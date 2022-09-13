const ytch = require('../index')
describe('Playlists', () => {
  test('Channel with playlists', () => {
    const parameters = { channelId: 'UCMO51vS4kaOSLqBD9bmZGIg', channelIdType: 1 }
    return ytch.getChannelPlaylistInfo(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Get playlists more', () => {
    const parameters = { channelId: 'UCPPc2PdtA7gCMbjYp_i_TKA', channelIdType: 1 }
    return ytch.getChannelPlaylistInfo(parameters).then((data) => {
      return ytch.getChannelPlaylistsMore({ continuation: data.continuation }).then(pm => {
        expect(pm.items.length).not.toBe(0)
      })
    })
  })
  test('Get channel playlists oldest', () => {
    const parameters = { channelId: 'UCMO51vS4kaOSLqBD9bmZGIg', channelIdType: 1, sortBy: 'oldest' }
    return ytch.getChannelPlaylistInfo(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Get channel playlists newest', () => {
    const parameters = { channelId: 'UCMO51vS4kaOSLqBD9bmZGIg', channelIdType: 1, sortBy: 'newest' }
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
  test('Channel missing playlist tab', () => {
    const parameters = { channelId: 'UCYfdidRxbB8Qhf0Nx7ioOYw', channelIdType: 1 }
    return ytch.getChannelPlaylistInfo(parameters).then((data) => {
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
