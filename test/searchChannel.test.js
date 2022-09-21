const ytch = require('../index')
describe('Searching channels', () => {
  test('Search channel', () => {
    const parameters = { channelId: 'UCsBjURrPoezykLs9EqgamOA', channelIdType: 1, query: 'Java' }
    return ytch.searchChannel(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Search channel more', () => {
    const parameters = { channelId: 'UCsBjURrPoezykLs9EqgamOA', channelIdType: 1, query: 'Java' }
    return ytch.searchChannel(parameters).then((data) => {
      return ytch.searchChannelMore({ continuation: data.continuation }).then(sm => {
        expect(sm.items.length).not.toBe(0)
      })
    })
  })
  test('Deleted channel', () => {
    const parameters = { channelId: 'UC59AcfHD5jOGqTxb-zAsahw', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.alertMessage).not.toBe(undefined)
    })
  })
})
