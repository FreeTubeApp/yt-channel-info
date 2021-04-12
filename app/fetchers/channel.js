const helper = require('../helper')

class YoutubeChannelFetcher {
  constructor(id, continuation) {
    this.continuation = continuation
  }

  static async getChannelVideosNewest (channelId, channelIdType) {
    const channelPageResponse = await helper.decideUrlRequestType(channelId, 'videos?flow=grid&view=0&pbj=1', channelIdType)
    return await helper.parseChannelVideoResponse(channelPageResponse.response, channelId, channelPageResponse.channelIdType)
  }

  static async getChannelVideosOldest (channelId, channelIdType) {
    const channelPageResponse = await helper.decideUrlRequestType(channelId, 'videos?view=0&sort=da&flow=grid&pbj=1', channelIdType)
    return await helper.parseChannelVideoResponse(channelPageResponse.response, channelId, channelPageResponse.channelIdType)
  }

  static async getChannelVideosPopular (channelId, channelIdType) {
    const channelPageResponse = await helper.decideUrlRequestType(channelId, 'videos?view=0&sort=p&flow=grid&pbj=1', channelIdType)
    return await helper.parseChannelVideoResponse(channelPageResponse.response, channelId, channelPageResponse.channelIdType)
  }
}

module.exports = YoutubeChannelFetcher
