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

**getChannelInfo(channelId, [channelIdType])**

Returns information about a given channel ID.
The optional argument 'channelIdType' can be provided to get faster results and less network requests if the type of channel id is known.
- `0` = Default value used by the module. It will try all url types in the order channel -> user -> name
- `1` = A channel id that is used with `https://www.youtube.com/channel/channelId` urls
- `2` = A user id that is used with `https://www.youtube.com/user/channelId` urls
- `3` = A name id that is used with `https://www.youtube.com/c/channelId` urls

```javascript
const channelId = 'UCXuqSBlHAE6Xw-yeJA0Tunw'

ytch.getChannelInfo(channelId, channelIdType).then((response) => {
   console.log(response)
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
   channelIdType: Number, 
}
```

**getChannelVideos(channelId, [sortBy], [channelIdType])**

Grabs videos from a given channel ID.

 - `newest` - Grabs videos from a channel sorted by newest / most recently uploaded (Default option if none given)
 - `oldest` - Grabs videos from a channel sorted by oldest videos
 - `popular` - Grabs videos from a channel sorted by the most popular (Highest amount of views)


- `channelIdType` defined as for `getChannelInfo()`
 ```javascript
 const channelId = 'UCXuqSBlHAE6Xw-yeJA0Tunw'
 const sortBy = 'newest'

ytch.getChannelVideos(channelId, sortBy, channelIdType).then((response) => {
   console.log(response)
}).catch((err) => {
   console.log(err)
})

 // Response object
 {
   items: Array[Object],
   continuation: String, // Will return null if no more results can be found.  Used with getChannelVideosMore()
   channelIdType: Number,
 }
 ```

 **getChannelVideosMore(continuation)**

 Grabs more videos within a channel.  Uses the continuation string returned from `getChannelVideos()` or from past calls to `getChannelVideosMore()`.

  ```javascript
 const continuation = '4qmFsgK9ARIYVUNYdXFTQmxIQUU2WHcteWVKQTBUdW53GqABRWdsd2JHRjViR2x6ZEhNZ0FYcG1VVlZzVUdFeGF6VlNiVkoyV1ZjNWJHVnNUbGhTUmxwWVZrVm9kR1ZHYTNoVU1EVnJUVWR3ZFdNd05VVmFSVVo0Vm10NGRsVnJWa2haYkd4dVUyNXZlbEpxUW5WT1YxRjNXbGhyTkZKcVVqVmhibEpXVkVVNWNtSkdUbnBaYXpWWVUxZDNNMVpSdUFFQQ%3D%3D'

ytch.getChannelInfoMore(continuation).then((response) => {
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

 **getChannelPlaylistInfo(channelId, [sortBy], [channelIdType])**

 Grabs playlist information of a given channel ID.

 - `last` - Grabs playlists from a channel sorted by the most recently updated playlist (Default option if none given)
 - `newest` - Grabs playlists from a channel sorted by the creation date (newest first)


- `channelIdType` defined as for `getChannelInfo()` 
  
```javascript
const channelId = 'UCXuqSBlHAE6Xw-yeJA0Tunw'
const sortBy = 'last'

ytch.getChannelPlaylistInfo(channelId, sortBy, channelIdType).then((response) => {
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

  **getChannelPlaylistsMore(continuation)**

 Grabs more playlists within a channel.  Uses the continuation string returned from `getChannelPlaylists()` or from past calls to `getChannelPlaylistsMore()`.

  ```javascript
const continuation = '4qmFsgK9ARIYVUNYdXFTQmxIQUU2WHcteWVKQTBUdW53GqABRWdsd2JHRjViR2x6ZEhNZ0FYcG1VVlZzVUdFeGF6VlNiVkoyV1ZjNWJHVnNUbGhTUmxwWVZrVm9kR1ZHYTNoVU1EVnJUVWR3ZFdNd05VVmFSVVo0Vm10NGRsVnJWa2haYkd4dVUyNXZlbEpxUW5WT1YxRjNXbGhyTkZKcVVqVmhibEpXVkVVNWNtSkdUbnBaYXpWWVUxZDNNMVpSdUFFQQ%3D%3D'

ytch.getChannelPlaylistsMore(continuation).then((response) => {
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

 **searchChannel(channelId, query)**

 Searchs for videos and playlists of a given channelId based on the given query

   ```javascript
const channelId = 'UCXuqSBlHAE6Xw-yeJA0Tunw'
const query = 'linux'

ytch.searchChannel(channelId, query).then((response) => {
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

  **searchChannelMore(continuation)**

 Grabs more search results within a channel.  Uses the continuation string returned from `searchChannel()` or from past calls to `searchChannelMore()`.

  ```javascript
const continuation = '4qmFsgK9ARIYVUNYdXFTQmxIQUU2WHcteWVKQTBUdW53GqABRWdsd2JHRjViR2x6ZEhNZ0FYcG1VVlZzVUdFeGF6VlNiVkoyV1ZjNWJHVnNUbGhTUmxwWVZrVm9kR1ZHYTNoVU1EVnJUVWR3ZFdNd05VVmFSVVo0Vm10NGRsVnJWa2haYkd4dVUyNXZlbEpxUW5WT1YxRjNXbGhyTkZKcVVqVmhibEpXVkVVNWNtSkdUbnBaYXpWWVUxZDNNMVpSdUFFQQ%3D%3D'

ytch.searchChannelMore(continuation).then((response) => {
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

**getRelatedChannelsMore(continuation)**

 Grabs more related channels within a channel.  Uses the relatedChannelsContinuation string returned from `getChannelInfo()` or from past calls to `getRelatedChannelsMore()`.

  ```javascript
 const continuation = '4qmFsgKlARIYVUNtOUs2cmJ5OThXOEppZ0xvWk9oNkZRGlhFZ2hqYUdGdWJtVnNjeGdESUFBd0FUZ0I2Z01vUTJkQlUwZG9iMWxXVlU1M1pXdHNVR1ZzUW5saE1IaGhXWHBhWm1SV1NsSldWazQyVG5wa1VnJTNEJTNEmgIuYnJvd3NlLWZlZWRVQ205SzZyYnk5OFc4SmlnTG9aT2g2RlFjaGFubmVsczE1Ng%3D%3D'

ytch.getRelatedChannelsMore(continuation).then((response) => {
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

**getChannelCommunityPosts(channelId, [channelIdType])**

Searches for all posts on the community page of a given channelId based on the given query.

- `channelIdType` defined as for `getChannelInfo()`

```javascript
const channelId = 'UCXuqSBlHAE6Xw-yeJA0Tunw'

ytch.getChannelCommunityPosts(channelId, authorURL='http://www.youtube.com/c/cChannelId').then((response) => {
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

**getChannelCommunityPostsMore(continuation, innerTubeApi)**

Grabs more search results within a channel community page.  Uses the continuation and innerTubeApi strings returned from `getChannelCommunityPosts()` or from past calls to `getChannelCommunityPostsMore()`.

  ```javascript
const continuation = '4qmFsgK9ARIYVUNYdXFTQmxIQUU2WHcteWVKQTBUdW53GqABRWdsd2JHRjViR2x6ZEhNZ0FYcG1VVlZzVUdFeGF6VlNiVkoyV1ZjNWJHVnNUbGhTUmxwWVZrVm9kR1ZHYTNoVU1EVnJUVWR3ZFdNd05VVmFSVVo0Vm10NGRsVnJWa2haYkd4dVUyNXZlbEpxUW5WT1YxRjNXbGhyTkZKcVVqVmhibEpXVkVVNWNtSkdUbnBaYXpWWVUxZDNNMVpSdUFFQQ%3D%3D'
const innerTubeApi = 'JNDJSGJHASJ44DSHGDNLGMHA6FSFas5faF5'

ytch.getChannelCommunityPostsMore(continuation, innerTubeApi).then((response) => {
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

**Community Posts Format**

The objects in the array of community posts all follow a basic structure but vary drastically in the postContent field of the object.

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
    totalVotes: String }
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

## Tests

Tests and code standards are still in the process of being created.  Check back later for information on how tests should be performed.

## Contribution

PRs are welcome.  Testing and coding guidlines are still in the works so I will try to get those created at a later point.  Try to keep similar code syntax to the rest of the code.

## Credits

This is a fork of the `youtube-grabber-js` module created by OlegRom4ig

View the original project on [NPM](https://www.npmjs.com/package/youtube-grabber-js) or [GitLab](https://gitlab.com/olroma123/youtube-grabber-nodejs)

## License

You have explicit permission to use this project as stated in the terms of the [ISC license](https://github.com/FreeTubeApp/yt-channel-info/blob/master/LICENSE).
