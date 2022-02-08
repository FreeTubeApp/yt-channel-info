const ytch = require('../index')
/* eslint no-undef: "off" */
describe('Getting channel info', () => {
  test('Verified channel', () => {
    const parameters = { channelId: 'UCfMJ2MchTSW2kWaT0kK94Yw', channelIdType: 1 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.isVerified).toBe(true)
    })
  })

  test('Unverified channel', () => {
    const parameters = { channelId: 'wsim7165', channelIdType: 2 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.isVerified).toBe(false)
    })
  })

  test('Channel with related channels', () => {
    const parameters = { channelId: 'LinusTechTips', channelIdType: 2 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.relatedChannels.items.length).not.toBe(0)
    })
  })

  test('Public channel with private subscriber count.', () => {
    const parameters = { channelId: 'UCemb7r7IyrvY-AFPqsDjs7w', channelIdType: 0 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.subscriberCount).toBe(0)
    })
  })
})
