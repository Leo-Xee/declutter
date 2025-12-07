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
}: StackedCardRootProps<T>) {
    const [consumedCardCount, setConsumedCardCount] = useState(0);
    const [activedDirection, setActivedDirection] = useState<Direction | null>(null);

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
    const { consumedCardCount, totalCount } = useStackedCard();

    return (
        <div className={cn('pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full')}>
            {`${consumedCardCount} /  ${totalCount}`}
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

    const handleDragEnd = async () => {
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
                                    onDragEnd={handleDragEnd}
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
