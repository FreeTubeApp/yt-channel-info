const { expect } = require('@jest/globals')
const ytch = require('../index')
/* eslint no-undef: 'off' */
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
})
