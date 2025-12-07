'use client';

import * as StackedCard from '@/src/components/StackedCard';
import { youtubeSubscriptionsOptions } from '@/src/services/youtube/subscriptions/queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CardContent } from '../CardContent';

function YoutubeMain() {
    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
        youtubeSubscriptionsOptions.infinite({ pageParam: null }),
    );
    const subscriptions = data?.pages.flatMap((page) => page?.items ?? []) ?? [];
    const totalCount = data?.pages?.[0]?.pageInfo?.totalResults ?? null;

    console.log(data);

    return (
        <StackedCard.Root
            data={subscriptions}
            hasMore={hasNextPage}
            onLoadMore={fetchNextPage}
            totalCount={totalCount}
            renderCard={(item) => <CardContent item={item} />}
        >
            <StackedCard.Background />
            <StackedCard.Score />
            <StackedCard.List />
        </StackedCard.Root>
    );
}

export default YoutubeMain;
