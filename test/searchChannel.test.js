const { expect } = require('@jest/globals')
const ytch = require('../index')
/* eslint no-undef: 'off' */
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
})
