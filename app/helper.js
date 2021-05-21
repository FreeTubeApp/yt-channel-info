
const axios = require('axios')

class YoutubeGrabberHelper {
  constructor () {
    this.session = axios.create({
      timeout: 10000,
      headers: {
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20201021.03.00',
        'accept-language': 'en-US,en;q=0.9'
      }
    })

    this.cookies = null
    this.test = 'hello'
  }

  /**
     * Try to get response from request
     * @param { string } url An url
     * @return { Promise<AxiosResponse | null> } Return AxiosResponse or null if response is end with error
     * */
  async makeChannelRequest(url) {
    // Electron doesn't like adding a user-agent in this way.  It might be needed in non-Electron based apps though.
    // 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',

    try {
      const response = await this.session.get(url)
      return response
    } catch (e) {
      return {
        error: true,
        message: e
      }
    }
  }

  async makeChannelPost(url, params) {
    // Electron doesn't like adding a user-agent in this way.  It might be needed in non-Electron based apps though.
    // 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',

    try {
      const response = await this.session({
        url: url,
        method: 'post',
        data: params
      })

      return response
    } catch (e) {
      return {
        error: true,
        message: e
      }
    }
  }

  async parseChannelVideoResponse(response, channelId, channelIdType) {
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

    const continuationItem = channelVideoData.items.filter((item) => {
      return typeof (item.continuationItemRenderer) !== 'undefined'
    })

    if (continuationItem.length > 0) {
      continuation = continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
    }

    const channelInfo = {
      channelId: channelId,
      channelName: channelName
    }

    const latestVideos = channelVideoData.items.filter((item) => {
      return typeof (item.continuationItemRenderer) === 'undefined'
    }).map((item) => {
      return this.parseVideo(item, channelInfo)
    })

    return {
      items: latestVideos,
      continuation: continuation,
      channelIdType: channelIdType,
    }
  }

  parseVideo(obj, channelInfo) {
    let video
    let liveNow = false
    let premiere = false
    let premium = false
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
      viewCount = parseInt(video.viewCountText.runs[0].text.split(',').join(''))
      viewCountText = video.shortViewCountText.runs[0].text + video.shortViewCountText.runs[1].text
    } else if (typeof (statusRenderer) !== 'undefined' && typeof (statusRenderer.text) !== 'undefined' && typeof (statusRenderer.text.runs) !== 'undefined') {
      premiere = true
      durationText = 'PREMIERE'
      viewCount = 0
      viewCountText = '0 views'
      const premiereDate = new Date(parseInt(video.upcomingEventData.startTime * 1000))
      publishedText = premiereDate.toLocaleString()
    } else if (typeof (video.viewCountText) === 'undefined') {
      premium = true
      publishedText = video.publishedTimeText.simpleText
      durationText = 'PREMIERE'
      viewCount = 0
      viewCountText = '0 views'
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
      premiere: premiere,
      premium: premium
    }
  }

  parseCommunityPage(communityInfo, channelIdType) {
    // A broader match approach to the whole JSON is required, because trackingParams can now occur in polls
    // Get the JSON data as string
    let contentDataString = communityInfo.data.match(/ytInitialData.+?(?=;<\/script>)/)[0]
    let innertubeAPIkey = communityInfo.data.match(/innertubeApiKey.+?(?=innertubeApiVersion)/)[0]
    // innertubeApiKey":"AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8","innertubeApiVersion"
    innertubeAPIkey = innertubeAPIkey.substring(18, innertubeAPIkey.length - 3)

    contentDataString = contentDataString.substring(16, contentDataString.length)

    // Parse the JSON data and get the relevent array with data
    let contentDataJSON = JSON.parse(contentDataString)
    contentDataJSON = contentDataJSON.contents.twoColumnBrowseResultsRenderer.tabs[3].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer
    if ('continuationItemRenderer' in contentDataJSON.contents[contentDataJSON.contents.length - 1]) {
      return { items: this.createCommunityPostArray(contentDataJSON.contents), continuation: contentDataJSON.contents[contentDataJSON.contents.length - 1].continuationItemRenderer.continuationEndpoint.continuationCommand.token, innerTubeApi: innertubeAPIkey, channelIdType: channelIdType }
    }
    return { items: this.createCommunityPostArray(contentDataJSON.contents), continuation: null, innerTubeApi: null, channelIdType: channelIdType }
  }

  createCommunityPostArray(postArray) {
    const postsArray = []
    postArray.forEach((post) => {
      if ('continuationItemRenderer' in post) {
        // we do not want to access the continuation data like a normal post, but instead later
        return
      }
      if ('sharedPostRenderer' in post.backstagePostThreadRenderer.post) {
        // this are special and rare posts, we only care about the text no content
        const postData = this.parseSharedPost(post)
        postsArray.push(postData)
        return
      }
      // Default structure of a post
      // comment count not available on shared posts
      const postData = {
        postText: '',
        postId: post.backstagePostThreadRenderer.post.backstagePostRenderer.postId,
        author: post.backstagePostThreadRenderer.post.backstagePostRenderer.authorText.runs[0].text,
        authorThumbnails: post.backstagePostThreadRenderer.post.backstagePostRenderer.authorThumbnail.thumbnails,
        publishedText: post.backstagePostThreadRenderer.post.backstagePostRenderer.publishedTimeText.runs[0].text,
        voteCount: post.backstagePostThreadRenderer.post.backstagePostRenderer.voteCount.simpleText,
        postContent: null,
        commentCount: ('text' in post.backstagePostThreadRenderer.post.backstagePostRenderer.actionButtons.commentActionButtonsRenderer.replyButton.buttonRenderer) ? post.backstagePostThreadRenderer.post.backstagePostRenderer.actionButtons.commentActionButtonsRenderer.replyButton.buttonRenderer.text.simpleText : '0'
      }
      if ('runs' in post.backstagePostThreadRenderer.post.backstagePostRenderer.contentText) {
        // eslint-disable-next-line no-return-assign
        post.backstagePostThreadRenderer.post.backstagePostRenderer.contentText.runs.forEach((element, index) => postData.postText += (index !== 0) ? ' ' + element.text : element.text)
      }

      // if this exists, then the post contains more data than only text - Assumption: sharedPostRenderer only has text. Only occurred once so far
      if ('backstageAttachment' in post.backstagePostThreadRenderer.post.backstagePostRenderer) {
        if ('backstageImageRenderer' in post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment) {
          // post with an image
          postData.postContent = { type: 'image', content: post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment.backstageImageRenderer.image.thumbnails }
        } else if ('pollRenderer' in post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment) {
          // post with a poll
          const pollObject = post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment.pollRenderer
          postData.postContent = { type: 'poll', content: { choices: pollObject.choices.map((entry) => entry.text.runs[0].text), totalVotes: pollObject.totalVotes.simpleText } }
        } else if ('videoRenderer' in post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment) {
          // post with a video
          const videoRenderer = post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment.videoRenderer
          postData.postContent = {
            type: 'video',
            content: {
              videoId: videoRenderer.videoId,
              title: videoRenderer.title.runs[0].text,
              description: videoRenderer.descriptionSnippet.runs[0].text,
              publishedText: videoRenderer.publishedTimeText.simpleText,
              lengthText: videoRenderer.lengthText.simpleText,
              viewCountText: videoRenderer.viewCountText.simpleText,
              badges: { verified: false, officialArtist: false },
              author: videoRenderer.ownerText.runs[0].text,
              thumbnails: videoRenderer.thumbnail.thumbnails
            }
          }
          if ('ownerBadges' in videoRenderer) {
            videoRenderer.ownerBadges.forEach((badge) => {
              postData.postContent.content.badges.officialArtist = (badge.metadataBadgeRenderer.tooltip === 'Official Artist Channel' || postData.postContent.content.badges.officialArtist)
              postData.postContent.content.badges.verified = (badge.metadataBadgeRenderer.tooltip === 'Verified' || postData.postContent.content.badges.verified)
            })
          }
        } else if ('playlistRenderer' in post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment) {
          // post with a playlist
          const playlistRenderer = post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment.playlistRenderer
          postData.postContent = {
            type: 'playlist',
            content: {
              playlistId: playlistRenderer.playlistId,
              title: playlistRenderer.title.simpleText,
              playlistVideoRenderer: [],
              videoCountText: playlistRenderer.videoCountText.runs[0],
              ownerBadges: playlistRenderer.ownerBadges,
              author: playlistRenderer.longBylineText.runs[0].text,
              thumbnails: playlistRenderer.thumbnails
            }
          }
          // there are small preview lines of the first view videos in the playlist
          playlistRenderer.videos.forEach((video) => {
            postData.postContent.content.playlistVideoRenderer.push({
              title: video.childVideoRenderer.title.simpleText,
              videoId: video.childVideoRenderer.videoId,
              lengthText: video.childVideoRenderer.lengthText.simpleText
            })
          }
          )
        } else {
          console.error('New type of post detected. Please report this to the repository with the log and channel that was scraped')
          console.log(post.backstagePostThreadRenderer.post.backstagePostRenderer.backstageAttachment.keys())
        }
      }
      postsArray.push(postData)
    })
    return postsArray
  }

  parseSharedPost(post) {
    const postData = {
      postText: '',
      postId: post.backstagePostThreadRenderer.post.sharedPostRenderer.postId,
      author: post.backstagePostThreadRenderer.post.sharedPostRenderer.displayName.runs[0].text,
      authorThumbnails: post.backstagePostThreadRenderer.post.sharedPostRenderer.thumbnail.thumbnails,
      publishedText: post.backstagePostThreadRenderer.post.sharedPostRenderer.publishedTimeText.runs[0].text,
      voteCount: post.backstagePostThreadRenderer.post.sharedPostRenderer.originalPost.backstagePostRenderer.voteCount.simpleText,
      postContent: null,
      commentCount: ('text' in post.backstagePostThreadRenderer.post.sharedPostRenderer.originalPost.backstagePostRenderer.actionButtons.commentActionButtonsRenderer.replyButton.buttonRenderer) ? post.backstagePostThreadRenderer.post.sharedPostRenderer.originalPost.backstagePostRenderer.actionButtons.commentActionButtonsRenderer.replyButton.buttonRenderer.text.simpleText : '0',
    }
    post.backstagePostThreadRenderer.post.sharedPostRenderer.content.runs.forEach((element, index) => postData.postText += (index !== 0) ? ' ' + element.text : element.text)
    return post
  }

  parsePlaylist(obj, channelInfo) {
    if (typeof (obj.gridShowRenderer) !== 'undefined') {
      return
    }

    let playlist
    let thumbnails
    let title
    let videoCount

    if (typeof (obj.gridPlaylistRenderer) === 'undefined' && typeof (obj.playlistRenderer) !== 'undefined') {
      playlist = obj.playlistRenderer

      if (typeof playlist === 'undefined') {
        return null
      }

      thumbnails = playlist.thumbnails[0].thumbnails
      title = playlist.title.simpleText
      videoCount = parseInt(playlist.videoCount)
    } else {
      playlist = obj.gridPlaylistRenderer

      if (typeof playlist === 'undefined') {
        return null
      }

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
  async isResourceExists(url) {
    const response = await YoutubeGrabberHelper.getResource(url)
    if (!response) return false

    const $ = cheerio.load(response.data)
    const metaTags = $('meta[name="title"]')
    return metaTags.length !== 0
  }

  async decideUrlRequestType(channelId, urlAppendix, channelIdType) {
    switch (channelIdType) {
      case 0: return this.performChannelPageRequestWithFallbacks(channelId, urlAppendix)
      case 1: return this.performChannelUrlRequest(channelId, urlAppendix)
      case 2: return this.performUserUrlRequest(channelId, urlAppendix)
      case 3: return this.performCUrlRequest(channelId, urlAppendix)
      default: return this.performChannelPageRequestWithFallbacks(channelId, urlAppendix)
    }
  }

  async performChannelPageRequestWithFallbacks(channelId, urlAppendix) {
    const ajaxUrl = `https://www.youtube.com/channel/${channelId}/${urlAppendix}`
    let workedUrl = 1
    let channelPageResponse = await this.makeChannelRequest(ajaxUrl)

    if (channelPageResponse.error) {
      // Try again as a user channel
      const userUrl = `https://www.youtube.com/user/${channelId}/${urlAppendix}`
      channelPageResponse = await this.makeChannelRequest(userUrl)
      workedUrl = 2
      if (channelPageResponse.error) {
        const cUrl = `https://www.youtube.com/c/${channelId}/${urlAppendix}`
        channelPageResponse = await this.makeChannelRequest(cUrl)
        workedUrl = 3
        if (channelPageResponse.error) {
          return Promise.reject(channelPageResponse.message)
        }
      }
    }
    return { response: channelPageResponse, channelIdType: workedUrl }
  }

  async performChannelUrlRequest(channelId, urlAppendix) {
    const ajaxUrl = `https://www.youtube.com/channel/${channelId}/${urlAppendix}`

    const channelPageResponse = await this.makeChannelRequest(ajaxUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }
    return { response: channelPageResponse, channelIdType: 1 }
  }

  async performUserUrlRequest(channelId, urlAppendix) {
    const ajaxUrl = `https://www.youtube.com/user/${channelId}/${urlAppendix}`

    const channelPageResponse = await this.makeChannelRequest(ajaxUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }
    return { response: channelPageResponse, channelIdType: 2 }
  }

  async performCUrlRequest(channelId, urlAppendix) {
    const ajaxUrl = `https://www.youtube.com/c/${channelId}/${urlAppendix}`

    const channelPageResponse = await this.makeChannelRequest(ajaxUrl)

    if (channelPageResponse.error) {
      return Promise.reject(channelPageResponse.message)
    }
    return { response: channelPageResponse, channelIdType: 3 }
  }
}

module.exports = new YoutubeGrabberHelper()
