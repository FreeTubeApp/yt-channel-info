const ytch = require('../index')
describe('Channel stats', () => {
  test('Channel stats', () => {
    const parameters = { channelId: 'UCMO51vS4kaOSLqBD9bmZGIg', channelIdType: 1 }
    return ytch.getChannelStats(parameters).then((data) => {
      expect(data.joinedDate).toBeGreaterThanOrEqual(1355227200000 - 86400000)
      expect(data.joinedDate).toBeLessThanOrEqual(1355227200000 + 86400000)
    })
  })
  test('Deleted channel', () => {
    const parameters = { channelId: 'UC59AcfHD5jOGqTxb-zAsahw', channelIdType: 1 }
    return ytch.getChannelStats(parameters).then((data) => {
      expect(data.alertMessage).not.toBe(undefined)
    })
  })
})
