import { useState, useMemo, useEffect } from 'react';

// 타로 단계별 이모지와 색상
const TAROT_PHASE_CONFIG = [
    { emoji: '🃏', color: '#9b59b6' },  // 1: 카드 연결
    { emoji: '✨', color: '#8e44ad' },  // 2: 에너지 감지
    { emoji: '🌙', color: '#6c5ce7' },  // 3: 첫 번째 카드
    { emoji: '☀️', color: '#a29bfe' },  // 4: 두 번째 카드
    { emoji: '⭐', color: '#fd79a8' },  // 5: 세 번째 카드
    { emoji: '🔮', color: '#e84393' },  // 6: 결론 카드
    { emoji: '💫', color: '#f39c12' },  // 7: 스토리 구성
    { emoji: '🌟', color: '#f1c40f' },  // 8: 완료
];

// 아르카나 색상
const ARCANA_COLORS = {
    major: { bg: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.5)', glow: '#ffd700' },
    wands: { bg: 'rgba(255, 87, 51, 0.15)', border: 'rgba(255, 87, 51, 0.5)', glow: '#ff5733' },
    cups: { bg: 'rgba(52, 152, 219, 0.15)', border: 'rgba(52, 152, 219, 0.5)', glow: '#3498db' },
    swords: { bg: 'rgba(149, 165, 166, 0.15)', border: 'rgba(149, 165, 166, 0.5)', glow: '#95a5a6' },
    pentacles: { bg: 'rgba(39, 174, 96, 0.15)', border: 'rgba(39, 174, 96, 0.5)', glow: '#27ae60' },
};

// 셔플 함수
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const TarotInput = ({
    tarotPhase,
    tarotQuestion,
    setTarotQuestion,
    tarotDeck,
    tarotSelectedCards,
    loading,
    analysisPhase,
    progress,
    error,
    onBack,
    onStartSelection,
    onToggleCard,
    onGenerateReading
}) => {
    const currentPhase = TAROT_PHASE_CONFIG[Math.min(analysisPhase, TAROT_PHASE_CONFIG.length) - 1] || TAROT_PHASE_CONFIG[0];

    // 셔플된 덱 (한번만 생성, selecting 단계에서 유지)
    const shuffledDeck = useMemo(() => {
        if (!tarotDeck || tarotDeck.length === 0) return [];
        return shuffleArray(tarotDeck);
    }, [tarotDeck]); // 덱이 바뀔 때만 재셔플

    // 화면 크기에 따른 반원 반지름 계산
    const [spreadRadius, setSpreadRadius] = useState(250);
    useEffect(() => {
        const updateRadius = () => {
            const width = window.innerWidth;
            if (width <= 480) setSpreadRadius(120);
            else if (width <= 640) setSpreadRadius(160);
            else if (width <= 900) setSpreadRadius(200);
            else setSpreadRadius(250);
        };
        updateRadius();
        window.addEventListener('resize', updateRadius);
        return () => window.removeEventListener('resize', updateRadius);
    }, []);

    return (
        <div className="create-card tarot-theme">
            {tarotPhase === 'question' && (
                <>
                    <div className="tarot-question-header">
                        <div className="mystical-orb">
                            <span className="orb-emoji">🔮</span>
                            <div className="orb-rings"></div>
                        </div>
                        <h2 className="create-title tarot-title">운명의 카드에게 물어보세요</h2>
                        <p className="tarot-subtitle">당신의 질문에 78장의 카드가 답합니다</p>
                    </div>
                    <textarea
                        value={tarotQuestion}
                        onChange={(e) => setTarotQuestion(e.target.value)}
                        placeholder={`타로에게 물어보고 싶은 것을 자유롭게 적어주세요...

예시:
• 지금 사귀는 사람과의 미래가 궁금해요
• 이직을 해야 할지 고민이에요
• 올해 나에게 어떤 일이 일어날까요?`}
                        className="dream-input tarot-input"
                        disabled={loading}
                        rows={6}
                    />
                    {error && <div className="error">{error}</div>}
                    <button
                        onClick={onStartSelection}
                        disabled={loading || !tarotQuestion.trim()}
                        className="submit-btn tarot-submit mystical-btn"
                    >
                        {loading ? '준비 중...' : '✨ 카드 뽑으러 가기'}
                    </button>
                </>
            )}

            {tarotPhase === 'selecting' && (
                <>
                    <h2 className="create-title tarot-title">운명의 카드를 선택하세요</h2>
                    <p className="tarot-selection-subtitle">
                        {tarotSelectedCards.length === 0 && '마음을 비우고, 끌리는 카드 3장을 뽑아주세요'}
                        {tarotSelectedCards.length === 1 && '좋아요... 두 장 더 선택해주세요'}
                        {tarotSelectedCards.length === 2 && '마지막 한 장을 선택해주세요'}
                        {tarotSelectedCards.length === 3 && '✨ 운명의 카드가 모두 모였습니다'}
                    </p>
                    <p className="tarot-bonus-hint">
                        🎁 3장을 선택하면 결론 카드 1장을 선물로 드려요!
                    </p>

                    {/* 선택된 카드 슬롯 - 4장 (카드 정체 숨김, 클릭으로 취소 가능) */}
                    <div className={`tarot-slots four-cards ${tarotSelectedCards.length === 3 ? 'complete' : ''}`}>
                        {[0, 1, 2].map((idx) => (
                            <div key={idx} className={`tarot-slot ${tarotSelectedCards[idx] ? 'filled' : ''}`}>
                                <span className="slot-label">{['첫 번째', '두 번째', '세 번째'][idx]}</span>
                                <div
                                    className="slot-card"
                                    onClick={() => tarotSelectedCards[idx] && onToggleCard(tarotSelectedCards[idx])}
                                    style={{ cursor: tarotSelectedCards[idx] ? 'pointer' : 'default' }}
                                >
                                    {tarotSelectedCards[idx] ? (
                                        <div className="slot-card-hidden">
                                            <div className="hidden-card-back">
                                                <span className="hidden-number">{idx + 1}</span>
                                                <span className="hidden-eye">👁️</span>
                                                <span className="hidden-text">탭하여 취소</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="slot-card-empty">
                                            <span className="slot-card-question">?</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* 보너스 카드 슬롯 */}
                        <div className={`tarot-slot bonus-slot ${tarotSelectedCards.length === 3 ? 'unlocked' : 'locked'}`}>
                            <span className="slot-label">🎁 결론</span>
                            <div className="slot-card">
                                <div className="slot-card-bonus">
                                    {tarotSelectedCards.length === 3 ? (
                                        <>
                                            <span className="bonus-reveal">✨</span>
                                            <span className="bonus-text">해석 시 공개</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="bonus-lock">🔒</span>
                                            <span className="bonus-text">{3 - tarotSelectedCards.length}장 더</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 해석 버튼 - 슬롯 바로 아래 */}
                    <button
                        className={`submit-btn tarot-submit mystical-btn ${tarotSelectedCards.length === 3 ? 'ready' : ''}`}
                        onClick={onGenerateReading}
                        disabled={tarotSelectedCards.length !== 3 || loading}
                    >
                        {loading ? '운명을 읽는 중...' : tarotSelectedCards.length === 3 ? '✨ 카드 해석하기' : `🃏 ${3 - tarotSelectedCards.length}장 더 선택하세요`}
                    </button>

                    {/* 78장 타로 카드 - 반원(아치) 형태로 펼침 */}
                    <div className="tarot-spread-container">
                        <div className="spread-header">
                            <span className="spread-icon">🔮</span>
                            <span className="spread-title">78장의 운명의 카드</span>
                            <span className="spread-hint">직감을 믿고 끌리는 카드를 선택하세요</span>
                        </div>
                        <div className="tarot-card-spread">
                            {shuffledDeck.map((card, index) => {
                                const isSelected = tarotSelectedCards.find(c => c.id === card.id);
                                const isDisabled = tarotSelectedCards.length >= 3 && !isSelected;
                                const selectedIndex = tarotSelectedCards.findIndex(c => c.id === card.id);

                                // 반원 형태 배치 계산 - 16:9 비율에 맞춤
                                const total = shuffledDeck.length;
                                const angleRange = 150; // 총 펼침 각도 (도)
                                const startAngle = -angleRange / 2; // 시작 각도
                                const angleStep = angleRange / (total - 1);
                                const angle = startAngle + (index * angleStep);
                                const radius = spreadRadius; // 반응형 반지름 사용

                                // 각도를 라디안으로 변환 (90도 보정: 위쪽 기준)
                                const radians = (angle - 90) * (Math.PI / 180);
                                const x = Math.cos(radians) * radius;
                                const y = Math.sin(radians) * radius + radius * 0.9; // y 보정

                                return (
                                    <div
                                        key={card.id}
                                        className={`tarot-card-back ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                        onClick={() => !isDisabled && onToggleCard(card)}
                                        style={{
                                            transform: `translateX(${x}px) translateY(${y - radius - 20}px) rotate(${angle}deg)`,
                                            zIndex: index
                                        }}
                                    >
                                        <div className="card-back-inner">
                                            {/* 뒷면만 표시 - 카드 정체는 숨김 */}
                                            <div className="card-back-face back">
                                                <div className="card-back-design">
                                                    <div className="card-back-border"></div>
                                                    <div className="card-back-pattern">
                                                        <span className="pattern-star">✦</span>
                                                        <span className="pattern-moon">☽</span>
                                                        <span className="pattern-star">✦</span>
                                                    </div>
                                                    <div className="card-back-center">
                                                        <span className="card-back-eye">👁️</span>
                                                    </div>
                                                    <div className="card-back-pattern">
                                                        <span className="pattern-star">✦</span>
                                                        <span className="pattern-sun">☀</span>
                                                        <span className="pattern-star">✦</span>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="selected-badge">{selectedIndex + 1}</div>
                                                    )}
                                                    <div className="card-back-shimmer"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {(tarotPhase === 'revealing' || tarotPhase === 'reading') && loading && (
                <div className="analysis-animation">
                    <div
                        className="analysis-circle tarot-circle"
                        style={{ '--phase-color': currentPhase.color }}
                    >
                        <div className={`analysis-ring ${analysisPhase >= 1 ? 'active' : ''}`}></div>
                        <div className={`analysis-ring ring-2 ${analysisPhase >= 2 ? 'active' : ''}`}></div>
                        <div className={`analysis-ring ring-3 ${analysisPhase >= 3 ? 'active' : ''}`}></div>
                        <div className="analysis-core">{currentPhase.emoji}</div>
                    </div>
                    <div className="analysis-text">{progress}</div>
                    <div className="analysis-phases">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                            <div key={p} className={`phase-dot ${analysisPhase >= p ? 'active' : ''} ${analysisPhase === p ? 'current' : ''}`} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TarotInput;
