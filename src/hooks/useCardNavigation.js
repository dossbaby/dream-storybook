import { useState } from 'react';
import { useSwipe } from './useSwipe';

export const useCardNavigation = (totalCards = 0) => {
    const [currentCard, setCurrentCard] = useState(0);

    const nextCard = () => {
        if (currentCard < totalCards - 1) {
            setCurrentCard(currentCard + 1);
        }
    };

    const prevCard = () => {
        if (currentCard > 0) {
            setCurrentCard(currentCard - 1);
        }
    };

    const swipe = useSwipe(nextCard, prevCard);

    return {
        currentCard,
        setCurrentCard,
        nextCard,
        prevCard,
        ...swipe
    };
};
