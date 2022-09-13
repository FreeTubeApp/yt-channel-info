const ytch = require('../index')
describe('Getting channel home', () => {
  test('Sports Explore', () => { // not fully implemented yet
    const parameters = { channelId: 'UCEgdi0XIXXZ-qJOFPf4JSKw', channelIdType: 1 }
    return ytch.getChannelHome(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('News Explore', () => {
    const parameters = { channelId: 'UCYfdidRxbB8Qhf0Nx7ioOYw', channelIdType: 1 }
    return ytch.getChannelHome(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Learning Explore', () => {
    const parameters = { channelId: 'UCtFRv9O2AHqOZjjynzrv-xg', channelIdType: 1 }
    return ytch.getChannelHome(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Fashion Explore', () => {
    const parameters = { channelId: 'UCrpQ4p1Ql_hG8rKXIKM1MOQ', channelIdType: 1 }
    return ytch.getChannelHome(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Music Explore', () => {
    const parameters = { channelId: 'UC-9-kyTW8ZkZNDHQJ6FgpwQ', channelIdType: 1 }
    return ytch.getChannelHome(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Mr Beast - regular channel', () => {
    const parameters = { channelId: 'MrBeast6000', channelIdType: 2 }
    return ytch.getChannelHome(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Rammstein - topic', () => {
    const parameters = { channelId: 'UCs6GGpd9zvsYghuYe0VDFUQ', channelIdType: 1 }
    return ytch.getChannelHome(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Deleted channel', () => {
    const parameters = { channelId: 'UC59AcfHD5jOGqTxb-zAsahw', channelIdType: 1 }
    return ytch.getChannelVideos(parameters).then((data) => {
      expect(data.alertMessage).not.toBe(undefined)
    })
  })
})
