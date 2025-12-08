import { YoutubeMain } from '@/src/components/YoutubeMain';
import { youtubeSubscriptionQueryOptions } from '@/src/services/youtube/subscriptions/queries';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function YoutubePage() {
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery(youtubeSubscriptionQueryOptions.infinite({ pageParam: null }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <main>
                <YoutubeMain />
            </main>
        </HydrationBoundary>
    );
}
