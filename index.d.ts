import { HttpsProxyAgent } from 'https-proxy-agent';

declare module "yt-channel-info" {

    enum ChannelIdType {
        Default = 0,
        ChannelId,
        LegacyName,
        CustomURL
    }

    /**
     * A abstract ChannelInfoResponse containing a continuation string if there are more responses which can be loaded
     * and an array of items of the type T
     */
    interface ChannelInfoResponseContinuation<T> {
        items: T[];
        /**
        * Will be null if no more results can be found.  Used with getChannelPlaylistsMore()
        */
        continuation: string | null;
    }

    interface ChannelInfoResponse<T> extends ChannelInfoResponseContinuation<T> {
        channelIdType: ChannelIdType;
        alertMessage?: string;
    }

    interface ChannelCommunityPostsContinuationResponse extends ChannelInfoResponseContinuation<CommunityPost> {
        innerTubeApi: string;
    }
    interface ChannelCommunityPostsResponse extends ChannelCommunityPostsContinuationResponse {
        channelIdType: ChannelIdType;
    }

    interface RelatedChannel {
        channelName: string;
        channelId: string;
        channelUrl: string;
        thumbnail: Image[];
        videoCount: number;
        subscriberText: string;
        subscriberCount: number;
        verified: boolean;
        officialArist: boolean;
    }

    interface ContinuationPayload {
        continuation: string;
        httpsAgent?: HttpsProxyAgent;
    }
    /**
     * ChannelInfo payload passed into getChannelInfo
     */

    interface ChannelInfoPayload {
        channelId: string;
        channelIdType?: ChannelIdType;
        httpsAgent?: HttpsProxyAgent;
    }

    interface CommunityPostContinuationPayload extends ContinuationPayload {
        innerTubeApi: string;
    }
    interface ChannelVideosPayload extends ChannelInfoPayload {
        sortBy?: "newest" | "oldest" | "popular";
    }

    interface ChannelSearchPayload extends ChannelInfoPayload {
        query: string;
    }

    interface ChannelPlaylistPayload extends ChannelInfoPayload {
        sortBy?: "last" | "newest";
    }

    /**
     * ChannelInfo type returned by getChannelVideos and getChannelInfoMore
     */
    interface ChannelInfo {
        author: string;
        authorId: string;
        authorUrl: string;
        /**
        * Is null if none exist
        **/
        authorBanners: Image[] | null;
        /**
        * Is null if none exist
        **/
        authorThumbnails: Image[] | null;
        subscriberText: string;
        subscriberCount: number;
        description: string;
        isFamilyFriendly: boolean;
        relatedChannels: RelatedChannel[];
        allowedRegions: string[];
        isVerified: boolean;
        isOfficialArtist: boolean;
        tags: string[];
        channelIdType: number;
        channelTabs: string[];
        alertMessage: string;
        channelLinks: {
          primaryLinks: ChannelLink[],
          secondaryLinks: ChannelLink[]
        }
    }

    interface ChannelLink {
      url: string,
      icon: string,
      title: string
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
        premium: boolean;
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

    interface ImagePostContent {
        type: "image";
        content: Image[]
    }

    interface PollPostContent {
        type: "poll";
        content: {
            choices: string[];
            totalVotes: string
        }
    }

    interface VideoPostContent {
        type: "video";
        content: {
            videoId: string;
            title: string;
            description: string,
            publishedText: string,
            lengthText: string,
            viewCountText: string,
            ownerBadges: {
                verified: boolean;
                officialArtist: boolean;
            },
            author: string;
            thumbnails: Image[];
        }
    }
    interface PlaylistPostContent {
        type: 'playlist',
        content: {
            playlistId: string;
            title: string;
            playlistVideoRenderer: VideoPostContent[];
            videoCountText: string;
            ownerBadges: {
                verified: boolean;
                officialArtist: boolean;
            },
            author: String,
            thumbnails: Image[];
        }
    }
    interface CommunityPost {
        postText: string;
        postId: string;
        author: string;
        authorThumbnails: string;
        publishedText: string;
        voteCount: string;
        postContent: ImagePostContent | PollPostContent | VideoPostContent | PlaylistPostContent | null
    }


    interface ChannelStatsResponse {
        joinedDate: number;
        viewCount: number;
        location: string;
    }

    interface Mix {
        playlistId: string;
        title: string;
        description: string;
        videoCount: number;
        url: string;
        thumbnails: Image[]
    }
    interface ChannelHomeResponse {
        featuredVideo : Video
        items: {
            shelfName: string;
            type: 'videos' | 'verticalVideoList' | 'playlist' | 'channels' | 'mix' | 'playlists' | 'video'
            items: Video[] | RelatedChannel[] | Playlist[] | Mix
        }
    }
    class YoutubeGrabber {
        static getChannelInfo(payload: ChannelInfoPayload): Promise<ChannelInfo>;

        static getChannelVideos(payload: ChannelVideosPayload): ChannelInfoResponse<Video>;

        static getChannelVideosMore(payload: ContinuationPayload): Promise<ChannelInfoResponseContinuation<Video>>;

        static getChannelPlaylistInfo(payload: ChannelPlaylistPayload): Promise<ChannelInfoResponse<Playlist>>;

        static getChannelPlaylistsMore(payload: ContinuationPayload): Promise<ChannelInfoResponseContinuation<Playlist>>;

        static searchChannel(payload: ChannelSearchPayload): Promise<ChannelInfoResponseContinuation<Video>>;

        static searchChannelMore(payload: ContinuationPayload): Promise<ChannelInfoResponseContinuation<Video>>;

        static getRelatedChannelsMore(payload: ContinuationPayload): Promise<ChannelInfoResponseContinuation<RelatedChannel>>;

        static getChannelCommunityPosts(payload: ChannelInfoPayload): Promise<ChannelCommunityPostsResponse>

        static getChannelCommunityPostsMore(payload: CommunityPostContinuationPayload): Promise<ChannelCommunityPostsContinuationResponse>

        static getChannelStats(payload: ChannelInfoPayload): Promise<ChannelStatsResponse>

        static getChannelHome(payload: ChannelInfoPayload): Promise<ChannelHomeResponse>
    }

    export = YoutubeGrabber;
}
