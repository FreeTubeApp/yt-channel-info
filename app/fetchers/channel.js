const helper = require('../helper')

class YoutubeChannelFetcher {
  static async getChannelVideosNewest (channelId, channelIdType, httpAgent = null) {
    const ytGrabHelp = helper.create(httpAgent)
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(channelId, 'videos?flow=grid&view=0&pbj=1', channelIdType)
    return await ytGrabHelp.parseChannelVideoResponse(channelPageResponse.response, channelId, channelPageResponse.channelIdType)
  }

  static async getChannelVideosOldest (channelId, channelIdType, httpAgent = null) {
    const ytGrabHelp = helper.create(httpAgent)
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(channelId, 'videos?view=0&sort=da&flow=grid&pbj=1', channelIdType)
    return await ytGrabHelp.parseChannelVideoResponse(channelPageResponse.response, channelId, channelPageResponse.channelIdType)
  }

  static async getChannelVideosPopular (channelId, channelIdType, httpAgent = null) {
    const ytGrabHelp = helper.create(httpAgent)
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(channelId, 'videos?view=0&sort=p&flow=grid&pbj=1', channelIdType)
    return await ytGrabHelp.parseChannelVideoResponse(channelPageResponse.response, channelId, channelPageResponse.channelIdType)
  }
}

module.exports = YoutubeChannelFetcher
