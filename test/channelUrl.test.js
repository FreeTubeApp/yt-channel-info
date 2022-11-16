const ytch = require('../index')
describe('Standalone Mode: Channel URL Testing', () => {
  test('Fallback URL', () => {
    // https://www.youtube.com/channel/UCfMJ2MchTSW2kWaT0kK94Yw
    const parameters = { channelId: 'UCfMJ2MchTSW2kWaT0kK94Yw', channelIdType: 0 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.authorId).toBe('UCfMJ2MchTSW2kWaT0kK94Yw')
    })
  })

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

  test('Whole URL', () => {
    // https://www.youtube.com/channel/UCfMJ2MchTSW2kWaT0kK94Yw
    const parameters = { channelId: 'https://www.youtube.com/channel/UCfMJ2MchTSW2kWaT0kK94Yw', channelIdType: 5 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.authorId).toBe('UCfMJ2MchTSW2kWaT0kK94Yw')
    })
  })

  test('Channel tag URL (whole url passed)', () => {
    // https://www.youtube.com/@SurveillanceReport
    const parameters = { channelId: 'SurveillanceReport', channelIdType: 4 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.authorId).toBe('UC0W_BIuwk8D0Bv4THbVZZOQ')
    })
  })
})
