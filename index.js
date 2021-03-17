module.exports = require('./app/youtube-grabber')
const grab = require('./app/youtube-grabber')

async function f() {
  let res = await grab.getChannelCommunityPosts('Finanzfluss')
  for(let i = 0; i < 100; i++) {
    res = await grab.getChannelCommunityPostsMore(res.continuation, res.innerTubeApi)
    if (res === null) {
      return
    }
  }
}
f()
