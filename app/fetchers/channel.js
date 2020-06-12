const axios = require('axios');
const moment = require('moment');
const queryString = require('querystring');
const YoutubeGrabberValidation = require('../validation');

const headers = {
    'x-youtube-client-name': '1',
    'x-youtube-client-version': '2.20180222',
    'accept-language': 'en-US,en;q=0.5'
};

class YoutubeChannelFetcher {
    constructor(url) {
        this._url = url;
    }

    /**
     * Get the video object
     * @param { Object } obj An object with youtube video data
     * @return { Object } Return the video object
     * */
    parseVideo(obj) {
        let viewCount
        let date = null
        let isLive = false
        let duration = null

        if (typeof (obj.gridVideoRenderer.publishedTimeText) !== 'undefined') {
          date = obj.gridVideoRenderer.publishedTimeText.simpleText
          viewCount = obj.gridVideoRenderer.viewCountText.simpleText
          duration = obj.gridVideoRenderer.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer.text.simpleText
        } else {
          isLive = true
          viewCount = obj.gridVideoRenderer.viewCountText.runs[0].text
        }

        return {
            id: obj.gridVideoRenderer.videoId,
            title: obj.gridVideoRenderer.title.simpleText,
            dateCreated: date,
            viewCount: viewCount,
            duration: duration,
            isLive: isLive
        };
    }

    /**
     * Get the playlist object
     * @param { Object } playlistObj An object with youtube playlist data
     * @return { Object } Return the playlist object
     * */
    parsePlaylist(playlistObj) {
        return {
            id: playlistObj.gridPlaylistRenderer.playlistId,
            url: `https://www.youtube.com/playlist?list=${playlistObj.gridPlaylistRenderer.playlistId}`,
            title: playlistObj.gridPlaylistRenderer.title.runs[0].text,
            thumbnail: playlistObj.gridPlaylistRenderer.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails[0].url.split('?')[0],
            videosCount: +playlistObj.gridPlaylistRenderer.videoCountShortText.simpleText
        }
    }

    /**
     * Get special tokens from youtube object
     * @param { Object } continationObject An object with tokens data to be parsed
     * @return { Object | null } Return token object or NULL if it no contination
     * */
    getTokens(continationObject) {
        if (continationObject.continuations && continationObject.continuations.length > 0 && continationObject.continuations[0].nextContinuationData) {
            return {
                clickTrackingParams:  continationObject.continuations[0].nextContinuationData.clickTrackingParams,
                continuation: continationObject.continuations[0].nextContinuationData.continuation
            };
        }

        return null;
    }

    /**
     * Determine if searched tab is selected
     * @param { object } tab The tab from response
     * @param searchValue { string } The tab's title
     * @return { boolean } Return true if searched tab is selected
     * */
    isSubmenuSelected(tab, searchValue) {
        if (!tab.tabRenderer.content.sectionListRenderer.subMenu)
            return false;

        const subMenus = tab.tabRenderer.content.sectionListRenderer.subMenu.channelSubMenuRenderer.contentTypeSubMenuItems;
        const searchedMenu = subMenus.find(menu => menu.title === searchValue);
        return !(!searchedMenu || (searchedMenu && !searchedMenu.selected));
    }

    /**
     * Search the tab object from response by title
     * @param { AxiosResponse } response A response of youtube
     * @param { string } tabTitle Title to search
     * */
    searchTab(response, tabTitle) {
        const tabs = response.data[1].response.contents.twoColumnBrowseResultsRenderer.tabs;
        const tabIndexWithVideos = tabs.findIndex((tab) => tab.tabRenderer ? tab.tabRenderer.title === tabTitle : false);
        return tabs[tabIndexWithVideos];
    }

    /**
     * Get first videos from video tab of youtube page
     * @return { Promise<Object> } Return the videos info
     * */
    async getFirstVideosAndTokens() {
        const response = await axios.get(`${this._url}videos?flow=grid&view=0&pbj=1`, { headers });
        const videoTab = this.searchTab(response, 'Videos');

        // If upload menu is not selected
        // Then user dont have any uploaded videos
        if (!this.isSubmenuSelected(videoTab, 'Uploads')) {
            return {
                error: {
                    status: false
                },
                tokens: null,
                info: {
                    resource: {
                        type: 'channel',
                        id: YoutubeGrabberValidation.getChannelIdOrUser(this._url)
                    },

                    videos: []
                }
            };
        }

        const channelVideosRaw = videoTab.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer;
        const tokens = this.getTokens(channelVideosRaw);

        // parse data from youtube object
        const videos = channelVideosRaw.items.map(videoItem => this.parseVideo(videoItem));
        return {
            error: {
                status: false
            },
            tokens: tokens,
            info: {
                resource: {
                    type: 'channel',
                    id: YoutubeGrabberValidation.getChannelIdOrUser(this._url)
                },

                videos: videos
            }
        };
    };

    /**
     * Get first playlists from playlists tab of youtube page
     * @return { Promise<Object> } Return the videos info
     * */
    async getFirstPlaylistsAndTokens() {
        const response = await axios.get(`${this._url}playlists?flow=grid&pbj=1&view=1&sort=dd&shelf_id=0`, { headers });
        const playlistTab = this.searchTab(response, 'Playlists');

        // If created menu is not selected
        // Then user dont have any playlists
        if (!this.isSubmenuSelected(playlistTab, 'Created playlists')) {
            return {
                error: {
                    status: false
                },
                tokens: null,
                info: {
                    resource: {
                        type: 'channel',
                        id: YoutubeGrabberValidation.getChannelIdOrUser(this._url)
                    },

                    playlists: []
                }
            };
        }


        const playlistsRaw = playlistTab.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer;
        const tokens = this.getTokens(playlistsRaw);

        // parse data from youtube object
        const playlists = playlistsRaw.items.map(playlistItem => this.parsePlaylist(playlistItem));
        return {
            error: {
                status: false
            },
            tokens: tokens,
            info: {
                resource: {
                    type: 'channel',
                    id: YoutubeGrabberValidation.getChannelIdOrUser(this._url)
                },

                playlists: playlists
            }
        };
    }

    /**
     * Get all videos from channel
     * @param { object } events An object with callback events
     * @param { Function } events.onVideos Callback function to get the part of videos
     * @return { Promise<Object> } Return the videos info after all videos are parsed
     * */
    async getVideos(events = {onVideos: null}) {
        const wrapperGettingVideos = async (tokens) => {
            // If tokens was not provided
            // Then try to get the first videos from youtube
            if (!tokens) {
                try {
                    return await this.getFirstVideosAndTokens();
                } catch(e) {
                    return {
                        error: {
                            status: true,
                            reason: 'For some reason the channel was not found. You can get a detailed error in a .payload field',
                            payload: e
                        },

                        info: null
                    };
                }
            }

            // If we have tokens
            // Then we need to send it to youtube to get the videos (youtube security :thinking:)
            try {
                const channelVideo = await axios.get(`https://www.youtube.com/browse_ajax?${queryString.stringify({
                    continuation: tokens.continuation,
                    ctoken: tokens.continuation,
                    itct: tokens.clickTrackingParams
                })}`, { headers });

                const grid = channelVideo.data[1].response.continuationContents.gridContinuation;
                const newTokens = this.getTokens(grid);
                const videos = grid.items.map(videoItem => this.parseVideo(videoItem));

                return {
                    error: {
                        status: false
                    },
                    tokens: newTokens,
                    info: {
                        resource: {
                            type: 'channel',
                            id: YoutubeGrabberValidation.getChannelIdOrUser(this._url)
                        },
                        videos: videos
                    }
                };
            } catch(e) {
                return {
                    error: {
                        status: true,
                        reason: 'Something goes wrong. You can get a detailed error in a .payload field',
                        payload: e
                    },
                    info: null
                };
            }
        };

        return new Promise((resolveParent, rejectParent) => {
            let count = 0;
            let parsed = {
                error: {
                    status: false
                },
                info: {
                    resource: {
                        type: 'channel',
                        id: YoutubeGrabberValidation.getChannelIdOrUser(this._url)
                    },
                    videos: []
                }
            };

            const scrapeChannel = (continuation) => {
                return new Promise((resolve, reject) => {
                    wrapperGettingVideos(continuation).then((videos) => {
                        if (videos.error.status) {
                            rejectParent(videos);
                        }

                        // If event is not null
                        // Call the callback to get information about parsed videos
                        if (events.onVideos) {
                            events.onVideos(videos.info.videos);
                        }

                        // If we not parsed all videos
                        if (videos.tokens) {
                            parsed.info.videos = [...parsed.info.videos, ...videos.info.videos];
                            count += videos.info.videos.length;

                            // TODO: Add max count options. With this option we can select how much video we need.
                            // TODO: This can save a lot of time
                            /*if (maxCount > 0 && count >= maxCount) {
                                resolveParent(readyVideos);
                                return;
                            }*/

                            resolve(scrapeChannel(videos.tokens));
                        } else {
                            if (videos.info !== null) {
                              parsed.info.videos = [...parsed.info.videos, ...videos.info.videos];
                              resolveParent(parsed);
                            }
                        }
                    });
                });
            };

            scrapeChannel(null);
        });
    }

    /**
     * Get all playlists from channel
     * @param { object } events An object with callback events
     * @param { Function } events.onPlaylists Callback function to get the part of playlists
     * @return { Promise<Object> } Return the playlists info after all playlists are parsed
     * */
    async getPlaylists(events = { onPlaylists: null }) {
        const wrapperGettingPlaylists = async (tokens) => {
            // If tokens was not provided
            // Then try to get the first videos from youtube
            if (!tokens) {
                try {
                    return await this.getFirstPlaylistsAndTokens();
                } catch(e) {
                    return {
                        error: {
                            status: true,
                            reason: 'For some reason the channel was not found. You can get a detailed error in a .payload field',
                            payload: e
                        },

                        info: null
                    };
                }
            }

            // If we have tokens
            // Then we need to send it to youtube to get the videos (youtube security :thinking:)
            try {
                const channelPlaylists = await axios.get(`https://www.youtube.com/browse_ajax?${queryString.stringify({
                    continuation: tokens.continuation,
                    ctoken: tokens.continuation,
                    itct: tokens.clickTrackingParams
                })}`, { headers });

                const grid = channelPlaylists.data[1].response.continuationContents.gridContinuation;
                const newTokens = this.getTokens(grid);
                const playlists = grid.items.map(playlistItem => this.parsePlaylist(playlistItem));

                return {
                    error: {
                        status: false
                    },
                    tokens: newTokens,
                    info: {
                        resource: {
                            type: 'channel',
                            id: YoutubeGrabberValidation.getChannelIdOrUser(this._url)
                        },
                        playlists: playlists
                    }
                };
            } catch(e) {
                return {
                    error: {
                        status: true,
                        reason: 'Something goes wrong. You can get a detailed error in a .payload field',
                        payload: e
                    },
                    info: null
                };
            }
        };

        return new Promise((resolveParent, rejectParent) => {
            let count = 0;
            let parsed = {
                error: {
                    status: false
                },
                info: {
                    resource: {
                        type: 'channel',
                        id: YoutubeGrabberValidation.getChannelIdOrUser(this._url)
                    },
                    playlists: []
                }
            };

            const scrapeChannel = (continuation) => {
                return new Promise((resolve, reject) => {
                    wrapperGettingPlaylists(continuation).then((playlists) => {
                        if (playlists.error.status) {
                            rejectParent(playlists);
                        }

                        // If event is not null
                        // Call the callback to get information about parsed videos
                        if (events.onPlaylists) {
                            events.onPlaylists(playlists.info.playlists);
                        }

                        // If we not parsed all videos
                        if (playlists.tokens) {
                            parsed.info.playlists = [...parsed.info.playlists, ...playlists.info.playlists];
                            count += playlists.info.playlists.length;

                            // TODO: Add max count options. With this option we can select how much playlists we need.
                            // TODO: This can save a lot of time
                            /*if (maxCount > 0 && count >= maxCount) {
                                resolveParent(readyVideos);
                                return;
                            }*/

                            resolve(scrapeChannel(playlists.tokens));
                        } else {
                            parsed.info.playlists = [...parsed.info.playlists, ...playlists.info.playlists];
                            resolveParent(parsed);
                        }
                    });
                });
            };

            scrapeChannel(null);
        });
    }
}

module.exports = YoutubeChannelFetcher;
