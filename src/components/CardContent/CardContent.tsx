import { YoutubeSubscription } from '@/src/services/youtube/subscriptions/types';
import { cn } from '@/src/utils/cn';
import { formatNumberIntl } from '@/src/utils/format';
import Image from 'next/image';
import { Button } from '../ui/button';
import CountryFlag from 'react-country-flag';

type CardContentProps = {
    item: YoutubeSubscription;
};

function CardContent({ item }: CardContentProps) {
    const stats = [
        {
            label: 'new videos',
            value: formatNumberIntl(item.contentDetail?.newItemCount),
        },
        {
            label: 'videos',
            value: formatNumberIntl(item.channel?.statistics?.videoCount),
        },
        {
            label: 'country',
            value: item.channel?.country,
        },
        {
            label: 'subscribers',
            value: formatNumberIntl(item.channel?.statistics?.subscriberCount),
        },
    ];

    const hasBannerImg = !!item.channel?.bannerExternalUrl;
    const description = item.description?.trim();
    const channelUrl = `https://youtube.com/channel/${item.channelId}`;

    return (
        <article className={cn('h-full w-full bg-gray-300/20 backdrop-blur-md rounded-3xl shadow-2xl p-2')}>
            <div className={cn('h-full w-full flex flex-col gap-2')}>
                <div
                    className={cn(
                        'relative flex-1 rounded-2xl flex flex-col gap-4 items-center bg-cover bg-center bg-no-repeat',
                        !hasBannerImg && 'backdrop-blur-md',
                    )}
                    style={{
                        backgroundImage: hasBannerImg
                            ? `url(${item.channel?.bannerExternalUrl})`
                            : `url(${item.thumbnails?.high?.url})`,
                    }}
                >
                    <Image
                        src={item.thumbnails?.high?.url ?? ''}
                        alt={`${item.title} 채널 썸네일`}
                        width={80}
                        height={80}
                        className={cn(
                            'absolute z-10 top-24 left-1/2 -translate-x-1/2 rounded-full shadow-xl border-2 border-gray-100',
                        )}
                    />
                </div>
                <div className={cn('flex-2 bg-white rounded-2xl pt-12 pb-4 px-4 flex flex-col gap-3 h-full')}>
                    <h2 className={cn('font-bold text-xl text-center truncate')}>{item.title}</h2>

                    {description && <p className={cn('text-sm text-gray-500 line-clamp-2')}>{description}</p>}

                    <ul className={cn('grid grid-cols-2 gap-3')}>
                        {stats.map(({ label, value }) => (
                            <li key={label} className={cn('flex flex-col items-center justify-center')}>
                                <div>
                                    {label !== 'country' ? (
                                        <div className={cn('font-bold text-2xl text-center')}>{value}</div>
                                    ) : (
                                        <div className={cn('flex gap-2 items-center font-bold text-xl')}>
                                            <span>{value}</span>
                                            <CountryFlag
                                                countryCode={value ?? ''}
                                                svg
                                                style={{ width: '2rem', height: '2rem' }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={cn('text-gray-500 text-sm text-center')}>{label}</div>
                            </li>
                        ))}
                    </ul>

                    <Button asChild variant="outline" size="lg" className={cn('mt-auto')}>
                        <a target="_blank" rel="noopener noreferrer" href={channelUrl}>
                            채널로 이동하기
                        </a>
                    </Button>
                </div>
            </div>
        </article>
    );
}

export default CardContent;
