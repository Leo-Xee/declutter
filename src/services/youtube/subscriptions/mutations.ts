import { isClient } from '@/src/utils/isClient';
import { clientFetcher, serverFetcher } from '@/src/lib/ky-fetcher';
import { mutationOptions } from '@tanstack/react-query';

type DeleteYoutubeSubscriptionParams = {
    id: string;
};

const deleteYoutubeSubscription = async ({ id }: DeleteYoutubeSubscriptionParams) => {
    const fetcher = isClient() ? clientFetcher : serverFetcher;

    const response = await fetcher('delete', 'api/youtube/subscriptions', {
        searchParams: { id },
    });

    if (!response.ok) {
        throw new Error('Failed to delete youtube subscription');
    }
};

export const youtubeSubscriptionMutationOptions = {
    delete: () =>
        mutationOptions({
            mutationFn: deleteYoutubeSubscription,
        }),
};
