'use client';

import * as StackedCard from '@/src/components/StackedCard';
import { cn } from '@/src/utils/cn';
import { signIn } from 'next-auth/react';
import YoutubeIcon from '@/public/assets/youtube.svg';
import { motion } from 'motion/react';
import { useState } from 'react';

function IntroMain() {
    const [isInteracting, setIsInteracting] = useState(false);

    const animation = {
        transformOrigin: 'bottom left',
        rotate: [0, 2, 1, 4, 0],
        transition: { duration: 1.25, repeat: Infinity, repeatDelay: 5 },
    };

    const handleSwipeLeft = () => window.location.reload();
    const handleSwipeRight = () => signIn('google');

    const handleCardHoverStart = () => setIsInteracting(true);
    const handleCardHoverEnd = () => setIsInteracting(false);

    return (
        <StackedCard.Root
            data={[{}]}
            totalCount={1}
            visibleCount={1}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            renderCard={() => (
                <motion.article
                    className={cn('h-full w-full bg-gray-300/20 backdrop-blur-md rounded-3xl shadow-2xl p-2')}
                    animate={isInteracting ? { rotate: 0 } : animation}
                    whileInView={animation}
                    onHoverStart={handleCardHoverStart}
                    onHoverEnd={handleCardHoverEnd}
                >
                    <div className={cn('h-full w-full flex flex-col items-center gap-6 rounded-2xl bg-white py-5')}>
                        <YoutubeIcon className={cn('w-14 fill-[#FF0000] text-center')} alt="" />
                        <h2 className={cn('flex flex-col gap-4 text-2xl font-bold text-center')}>
                            유튜브 구독 정리를 <br />
                            시작해보세요! ✨
                        </h2>
                        <p className={cn('text-center font-semibold')}>
                            유튜브 채널 정보를 한눈에 확인하고, <br />
                            드래그 한 번으로 손쉽게 <br />
                            구독을 해제할 수 있어요.
                        </p>
                        <div
                            className={cn(
                                'flex flex-col gap-4 font-bold text-center border border-gray-200 rounded-3xl py-8 px-6 bg-gray-50',
                            )}
                        >
                            카드를 오른쪽으로 드래그해서 <br />
                            구글 로그인을 진행해주세요.
                        </div>
                        <div className={cn('flex gap-4 text-sm text-gray-600')}>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={process.env.NEXT_PUBLIC_TERM_OF_SERVICE_URL}
                            >
                                이용약관
                            </a>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
                            >
                                개인정보처리방침
                            </a>
                        </div>
                    </div>
                </motion.article>
            )}
        >
            <StackedCard.Background />
            <StackedCard.List />
        </StackedCard.Root>
    );
}

export default IntroMain;
