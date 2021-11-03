const ytch = require('../index')
/* eslint no-undef: "off" */
describe('Playlists', () => {
  test('Channel with playlists', () => {
    const parameters = { channelId: 'UCMO51vS4kaOSLqBD9bmZGIg', channelIdType: 1 }
    return ytch.getChannelPlaylistInfo(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Channel without playlists', () => {
    const parameters = { channelId: 'MrSCraft27', channelIdType: 2 }
    return ytch.getChannelPlaylistInfo(parameters).then((data) => {
      expect(data.items.length).toBe(0)
    })
  })
})
