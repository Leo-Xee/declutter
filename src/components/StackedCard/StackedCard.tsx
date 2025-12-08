'use client';

import { cn } from '@/src/utils/cn';
import { isClient } from '@/src/utils/isClient';
import { animate, AnimatePresence, motion, MotionValue, useMotionValue, useTransform } from 'motion/react';
import {
    createContext,
    Dispatch,
    ReactNode,
    RefObject,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
} as const;

type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];

type StackedCardItem<T> = {
    value: T;
    key: number;
};

type StackedCardContextValue<T> = {
    cards: StackedCardItem<T>[];
    totalCount?: number | null;
    consumedCardCount: number;
    consumeCard: () => void;
    onSwipeLeft?: (card: T) => Promise<void> | void;
    onSwipeRight?: (card: T) => Promise<void> | void;
    swipeCounts: { left: number; right: number };
    updateSwipeCounts: (direction: Direction) => void;
    activedDirection: Direction | null;
    setActivedDirection: Dispatch<SetStateAction<Direction | null>>;
    constraintsRef: RefObject<HTMLDivElement | null>;
    mvX: MotionValue<number>;
    mvY: MotionValue<number>;
    dragRotate: MotionValue<number>;
    dragScale: MotionValue<number>;
    stackLayout: { zIndex: number; posY: number; rotate: number }[];
    getDirectionByDx: (dx: number, deadZone: number) => Direction | null;
    renderCard: (card: T) => ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StackedCardContext = createContext<StackedCardContextValue<any> | null>(null);

function useStackedCard<T>() {
    const context = useContext(StackedCardContext);

    if (!context) {
        throw new Error('StackedCard compound components must be used within StackedCard.Root');
    }

    return context as StackedCardContextValue<T>;
}

/**
 *  Root
 */

type StackedCardRootProps<T> = {
    data: T[];
    renderCard?: (item: T) => ReactNode;
    children?: ReactNode;
    visibleCount?: number;
    prefetchThreshold?: number;
    hasMore?: boolean;
    onLoadMore?: () => Promise<unknown> | void;
    totalCount?: number | null;
    onSwipeLeft?: (item: T) => Promise<void> | void;
    onSwipeRight?: (item: T) => Promise<void> | void;
};

function StackedCardRoot<T>({
    data,
    renderCard,
    children,
    visibleCount = 5,
    prefetchThreshold = 10,
    hasMore = false,
    onLoadMore,
    totalCount,
    onSwipeLeft,
    onSwipeRight,
}: StackedCardRootProps<T>) {
    const [consumedCardCount, setConsumedCardCount] = useState(0);
    const [activedDirection, setActivedDirection] = useState<Direction | null>(null);
    const [swipeCounts, setSwipeCounts] = useState({ left: 0, right: 0 });

    const constraintsRef = useRef<HTMLDivElement | null>(null);

    const mvX = useMotionValue(0);
    const mvY = useMotionValue(0);
    const dragRotate = useTransform(mvX, [-150, 0, 150], [-15, 0, 15]);
    const dragScale = useTransform(mvY, [-120, 0, 200], [0.98, 1, 1.03]);

    const cards = useMemo<StackedCardItem<T>[]>(() => {
        return data
            .slice(consumedCardCount, consumedCardCount + visibleCount)
            .map((item, index) => ({
                value: item,
                key: consumedCardCount + index,
            }))
            .reverse();
    }, [consumedCardCount, data, visibleCount]);

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

    const consumeCard = useCallback(() => {
        setConsumedCardCount((prev) => Math.min(prev + 1, data.length));
    }, [data.length]);

    const updateSwipeCounts = useCallback((direction: Direction) => {
        setSwipeCounts((prev) => ({
            ...prev,
            [direction]: prev[direction] + 1,
        }));
    }, []);

    const remainingDataCount = Math.max(data.length - consumedCardCount, 0);
    const pendingPrefetchRef = useRef(false);

    useEffect(() => {
        if (!onLoadMore || !hasMore) {
            pendingPrefetchRef.current = false;
            return;
        }

        if (remainingDataCount <= prefetchThreshold) {
            if (!pendingPrefetchRef.current) {
                pendingPrefetchRef.current = true;
                onLoadMore();
            }
        } else {
            pendingPrefetchRef.current = false;
        }
    }, [hasMore, onLoadMore, prefetchThreshold, remainingDataCount]);

    return (
        <StackedCardContext.Provider
            value={
                {
                    cards,
                    totalCount,
                    consumedCardCount,
                    consumeCard,
                    onSwipeLeft,
                    onSwipeRight,
                    swipeCounts,
                    updateSwipeCounts,
                    activedDirection,
                    setActivedDirection,
                    constraintsRef,
                    mvX,
                    mvY,
                    dragRotate,
                    dragScale,
                    stackLayout,
                    getDirectionByDx,
                    renderCard,
                } as StackedCardContextValue<T>
            }
        >
            <div className={cn('relative overflow-hidden')} ref={constraintsRef}>
                {children}
            </div>
        </StackedCardContext.Provider>
    );
}

/**
 *  Background
 */

function StackedCardBackground() {
    const { activedDirection } = useStackedCard();

    return (
        <>
            <div
                className={cn(
                    'pointer-events-none fixed left-0 top-0 h-screen w-[50%] transition-all bg-linear-to-l',
                    activedDirection === DIRECTION.LEFT ? 'from-white to-red-200' : 'from-white to-red-100',
                )}
            />
            <div
                className={cn(
                    'pointer-events-none fixed right-0 top-0 h-screen w-[50%] transition-all bg-linear-to-r',
                    activedDirection === DIRECTION.RIGHT ? 'from-white to-green-200' : 'from-white to-green-100',
                )}
            />
        </>
    );
}

/**
 * Score
 */

function StackedCardScore() {
    const { consumedCardCount, totalCount, swipeCounts } = useStackedCard();

    const totalSwipes = swipeCounts.left + swipeCounts.right;

    const leftRatio = totalSwipes === 0 ? 0.5 : swipeCounts.left / totalSwipes;
    const rightRatio = totalSwipes === 0 ? 0.5 : swipeCounts.right / totalSwipes;

    return (
        <div
            className={cn(
                'pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 bg-gray-300/20 backdrop-blur-md rounded-3xl shadow-2xl p-3',
            )}
        >
            <div className={cn('flex flex-col gap-3 items-center')}>
                <div className={cn('text-center px-4 py-2 bg-white rounded-2xl font-bold text-lg')}>
                    {`${consumedCardCount} /  ${totalCount}`}
                </div>
                <div className={cn('w-46 h-10 flex gap-2 overflow-hidden rounded-2xl')}>
                    <div
                        className={cn(
                            'flex items-center justify-center rounded-2xl min-w-8 text-white text-md font-bold transition-[flex-basis] duration-500',
                            swipeCounts.left ? 'bg-red-400' : 'bg-gray-300',
                        )}
                        style={{
                            flexBasis: `${leftRatio * 100}%`,
                        }}
                    >
                        {swipeCounts.left}
                    </div>
                    <div
                        className={cn(
                            'flex items-center justify-center rounded-2xl min-w-8 text-white text-md font-bold transition-[flex-basis] duration-500',
                            swipeCounts.right ? 'bg-green-400' : 'bg-gray-300',
                        )}
                        style={{
                            flexBasis: `${rightRatio * 100}%`,
                        }}
                    >
                        {swipeCounts.right}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 *  List
 */

function StackedCardList() {
    const {
        cards,
        stackLayout,
        mvX,
        mvY,
        dragRotate,
        dragScale,
        constraintsRef,
        consumeCard,
        setActivedDirection,
        getDirectionByDx,
        renderCard,
        onSwipeLeft,
        onSwipeRight,
        updateSwipeCounts,
    } = useStackedCard();

    const handleDrag = () => {
        const direction = getDirectionByDx(mvX.get(), 100);
        const isSuccess = direction !== null;

        if (isSuccess) {
            setActivedDirection(direction);
        } else {
            setActivedDirection(null);
        }
    };

    const handleDragStart = () => {
        setActivedDirection(null);
    };

    const handleDragEnd = async (cardValue: (typeof cards)[number]['value']) => {
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

            consumeCard();
            updateSwipeCounts(direction);

            if (direction === DIRECTION.LEFT && onSwipeLeft) {
                await onSwipeLeft(cardValue);
            }

            if (direction === DIRECTION.RIGHT && onSwipeRight) {
                await onSwipeRight(cardValue);
            }

            mvX.set(0);
            mvY.set(0);
        }
    };

    return (
        <div className={cn('grid min-h-screen place-items-center')}>
            <div className={cn('relative h-[480px] w-[320px]')}>
                <AnimatePresence initial={false}>
                    {cards.map((card, index) => {
                        const isTop = index === cards.length - 1;
                        const { zIndex, posY, rotate } = stackLayout[index];

                        return (
                            <motion.div
                                key={card.key}
                                layout
                                className={cn('absolute inset-0')}
                                style={{ zIndex }}
                                initial={{ y: posY, rotate, opacity: 0 }}
                                animate={{ y: posY, rotate, opacity: 1 }}
                            >
                                <motion.div
                                    className={cn('h-full w-full select-none cursor-grab active:cursor-grabbing')}
                                    drag={isTop}
                                    whileHover={{ scale: isTop ? 1.05 : undefined }}
                                    whileTap={{ scale: isTop ? 0.995 : undefined }}
                                    dragElastic={0}
                                    dragConstraints={constraintsRef}
                                    dragMomentum={false}
                                    style={{
                                        x: isTop ? mvX : 0,
                                        y: isTop ? mvY : 0,
                                        rotate: isTop ? dragRotate : rotate,
                                        scale: isTop ? dragScale : 1,
                                    }}
                                    onDrag={handleDrag}
                                    onDragStart={handleDragStart}
                                    onDragEnd={() => handleDragEnd(card.value)}
                                >
                                    {renderCard(card.value)}
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

export const Root = StackedCardRoot;
export const Background = StackedCardBackground;
export const Score = StackedCardScore;
export const List = StackedCardList;
