const axios = require('axios');
const cheerio = require('cheerio');
const querystring = require('querystring');
const fs = require('fs');

class PlaylistFetcher {
  constructor(url) {
    const _url = url;
    this.getOriginalURL = () => _url;
  }

  continationParse({ctoken, itct, url = null}) {
    return new Promise((resolve, reject) => {
      const aUrl = !url ? `https://www.youtube.com/browse_ajax?${querystring.stringify({ctoken, itct, continuation: ctoken})}` :
        `https://www.youtube.com${url}`;

      axios.get(aUrl)
      .then(response => {
        const $ = cheerio.load(response.data.content_html);
        const videos = cheerio('tr', response.data.content_html);

        let loadMore = response.data.load_more_widget_html ? cheerio.load(response.data.load_more_widget_html) : false;
        if (loadMore) {
          loadMore = loadMore('button').attr('data-uix-load-more-href');
        }

        resolve({ 
          payload: videos.map((i, el) => {
            return {
              id: $(el).attr('data-video-id'),
              youtubeUrl: `/watch?v=${$(el).attr('data-video-id')}`,
              thumbnail: $(el).find('.video-thumb img').attr('data-thumb').split('?')[0],
              title: $(el).attr('data-title'),
              duration: $(el).find('.timestamp span').text()
            };
          }).toArray(),
          
          loadMore
        });
      })
    });
  }
  
  parse() {
    return new Promise((resolve, reject) => {
      axios.get(this.getOriginalURL(), {
        headers: {
          'accept-language': 'en-US,en;q=0.5',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 OPR/60.0.3255.109'
        }
      })
      .then(async response => {
        if (response.request.res.responseUrl.includes('oops')) {
          reject({ message: 'Playlist does not exists' });
        }

        const tempArrayString = 'window["ytInitialData"] = ';
        const tempIndex = response.data.indexOf('window["ytInitialData"] = ');

        let text = response.data.substring(tempIndex + tempArrayString.length);
        text = JSON.parse(text.substring(0, text.indexOf(';')));

        // If there is error on accessing the playlist
        // (e.g private or etc.)
        if (text.alerts && text.alerts.length > 0) {
          reject({ message: text.alerts[0].alertRenderer.text.simpleText });
        }
        
        const playlist = text.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer;

        // If need not all videos loaded
        let continationVideos = [];
        if (playlist.continuations && playlist.continuations[0].nextContinuationData) {
          let newLoadedVideos = null;
          do {
            newLoadedVideos = await this.continationParse(!newLoadedVideos ? {
              ctoken: playlist.continuations[0].nextContinuationData.continuation,
              itct: playlist.continuations[0].nextContinuationData.clickTrackingParams
            } : { url: newLoadedVideos.loadMore });

            continationVideos = continationVideos.concat(newLoadedVideos.payload);
          } while(newLoadedVideos.loadMore);
        }

        if (playlist) {
          resolve({ payload: playlist.contents.map(item => {
            return {
              id: item.playlistVideoRenderer.videoId,
              youtubeUrl: `/watch?v=${item.playlistVideoRenderer.videoId}`,
              title: item.playlistVideoRenderer.title.simpleText,
              thumbnail: item.playlistVideoRenderer.thumbnail.thumbnails[0].url.split('?')[0],
              duration: item.playlistVideoRenderer.lengthText.simpleText
            };
          }).concat(continationVideos) });
        }

        reject({ message: 'Playlist does not exists' });
      })
      .catch(err => {
        reject({ message: 'Playlist does not exists' });
      });
    });
  }
}

module.exports = PlaylistFetcher;