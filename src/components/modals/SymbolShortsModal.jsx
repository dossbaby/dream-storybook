const SymbolShortsModal = ({
    symbolShortsView,
    symbolDreams,
    currentShortsIndex,
    dreamTypes,
    user,
    touchStart,
    touchEnd,
    onClose,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onPrevShorts,
    onNextShorts,
    onToggleLike,
    onOpenDreamDetail
}) => {
    if (!symbolShortsView) return null;

    const handleSwipeEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) onNextShorts();
        if (distance < -50) onPrevShorts();
    };

    const currentDream = symbolDreams[currentShortsIndex];

    return (
        <div className="shorts-modal-overlay" onClick={onClose}>
            <div className="shorts-modal" onClick={e => e.stopPropagation()}>
                <div className="shorts-header">
                    <button className="shorts-close" onClick={onClose}>✕</button>
                    <span className="shorts-title">#{symbolShortsView} 관련 꿈</span>
                    <span className="shorts-count">{symbolDreams.length}개</span>
                </div>

                {symbolDreams.length === 0 ? (
                    <div className="shorts-empty">
                        <span>🌙</span>
                        <p>아직 이 상징과 관련된 꿈이 없어요</p>
                    </div>
                ) : (
                    <div className="shorts-container">
                        <div
                            className="shorts-swipe-area"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={handleSwipeEnd}
                        >
                            {currentDream && (
                                <div className="shorts-card">
                                    <div className="shorts-card-bg">
                                        {currentDream.dreamImage && (
                                            <img src={currentDream.dreamImage} alt="" />
                                        )}
                                        <div className="shorts-card-overlay" />
                                    </div>
                                    <div className="shorts-card-content">
                                        <div className="shorts-author">
                                            {currentDream.userPhoto && (
                                                <img src={currentDream.userPhoto} alt="" />
                                            )}
                                            <span>{currentDream.userName}</span>
                                        </div>
                                        <div className="shorts-type-badge">
                                            {dreamTypes[currentDream.dreamType]?.emoji}
                                            {dreamTypes[currentDream.dreamType]?.name}
                                        </div>
                                        <h2 className="shorts-dream-title">{currentDream.title}</h2>
                                        <p className="shorts-verdict">"{currentDream.verdict}"</p>
                                        <div className="shorts-keywords">
                                            {currentDream.keywords?.map((k, i) => (
                                                <span key={i} className="shorts-keyword">#{k.word}</span>
                                            ))}
                                        </div>
                                        <button
                                            className="shorts-view-detail"
                                            onClick={() => {
                                                onOpenDreamDetail(currentDream);
                                                onClose();
                                            }}
                                        >
                                            자세히 보기 →
                                        </button>
                                    </div>
                                    <div className="shorts-side-actions">
                                        <button
                                            className={`shorts-action ${currentDream.likes?.includes(user?.uid) ? 'liked' : ''}`}
                                            onClick={() => onToggleLike(currentDream.id)}
                                        >
                                            <span>{currentDream.likes?.includes(user?.uid) ? '❤️' : '🤍'}</span>
                                            <span>{currentDream.likeCount || 0}</span>
                                        </button>
                                        <button className="shorts-action">
                                            <span>💬</span>
                                            <span>{currentDream.commentCount || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 네비게이션 */}
                        <div className="shorts-nav">
                            <button onClick={onPrevShorts} disabled={currentShortsIndex === 0}>▲</button>
                            <span>{currentShortsIndex + 1} / {symbolDreams.length}</span>
                            <button onClick={onNextShorts} disabled={currentShortsIndex === symbolDreams.length - 1}>▼</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SymbolShortsModal;
