const YoutubeGrabberValidation = require('./validation');
const YoutubeGrabberHelper = require('./helper');

const axios = require('axios');
const isUrl = require('is-url');
const cheerio = require('cheerio');
const Entities = require('html-entities').AllHtmlEntities;
const htmlEntities = new Entities();

// Fetchers
const YoutubeChannelFetcher = require('./fetchers/channel');
const YoutubePlaylistFetcher = require('./fetchers/playlist');

class YoutubeGrabber {
  /**
  * Check the URL to be an youtube link. This function is not checking for existing the resource
  * @param { string } url The URL of youtube resource
  * @returns { boolean } Return TRUE if url is youtube link
  * */
  static isYoutubeURLValid(url) {
    if (!url || typeof url !== 'string' || !url.includes('youtube'))
    return false;

    if (!isUrl(url)) {
      return false;
    }

    return YoutubeGrabberValidation.isResourceIsChannel(url) ||
    YoutubeGrabberValidation.isResourceIsPlaylist(url) ||
    YoutubeGrabberValidation.isResourceIsVideo(url);
  }

  /**
  * Get type of resource
  * @param { string } url The URL of youtube resource
  * @returns { string | null } Return the type of resource or null if resource is invalid
  * */
  static getTypeOfResource(url) {
    if (!YoutubeGrabber.isYoutubeURLValid(url)) return null;

    if (YoutubeGrabberValidation.isResourceIsChannel(url)) return 'channel';
    if (YoutubeGrabberValidation.isResourceIsPlaylist(url)) return 'playlist';
    if (YoutubeGrabberValidation.isResourceIsVideo(url)) return 'video';

    return null;
  }

  /**
  * Check resource for existing on youtube
  * @param { string } url The URL of youtube resource
  * @returns { boolean } Return TRUE if: channel is exists, playlist is exists, video is exists
  * */
  static async isResourceExists(url) {
    if (!YoutubeGrabber.isYoutubeURLValid(url)) return false;
    return await YoutubeGrabberHelper.isResourceExists(url);
  }

  /**
  * Get channel information. Full list of channel information you can find in README.md file
  * @param { string } channelURL A channel url. Should contains at least user or channel word
  * @param { Object } config An object with parsing option
  * @param { boolean } config.videos Should parse the videos
  * @param { boolean } config.playlists Should parse the playlists
  * @return { Promise<Object> } Return channel information
  * */
  static async getChannelInfo(channelURL, config = {videos: false, playlists: false}) {
    const isChannelExists = await YoutubeGrabber.isResourceExists(channelURL);
    if (!isChannelExists) {
      return {
        error: { status: true, reason: 'Channel does not exist or blocked' },
        info: null
      };
    }

    const channelIdRaw = YoutubeGrabberValidation.getChannelIdOrUser(channelURL);
    if (!channelIdRaw) {
      return {
        error: { status: true, reason: 'Wrong URL' },
        info: null
      };
    }

    if (channelURL.includes('/user/')) {
      channelURL = `https://youtube.com/user/${channelIdRaw}/`;
    } else if (channelURL.includes('/channel/')) {
      channelURL = `https://youtube.com/channel/${channelIdRaw}/`;
    }

    const cookieCollectResponse = await axios.get(channelURL);

    // INFO: In the first request we just collect cookies.
    // This step is important, because otherwise YouTube will give an error message saying "Choose a language"
    // And yes, i know that this is bad, but who cares. Am i right? (づ ◕‿◕ )づ
    // FIXME: Should fix it
    const channelPageResponse = await axios.get(channelURL);

    const channelPage = cheerio.load(channelPageResponse.data);

    // If youtube print the error
    // Then return the error object
    const alerts = channelPage('#alerts .yt-alert-message');
    if (alerts.length !== 0) {
      return {
        error: {
          status: true,
          reason: htmlEntities.decode(alerts.html()).trim()
        },
        info: null
      };
    }

    const channelSubscribers = channelPage('span.subscribed');

    const channelInfo = {
      error: {
        status: false
      },
      info: {
        id: channelPage('meta[itemprop="channelId"]').attr('content'),
        title: channelPage('meta[itemprop="name"]').attr('content'),
        description: channelPage('meta[itemprop="description"]').attr('content'),
        avatarURL: channelPage('link[rel="image_src"]').attr('href'),
        subscriberCount: channelSubscribers.length !== 0 ? Number.parseInt(channelSubscribers.html().replace('&#xA0;', '')) : false,
        isConfirmed: channelPage('span.has-badge').length > 0,
      }
    };

    // If need to get all videos
    const channelFetcher = new YoutubeChannelFetcher(channelURL);
    if (config.videos) {
      const videosInfo = await channelFetcher.getVideos();

      // If parsed with error
      if (videosInfo.error.status) {
        return {
          error: videosInfo.error,
          info: null
        };
      }

      channelInfo.info.videos = videosInfo.info.videos;
    }

    // If need to get all playlists
    if (config.playlists) {
      const playlistsInfo = await channelFetcher.getPlaylists();

      // If parsed with error
      if (playlistsInfo.error.status) {
        return {
          error: playlistsInfo.error,
          info: null
        };
      }

      channelInfo.info.playlists = playlistsInfo.info.playlists;
    }

    return channelInfo;
  }

  /**
  * Get playlist information (with videos)
  * @param { string } playlistURL A playlist url
  * @return { Promise<Object> } Return playlist information
  * */
  static async getPlaylistInfo(playlistURL) {
    const isPlaylistsExists = await YoutubeGrabber.isResourceExists(playlistURL);
    if (!isPlaylistsExists) {
      return {
        error: { status: true, reason: 'Playlist does not exist or private' },
        info: null
      };
    }

    const playlistId = YoutubeGrabberValidation.getPlaylistId(playlistURL);
    if (!playlistId) {
      return {
        error: { status: true, reason: 'Wrong URL' },
        info: null
      };
    }

    playlistURL = `https://www.youtube.com/playlist?list=${playlistId}`;

    const cookieCollectResponse = await axios.get(playlistURL);

    // INFO: In the first request we just collect cookies.
    // This step is important, because otherwise YouTube will give an error message saying "Choose a language"
    // And yes, i know that this is bad, but who cares. Am i right? (づ ◕‿◕ )づ
    // FIXME: Should fix it
    const playlistResponse = await axios.get(playlistURL, {
      headers: {
        cookie: cookieCollectResponse.headers['set-cookie'].join(';')
      }
    });

    const playlistPage = cheerio.load(playlistResponse.data);

    // If youtube print the error
    // Then return the error object
    const alerts = playlistPage('#alerts .yt-alert-message');
    if (alerts.length !== 0) {
      return {
        error: {
          status: true,
          reason: htmlEntities.decode(alerts.html()).trim()
        },
        info: null
      };
    }

    const playlistDetails = playlistPage('.pl-header-details');
    const playlistOwner = playlistDetails.find('li a')[0];

    const playlistInfo = {
      error: {
        status: false
      },

      info: {
        id: playlistId,
        title: playlistPage('meta[name="title"]').attr('content'),
        description: playlistPage('meta[name="description"]').attr('content'),
        playlistImage: playlistPage('meta[property="og:image"]').attr('content').split('?')[0],
        videos: {
          count: parseInt(playlistDetails.find('li')[1].children[0].data)
        },
        views: parseInt(playlistDetails.find('li')[2].children[0].data.replace(/\s+/g, '')),
        channel: {
          url: `https://youtube.com${playlistOwner.attribs.href}`,
          name: playlistOwner.children[0].data
        }
      }
    };

    // If need to parse the videos
    const playlistFetcher = new YoutubePlaylistFetcher(playlistURL);
    let parsed = null;
    try {
      parsed = await playlistFetcher.parse();
    } catch(err) {
      return {
        error: {
          status: true,
          reason: err.message
        },

        info: null
      };
    }

    playlistInfo.info.videos.array = parsed.payload;

    return playlistInfo;
  }
}

module.exports = YoutubeGrabber;
