import * as StackedCard from '@/src/components/StackedCard';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function YoutubePage() {
    const queryClient = new QueryClient();

    const initial = [
        {
            id: 1,
            channelName: 'Hello',
            color: 'bg-red-200',
        },
        {
            id: 2,
            channelName: 'Hello',
            color: 'bg-green-200',
        },
        {
            id: 3,
            channelName: 'Hello',
            color: 'bg-blue-200',
        },
        {
            id: 4,
            channelName: 'Hello',
            color: 'bg-purple-200',
        },
        {
            id: 5,
            channelName: 'Hello',
            color: 'bg-yellow-200',
        },
    ];

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <StackedCard.Root initial={initial}>
                <StackedCard.Background />
                <StackedCard.List />
            </StackedCard.Root>
        </HydrationBoundary>
    );
}
