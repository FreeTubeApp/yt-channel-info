const _regex = {
  channel: /(channel|user)\/([a-zA-Z0-9\-_]*.)/
}

const urlModule = require('url')

class YoutubeGrabberValidation {
  /**
     * Is youtube url is channel
     * @param { string } url Youtube URL of resource
     * @returns { boolean } Return TRUE if resource is channel
     * */
  static isResourceIsChannel (url) {
    return url.includes('/user/') || url.includes('/channel/')
  }

  /**
     * Is youtube url is playlist
     * @param { string } url Youtube URL of resource
     * @returns { boolean } Return TRUE if resource is playlist
     * */
  static isResourceIsPlaylist (url) {
    return url.includes('playlist?list=')
  }

  /**
     * Is youtube url is video
     * @param { string } url Youtube URL of resource
     * @returns { boolean } Return TRUE if resource is video
     * */
  static isResourceIsVideo (url) {
    return rl.includes('watch?v=') || url.includes('/v/')
  }

  /**
     * Get channel id or user name from youtube url
     * @param { string } url Youtube URL of resource
     * @return { string | null } Return id or user name. Return NULL if wrong url
     * */
  static getChannelIdOrUser(url) {
    const regUser = _regex.channel.exec(url)
    if (regUser) { return regUser[2].endsWith('/') ? regUser[2].substring(0, regUser[2].length - 1) : regUser[2] }

    return null
  }

  /**
     * Get playlist id from youtube url
     * @param { string } url Youtube URL of resourse
     * @return { string | null } Return id of playlist or NULL if id not found
    */
  static getPlaylistId(url) {
    const urlParsed = urlModule.parse(url, true)
    return urlParsed.query.list || null
  }
}

module.exports = YoutubeGrabberValidation
