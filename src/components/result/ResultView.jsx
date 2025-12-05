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

                        {/* 이미지 */}
                        {card.image ? (
                            <img src={card.image} alt="" className="royal-image" />
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

                            {/* 리딩 텍스트 - 간결하게 */}
                            {cardReading && (
                                <div className="reading-area">
                                    <p>{cardReading.slice(0, 120)}{cardReading.length > 120 ? '...' : ''}</p>
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

                    {/* 키워드 */}
                    {currentResult?.keywords?.length > 0 && currentCard === 0 && (
                        <div className="keyword-row">
                            {currentResult.keywords.map((kw, i) => (
                                <span key={i} className="keyword">#{kw.word}</span>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <button className="royal-cta" onClick={() => onGenerateDetailedReading(currentResult, mode)}>
                        ✨ {mode === 'tarot' ? '타로의 비밀 열어보기' : mode === 'fortune' ? '운명의 상세 풀이' : '운명의 비밀 열어보기'}
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
