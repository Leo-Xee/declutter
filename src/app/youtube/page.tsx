import StackedDraggableCards from '@/src/components/StackedDraggableCards';

export default function YoutubePage() {
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
        <div>
            <StackedDraggableCards initial={initial} />
        </div>
    );
}
