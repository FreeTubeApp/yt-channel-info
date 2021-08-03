const grab = require('./index')

async function f() {
  const grabber = await grab.getChannelInfo('UCW3olC64tqnl32wKqQvY07Q')
  console.log(grabber)
}
f()
