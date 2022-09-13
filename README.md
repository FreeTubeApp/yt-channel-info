# YouTube Channel Info NodeJS Documentation
This library is designed to receive channel data from YouTube without accessing the official API.
<br />
This method has several advantages:
* No API key is required, which you should put next to your code;
* No restrictions on key usage (1 million [quota](https://developers.google.com/youtube/v3/getting-started#quota))

But there are also disadvantages:
* Data acquisition time increases by many times;
* Any change to the YouTube DOM entails non-working methods of this library.

You must consider this before you use **YouTube Channel Info**

## Installation
```
npm i yt-channel-info --save
```

## Usage

```javascript
// If using require
const ytch = require('yt-channel-info')

// If using import
import ytch from 'yt-channel-info'
```

## API

**getChannelInfo(payload)**
- payload (Object) (Required) - An object containing the various options
  - channelId (String) (Required) - The channel ID to get info from
  - channelIdType (Integer) (Optional) - Grabs newest comments when `true`. Grabs top comments when `false`
    - `0` = Default value used by the module. It will try all url types in the order channel -> user -> name
    - `1` = A channel id that is used with `https://www.youtube.com/channel/channelId` urls
    - `2` = A user id that is used with `https://www.youtube.com/user/channelId` urls
    - `3` = A name id that is used with `https://www.youtube.com/c/channelId` urls
  - httpsAgent (Object) (Optional) -  Defines Proxy data in an object like https proxy agent. Allows to specify host, port, protocol, authentication (see section Proxy)

```javascript
const payload = {
   channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw', // Required
   channelIdType: 0,
   httpsAgent: agent
}

ytch.getChannelInfo(payload).then((response) => {
   if (!response.alertMessage) {
      console.log(response)
   } else {
      console.log('Channel could not be found.')
      // throw response.alertMessage
   }
}).catch((err) => {
   console.log(err)
})


// Response object
{
   author: String,
   authorId: String,
   authorUrl: String,
   authorBanners: Array[Object], // Will return null if none exist
   authorThumbnails: Array[Object], // Will return null if none exist
   subscriberText: String,
   subscriberCount: Integer,
   description: String,
   isFamilyFriendly: Boolean,
   relatedChannels: {
      items: Array[Object],
      continuation: String // Will return null if there are 12 or fewer related channels.  Used with getRelatedChannelsMore()
   },
   allowedRegions: Array[String],
   isVerified: Boolean,
   isOfficialArtist: Boolean,
   tags: Array[String], // Will return null if none exist
   channelIdType: Number, 
   channelTabs: Array[String], // The tabs that are displayed on the channel (e.g., Videos, Playlists)
   alertMessage: String, // Will return a response alert message if any (e.g., "This channel does not exist."). Otherwise undefined
   channelLinks: {
      primaryLinks: Array[Object],
      secondaryLinks: Array[Object]
   }
}
```

**getChannelVideos(payload)**

Grabs videos from a given channel ID.
- payload (Object) (Required) - An object containing the various options
  - channelId (String) (Required) - The channel ID to get videos from
  - sortBy (String) (Optional) - How videos will be sorted
    - `newest` - Grabs videos from a channel sorted by newest / most recently uploaded (Default option if none given)
    - `oldest`- Grabs videos from a channel sorted by oldest videos
    - `popular` - Grabs videos from a channel sorted by the most popular (Highest amount of views)
  - channelIdType (Integer) (Optional) - Same definition as 'channelIdType' in `getChannelInfo()`
  - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in `getChannelInfo()`

 ```javascript
 const payload = {
    channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw', // Required
    sortBy: 'newest',
    channelIdType: 0
 }

ytch.getChannelVideos(payload).then((response) => {
   if (!response.alertMessage) {
      console.log(response)
   } else {
      console.log('Channel could not be found.')
      // throw response.alertMessage
   }
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object],
   continuation: String, // Will return null if no more results can be found.  Used with getChannelVideosMore()
   channelIdType: Number,
   alertMessage: String, // Will return a response alert message if any (e.g., "This channel does not exist."). Otherwise undefined 
 }
 ```

 **getChannelVideosMore(payload)**

 Grabs more videos within a channel.  Uses the continuation string returned from `getChannelVideos()` or from past calls to `getChannelVideosMore()`.

Grabs videos from a given channel ID.
- payload (Object) (Required) - An object containing the various options
  - continuation (String) (Required) - The continuation string from `getChannelVideos()` or from past calls to `getChannelVideosMore()`.
  - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in  `getChannelInfo()`


 ```javascript
  const payload = {
    continuation: '4qmFsgK9ARIYVUNYdXFTQmxIQUU2WHcteWVKQTBUdW53GqABRWdsd2JHRjViR2x6ZEhNZ0FYcG1VVlZzVUdFeGF6VlNiVkoyV1ZjNWJHVnNUbGhTUmxwWVZrVm9kR1ZHYTNoVU1EVnJUVWR3ZFdNd05VVmFSVVo0Vm10NGRsVnJWa2haYkd4dVUyNXZlbEpxUW5WT1YxRjNXbGhyTkZKcVVqVmhibEpXVkVVNWNtSkdUbnBaYXpWWVUxZDNNMVpSdUFFQQ%3D%3D', // Required
 }

ytch.getChannelVideosMore(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object],
   continuation: String // Will return null if no more results can be found.  Used with getChannelVideosMore()
 }
 ```

 **getChannelPlaylistInfo(payload)**

 Grabs playlist information of a given channel ID.
 - `payload (Object) (Required)` - An object containing the various options
   - channelId (String) (Required) - The channel ID to grab playlists from
   - sortBy (String) (Optional) - 'last' sort by last updated or 'newest' sort by creation date
      - `last` - Grabs playlists from a channel sorted by the most recently updated playlist (Default option if none given)
      - `oldest` - Grabs playlists from a channel sorted by the creation date (oldest first)
      - `newest` - Grabs playlists from a channel sorted by the creation date (newest first)
   - httpsAgent (Object) (Optional) - Same definition as 'httpsAgent' in `getChannelInfo()`
   - channelIdType (Integer) (Optional) - Same definition as 'channelIdType' in `getChannelInfo()` 

```javascript
const payload = {
   channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
   sortBy: 'last',
}

ytch.getChannelPlaylistInfo(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object],
   continuation: String // Will return null if no more results can be found.  Used with getChannelPlaylistsMore()
   channelIdType: Number,
 }
 ```

  **getChannelPlaylistsMore(payload)**

 Grabs more playlists within a channel.  Uses the continuation string returned from `getChannelPlaylists()` or from past calls to `getChannelPlaylistsMore()`.
 - payload (Object) (Required) - An object containing the various options
   - continuation (String) (Required) - The continuation string from `getChannelPlaylists()` or from past calls to `getChannelPlaylistsMore()`.
   - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in `getChannelInfo()`

```javascript
const payload = {
   continuation: '4qmFsgK9ARIYVUNYdXFTQmxIQUU2WHcteWVKQTBUdW53GqABRWdsd2JHRjViR2x6ZEhNZ0FYcG1VVlZzVUdFeGF6VlNiVkoyV1ZjNWJHVnNUbGhTUmxwWVZrVm9kR1ZHYTNoVU1EVnJUVWR3ZFdNd05VVmFSVVo0Vm10NGRsVnJWa2haYkd4dVUyNXZlbEpxUW5WT1YxRjNXbGhyTkZKcVVqVmhibEpXVkVVNWNtSkdUbnBaYXpWWVUxZDNNMVpSdUFFQQ%3D%3D'
}

ytch.getChannelPlaylistsMore(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object],
   continuation: String // Will return null if no more results can be found.  Used with getChannelPlaylistsMore()
 }
 ```

 **searchChannel(payload)**

 Searchs for videos and playlists of a given channelId based on the given query
 - payload (Object) (Required) - An object containing the various options
   - channelId (String) (Required) - The channel you want to search
   - query (String) (Required) - The query you want to use
   - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in `getChannelInfo()`
   - channelIdType (Integer) (Optional) - Same definition as 'channelIdType' `getChannelInfo()` 
  
```javascript
const payload = {
   channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
   query: 'linux'
}

ytch.searchChannel(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object],
   continuation: String // Will return null if no more results can be found.  Used with searchChannelMore()
 }
 ```

  **searchChannelMore(payload)**

 Grabs more search results within a channel.  Uses the continuation string returned from `searchChannel()` or from past calls to `searchChannelMore()`.
 - payload (Object) (Required) - An object containing the various options
   - continuation (String) (Required) - The continuation string from `searchChannel()` or from past calls to `searchChannelMore()`.
   - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in `getChannelInfo()`

```javascript
const payload = {
  continuation: '4qmFsgK9ARIYVUNYdXFTQmxIQUU2WHcteWVKQTBUdW53GqABRWdsd2JHRjViR2x6ZEhNZ0FYcG1VVlZzVUdFeGF6VlNiVkoyV1ZjNWJHVnNUbGhTUmxwWVZrVm9kR1ZHYTNoVU1EVnJUVWR3ZFdNd05VVmFSVVo0Vm10NGRsVnJWa2haYkd4dVUyNXZlbEpxUW5WT1YxRjNXbGhyTkZKcVVqVmhibEpXVkVVNWNtSkdUbnBaYXpWWVUxZDNNMVpSdUFFQQ%3D%3D' 
}

ytch.searchChannelMore(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object],
   continuation: String // Will return null if no more results can be found.  Used with searchChannelMore()
 }
 ```

**getRelatedChannelsMore(payload)**

 Grabs more related channels within a channel.  Uses the relatedChannelsContinuation string returned from `getChannelInfo()` or from past calls to `getRelatedChannelsMore()`.
 - payload (Object) (Required) - An object containing the various options
   - continuation (String) (Required) - The continuation string from `getChannelInfo()` or from past calls to `getRelatedChannelsMore()`.
   - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in `getChannelInfo()`
  
```javascript
 const payload = {
    continuation: '4qmFsgKlARIYVUNtOUs2cmJ5OThXOEppZ0xvWk9oNkZRGlhFZ2hqYUdGdWJtVnNjeGdESUFBd0FUZ0I2Z01vUTJkQlUwZG9iMWxXVlU1M1pXdHNVR1ZzUW5saE1IaGhXWHBhWm1SV1NsSldWazQyVG5wa1VnJTNEJTNEmgIuYnJvd3NlLWZlZWRVQ205SzZyYnk5OFc4SmlnTG9aT2g2RlFjaGFubmVsczE1Ng%3D%3D'
 } 

ytch.getRelatedChannelsMore(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object],
   continuation: String // Will return null if no more results can be found.  Used with getRelatedChannelsMore()
 }
 ```

**getChannelCommunityPosts(payload)**

Searches for all posts on the community page of a given channelId based on the given query.

- payload (Object) (Required) - An object containing the various options
  - channelId (String) (Required) - The channel ID to get community posts from
  - channelIdType (Integer) (Optional) - Same definition as 'channelIdType' for `getChannelInfo()`
  - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in `getChannelInfo()`


```javascript
const payload = {
   channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw'
}

ytch.getChannelCommunityPosts(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object], // Described below
   continuation: String, // Will return null if no more results can be found.  Used with searchChannelMore()
   innerTubeApi: String,
   channelIdType: Number,
 }
 ```

 **getChannelStats(payload)**

Gets the stats of a channel
- payload (Object) (Required) - An object containing the various options
  - channelId (String) (Required) - The channel ID to get stats from
  - channelIdType (Integer) (Optional) - Same definition as `channelIdType` in `getChannelInfo()`
  - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in `getChannelInfo()`


```javascript
const payload = {
   channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw'
}

ytch.getChannelStats(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   joinedDate: Integer, // Date joined in ms
   viewCount: Integer, // Total views on channel
   location: String // location of channel
 }
 ```

**getChannelCommunityPostsMore(payload)**

Grabs more search results within a channel community page.  Uses the continuation and innerTubeApi strings returned from `getChannelCommunityPosts()` or from past calls to `getChannelCommunityPostsMore()`.
- payload (Object) (Required) - An object containing the various options
   - continuation (String) (Required) - The continuation string from `getChannelCommunityPosts()` or from past calls to `getChannelCommunityPostsMore()`.
   - innterTubeApi (String) (Required) - The innerTubeApi string from `getChannelCommunityPosts()` or from past calls to `getChannelCommunityPostsMore()`.
   - httpsAgent (Object) (Optional) -  Same definition as 'httpsAgent' in `getChannelInfo()`
  
```javascript
const payload = {
   continuation: '4qmFsgK9ARIYVUNYdXFTQmxIQUU2WHcteWVKQTBUdW53GqABRWdsd2JHRjViR2x6ZEhNZ0FYcG1VVlZzVUdFeGF6VlNiVkoyV1ZjNWJHVnNUbGhTUmxwWVZrVm9kR1ZHYTNoVU1EVnJUVWR3ZFdNd05VVmFSVVo0Vm10NGRsVnJWa2haYkd4dVUyNXZlbEpxUW5WT1YxRjNXbGhyTkZKcVVqVmhibEpXVkVVNWNtSkdUbnBaYXpWWVUxZDNNMVpSdUFFQQ%3D%3D',
   innerTubeApi: 'JNDJSGJHASJ44DSHGDNLGMHA6FSFas5faF5'
}

ytch.getChannelCommunityPostsMore(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object], // Described below
   continuation: String, // Will return null if no more results can be found.  Used with searchChannelMore()
   innerTubeApi: String
 }
 ```

 **getChannelHome(payload)**

 Searchs for videos and playlists of a given channelId based on the given query
 - payload (Object) (Required) - An object containing the various options
   - channelId (String) (Required) - The channel you want to search
   - channelIdType (Integer) (Optional) - defined as for `getChannelInfo()`
   - httpsAgent (Object) (Optional) -  defined as for `getChannelInfo()`
  
```javascript
const payload = {
   channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
}

ytch.getChannelHome(payload).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   featuredVideo: {
      type: 'video',
      title: String,
      videoId: String,
      author: String,
      authorId: String,
      videoThumbnails: [],
      viewCountText: String,
      viewCount: Number,
      publishedText: String,
      durationText: undefined,
      lengthSeconds: 0,
      liveNow: Boolean,
      premier: Boolean,
      premium: Boolean
   },
   items: Array[Object],
 }
 ```
**Community Posts Format**

The objects in the array of community posts all follow a basic structure but vary drastically in the postContent field of the object.

-`httpsAgent` defined as for `getChannelInfo()`
  
```javascript
postData = {
  postText: String,
  postId: String, 
  author: String,
  authorThumbnails: Array[Object], // Array of objects with links to images
  publishedText: String,
  voteCount: String,
  postContent: Object, // null if the post only consists of text
  commentCount: String
}

// If the post contains an image
imagePostContent = {
  type: 'image',
  content: Array[Object] // Array of objects with links to images
}

pollPostContent = {
   type: 'poll',
   content: {
      choices: Array[String],
      totalVotes: String 
   }
}

videoPostContent = {
   type: 'video',
   content: {
      videoId: String,
      title: String,
      description: String,
      publishedText: String,
      lengthText: String,
      viewCountText: String,
      ownerBadges: Object, // Object indicating possible badges {verified: false, officialArtist: false}
      author: String,
      thumbnails: Array[Object] // Array of objects with links to images
  }
}

playlistPostContent = {
   type: 'playlist',
   content: {
      playlistId: String,
      title: String,
      playlistVideoRenderer: Array[Object], // An array of minimized videoPostContent data
      videoCountText: String,
      ownerBadges: Array[Object],
      author: String,
      thumbnails: Array[Object] // Array of objects with links to images
   }
}

 ```

### Proxy (HTTP Agent)
In order to use a proxy, you have to provide an assembled HTTP Agent. This can be achieved via additional packages like https-proxy-agent:
```
import HttpsProxyAgent from 'https-proxy-agent';
const proxy = 'http://127.0.0.1:10003';
const httpAgent = HttpsProxyAgent(proxy);
```

## Tests

Tests and code standards are still in the process of being created.  Check back later for information on how tests should be performed.

## Contribution

PRs are welcome.  Testing and coding guidlines are still in the works so I will try to get those created at a later point.  Try to keep similar code syntax to the rest of the code.

## Credits

This is a fork of the `youtube-grabber-js` module created by OlegRom4ig

View the original project on [NPM](https://www.npmjs.com/package/youtube-grabber-js) or [GitLab](https://gitlab.com/olroma123/youtube-grabber-nodejs)

## License

You have explicit permission to use this project as stated in the terms of the [ISC license](https://github.com/FreeTubeApp/yt-channel-info/blob/master/LICENSE).
