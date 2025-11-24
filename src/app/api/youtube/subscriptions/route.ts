import { auth } from '@/src/lib/auth';
import { createYoutubeClient } from '@/src/lib/youtube-client';
import { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {
    const session = await auth();
    const authHeader = req.headers.get('authorization')?.split(' ')[1];

    const accessToken = session?.accessToken ?? authHeader;

    if (!accessToken) {
        return new Response('Unauthorized', { status: 401 });
    }

    const pageToken = req.nextUrl.searchParams.get('pageToken');

    const { youtubeClient } = createYoutubeClient(accessToken);

    try {
        const { data: subscriptionData } = await youtubeClient.subscriptions.list({
            part: ['id', 'contentDetails', 'snippet'],
            mine: true,
            maxResults: 20,
            pageToken: pageToken ? pageToken : undefined,
        });

        const channelIds =
            subscriptionData.items
                ?.map((item) => item.snippet?.resourceId?.channelId)
                .filter((id): id is string => Boolean(id)) ?? [];

        const { data: channelsData } = await youtubeClient.channels.list({
            id: channelIds,
            part: ['statistics', 'brandingSettings'],
        });

        const data = {
            nextPageToken: subscriptionData.nextPageToken,
            pageInfo: subscriptionData.pageInfo,
            items: subscriptionData.items?.map((item) => {
                const currentChannelId = item.snippet?.resourceId?.channelId;
                const currentChannel = channelsData.items?.find((item) => item.id === currentChannelId);

                return {
                    id: item.id,
                    title: item.snippet?.title,
                    description: item.snippet?.description,
                    channelId: item.snippet?.resourceId?.channelId,
                    thumbnails: item.snippet?.thumbnails,
                    publishedAt: item.snippet?.publishedAt,
                    contentDetail: item.contentDetails,
                    channel: {
                        id: currentChannel?.id,
                        statistics: currentChannel?.statistics,
                        country: currentChannel?.brandingSettings?.channel?.country,
                        bannerExternalUrl: currentChannel?.brandingSettings?.image?.bannerExternalUrl,
                    },
                };
            }),
        };

        return Response.json(data);
    } catch (error) {
        console.error('Failed to fetch YouTube subscriptions', error);
        return new Response('Failed to fetch subscriptions', { status: 500 });
    }
};
