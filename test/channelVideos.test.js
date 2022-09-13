const ytch = require('../index')
describe('Getting channel videos', () => {
  test('Public channel with videos. Should return videos array (not empty)', () => {
    const parameters = { channelId: 'UCsBjURrPoezykLs9EqgamOA', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })

  test('Get channel videos more', () => {
    const parameters = { channelId: 'UCsBjURrPoezykLs9EqgamOA', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      return ytch.getChannelVideosMore({ continuation: data.continuation }).then(vm => {
        expect(vm.items.length).not.toBe(0)
      })
    })
  })

  test('Get Channel Videos oldest', () => {
    const parameters = { channelId: 'UCsBjURrPoezykLs9EqgamOA', channelIdType: 1, sortBy: 'oldest' }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })

  test('Get Channel Videos popular', () => {
    const parameters = { channelId: 'UCsBjURrPoezykLs9EqgamOA', channelIdType: 1, sortBy: 'popular' }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })

  test('Shorts Channel', () => {
    const parameters = { channelId: 'UC4-79UOlP48-QNGgCko5p2g', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items[0].lengthSeconds).not.toBe(0)
    })
  })

  test('Public channel w/o videos', () => {
    const parameters = { channelId: 'UCS-DgEvT4XuQsrrmI7iZVsA', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items.length).toBe(0)
    })
  })

  test('Upcoming video', () => {
    // https://www.youtube.com/channel/UCUKPG1-r4WFyxpyhIuCs86Q
    // This channel has a video premiering in 2024/3/31
    const parameters = { channelId: 'UCUKPG1-r4WFyxpyhIuCs86Q', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items.length).toBeGreaterThan(0)
    })
  })

  test('Channel missing video tab', () => {
    const parameters = { channelId: 'UCs6GGpd9zvsYghuYe0VDFUQ', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items.length).toBe(0)
      expect(data.continuation).toBe(null)
    })
  })
  test('Deleted channel', () => {
    const parameters = { channelId: 'UC59AcfHD5jOGqTxb-zAsahw', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.alertMessage).not.toBe(undefined)
    })
  })
})
