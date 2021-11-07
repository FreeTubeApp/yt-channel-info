const YoutubeGrabberHelper = require('./helper')
const queryString = require('querystring')

// Fetchers
const YoutubeChannelFetcher = require('./fetchers/channel')
const YoutubePlaylistFetcher = require('./fetchers/playlist')

class YoutubeGrabber {
  /**
   * Get channel information. Full list of channel information you can find in README.md file
   * @param { string } channelId The channel id to grab data from.
   * @param { string } channelIdType (optional) The type of id a channel id can be 1 = /channel/, 2= /user/, 3=/c/.
   * @param httpAgent
   * @return { Promise<Object> } Return channel information
   * */
  static async getChannelInfo(payload) {
    const channelId = payload.channelId
    const channelIdType = payload.channelIdType ?? 0
    const httpAgent = payload.httpAgent ?? null

    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent)
    const decideResponse = await ytGrabHelp.decideUrlRequestType(channelId, 'channels?flow=grid&view=0&pbj=1', channelIdType)
    const channelPageResponse = decideResponse.response

    const headerLinks = channelPageResponse.data[1].response.header.c4TabbedHeaderRenderer.headerLinks
    let links = {
      primaryLinks: [],
      secondaryLinks: []
    }
    if (typeof headerLinks !== 'undefined') {
      links = headerLinks.channelHeaderLinksRenderer
      links.primaryLinks = links.primaryLinks.map(x => {
        return {
          url: decodeURIComponent(x.navigationEndpoint.urlEndpoint.url.match('&q=(.*)')[1]),
          icon: x.icon.thumbnails[0].url,
          title: x.title.simpleText
        }
      })
      links.secondaryLinks = links.secondaryLinks.map(x => {
        return {
          url: decodeURIComponent(x.navigationEndpoint.urlEndpoint.url.match('&q=(.*)')[1]),
          icon: x.icon.thumbnails[0].url,
          title: x.title.simpleText
        }
      })
    }

    if (typeof (channelPageResponse.data[1].response.alerts) !== 'undefined') {
      return {
        alertMessage: channelPageResponse.data[1].response.alerts[0].alertRenderer.text.simpleText
      }
    }

    const channelMetaData = channelPageResponse.data[1].response.metadata.channelMetadataRenderer
    const channelHeaderData = channelPageResponse.data[1].response.header.c4TabbedHeaderRenderer
    const headerTabs = channelPageResponse.data[1].response.contents.twoColumnBrowseResultsRenderer.tabs

    const channelsTab = headerTabs.filter((data) => {
      if (typeof data.tabRenderer !== 'undefined') {
        return data.tabRenderer.title === 'Channels'
      }

      return false
    })

    const featuredChannels = channelsTab[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0]

    let relatedChannels = []
    let relatedChannelsContinuation = null

    if (typeof (featuredChannels.gridRenderer) !== 'undefined') {
      relatedChannels = featuredChannels.gridRenderer.items.filter((channel) => {
        return typeof (channel.gridChannelRenderer) !== 'undefined'
      }).map((channel) => {
        const author = channel.gridChannelRenderer
        let channelName

        if (typeof (author.title.runs) !== 'undefined') {
          channelName = author.title.runs[0].text
        } else {
          channelName = author.title.simpleText
        }

        return {
          author: channelName,
          authorId: author.channelId,
          authorUrl: author.navigationEndpoint.browseEndpoint.canonicalBaseUrl,
          authorThumbnails: author.thumbnail.thumbnails,
        }
      })

      const continuationData = featuredChannels.gridRenderer.items

      const continuationItem = continuationData.filter((item) => {
        return typeof (item.continuationItemRenderer) !== 'undefined'
      })

      if (typeof continuationItem !== 'undefined' && typeof continuationItem[0] !== 'undefined') {
        relatedChannelsContinuation = continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
      }
    }

    let subscriberText
    if (channelHeaderData.subscriberCountText) {
      if (typeof (channelHeaderData.subscriberCountText.runs) !== 'undefined') {
        subscriberText = channelHeaderData.subscriberCountText.runs[0].text
      } else {
        subscriberText = channelHeaderData.subscriberCountText.simpleText
      }
    } else {
      subscriberText = '0 subscribers'
    }

    let bannerThumbnails = null

    if (typeof (channelHeaderData.banner) !== 'undefined') {
      bannerThumbnails = channelHeaderData.banner.thumbnails
    }

    const subscriberSplit = subscriberText.split(' ')
    const subscriberMultiplier = subscriberSplit[0].substring(subscriberSplit[0].length - 1).toLowerCase()

    let subscriberNumber
    if (typeof (parseFloat(subscriberMultiplier)) === 'undefined') {
      subscriberNumber = parseFloat(subscriberText.substring(0, subscriberSplit[0].length - 1))
    } else {
      subscriberNumber = parseFloat(subscriberSplit[0])
    }

    let subscriberCount

    switch (subscriberMultiplier) {
      case 'k':
        subscriberCount = subscriberNumber * 1000
        break
      case 'm':
        subscriberCount = subscriberNumber * 1000000
        break
      default:
        subscriberCount = subscriberNumber
    }

    let isVerified = false
    if (channelHeaderData.badges) {
      isVerified = channelHeaderData.badges.some((badge) => badge.metadataBadgeRenderer.tooltip === 'Verified')
    }

    const tags = channelPageResponse.data[1].response.microformat.microformatDataRenderer.tags || null

    const channelInfo = {
      author: channelMetaData.title,
      authorId: channelMetaData.externalId,
      authorUrl: channelMetaData.vanityChannelUrl,
      authorBanners: bannerThumbnails,
      authorThumbnails: channelHeaderData.avatar.thumbnails,
      subscriberText: subscriberText,
      subscriberCount: subscriberCount,
      description: channelMetaData.description,
      isFamilyFriendly: channelMetaData.isFamilySafe,
      relatedChannels: {
        items: relatedChannels,
        continuation: relatedChannelsContinuation
      },
      allowedRegions: channelMetaData.availableCountryCodes,
      isVerified: isVerified,
      tags: tags,
      channelLinks: links,
      channelIdType: decideResponse.channelIdType,
    }

    return channelInfo
  }

  static async getRelatedChannelsMore (payload) {
    const continuation = payload.continuation
    const httpAgent = payload.httpAgent ?? null

    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent)
    const urlParams = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20201021.03.00',
        },
      },
      continuation: continuation
    }
    const ajaxUrl = 'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'

    const channelPageResponse = await ytGrabHelp.makeChannelPost(ajaxUrl, urlParams)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    let nextContinuation = null

    const continuationData = channelPageResponse.data.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems

    const continuationItem = continuationData.filter((item) => {
      return typeof (item.continuationItemRenderer) !== 'undefined'
    })

    if (typeof continuationItem !== 'undefined' && typeof continuationItem[0] !== 'undefined') {
      nextContinuation = continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
    }

    let relatedChannels = []

    relatedChannels = continuationData.filter((channel) => {
      return typeof (channel.gridChannelRenderer) !== 'undefined'
    }).map((channel) => {
      const author = channel.gridChannelRenderer
      let channelName

      if (typeof (author.title.runs) !== 'undefined') {
        channelName = author.title.runs[0].text
      } else {
        channelName = author.title.simpleText
      }

      return {
        author: channelName,
        authorId: author.channelId,
        authorUrl: author.navigationEndpoint.browseEndpoint.canonicalBaseUrl,
        authorThumbnails: author.thumbnail.thumbnails,
      }
    })

    return {
      items: relatedChannels,
      continuation: nextContinuation
    }
  }

  static async getChannelVideos (payload) {
    const channelId = payload.channelId
    const sortBy = payload.sortBy ?? 'newest'
    const channelIdType = payload.channelIdType ?? 0
    const httpAgent = payload.httpAgent ?? null

    switch (sortBy) {
      case 'popular':
        return await YoutubeChannelFetcher.getChannelVideosPopular(channelId, channelIdType, httpAgent)
      case 'newest':
        return await YoutubeChannelFetcher.getChannelVideosNewest(channelId, channelIdType, httpAgent)
      case 'oldest':
        return await YoutubeChannelFetcher.getChannelVideosOldest(channelId, channelIdType, httpAgent)
      default:
        return await YoutubeChannelFetcher.getChannelVideosNewest(channelId, channelIdType, httpAgent)
    }
  }

  static async getChannelVideosMore (payload) {
    const continuation = payload.continuation
    const httpAgent = payload.httpAgent

    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent)
    const urlParams = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20201021.03.00',
        },
      },
      continuation: continuation
    }
    const ajaxUrl = 'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'

    const channelPageResponse = await ytGrabHelp.makeChannelPost(ajaxUrl, urlParams)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    let nextContinuation = null

    const continuationData = channelPageResponse.data.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems

    const continuationItem = continuationData.filter((item) => {
      return typeof (item.continuationItemRenderer) !== 'undefined'
    })

    if (typeof continuationItem !== 'undefined' && typeof continuationItem[0] !== 'undefined') {
      nextContinuation = continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
    }

    const channelMetaData = channelPageResponse.data.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title
    const channelId = channelMetaData.externalId

    const channelInfo = {
      channelId: channelId,
      channelName: channelName
    }

    const nextVideos = continuationData.filter((item) => {
      return typeof (item.continuationItemRenderer) === 'undefined'
    }).map((item) => {
      return ytGrabHelp.parseVideo(item, channelInfo)
    })

    return {
      items: nextVideos,
      continuation: nextContinuation
    }
  }

  static async getChannelPlaylistInfo (payload) {
    const channelId = payload.channelId
    const sortBy = payload.sortBy ?? 'last'
    const channelIdType = payload.channelIdType ?? 0
    const httpAgent = payload.httpAgent ?? null

    switch (sortBy) {
      case 'last':
        return await YoutubePlaylistFetcher.getChannelPlaylistLast(channelId, channelIdType, httpAgent)
      case 'oldest':
        console.warn("yt-channel-info: Fetching by oldest isn't available in YouTube any more. This option will be removed in a later update.")
        return await YoutubePlaylistFetcher.getChannelPlaylistOldest(channelId, channelIdType, httpAgent)
      case 'newest':
        return await YoutubePlaylistFetcher.getChannelPlaylistNewest(channelId, channelIdType, httpAgent)
      default:
        return await YoutubePlaylistFetcher.getChannelPlaylistLast(channelId, channelIdType, httpAgent)
    }
  }

  static async getChannelPlaylistsMore (payload) {
    const continuation = payload.continuation
    const httpAgent = payload.httpAgent ?? null

    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent)
    const urlParams = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20201021.03.00',
        },
      },
      continuation: continuation
    }
    const ajaxUrl = 'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'

    const channelPageResponse = await ytGrabHelp.makeChannelPost(ajaxUrl, urlParams)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    let nextContinuation = null

    const continuationData = channelPageResponse.data.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems

    const continuationItem = continuationData.filter((item) => {
      return typeof (item.continuationItemRenderer) !== 'undefined'
    })

    if (typeof continuationItem !== 'undefined' && typeof continuationItem[0] !== 'undefined') {
      nextContinuation = continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
    }

    const channelMetaData = channelPageResponse.data.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title
    const channelId = channelMetaData.externalId

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://www.youtube.com/channel/${channelId}`
    }

    const nextPlaylists = continuationData.filter((item) => {
      return typeof (item.gridShowRenderer) === 'undefined' && typeof (item.continuationItemRenderer) === 'undefined'
    }).map((item) => {
      return ytGrabHelp.parsePlaylist(item, channelInfo)
    })

    return {
      items: nextPlaylists,
      continuation: nextContinuation
    }
  }

  static async searchChannel(payload) {
    const channelId = payload.channelId
    const query = payload.query ?? ''
    const channelIdType = payload.channelIdType ?? 0
    const httpAgent = payload.httpAgent ?? null

    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent)
    const urlParams = queryString.stringify({
      query: query,
      flow: 'grid',
      view: 0,
      pbj: 1
    })

    const decideResponse = await ytGrabHelp.decideUrlRequestType(channelId, `search?${urlParams}`, channelIdType)
    const channelPageResponse = decideResponse.response

    const channelMetaData = channelPageResponse.data[1].response.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://www.youtube.com/channel/${channelId}`
    }

    const searchTab = channelPageResponse.data[1].response.contents.twoColumnBrowseResultsRenderer.tabs.findIndex((tab) => {
      if (typeof (tab.expandableTabRenderer) !== 'undefined') {
        return true
      }
    })

    const searchResults = channelPageResponse.data[1].response.contents.twoColumnBrowseResultsRenderer.tabs[searchTab].expandableTabRenderer.content.sectionListRenderer

    let continuation = null

    const searchItems = searchResults.contents

    const continuationItem = searchItems.filter((item) => {
      return typeof (item.continuationItemRenderer) !== 'undefined'
    })

    if (typeof continuationItem !== 'undefined' && typeof continuationItem[0] !== 'undefined') {
      continuation = continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
    }

    if (typeof (searchItems[0].itemSectionRenderer.contents[0].messageRenderer) !== 'undefined') {
      return {
        continuation: null,
        items: []
      }
    }

    const parsedSearchItems = searchItems.filter((item) => {
      return typeof (item.continuationItemRenderer) === 'undefined'
    }).map((item) => {
      const obj = item.itemSectionRenderer.contents[0]

      if (typeof (obj.playlistRenderer) !== 'undefined') {
        return ytGrabHelp.parsePlaylist(obj, channelInfo)
      } else {
        return ytGrabHelp.parseVideo(obj, channelInfo)
      }
    })

    return {
      continuation: continuation,
      items: parsedSearchItems
    }
  }

  static async searchChannelMore (payload) {
    const continuation = payload.continuation
    const httpAgent = payload.httpAgent ?? null

    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent)
    const urlParams = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20201021.03.00',
        },
      },
      continuation: continuation
    }
    const ajaxUrl = 'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'

    const channelPageResponse = await ytGrabHelp.makeChannelPost(ajaxUrl, urlParams)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    let nextContinuation = null

    const continuationData = channelPageResponse.data.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems

    const continuationItem = continuationData.filter((item) => {
      return typeof (item.continuationItemRenderer) !== 'undefined'
    })

    if (typeof continuationItem !== 'undefined' && typeof continuationItem[0] !== 'undefined') {
      nextContinuation = continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
    }

    const channelMetaData = channelPageResponse.data.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title
    const channelId = channelMetaData.externalId

    const channelInfo = {
      channelId: channelId,
      channelName: channelName
    }

    const nextVideos = continuationData.filter((item) => {
      return typeof (item.continuationItemRenderer) === 'undefined'
    }).map((item) => {
      const channel = item.itemSectionRenderer.contents[0]
      return ytGrabHelp.parseVideo(channel, channelInfo)
    })

    return {
      items: nextVideos,
      continuation: nextContinuation
    }
  }

  static async getChannelCommunityPosts(payload) {
    const channelId = payload.channelId
    const channelIdType = payload.channelIdType ?? 0
    const httpAgent = payload.httpAgent ?? null

    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent)
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(channelId, 'community', channelIdType)
    return ytGrabHelp.parseCommunityPage(channelPageResponse.response, channelPageResponse.channelIdType)
  }

  static async getChannelCommunityPostsMore(payload) {
    const continuation = payload.continuation
    const innerAPIKey = payload.innerTubeApi
    const httpAgent = payload.httpAgent ?? null

    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent)
    const channelPageResponse = await ytGrabHelp.makeChannelPost(`https://www.youtube.com/youtubei/v1/browse?key=${innerAPIKey}`, {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20210314.08.00',
        },
      },
      continuation: continuation
    })
    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }
    const postDataArray = channelPageResponse.data.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems
    const contValue = ('continuationItemRenderer' in postDataArray[postDataArray.length - 1]) ? postDataArray[postDataArray.length - 1].continuationItemRenderer.continuationEndpoint.continuationCommand.token : null
    return { items: ytGrabHelp.createCommunityPostArray(postDataArray), continuation: contValue, innerTubeApi: innerAPIKey }
  }
}

module.exports = YoutubeGrabber
