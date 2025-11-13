'use client';

import { cn } from '@/src/utils/cn';
import { isClient } from '@/src/utils/isClient';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { useCallback, useMemo, useRef, useState } from 'react';

type Card = {
    id: number;
    channelName: string;
    color: string;
};

type StackedDraggableCardsProps = {
    initial: Card[];
};

const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
} as const;

type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];

function StackedDraggableCards({ initial }: StackedDraggableCardsProps) {
    const [cards, setCards] = useState<Card[]>(initial.toReversed());
    const [activedDirection, setActivedDirection] = useState<Direction | null>(null);

    const constraintsRef = useRef<HTMLDivElement | null>(null);

    const mvX = useMotionValue(0);
    const mvY = useMotionValue(0);
    const dragRotate = useTransform(mvX, [-150, 0, 150], [-15, 0, 15]);
    const dragScale = useTransform(mvY, [-120, 0, 200], [0.98, 1, 1.03]);

    const stackLayout = useMemo(
        () =>
            cards.map((_, i, arr) => ({
                zIndex: i,
                posY: i * 20,
                rotate: (i - (arr.length - 1) / 2) * 2.5,
            })),
        [cards],
    );

    const getDirectionByDx = useCallback((dx: number, deadZone: number): Direction | null => {
        if (dx > deadZone) return DIRECTION.RIGHT;
        if (dx < -deadZone) return DIRECTION.LEFT;
        return null;
    }, []);

    return (
        <div className={cn('relative overflow-hidden')} ref={constraintsRef}>
            <div
                className={cn(
                    'pointer-events-none fixed left-0 top-0 h-screen w-[50%] transition-all',
                    activedDirection === DIRECTION.LEFT ? 'bg-red-100' : 'bg-red-50',
                )}
            />
            <div
                className={cn(
                    'pointer-events-none fixed right-0 top-0 h-screen w-[50%] transition-all',
                    activedDirection === DIRECTION.RIGHT ? 'bg-green-100' : 'bg-green-50',
                )}
            />

            <div className={cn('grid min-h-screen place-items-center')}>
                <div className={cn(`relative w-[320px] h-[480px]`)}>
                    <AnimatePresence initial={false}>
                        {cards.map((card, index) => {
                            const isTop = index === cards.length - 1;
                            const { zIndex, posY, rotate } = stackLayout[index];

                            return (
                                <motion.div
                                    key={card.id}
                                    layout
                                    className={cn('absolute inset-0')}
                                    style={{ zIndex }}
                                    initial={{ y: posY, rotate, opacity: 0 }}
                                    animate={{ y: posY, rotate, opacity: 1 }}
                                >
                                    <motion.div
                                        className={`h-full w-full rounded-2xl shadow-lg ${card.color} select-none cursor-grab active:cursor-grabbing `}
                                        drag={isTop}
                                        whileHover={{ scale: isTop ? 1.05 : undefined }}
                                        whileTap={{ scale: isTop ? 0.995 : undefined }}
                                        whileDrag={{ boxShadow: '0px 10px 20px rgba(0,0,0,0.2)' }}
                                        dragElastic={0}
                                        dragConstraints={constraintsRef}
                                        dragMomentum={false}
                                        style={{
                                            x: isTop ? mvX : 0,
                                            y: isTop ? mvY : 0,
                                            rotate: isTop ? dragRotate : rotate,
                                            scale: isTop ? dragScale : 1,
                                        }}
                                        onDrag={() => {
                                            const direction = getDirectionByDx(mvX.get(), 100);
                                            const isSuccess = direction !== null;

                                            if (isSuccess) {
                                                setActivedDirection(direction);
                                            } else {
                                                setActivedDirection(null);
                                            }
                                        }}
                                        onDragStart={() => setActivedDirection(null)}
                                        onDragEnd={async () => {
                                            setActivedDirection(null);

                                            const direction = getDirectionByDx(mvX.get(), 100);
                                            const isSuccess = direction !== null;
                                            const sign = direction === DIRECTION.LEFT ? -1 : 1;

                                            if (isSuccess) {
                                                const innerWidth = isClient() ? window.innerWidth : 0;
                                                const destinationToFly = sign * innerWidth * 0.8;

                                                await animate(mvX, destinationToFly, {
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 30,
                                                }).finished;

                                                setCards((prev) => {
                                                    return [...prev.slice(0, -1)];
                                                });

                                                mvX.set(0);
                                                mvY.set(0);
                                            }
                                        }}
                                    ></motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default StackedDraggableCards;
