const YoutubeGrabberHelper = require('./helper')
const queryString = require('querystring')

// Fetchers
const YoutubeChannelFetcher = require('./fetchers/channel')
const YoutubePlaylistFetcher = require('./fetchers/playlist')

class YoutubeGrabber {
  /**
  * Get channel information. Full list of channel information you can find in README.md file
  * @param { string } channelId The channel id to grab data from.
  * @return { Promise<Object> } Return channel information
  * */
  static async getChannelInfo(channelId) {
    const channelUrl = `https://youtube.com/channel/${channelId}/about?flow=grid&view=0&pbj=1`

    let channelPageResponse = await YoutubeGrabberHelper.makeChannelRequest(channelUrl)

    if (channelPageResponse.error) {
      // Try again as a user channel
      const userUrl = `https://youtube.com/user/${channelId}/about?flow=grid&view=0&pbj=1`
      channelPageResponse = await YoutubeGrabberHelper.makeChannelRequest(userUrl)

      if (channelPageResponse.error) {
        return Promise.reject(channelPageResponse.message)
      }
    }

    if (typeof (channelPageResponse.data[1].response.alerts) !== 'undefined') {
      const alert = channelPageResponse.data[1].response.alerts[0].alertRenderer.text.simpleText
      return Promise.reject(alert)
    }

    const channelMetaData = channelPageResponse.data[1].response.metadata.channelMetadataRenderer
    const channelHeaderData = channelPageResponse.data[1].response.header.c4TabbedHeaderRenderer
    const channelContentsData = channelPageResponse.data[1].response.contents.twoColumnBrowseResultsRenderer

    let relatedChannels = []

    if (typeof (channelContentsData.secondaryContents) !== 'undefined') {
      const featuredChannels = channelContentsData.secondaryContents.browseSecondaryContentsRenderer.contents[0].verticalChannelSectionRenderer.items

      relatedChannels = featuredChannels.map((channel) => {
        const author = channel.miniChannelRenderer
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
      relatedChannels: relatedChannels,
      allowedRegions: channelMetaData.availableCountryCodes,
      isVerified: isVerified
    }

    return channelInfo
  }

  static async getChannelVideos (channelId, sortBy = 'newest') {
    switch (sortBy) {
      case 'popular':
        return await YoutubeChannelFetcher.getChannelVideosPopular(channelId)
      case 'newest':
        return await YoutubeChannelFetcher.getChannelVideosNewest(channelId)
      case 'oldest':
        return await YoutubeChannelFetcher.getChannelVideosOldest(channelId)
      default:
        return await YoutubeChannelFetcher.getChannelVideosNewest(channelId)
    }
  }

  static async getChannelVideosMore (continuation) {
    const urlParams = queryString.stringify({
      continuation: continuation,
      ctoken: continuation
    })
    const ajaxUrl = `https://www.youtube.com/browse_ajax?${urlParams}`

    const channelPageResponse = await YoutubeGrabberHelper.makeChannelRequest(ajaxUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    let nextContinuation = null

    const continuationData = channelPageResponse.data[1].response.continuationContents.gridContinuation

    if (typeof (continuationData.continuations) !== 'undefined') {
      nextContinuation = continuationData.continuations[0].nextContinuationData.continuation
    }

    const channelMetaData = channelPageResponse.data[1].response.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title
    const channelId = channelMetaData.externalId

    const channelInfo = {
      channelId: channelId,
      channelName: channelName
    }

    const nextVideos = continuationData.items.map((item) => {
      return YoutubeGrabberHelper.parseVideo(item, channelInfo)
    })

    return {
      items: nextVideos,
      continuation: nextContinuation
    }
  }

  static async getChannelPlaylistInfo (channelId, sortBy = 'last') {
    switch (sortBy) {
      case 'last':
        return await YoutubePlaylistFetcher.getChannelPlaylistLast(channelId)
      case 'oldest':
        return await YoutubePlaylistFetcher.getChannelPlaylistOldest(channelId)
      case 'newest':
        return await YoutubePlaylistFetcher.getChannelPlaylistNewest(channelId)
      default:
        return await YoutubePlaylistFetcher.getChannelPlaylistLast(channelId)
    }
  }

  static async getChannelPlaylistsMore (continuation) {
    const urlParams = queryString.stringify({
      continuation: continuation,
      ctoken: continuation
    })
    const ajaxUrl = `https://www.youtube.com/browse_ajax?${urlParams}`

    const channelPageResponse = await YoutubeGrabberHelper.makeChannelRequest(ajaxUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    const continuationData = channelPageResponse.data[1].response.continuationContents.gridContinuation
    const nextContinuation = continuationData.continuations ? continuationData.continuations[0].nextContinuationData.continuation : null
    const channelMetaData = channelPageResponse.data[1].response.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title
    const channelId = channelMetaData.externalId

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://youtube.com/channel/${channelId}`
    }

    const nextPlaylists = continuationData.items.filter((item) => {
      return typeof (item.gridShowRenderer) === 'undefined'
    }).map((item) => {
      return YoutubeGrabberHelper.parsePlaylist(item, channelInfo)
    })

    return {
      items: nextPlaylists,
      continuation: nextContinuation
    }
  }

  static async searchChannel(channelId, query = '') {
    const urlParams = queryString.stringify({
      query: query,
      flow: 'grid',
      view: 0,
      pbj: 1
    })
    const ajaxUrl = `https://youtube.com/channel/${channelId}/search?${urlParams}`

    let channelPageResponse = await YoutubeGrabberHelper.makeChannelRequest(ajaxUrl)

    if (channelPageResponse.error) {
      // Try again as a user channel
      const userUrl = `https://youtube.com/user/${channelId}/search?${urlParams}`
      channelPageResponse = await YoutubeGrabberHelper.makeChannelRequest(userUrl)

      if (channelPageResponse.error) {
        return Promise.reject(channelPageResponse.message)
      }
    }

    const channelMetaData = channelPageResponse.data[1].response.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://youtube.com/channel/${channelId}`
    }

    const searchTab = channelPageResponse.data[1].response.contents.twoColumnBrowseResultsRenderer.tabs.findIndex((tab) => {
      if (typeof (tab.expandableTabRenderer) !== 'undefined') {
        return true
      }
    })

    const searchResults = channelPageResponse.data[1].response.contents.twoColumnBrowseResultsRenderer.tabs[searchTab].expandableTabRenderer.content.sectionListRenderer
    const searchItems = searchResults.contents

    let continuation = null

    if (typeof (searchResults.continuation) !== 'undefined') {
      continuation = searchResults.continuations[0].nextContinuationData.continuation
    }

    if (typeof (searchItems[0].itemSectionRenderer.contents[0].messageRenderer) !== 'undefined') {
      return {
        continuation: null,
        items: []
      }
    }

    const parsedSearchItems = searchItems.map((item) => {
      const obj = item.itemSectionRenderer.contents[0]

      if (typeof (obj.playlistRenderer) !== 'undefined') {
        return YoutubeGrabberHelper.parsePlaylist(obj, channelInfo)
      } else {
        return YoutubeGrabberHelper.parseVideo(obj, channelInfo)
      }
    })

    return {
      continuation: continuation,
      items: parsedSearchItems
    }
  }

  static async searchChannelMore (continuation) {
    const urlParams = queryString.stringify({
      continuation: continuation,
      ctoken: continuation
    })
    const ajaxUrl = `https://www.youtube.com/browse_ajax?${urlParams}`

    const channelPageResponse = await YoutubeGrabberHelper.makeChannelRequest(ajaxUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }

    const continuationData = channelPageResponse.data[1].response.continuationContents.sectionListContinuation
    const nextContinuation = continuationData.continuations[0].nextContinuationData.continuation
    const channelMetaData = channelPageResponse.data[1].response.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title
    const channelId = channelMetaData.externalId

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://youtube.com/channel/${channelId}`
    }

    const parsedSearchItems = continuationData.contents.map((item) => {
      const obj = item.itemSectionRenderer.contents[0]

      if (typeof (obj.playlistRenderer) !== 'undefined') {
        return YoutubeGrabberHelper.parsePlaylist(obj, channelInfo)
      } else {
        return YoutubeGrabberHelper.parseVideo(obj, channelInfo)
      }
    })

    return {
      continuation: nextContinuation,
      items: parsedSearchItems
    }
  }
}

module.exports = YoutubeGrabber
