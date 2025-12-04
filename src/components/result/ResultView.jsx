import { forwardRef } from 'react';

const ResultView = forwardRef(({
    mode,
    result,
    tarotResult,
    fortuneResult,
    cards,
    currentCard,
    setCurrentCard,
    cardRevealMode,
    revealParticles,
    user,
    savedDreamId,
    savedDreamPublic,
    progress,
    cardRef,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onBack,
    onRestart,
    onPrevCard,
    onNextCard,
    onToggleVisibility,
    onGenerateDetailedReading,
    onShare,
    onLogin,
    renderCard
}, ref) => {
    const currentResult = result || tarotResult || fortuneResult;

    return (
        <>
            {/* 레어카드 파티클 효과 */}
            {revealParticles.length > 0 && (
                <div className="reveal-particles">
                    {revealParticles.map(p => (
                        <div
                            key={p.id}
                            className="reveal-particle"
                            style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                background: p.color,
                                '--tx': `${p.tx}px`,
                                '--ty': `${p.ty}px`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    ))}
                </div>
            )}
            <div className={`card-container ${cardRevealMode ? 'reveal-mode' : ''} ${mode}-theme`}>
                <div className="card-indicators">
                    {cards.map((_, i) => (
                        <div key={i} className={`indicator ${i === currentCard ? 'active' : ''}`} onClick={() => setCurrentCard(i)} />
                    ))}
                </div>
                <div className="card-wrapper" ref={cardRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                    <div className="card-stack" style={{ transform: `translateX(-${currentCard * 100}%)` }}>
                        {cards.map(renderCard)}
                    </div>
                </div>
                <div className="card-nav">
                    <button className="nav-btn" onClick={onPrevCard} disabled={currentCard === 0}>‹</button>
                    <button className="nav-btn" onClick={onNextCard} disabled={currentCard === cards.length - 1}>›</button>
                </div>
                {/* 상세 풀이 CTA */}
                <button
                    className="detailed-reading-cta"
                    onClick={() => onGenerateDetailedReading(currentResult)}
                >
                    <span className="cta-icon">✨</span>
                    <span className="cta-text">
                        {mode === 'tarot' ? '타로의 비밀 열어보기' : mode === 'fortune' ? '운명의 상세 풀이' : '운명의 비밀 열어보기'}
                    </span>
                    <span className="cta-arrow">→</span>
                </button>
                {user ? (
                    <div className="auto-saved-section">
                        {savedDreamId ? (
                            <>
                                <div className="saved-status">
                                    <span className="saved-icon">✓</span>
                                    <span className="saved-text">자동 저장됨</span>
                                </div>
                                <div className="visibility-toggle-large" onClick={onToggleVisibility}>
                                    <div className={`toggle-switch-large ${savedDreamPublic ? 'active' : ''}`}></div>
                                    <span className={`visibility-label-large ${savedDreamPublic ? 'public' : ''}`}>
                                        {savedDreamPublic ? '🌐 공개 중' : '🔒 비공개'}
                                    </span>
                                </div>
                                <p className="visibility-hint">
                                    {savedDreamPublic ? '다른 사람들이 볼 수 있어요' : '나만 볼 수 있어요. 공개하려면 토글하세요'}
                                </p>
                                {/* pSEO 공유 링크 */}
                                {savedDreamPublic && (
                                    <div className="seo-share-link">
                                        <span className="seo-link-label">검색 가능한 링크</span>
                                        <button
                                            className="copy-link-btn"
                                            onClick={() => {
                                                const baseUrl = window.location.origin;
                                                const path = mode === 'tarot' ? 'tarot' : mode === 'fortune' ? 'fortune' : 'dream';
                                                const url = `${baseUrl}/${path}/${savedDreamId}`;
                                                navigator.clipboard.writeText(url);
                                                alert('링크가 복사되었습니다!');
                                            }}
                                        >
                                            🔗 링크 복사
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="saving-status">
                                <span className="saving-spinner"></span>
                                <span>저장 중...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="login-prompt">
                        <p>로그인하면 저장하고 공유할 수 있어요</p>
                        <button onClick={onLogin}>Google로 로그인</button>
                    </div>
                )}
                {progress && <div className="progress"><span className="progress-dot"></span>{progress}</div>}
                {/* 공유 버튼 */}
                <button className="share-btn-result" onClick={() => onShare(currentResult)}>
                    📤 공유하기
                </button>
                <button className="restart-btn" onClick={onRestart}>
                    {mode === 'tarot' ? '다른 질문 보기' : mode === 'fortune' ? '다시 운세 보기' : '다른 꿈 해독'}
                </button>
            </div>
        </>
    );
});

ResultView.displayName = 'ResultView';

export default ResultView;
