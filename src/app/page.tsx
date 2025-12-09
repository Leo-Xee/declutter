import { auth } from '../lib/auth';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { youtubeSubscriptionQueryOptions } from '../services/youtube/subscriptions/queries';
import { YoutubeMain } from '../components/YoutubeMain';
import { IntroMain } from '../components/IntroMain';

export default async function Home() {
    const session = await auth();
    const queryClient = new QueryClient();

    if (session) {
        await queryClient.prefetchInfiniteQuery(youtubeSubscriptionQueryOptions.infinite({ pageParam: null }));
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <main>{session ? <YoutubeMain /> : <IntroMain />}</main>
        </HydrationBoundary>
    );
}
