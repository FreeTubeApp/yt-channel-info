# YouTube Channel Info NodeJS Documentation
This library is designed to receive data from YouTube without accessing the official API.
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

## Tests
Tests are written with mocha.  
Since receiving data directly from the site takes a lot of time, you should make sure that the tests have enough time for execution.  

You can run tests via **npm run**
```
npm run test
```
With this method you do not need to configure anything.  
But if you want to start test directly from the **test/** folder you need to provide additional mocha params
```
--timeout 20000
```

Available tests:  
* All tests: **npm test**
* Channel parser test: **npm run test-channel**
* Playlist parser test: **npm run test-playlist**

## Features
1) [URL validation](#1-url-validation)
    * [Check for YouTube URL](#11-check-for-youtube-url)
    * [Get type of resource](#12-get-type-of-resource)
    * [Check for existence of resource](#13-check-for-existence-of-resource)
2) [Error handling](#2-error-handling)
3) [Channel](#3-channel)
    * [Get basic channel information](#31-get-basic-channel-information)
    * [Get uploaded videos](#32-get-uploaded-videos)
    * [Get playlists](#33-get-playlists)
4) Playlist
    * [Get playlist information](#41-get-playlist-information)

### 1. URL validation
#### 1.1. Check for YouTube URL
The method **isYoutubeURLValid(url)** checks the link:
* Is string is the URL
* Is URL contains YouTube
* Is resource is channel, playlist or video

**Example:**
```javascript
const ytch = require('yt-channel-info');

const link = 'https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA';
if (ytch.isYoutubeURLValid(link)) {
  console.log('Valid');
} else {
  console.log('Not valid');
}
```

### 1.2. Get type of resource
The method **getTypeOfResource(url)** returns the type of resource or null if an invalid URL is passed.
<br/><br/>
Available resources:
* channel
* playlist
* video

**Example:**
```javascript
const ytch = require('yt-channel-info');

const link = 'https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA';
const type = ytch.getTypeOfResource(link);

console.log(type);    // "channel"
```

### 1.3. Check for existence of resource
The method **isResourceExists(url)** not only verifies the correctness of the URL, but also checks the existence of the resource on YouTube

**Example:**
```javascript
const ytch = require('yt-channel-info');

const link = 'https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA';
if (ytch.isResourceExists(link)) {
  console.log('Valid and Exists');
} else {
  console.log('No valid OR not exists');
}
```

### 2. Error handling
Each method that will be described later returns not only information, but also errors.
Here is a sample return pattern for almost any method:
```json
{
  "error": {
    "status": true | false,
    "reason?": "Textual representation of the error",
    "payload?": "Some additional information about error"
  },

  "info": {

  }
}
```

Let's describe this:  
1) **error** field - object with error information;  
    1.1.) **error.status** - (boolean) Describes whether an error has occurred;  
    1.2.) **error.reason** - (optional)(string) This field is present only if the status field is true. Describes the error;  
    1.3.) **error.payload** - (optional)(object | string | null) Additional error information. Not always present

### 3. Channel
#### 3.1. Get basic channel information
Method **getChannelInfo(url)** can provide you a public channel information. The method also has options, but more on that later.

```javascript
const ytch = require('yt-channel-info');

const channelURL = 'https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA';
const channel = ytch.getChannelInfo(channelURL);
console.log(channel);
/*
{
  error: {
    status: false
  },

  info: {
    id: 'UCsBjURrPoezykLs9EqgamOA',
    title: string,
    description: string,
    avatarURL: string,
    subscriberCount: number | false,
    isConfirmed: boolean
  }
}
*/
```

#### 3.2. Get uploaded videos
The method also has **config** param. This parameter is responsible for what additional data will be obtained.
```javascript    
{    
  "videos":    true | false,   // Default: false    
  "playlists": true | false    // Default: false    
}   
```

To get all videos from channel:
```javascript
const ytch = require('yt-channel-info');

const channelURL = 'https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA';
const channel = ytch.getChannelInfo(channelURL, {
  videos: true
});

console.log(channel);
/*
  {
      error: {
          status: false
      },
      info: {
          id: 'UCsBjURrPoezykLs9EqgamOA',
          title: string,
          description: string,
          avatarURL: string,
          subscriberCount: number | false - If subscribers is private then it false,    
          isConfirmed: boolean,
          videos: [
              {
                  id: string,
                  title: string,
                  youtubeUrl: string,
                  thumbnail: string,
                  dateCreated: Date
              }
        ]
      }
    }
*/
```

#### 3.3. Get playlists
To get all channel's playlists:
```javascript
const ytch = require('yt-channel-info');

const channelURL = 'https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA';
const channel = ytch.getChannelInfo(channelURL, {
  playlists: true
});

console.log(channel);
/*
  {
      error: {
          status: false
      },
      info: {
          id: 'UCsBjURrPoezykLs9EqgamOA',
          title: string,
          description: string,
          avatarURL: string,
          subscriberCount: number | false - If subscribers is private then it false,    
          isConfirmed: boolean,
          playlists: [
              {
                  id: string,
                  url: string,
                  title: string,
                  thumbnail: string,
                  videosCount: number
              }
        ]
      }
    }
*/
```

### 4. Playlist
#### 4.1. Get playlist information
The method **getPlaylistInfo(url)** provide the basic playlist information with videos

```javascript
const ytch = require('yt-channel-info');

const playlistURL = 'https://www.youtube.com/playlist?list=PLfMzBWSH11xaZvhv1X5Fq1H-oMdnAtG6k';
const playlist = ytch.getPlaylistInfo(playlistURL);
console.log(playlist);
/*
{
  error: {
    status: false
  },

  info: {
    id: "PLfMzBWSH11xaZvhv1X5Fq1H-oMdnAtG6k",
    title: "string",
    description: "string",
    playlistImage: "string",
    videos: {
      count: number
      payload: [
        {
          id: "string",
          youtubeUrl: "string",
          title: "string",
          thumbnail: "string",
          duration: "string"
        }
      ]
    },
    views: number,
    channel: {
      url: "string",
      name: "string"
    }
  }
}
*/
```

## Credits

This is a fork of the `youtube-grabber-js` module created by OlegRom4ig

View the original project on [NPM](https://www.npmjs.com/package/youtube-grabber-js) or [GitLab](https://gitlab.com/olroma123/youtube-grabber-nodejs)

## License

You have explicit permission to use this project as stated in the terms of the [ISC license](https://github.com/FreeTubeApp/yt-channel-info/blob/master/LICENSE).
