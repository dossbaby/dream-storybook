/**
 * 로딩 스켈레톤 카드 컴포넌트
 * 피드, 리스트 등에서 로딩 상태를 표시
 */
const SkeletonCard = ({ type = 'feed' }) => {
    if (type === 'feed') {
        return (
            <div className="skeleton-card">
                <div className="skeleton-header">
                    <div className="skeleton-avatar shimmer"></div>
                    <div className="skeleton-meta">
                        <div className="skeleton-line short shimmer"></div>
                        <div className="skeleton-line tiny shimmer"></div>
                    </div>
                </div>
                <div className="skeleton-body">
                    <div className="skeleton-line shimmer"></div>
                    <div className="skeleton-line shimmer"></div>
                    <div className="skeleton-line medium shimmer"></div>
                </div>
                <div className="skeleton-footer">
                    <div className="skeleton-tag shimmer"></div>
                    <div className="skeleton-tag shimmer"></div>
                </div>
            </div>
        );
    }

    if (type === 'detail') {
        return (
            <div className="skeleton-detail">
                <div className="skeleton-image shimmer"></div>
                <div className="skeleton-content">
                    <div className="skeleton-line large shimmer"></div>
                    <div className="skeleton-line shimmer"></div>
                    <div className="skeleton-line shimmer"></div>
                    <div className="skeleton-line medium shimmer"></div>
                </div>
            </div>
        );
    }

    // sidebar 타입
    return (
        <div className="skeleton-sidebar-item">
            <div className="skeleton-icon shimmer"></div>
            <div className="skeleton-text">
                <div className="skeleton-line shimmer"></div>
                <div className="skeleton-line short shimmer"></div>
            </div>
        </div>
    );
};

// 여러 개의 스켈레톤을 렌더링하는 헬퍼
export const SkeletonList = ({ count = 3, type = 'feed' }) => (
    <div className="skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} type={type} />
        ))}
    </div>
);

export default SkeletonCard;
