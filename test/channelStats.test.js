const ytch = require('../index')
/* eslint no-undef: "off" */
describe('Channel stats', () => {
  test('Channel stats', () => {
    const parameters = { channelId: 'UCMO51vS4kaOSLqBD9bmZGIg', channelIdType: 1 }
    return ytch.getChannelStats(parameters).then((data) => {
      expect(data.joinedDate).toBe(1355202000000)
    })
  })
})
