import { useState, useCallback, useRef } from 'react';

/**
 * 스와이프 제스처 훅
 * 카드 넘기기, 바텀시트 드래그 등에 사용
 */
export const useSwipe = (options = {}) => {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        threshold = 50,
        velocityThreshold = 0.3
    } = options;

    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [swipeDistance, setSwipeDistance] = useState({ x: 0, y: 0 });

    const startRef = useRef({ x: 0, y: 0, time: 0 });
    const currentRef = useRef({ x: 0, y: 0 });

    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0];
        startRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
        currentRef.current = { x: touch.clientX, y: touch.clientY };
        setIsSwiping(true);
        setSwipeDirection(null);
        setSwipeDistance({ x: 0, y: 0 });
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isSwiping) return;

        const touch = e.touches[0];
        currentRef.current = { x: touch.clientX, y: touch.clientY };

        const deltaX = touch.clientX - startRef.current.x;
        const deltaY = touch.clientY - startRef.current.y;

        setSwipeDistance({ x: deltaX, y: deltaY });

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            setSwipeDirection(deltaX > 0 ? 'right' : 'left');
        } else {
            setSwipeDirection(deltaY > 0 ? 'down' : 'up');
        }
    }, [isSwiping]);

    const handleTouchEnd = useCallback(() => {
        if (!isSwiping) return;

        const deltaX = currentRef.current.x - startRef.current.x;
        const deltaY = currentRef.current.y - startRef.current.y;
        const elapsed = Date.now() - startRef.current.time;
        const velocityX = Math.abs(deltaX) / elapsed;
        const velocityY = Math.abs(deltaY) / elapsed;

        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

        if (isHorizontalSwipe) {
            if (Math.abs(deltaX) >= threshold || velocityX >= velocityThreshold) {
                if (deltaX > 0 && onSwipeRight) {
                    onSwipeRight();
                } else if (deltaX < 0 && onSwipeLeft) {
                    onSwipeLeft();
                }
            }
        } else {
            if (Math.abs(deltaY) >= threshold || velocityY >= velocityThreshold) {
                if (deltaY > 0 && onSwipeDown) {
                    onSwipeDown();
                } else if (deltaY < 0 && onSwipeUp) {
                    onSwipeUp();
                }
            }
        }

        setIsSwiping(false);
        setSwipeDirection(null);
        setSwipeDistance({ x: 0, y: 0 });
    }, [isSwiping, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

    return {
        isSwiping,
        swipeDirection,
        swipeDistance,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        swipeHandlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd
        }
    };
};

export default useSwipe;
