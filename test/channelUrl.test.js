const ytch = require('../index')
/* eslint no-undef: "off" */
describe('Standalone Mode: Channel URL Testing', () => {
  test('Channel URL (ID-based)', () => {
    // https://www.youtube.com/channel/UCfMJ2MchTSW2kWaT0kK94Yw
    const parameters = { channelId: 'UCfMJ2MchTSW2kWaT0kK94Yw', channelIdType: 1 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.authorId).toBe('UCfMJ2MchTSW2kWaT0kK94Yw')
    })
  })

  test('Legacy username URL', () => {
    // https://www.youtube.com/user/youtube
    const parameters = { channelId: 'youtube', channelIdType: 2 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.author).toBe('YouTube')
    })
  })

  test('Custom URL', () => {
    // https://www.youtube.com/c/YouTubeCreators
    const parameters = { channelId: 'YouTubeCreators', channelIdType: 3 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.authorId).toBe('UCkRfArvrzheW2E7b6SVT7vQ')
    })
  })
})
