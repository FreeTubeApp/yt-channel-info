const { expect, test } = require('@jest/globals')
const ytch = require('../index')
/* eslint no-undef: "off" */
describe('Getting channel home', () => {
  // test('Channel with no tabs', () => { // not fully implemented yet
  //   const parameters = { channelId: 'UCEgdi0XIXXZ-qJOFPf4JSKw', channelIdType: 1 }
  //   return ytch.getChannelHome(parameters).then((data) => {
  //     expect(data.items.length).not.toBe(0)
  //   })
  // })
  test('Channel with some tabs', () => {
    const parameters = { channelId: 'UCYfdidRxbB8Qhf0Nx7ioOYw', channelIdType: 1 }
    return ytch.getChannelHome(parameters).then((data) => {
      expect(data.items.length).not.toBe(0)
    })
  })
})
