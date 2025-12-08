import { clientFetcher, serverFetcher } from '@/src/lib/ky-fetcher';
import { isClient } from '@/src/utils/isClient';
import { infiniteQueryOptions } from '@tanstack/react-query';
import { YoutubeSubscriptionsResponse } from './types';

type GetYoutubeSubscriptionsParams = {
    pageParam?: string | null;
};

const fetchYoutubeSubscriptions = async ({
    pageParam,
}: GetYoutubeSubscriptionsParams): Promise<YoutubeSubscriptionsResponse | undefined> => {
    const fetcher = isClient() ? clientFetcher : serverFetcher;

    try {
        const response = await fetcher<YoutubeSubscriptionsResponse>('get', 'api/youtube/subscriptions', {
            searchParams: {
                pageToken: pageParam ?? undefined,
            },
        });
        return response.json();
    } catch (err) {
        console.error(err);
    }
};

const youtubeSubscriptionKeys = {
    all: ['youtube', 'subscriptions'] as const,
    infinite: () => [...youtubeSubscriptionKeys.all, 'infinite'] as const,
};

export const youtubeSubscriptionQueryOptions = {
    infinite: ({ pageParam = null }: GetYoutubeSubscriptionsParams) =>
        infiniteQueryOptions({
            queryKey: youtubeSubscriptionKeys.infinite(),
            initialPageParam: pageParam,
            queryFn: ({ pageParam: currentPageParam }) => fetchYoutubeSubscriptions({ pageParam: currentPageParam }),
            getNextPageParam: (lastPage) => lastPage?.nextPageToken ?? undefined,
        }),
};
