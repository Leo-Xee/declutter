'use client';

import * as StackedCard from '@/src/components/StackedCard';
import { youtubeSubscriptionsOptions } from '@/src/services/youtube/subscriptions/queries';
import { cn } from '@/src/utils/cn';
import { useInfiniteQuery } from '@tanstack/react-query';

function YoutubeMain() {
    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
        youtubeSubscriptionsOptions.infinite({ pageParam: null }),
    );
    const subscriptions = data?.pages.flatMap((page) => page?.items ?? []) ?? [];
    const totalCount = data?.pages?.[0]?.pageInfo?.totalResults ?? null;

    return (
        <StackedCard.Root
            data={subscriptions}
            hasMore={hasNextPage}
            onLoadMore={fetchNextPage}
            totalCount={totalCount}
            renderCard={(item) => (
                <div className={cn('bg-white h-full w-full rounded-2xl flex justify-center items-center')}>
                    {item.title}
                </div>
            )}
        >
            <StackedCard.Background />
            <StackedCard.Score />
            <StackedCard.List />
        </StackedCard.Root>
    );
}

export default YoutubeMain;
