const axios = require('axios')

class YoutubeGrabberHelper {
  /**
     * Try to get response from request
     * @param { string } url An url
     * @return { Promise<AxiosResponse | null> } Return AxiosResponse or null if response is end with error
     * */
  static async makeChannelRequest(url) {
    // Electron doesn't like adding a user-agent in this way.  It might be needed in non-Electron based apps though.
    // 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
    const config = {
      headers: {
        'x-youtube-client-name': '1',
        'x-youtube-client-version': '2.20180222',
        'accept-language': 'en-US,en;q=0.5'
      }
    }

    try {
      return await axios.get(url, config)
    } catch (e) {
      return {
        error: true,
        message: e
      }
    }
  }

  static async parseChannelVideoResponse(response, channelId) {
    const channelMetaData = response.data[1].response.metadata.channelMetadataRenderer
    const channelName = channelMetaData.title
    const channelVideoData = response.data[1].response.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer

    if (typeof (channelVideoData) === 'undefined') {
      // Channel has no videos
      return {
        items: [],
        continuation: null
      }
    }

    let continuation = null

    if (typeof channelVideoData.continuations !== 'undefined') {
      continuation = channelVideoData.continuations[0].nextContinuationData.continuation
    }

    const channelInfo = {
      channelId: channelId,
      channelName: channelName
    }

    const latestVideos = channelVideoData.items.map((item) => {
      return this.parseVideo(item, channelInfo)
    })

    return {
      items: latestVideos,
      continuation: continuation
    }
  }

  static parseVideo(obj, channelInfo) {
    let video
    let liveNow = false
    let premiere = false
    let viewCount
    let viewCountText
    let lengthSeconds = 0
    let durationText
    let publishedText = ''

    if (typeof (obj.gridVideoRenderer) === 'undefined' && typeof (obj.videoRenderer) !== 'undefined') {
      video = obj.videoRenderer
    } else {
      video = obj.gridVideoRenderer
    }

    let title = video.title.simpleText
    const statusRenderer = video.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer

    if (typeof (title) === 'undefined') {
      title = video.title.runs[0].text
    }
    if (typeof (video.shortViewCountText) !== 'undefined' && typeof (video.shortViewCountText.simpleText) === 'undefined') {
      liveNow = true
      publishedText = 'Live'
      viewCount = parseInt(video.shortViewCountText.runs[0].text)
      viewCountText = video.shortViewCountText.runs[0].text + video.shortViewCountText.runs[1].text
    } else if (typeof (statusRenderer) !== 'undefined' && typeof (statusRenderer.text) !== 'undefined' && typeof (statusRenderer.text.runs) !== 'undefined') {
      premiere = true
      durationText = 'PREMIERE'
      viewCount = 0
      viewCountText = '0 views'
      const premiereDate = new Date(parseInt(video.upcomingEventData.startTime * 1000))
      publishedText = premiereDate.toLocaleString()
    } else {
      viewCount = parseInt(video.viewCountText.simpleText.split(' ')[0].split(',').join(''))
      viewCountText = video.viewCountText.simpleText

      publishedText = video.publishedTimeText.simpleText

      if (typeof (video.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer) !== 'undefined') {
        durationText = video.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer.text.simpleText
        const durationSplit = durationText.split(':')

        if (durationSplit.length === 3) {
          const hours = parseInt(durationSplit[0])
          const minutes = parseInt(durationSplit[1])
          const seconds = parseInt(durationSplit[2])

          lengthSeconds = (hours * 3600) + (minutes * 60) + seconds
        } else if (durationSplit.length === 2) {
          const minutes = parseInt(durationSplit[0])
          const seconds = parseInt(durationSplit[1])

          lengthSeconds = (minutes * 60) + seconds
        }
      } else {
        lengthSeconds = 0
      }
    }

    return {
      type: 'video',
      title: title,
      videoId: video.videoId,
      author: channelInfo.channelName,
      authorId: channelInfo.channelId,
      videoThumbnails: video.thumbnail.thumbnails,
      viewCountText: viewCountText,
      viewCount: viewCount,
      publishedText: publishedText,
      durationText: durationText,
      lengthSeconds: lengthSeconds,
      liveNow: liveNow,
      premiere: premiere
    }
  }

  static parsePlaylist(obj, channelInfo) {
    if (typeof (obj.gridShowRenderer) !== 'undefined') {
      return
    }

    let playlist
    let thumbnails
    let title
    let videoCount

    if (typeof (obj.gridPlaylistRenderer) === 'undefined' && typeof (obj.playlistRenderer) !== 'undefined') {
      playlist = obj.playlistRenderer
      thumbnails = playlist.thumbnails[0].thumbnails
      title = playlist.title.simpleText
      videoCount = parseInt(playlist.videoCount)
    } else {
      playlist = obj.gridPlaylistRenderer
      thumbnails = playlist.thumbnail.thumbnails
      title = playlist.title.runs[0].text
      videoCount = parseInt(playlist.videoCountShortText.simpleText)
    }

    return {
      title: title,
      type: 'playlist',
      playlistThumbnail: thumbnails[thumbnails.length - 1].url,
      author: channelInfo.channelName,
      authorUrl: channelInfo.channelUrl,
      authorId: channelInfo.channelId,
      playlistId: playlist.playlistId,
      playlistUrl: `https://www.youtube.com/playlist?list=${playlist.playlistId}`,
      videoCount: videoCount
    }
  }

  /**
     * Get the existing status of resource
     * @param { string } url The url of youtube resource
     * @returns { Promise<boolean> } Return TRUE if resource is exists
     * */
  static async isResourceExists(url) {
    const response = await YoutubeGrabberHelper.getResource(url)
    if (!response) return false

    const $ = cheerio.load(response.data)
    const metaTags = $('meta[name="title"]')
    return metaTags.length !== 0
  }
}

module.exports = YoutubeGrabberHelper
