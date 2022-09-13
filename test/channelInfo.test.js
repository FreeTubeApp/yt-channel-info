const ytch = require('../index')
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

  // test('Get Related Channels more', () => {
  //   const parameters = { channelId: 'LinusTechTips', channelIdType: 2 }
  //   return ytch.getChannelInfo(parameters).then((data) => {
  //     return ytch.getRelatedChannelsMore({ continuation: data.relatedChannels.continuation }).then((rel) => {
  //       expect(rel.items.length).not.toBe(0)
  //     })
  //   })
  // })

  test('Public channel with private subscriber count.', () => {
    const parameters = { channelId: 'RickAstleyVEVO', channelIdType: 2 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.subscriberCount).toBe(0)
    })
  })

  test('Channel that doesnt exist.', () => {
    const parameters = { channelId: 'UCDzb8yXGOm6ZYd0Jf_FYKWA', channelIdType: 1 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.alertMessage).toBe('This channel does not exist.')
    })
  })

  test('Channel missing tabs', () => {
    const parameters = { channelId: 'UCs6GGpd9zvsYghuYe0VDFUQ', channelIdType: 1 }
    return ytch.getChannelInfo(parameters).then((data) => {
      expect(data.channelTabs.length).toBe(3)
    })
  })
  test('Deleted channel', () => {
    const parameters = { channelId: 'UC59AcfHD5jOGqTxb-zAsahw', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.alertMessage).not.toBe(undefined)
    })
  })
})
