import { forwardRef, useState, useEffect } from 'react';
import RatingFeedback from '../common/RatingFeedback';

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
    renderCard,
    isPremium = false,
    onOpenPremium,
    onRate,
    userRating = 0,
    onKeywordClick
}, ref) => {
    const [localRating, setLocalRating] = useState(userRating);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const currentResult = result || tarotResult || fortuneResult;

    // 풀스크린 모드에서 body 스크롤 방지
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    // ESC 키로 풀스크린 닫기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    // Jenny 전략 필드 가져오기
    const jenny = currentResult?.jenny || {};
    const rarity = currentResult?.rarity || {};
    const rarityText = rarity.description || '';

    const handleCopyLink = () => {
        const baseUrl = window.location.origin;
        const path = mode === 'tarot' ? 'tarot' : mode === 'fortune' ? 'fortune' : 'dream';
        const url = `${baseUrl}/${path}/${savedDreamId}`;
        navigator.clipboard.writeText(url);
    };

    // 현재 카드 데이터
    const card = cards[currentCard] || {};
    const isConclusion = card.type === 'tarot-conclusion';

    // storyReading 가져오기
    const storyReading = tarotResult?.storyReading || {};

    // 현재 카드의 상세 텍스트 가져오기
    const getCardReading = () => {
        if (mode === 'tarot') {
            if (currentCard === 0 && storyReading.card1Analysis) return storyReading.card1Analysis;
            if (currentCard === 1 && storyReading.card2Analysis) return storyReading.card2Analysis;
            if (currentCard === 2 && storyReading.card3Analysis) return storyReading.card3Analysis;
            if (currentCard === 3 && storyReading.conclusionCard) return storyReading.conclusionCard;
        }
        if (mode === 'dream' && result) {
            if (currentCard === 0) return result.reading?.situation || result.verdict;
            if (currentCard === 1) return result.tarot?.meaning || result.reading?.unconscious;
            if (currentCard === 2) return result.dreamMeaning?.detail || result.reading?.action;
        }
        if (mode === 'fortune' && fortuneResult) {
            return fortuneResult.reading?.[['morning', 'afternoon', 'evening'][currentCard]] || '';
        }
        return card.reading || '';
    };

    const cardReading = getCardReading();

    // 저장 상태
    const getSaveStatus = () => {
        if (!user) return 'login';
        if (progress) return 'saving';
        if (savedDreamId) return 'saved';
        return 'pending'; // 아직 저장 안됨
    };
    const saveStatus = getSaveStatus();

    // cards가 없으면 렌더링하지 않음
    if (!cards?.length) return null;

    return (
        <>
            {/* 풀스크린 카드 뷰어 */}
            {isFullscreen && card.image && (
                <div
                    className="fullscreen-viewer"
                    onClick={() => setIsFullscreen(false)}
                >
                    <div className="fullscreen-backdrop" style={{ backgroundImage: `url(${card.image})` }} />
                    <div className="fullscreen-container" onClick={(e) => e.stopPropagation()}>
                        {/* 닫기 버튼 */}
                        <button className="fullscreen-close" onClick={() => setIsFullscreen(false)}>
                            ✕
                        </button>

                        {/* 진행 표시 */}
                        <div className="fullscreen-progress">
                            {cards.map((_, i) => (
                                <div
                                    key={i}
                                    className={`fs-progress-dot ${i === currentCard ? 'active' : ''} ${i < currentCard ? 'done' : ''}`}
                                    onClick={() => setCurrentCard(i)}
                                />
                            ))}
                        </div>

                        {/* 메인 이미지 */}
                        <div
                            className="fullscreen-image-wrapper"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            <img src={card.image} alt="" className="fullscreen-image" />
                        </div>

                        {/* 카드 정보 오버레이 */}
                        <div className="fullscreen-info">
                            {card.card && (
                                <div className="fs-card-badge">
                                    <span className="fs-card-emoji">{card.card.emoji}</span>
                                    <span className="fs-card-name">{card.card.nameKo || card.card.name_ko}</span>
                                </div>
                            )}
                            {currentCard === 0 && currentResult?.title && (
                                <h2 className="fs-title">{currentResult.title}</h2>
                            )}
                            {cardReading && (
                                <p className="fs-reading">{cardReading.slice(0, 150)}{cardReading.length > 150 ? '...' : ''}</p>
                            )}
                        </div>

                        {/* 네비게이션 */}
                        {currentCard > 0 && (
                            <button className="fullscreen-nav prev" onClick={onPrevCard}>‹</button>
                        )}
                        {currentCard < cards.length - 1 && (
                            <button className="fullscreen-nav next" onClick={onNextCard}>›</button>
                        )}

                        {/* 하단 힌트 */}
                        <div className="fullscreen-hint">
                            <span>스와이프하여 다른 카드 보기</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 파티클 효과 */}
            {revealParticles?.length > 0 && (
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

            {/* 로얄 카드 레이아웃 */}
            <div className={`royal-result ${mode}-theme`}>

                {/* 메인 비주얼 */}
                <div
                    className="royal-visual"
                    ref={cardRef}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* 배경 블러 */}
                    {card.image && (
                        <div className="royal-backdrop" style={{ backgroundImage: `url(${card.image})` }} />
                    )}

                    {/* 메인 카드 */}
                    <div className={`royal-card ${isConclusion ? 'golden' : ''}`}>
                        {/* 카드 프레임 */}
                        <div className="card-frame">
                            <div className="frame-corner tl" />
                            <div className="frame-corner tr" />
                            <div className="frame-corner bl" />
                            <div className="frame-corner br" />
                        </div>

                        {/* 이미지 - 클릭 시 풀스크린 */}
                        {card.image ? (
                            <img
                                src={card.image}
                                alt=""
                                className="royal-image"
                                onClick={() => setIsFullscreen(true)}
                            />
                        ) : (
                            <div className="royal-placeholder">
                                <span>{card.card?.emoji || '🌙'}</span>
                            </div>
                        )}

                        {/* 그라데이션 */}
                        <div className="royal-gradient" />

                        {/* 상단: 진행 바 */}
                        <div className="royal-progress">
                            {cards.map((_, i) => (
                                <div
                                    key={i}
                                    className={`progress-segment ${i === currentCard ? 'active' : ''} ${i < currentCard ? 'done' : ''}`}
                                    onClick={() => setCurrentCard(i)}
                                />
                            ))}
                        </div>

                        {/* 카드 정보 오버레이 */}
                        <div className="royal-overlay">
                            {/* 카드 이름 (타로) */}
                            {card.card && (
                                <div className={`card-title-area ${isConclusion ? 'golden' : ''}`}>
                                    <div className="card-roman">
                                        {isConclusion ? '✦' : ['I', 'II', 'III', 'IV'][currentCard]}
                                    </div>
                                    <div className="card-name-stack">
                                        <span className="card-name-main">{card.card.nameKo || card.card.name_ko}</span>
                                        <span className="card-name-sub">{card.card.name}</span>
                                    </div>
                                    <span className="card-emoji">{card.card.emoji}</span>
                                </div>
                            )}

                            {/* 제목 (첫 카드) */}
                            {currentCard === 0 && (
                                <div className="result-title-area">
                                    <h1 className="result-title">{currentResult?.title}</h1>
                                    <p className="result-verdict">{currentResult?.verdict}</p>
                                </div>
                            )}

                            {/* Jenny Hook - 희귀도 강조 (첫 카드) */}
                            {currentCard === 0 && (jenny.hook || rarityText) && (
                                <div className="jenny-hook-overlay">
                                    <span className="hook-sparkle">✨</span>
                                    <span className="hook-text">{jenny.hook || rarityText}</span>
                                </div>
                            )}

                            {/* 리딩 텍스트 - 간결하게 */}
                            {cardReading && (
                                <div className="reading-area">
                                    <p>{cardReading.slice(0, 120)}{cardReading.length > 120 ? '...' : ''}</p>
                                </div>
                            )}

                            {/* Jenny Transition - 다음 카드 유도 */}
                            {mode === 'tarot' && currentCard < cards.length - 1 && (
                                <div className="jenny-transition-overlay">
                                    {currentCard === 0 && jenny.card1Transition && (
                                        <span className="transition-text">{jenny.card1Transition}</span>
                                    )}
                                    {currentCard === 1 && jenny.card2Transition && (
                                        <span className="transition-text">{jenny.card2Transition}</span>
                                    )}
                                    {currentCard === 2 && jenny.card3Transition && (
                                        <span className="transition-text">{jenny.card3Transition}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 네비게이션 */}
                        {currentCard > 0 && (
                            <button className="royal-nav prev" onClick={onPrevCard}>‹</button>
                        )}
                        {currentCard < cards.length - 1 && (
                            <button className="royal-nav next" onClick={onNextCard}>›</button>
                        )}
                    </div>
                </div>

                {/* 하단 컨텐츠 */}
                <div className="royal-content">
                    {/* 종합 (마지막 카드) */}
                    {mode === 'tarot' && currentCard === cards.length - 1 && storyReading.synthesis && (
                        <div className="synthesis-box">
                            <p className="synthesis-text">{storyReading.synthesis}</p>
                            {storyReading.actionAdvice && (
                                <p className="synthesis-advice">💡 {storyReading.actionAdvice}</p>
                            )}
                        </div>
                    )}

                    {/* 키워드 - 클릭 시 피드 필터링 */}
                    {currentResult?.keywords?.length > 0 && currentCard === 0 && (
                        <div className="keyword-row">
                            {currentResult.keywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="keyword clickable"
                                    onClick={() => onKeywordClick?.(kw.word)}
                                >
                                    #{kw.word}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <button
                        className={`royal-cta ${!isPremium ? 'locked' : ''}`}
                        onClick={() => {
                            if (isPremium) {
                                onGenerateDetailedReading(currentResult, mode);
                            } else {
                                onOpenPremium?.('detailed_analysis');
                            }
                        }}
                    >
                        {isPremium
                            ? `✨ ${mode === 'tarot' ? '타로의 비밀 열어보기' : mode === 'fortune' ? '운명의 상세 풀이' : '운명의 비밀 열어보기'}`
                            : `🔒 프리미엄으로 ${mode === 'tarot' ? '타로의 비밀' : mode === 'fortune' ? '운명의 상세 풀이' : '운명의 비밀'} 보기`
                        }
                    </button>

                    {/* 저장 */}
                    <div className="save-row">
                        {saveStatus === 'saved' && (
                            <>
                                <span className="saved-text">✓ 저장됨</span>
                                <span className="visibility-btn" onClick={onToggleVisibility}>
                                    {savedDreamPublic ? '🌐' : '🔒'}
                                </span>
                                {savedDreamPublic && savedDreamId && (
                                    <button className="link-btn" onClick={handleCopyLink}>🔗</button>
                                )}
                            </>
                        )}
                        {saveStatus === 'saving' && <span className="saving-text">저장 중...</span>}
                        {saveStatus === 'pending' && <span className="saving-text">저장 대기...</span>}
                        {saveStatus === 'login' && (
                            <button className="login-btn" onClick={onLogin}>로그인하면 저장 가능</button>
                        )}
                    </div>

                    {/* 별점 피드백 - 마지막 카드에서만 표시 */}
                    {currentCard === cards.length - 1 && savedDreamId && (
                        <div className="result-feedback-section">
                            <RatingFeedback
                                currentRating={localRating}
                                onRate={async (rating) => {
                                    setLocalRating(rating);
                                    if (onRate) {
                                        await onRate(savedDreamId, rating, mode);
                                    }
                                }}
                                size="medium"
                            />
                        </div>
                    )}

                    {/* 액션 */}
                    <div className="action-row">
                        <button className="action-btn" onClick={() => onShare(currentResult)}>📤 공유</button>
                        <button className="action-btn" onClick={onRestart}>
                            {mode === 'tarot' ? '🃏 다시' : mode === 'fortune' ? '🔮 다시' : '🌙 다시'}
                        </button>
                    </div>
                </div>

                {progress && (
                    <div className="progress-toast">
                        <span className="dot" />{progress}
                    </div>
                )}
            </div>
        </>
    );
});

ResultView.displayName = 'ResultView';

export default ResultView;
