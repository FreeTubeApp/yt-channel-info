const ytch = require('../index')
/* eslint no-undef: "off" */
describe('Community Posts', () => {
  test('Channel with community posts', () => {
    const parameters = { channelId: 'UCfMJ2MchTSW2kWaT0kK94Yw', channelIdType: 1 }
    return ytch.getChannelCommunityPosts(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
})
