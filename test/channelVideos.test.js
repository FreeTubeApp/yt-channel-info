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
})
