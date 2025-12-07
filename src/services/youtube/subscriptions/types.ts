export type YoutubeSubscription = {
    id?: string;
    title?: string;
    description?: string;
    channelId?: string;
    thumbnails?: {
        default?: { url?: string };
        medium?: { url?: string };
        high?: { url?: string };
    };
    publishedAt?: string;
    contentDetail?: {
        totalItemCount?: number;
        newItemCount?: number;
        activityType?: string;
    };
    channel?: {
        id?: string;
        statistics?: {
            viewCount?: string;
            subscriberCount?: string;
            hiddenSubscriberCount?: boolean;
            videoCount?: string;
        };
        country?: string;
        bannerExternalUrl?: string;
    };
};

export type YoutubeSubscriptionsResponse = {
    nextPageToken?: string;
    pageInfo?: {
        totalResults?: number;
        resultsPerPage?: number;
    };
    items?: YoutubeSubscription[];
};
