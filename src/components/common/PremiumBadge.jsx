/**
 * 프리미엄 배지 컴포넌트
 * 프리미엄/울트라 상태 표시 및 업그레이드 유도
 */
const PremiumBadge = ({
    isPremium = false,
    tier = 'free', // 'free', 'premium', 'ultra'
    size = 'small', // 'tiny', 'small', 'medium', 'large'
    showLabel = true,
    onClick,
    className = ''
}) => {
    const sizeClasses = {
        tiny: 'premium-badge-tiny',
        small: 'premium-badge-small',
        medium: 'premium-badge-medium',
        large: 'premium-badge-large'
    };

    // 울트라 티어
    if (tier === 'ultra') {
        return (
            <span
                className={`premium-badge active ultra ${sizeClasses[size]} ${className}`}
                onClick={onClick}
            >
                <span className="badge-icon">✦</span>
                {showLabel && <span className="badge-label">Ultra</span>}
            </span>
        );
    }

    // 프리미엄 티어
    if (isPremium || tier === 'premium') {
        return (
            <span
                className={`premium-badge active ${sizeClasses[size]} ${className}`}
                onClick={onClick}
            >
                <span className="badge-icon">👑</span>
                {showLabel && <span className="badge-label">Premium</span>}
            </span>
        );
    }

    // 무료 티어 - 업그레이드 유도
    return (
        <button
            className={`premium-badge upgrade ${sizeClasses[size]} ${className}`}
            onClick={onClick}
        >
            <span className="badge-icon">👑</span>
            {showLabel && <span className="badge-label">업그레이드</span>}
        </button>
    );
};

/**
 * 사용량 표시 배지
 * 남은 사용 횟수 및 리셋 시간 표시
 */
export const UsageBadge = ({
    remaining,
    limit,
    type = 'dream', // 'dream', 'tarot', 'saju'
    resetTime,
    isPremium = false,
    onClick
}) => {
    const typeEmojis = {
        dream: '🌙',
        tarot: '🔮',
        saju: '🔮'
    };

    if (isPremium) {
        return (
            <span className="usage-badge premium" onClick={onClick}>
                <span className="usage-icon">{typeEmojis[type]}</span>
                <span className="usage-text">무제한</span>
            </span>
        );
    }

    const isExhausted = remaining <= 0;

    return (
        <button
            className={`usage-badge ${isExhausted ? 'exhausted' : ''}`}
            onClick={onClick}
        >
            <span className="usage-icon">{typeEmojis[type]}</span>
            {isExhausted ? (
                <span className="usage-text reset">
                    <span className="reset-icon">⏰</span>
                    {resetTime}
                </span>
            ) : (
                <span className="usage-text">
                    {remaining}/{limit === Infinity ? '∞' : limit}
                </span>
            )}
        </button>
    );
};

/**
 * Hidden Insight 블러 오버레이
 * 프리미엄 전용 콘텐츠 블러 처리
 */
export const HiddenInsightBlur = ({
    children,
    isPremium = false,
    onUnlock
}) => {
    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <div className="hidden-insight-container">
            <div className="hidden-insight-blur">
                {children}
            </div>
            <div className="hidden-insight-overlay">
                <div className="unlock-prompt">
                    <span className="lock-icon">🔮</span>
                    <h4>Hidden Insight</h4>
                    <p>당신만을 위한 숨겨진 메시지</p>
                    <button className="unlock-btn" onClick={onUnlock}>
                        <span className="btn-icon">👑</span>
                        프리미엄으로 확인
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 심층 분석 잠금
 */
export const DetailedAnalysisLock = ({
    isPremium = false,
    onUnlock
}) => {
    if (isPremium) {
        return null;
    }

    return (
        <div className="detailed-lock-overlay">
            <div className="lock-content">
                <span className="lock-icon">📖</span>
                <h4>심층 분석</h4>
                <p>더 깊은 해석과 조언을 확인하세요</p>
                <button className="unlock-btn" onClick={onUnlock}>
                    <span className="btn-icon">👑</span>
                    프리미엄으로 잠금해제
                </button>
            </div>
        </div>
    );
};

export default PremiumBadge;
