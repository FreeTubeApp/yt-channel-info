const ytch = require('../index')
/* eslint no-undef: "off" */
describe('Community Posts', () => {
  test('Channel with community posts', () => {
    const parameters = { channelId: 'UCfMJ2MchTSW2kWaT0kK94Yw', channelIdType: 1 }
    return ytch.getChannelCommunityPosts(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
  test('Get channel community posts more', () => {
    const parameters = { channelId: 'UCnkp4xDOwqqJD7sSM3xdUiQ', channelIdType: 1 }
    return ytch.getChannelCommunityPosts(parameters).then((data) => {
      return ytch.getChannelCommunityPostsMore({ continuation: data.continuation, innerTubeApi: data.innerTubeApi }).then(cpm => {
        expect(data.items.length).not.toBe(0)
      })
    })
  })
})
