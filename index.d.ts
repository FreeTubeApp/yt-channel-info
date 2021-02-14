declare module 'yt-channel-info' {
    /**
     * A abstract ChannelInfoResponse containing a continuation string if there are more responses which can be loaded
     * and an array of items of the type T
     */
    interface ChannelInfoResponse<T> {
        items: T[];
        continuation: string | null; // Will return null if no more results can be found.  Used with getChannelPlaylistsMore()
    }
    
    interface RelatedChannel {
        author: string;
        authorId: string;
        authorUrl: string;
        authorThumbnails: string[];
    }

    /**
     * ChannelInfo type returned by getChannelVideos and getChannelInfoMore
     */
    interface ChannelInfo {
        author: string;
        authorId: string;
        authorUrl: string;
        authorBanners: Image[] | null; // Will return null if none exist
        authorThumbnails: Image[] | null; // Will return null if none exist
        subscriberText: string;
        subscriberCount: number;
        description: string;
        isFamilyFriendly: boolean;
        relatedChannels: RelatedChannel[];
        allowedRegions: string[];
        isVerified: boolean;
    }

    /**
     * An Image which represents all banners and thumbnails
     */
    interface Image {
        url: string;
        height: number;
        width: number;
    }

    /**
     * Video type returned by getChannelVideos and getChannelInfoMore
     */
    interface Video {
        author: string;
        authorId: string;
        durationText: string;
        lengthSeconds: number;
        liveNow: boolean;
        premiere: boolean;
        publishedText: string;
        title: string;
        type: "video";
        videoId: string;
        videoThumbnails: Image[] | null;
        viewCount: number;
        viewCountText: string;
    }

    /**
     * Playlist type returned by getChannelPlaylistInfo and getChannelPlaylistsMore
     */
    interface Playlist {
        author: string;
        authorId: string;
        authorUrl: string;
        playlistId: string;
        playlistThumbnail: string;
        playlistUrl: string;
        title: string;
        type: "playlist";
        videoCount: number;
    }
    
    export class YoutubeGrabber {
        static getChannelInfo(channelId: string): Promise<ChannelInfo>;

        static getChannelVideos(channelId: string, sortBy?: "newest" | "oldest" | "popular"): Promise<ChannelInfoResponse<Video>>;
    
        static getChannelVideosMore(continuation: string): Promise<ChannelInfoResponse<Video>>;
    
        static getChannelPlaylistInfo(channelId: string, sortBy?: "last" | "oldest" | "newest"): Promise<ChannelInfoResponse<Playlist>>;
    
        static getChannelPlaylistsMore(continuation: string): Promise<ChannelInfoResponse<Playlist>>;

        static searchChannel(channelId: string, query: string): Promise<ChannelInfoResponse<Video>>;

        static searchChannelMore(continuation: string): Promise<ChannelInfoResponse<Video>>;
    }
}