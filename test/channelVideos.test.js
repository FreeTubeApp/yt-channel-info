const ytch = require('../index')
/* eslint no-undef: 'off' */
describe('Getting channel videos', () => {
  test('Public channel with videos. Should return videos array (not empty)', () => {
    const parameters = { channelId: 'UCsBjURrPoezykLs9EqgamOA', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })

  test('Public channel w/o videos', () => {
    const parameters = { channelId: 'UCS-DgEvT4XuQsrrmI7iZVsA', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.items.length).toBe(0)
    })
  })

  test('Public channel recent videos playlist', () => {
    const parameters = { channelId: 'UCfMJ2MchTSW2kWaT0kK94Yw', channelIdType: 1, sortBy: 'newest' }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.playlistUrl.endsWith('list=UUfMJ2MchTSW2kWaT0kK94Yw')).toBe(true)
    })
  })

  test('Public channel oldest videos playlist (non-existent)', () => {
    const parameters = { channelId: 'UCfMJ2MchTSW2kWaT0kK94Yw', channelIdType: 1, sortBy: 'oldest' }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.playlistUrl).toBe(null)
    })
  })

  test('Public channel popular videos playlist', () => {
    const parameters = { channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA', channelIdType: 1, sortBy: 'popular' }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.playlistUrl.endsWith('list=PUX6OQ3DkcsbYNE6H8uQQuVA')).toBe(true)
    })
  })
})
