import { useState } from 'react';

/**
 * AI 리딩 결과에 대한 별점 피드백 컴포넌트
 * 사용자가 1-5 별점으로 만족도를 평가할 수 있음
 */
const RatingFeedback = ({
    currentRating = 0,
    onRate,
    readOnly = false,
    size = 'medium',
    showLabel = true,
    showThankYou = true
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [hasRated, setHasRated] = useState(currentRating > 0);
    const [showThanks, setShowThanks] = useState(false);

    const labels = {
        1: '별로예요',
        2: '아쉬워요',
        3: '보통이에요',
        4: '좋아요',
        5: '최고예요!'
    };

    const handleClick = async (rating) => {
        if (readOnly) return;

        setHasRated(true);
        if (showThankYou) {
            setShowThanks(true);
            setTimeout(() => setShowThanks(false), 2000);
        }

        if (onRate) {
            await onRate(rating);
        }
    };

    const displayRating = hoverRating || currentRating;

    return (
        <div className={`rating-feedback ${size} ${hasRated ? 'rated' : ''}`}>
            {showLabel && !hasRated && (
                <span className="rating-label">이 해석이 도움이 되었나요?</span>
            )}

            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        className={`rating-star ${displayRating >= star ? 'filled' : ''} ${readOnly ? 'readonly' : ''}`}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => !readOnly && setHoverRating(star)}
                        onMouseLeave={() => !readOnly && setHoverRating(0)}
                        disabled={readOnly}
                        aria-label={`${star}점`}
                    >
                        {displayRating >= star ? '★' : '☆'}
                    </button>
                ))}
            </div>

            {showLabel && hoverRating > 0 && !hasRated && (
                <span className="rating-hover-label">{labels[hoverRating]}</span>
            )}

            {showThanks && (
                <span className="rating-thanks">
                    피드백 감사합니다! 더 나은 서비스를 위해 노력할게요
                </span>
            )}

            {hasRated && !showThanks && showLabel && (
                <span className="rating-submitted">
                    {labels[currentRating]} ({currentRating}점)
                </span>
            )}
        </div>
    );
};

export default RatingFeedback;
