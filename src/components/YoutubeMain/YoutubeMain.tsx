'use client';

import * as StackedCard from '@/src/components/StackedCard';
import { youtubeSubscriptionQueryOptions } from '@/src/services/youtube/subscriptions/queries';
import { YoutubeSubscription } from '@/src/services/youtube/subscriptions/types';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { CardContent } from '../CardContent';
import { youtubeSubscriptionMutationOptions } from '@/src/services/youtube/subscriptions/mutations';
import { cn } from '@/src/utils/cn';
import { Button } from '../ui/button';
import { LogOutIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';

function YoutubeMain() {
    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
        youtubeSubscriptionQueryOptions.infinite({ pageParam: null }),
    );
    const deleteSubscriptionMutation = useMutation(youtubeSubscriptionMutationOptions.delete());

    const subscriptions = data?.pages.flatMap((page) => page?.items ?? []) ?? [];
    const totalCount = data?.pages?.[0]?.pageInfo?.totalResults ?? null;

    const handleSwipeLeft = (subscription: YoutubeSubscription) => {
        if (!subscription.id) return;

        try {
            deleteSubscriptionMutation.mutate({ id: subscription.id });
        } catch (error) {
            console.error('Failed to delete subscription', error);
        }
    };

    return (
        <div className={cn('relative')}>
            <StackedCard.Root
                data={subscriptions}
                hasMore={hasNextPage}
                onLoadMore={fetchNextPage}
                totalCount={totalCount}
                renderCard={(item) => <CardContent item={item} />}
                prefetchThreshold={10}
                onSwipeLeft={handleSwipeLeft}
            >
                <StackedCard.Background />
                <StackedCard.Score />
                <StackedCard.List />
            </StackedCard.Root>

            <Button
                variant="outline"
                size="icon-lg"
                className={cn('absolute bottom-6 right-6 w-12 h-12 rounded-full shadow-2xl cursor-pointer')}
                onClick={() => signOut()}
            >
                <div className={cn()}>
                    <LogOutIcon className={cn('stroke-3')} />
                </div>
            </Button>
        </div>
    );
}

export default YoutubeMain;
