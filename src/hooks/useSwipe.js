import { useState } from 'react';

export const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 50) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > threshold && onSwipeLeft) {
            onSwipeLeft();
        }
        if (distance < -threshold && onSwipeRight) {
            onSwipeRight();
        }
    };

    return {
        touchStart,
        touchEnd,
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};
