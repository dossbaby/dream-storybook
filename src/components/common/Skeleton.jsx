/**
 * Skeleton UI 컴포넌트
 * 로딩 상태에서 콘텐츠 자리표시자 표시
 */

// 기본 스켈레톤
export const Skeleton = ({
    width = '100%',
    height = '1rem',
    borderRadius = '4px',
    className = '',
    style = {}
}) => (
    <div
        className={`skeleton ${className}`}
        style={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.5s infinite',
            ...style
        }}
    />
);

// 카드 스켈레톤
export const CardSkeleton = ({ className = '' }) => (
    <div className={`card-skeleton ${className}`} style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    }}>
        <Skeleton height="180px" borderRadius="8px" />
        <Skeleton width="70%" height="1.2rem" />
        <Skeleton width="100%" height="0.9rem" />
        <Skeleton width="40%" height="0.9rem" />
    </div>
);

// 피드 아이템 스켈레톤
export const FeedItemSkeleton = () => (
    <div className="feed-item-skeleton" style={{
        display: 'flex',
        gap: '12px',
        padding: '12px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px'
    }}>
        <Skeleton width="48px" height="48px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton width="120px" height="1rem" />
            <Skeleton width="100%" height="0.85rem" />
            <Skeleton width="60%" height="0.85rem" />
        </div>
    </div>
);

// 피드 리스트 스켈레톤
export const FeedListSkeleton = ({ count = 5 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: count }).map((_, i) => (
            <FeedItemSkeleton key={i} />
        ))}
    </div>
);

// 결과 카드 스켈레톤
export const ResultCardSkeleton = () => (
    <div className="result-card-skeleton" style={{
        aspectRatio: '16/9',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '20px',
        gap: '12px'
    }}>
        <Skeleton width="60%" height="1.5rem" />
        <Skeleton width="80%" height="1rem" />
        <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton width="60px" height="24px" borderRadius="12px" />
            <Skeleton width="60px" height="24px" borderRadius="12px" />
            <Skeleton width="60px" height="24px" borderRadius="12px" />
        </div>
    </div>
);

// 텍스트 라인 스켈레톤
export const TextLineSkeleton = ({ lines = 3, gap = '8px' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                width={i === lines - 1 ? '60%' : '100%'}
                height="1rem"
            />
        ))}
    </div>
);

// 아바타 스켈레톤
export const AvatarSkeleton = ({ size = 40 }) => (
    <Skeleton width={`${size}px`} height={`${size}px`} borderRadius="50%" />
);

// 버튼 스켈레톤
export const ButtonSkeleton = ({ width = '100px', height = '36px' }) => (
    <Skeleton width={width} height={height} borderRadius="8px" />
);

export default Skeleton;
