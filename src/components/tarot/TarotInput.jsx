import { useState, useMemo, useEffect, useCallback } from 'react';

// 인트로 텍스트
const INTRO_TEXTS = [
    '카드가 당신을 기다리고 있어요',
    '마음속 질문에 집중하며 세 장을 선택하세요'
];

// 타로 단계별 이모지와 색상
const TAROT_PHASE_CONFIG = [
    { emoji: '🃏', color: '#9b59b6' },
    { emoji: '✨', color: '#8e44ad' },
    { emoji: '🌙', color: '#6c5ce7' },
    { emoji: '☀️', color: '#a29bfe' },
    { emoji: '⭐', color: '#fd79a8' },
    { emoji: '🔮', color: '#e84393' },
    { emoji: '💫', color: '#f39c12' },
    { emoji: '🌟', color: '#f1c40f' },
];

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
    onCancel,
    onStartSelection,
    onToggleCard,
    onGenerateReading
}) => {
    const currentPhase = TAROT_PHASE_CONFIG[Math.min(analysisPhase, TAROT_PHASE_CONFIG.length) - 1] || TAROT_PHASE_CONFIG[0];

    // 셔플된 덱
    const shuffledDeck = useMemo(() => {
        if (!tarotDeck || tarotDeck.length === 0) return [];
        return shuffleArray(tarotDeck);
    }, [tarotDeck]);

    // 화면 크기에 따른 카드 크기 - 55% 확대 (40% + 15%)
    const [cardSize, setCardSize] = useState({ width: 116, height: 174 });
    const [containerWidth, setContainerWidth] = useState(1440);

    // 인트로 상태 (fade in 방식)
    const [introPhase, setIntroPhase] = useState(0); // 0: 대기, 1: 첫번째 표시, 2: 두번째 표시, 3: fade out
    const [cardsRevealed, setCardsRevealed] = useState(false);

    // 인트로 시퀀스 (fade in 방식 - 타이핑 없이)
    // 카드 스프레드: 22장 × 30ms = 660ms 딜레이 + 0.8s 애니메이션 = 약 1.5초
    useEffect(() => {
        if (tarotPhase !== 'selecting') {
            setIntroPhase(0);
            setCardsRevealed(false);
            return;
        }

        // Phase 0 → 1: 0.3초 후 첫 번째 텍스트 fade in + 카드 스프레드 동시 시작
        const timer1 = setTimeout(() => {
            setIntroPhase(1);
            setCardsRevealed(true); // 카드 스프레드도 동시에 시작
        }, 300);

        // Phase 1 → 2: 1초 후 두 번째 텍스트 fade in
        const timer2 = setTimeout(() => {
            setIntroPhase(2);
        }, 1300);

        // Phase 2 → 3: 카드 스프레드 완료 후 3초 더 대기 후 fade out
        const timer3 = setTimeout(() => {
            setIntroPhase(3);
        }, 5800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [tarotPhase]);

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            setContainerWidth(Math.min(width - 60, 1440));

            if (width <= 480) {
                setCardSize({ width: 67, height: 99 }); // 55% 확대
            } else if (width <= 768) {
                setCardSize({ width: 83, height: 124 }); // 55% 확대
            } else if (width <= 1024) {
                setCardSize({ width: 99, height: 148 }); // 55% 확대
            } else {
                setCardSize({ width: 116, height: 174 }); // 55% 확대
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // 카드 클릭
    const handleCardClick = (card, isDisabled) => {
        if (!isDisabled) {
            onToggleCard(card);
        }
    };

    return (
        <div className="create-card tarot-input-card">
            {tarotPhase === 'question' && (
                <>
                    <div className="tarot-question-header">
                        <div className="mystical-orb">
                            <span className="orb-emoji">🔮</span>
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
                <div className="tarot-table">
                    {/* 리딩 취소 버튼 - 우측 상단 (질문 입력 화면으로 돌아감) */}
                    <button className="cancel-reading-btn" onClick={onCancel}>
                        리딩 취소
                    </button>

                    {/* 인트로 텍스트 - fade in 방식 */}
                    <div className={`tarot-intro-text ${introPhase >= 3 ? 'fade-out' : ''}`}>
                        <p className={`intro-line intro-line-1 ${introPhase >= 1 ? 'visible' : ''}`}>
                            {INTRO_TEXTS[0]}
                        </p>
                        <p className={`intro-line intro-line-2 ${introPhase >= 2 ? 'visible' : ''}`}>
                            {INTRO_TEXTS[1]}
                        </p>
                    </div>

                    {/* 반짝이는 별 효과 - 40% 추가 */}
                    <div className="table-stars">
                        <div className="star star-1"></div>
                        <div className="star star-2"></div>
                        <div className="star star-3"></div>
                        <div className="star star-4"></div>
                        <div className="star star-5"></div>
                        <div className="star star-6"></div>
                        <div className="star star-7"></div>
                        <div className="star star-8"></div>
                        <div className="star star-9"></div>
                        <div className="star star-10"></div>
                        <div className="star star-11"></div>
                        <div className="star star-12"></div>
                        <div className="star star-13"></div>
                        <div className="star star-14"></div>
                        <div className="star star-15"></div>
                        <div className="star star-16"></div>
                        <div className="star star-17"></div>
                    </div>

                    {/* 선택된 카드 표시 영역 - 하단 */}
                    <div className="selected-cards-area">
                        <div className="selected-cards-row">
                            {[0, 1, 2].map((idx) => {
                                const card = tarotSelectedCards[idx];
                                const labels = ['카드 1', '카드 2', '카드 3'];
                                const symbols = ['☽', '☀', '★']; // 달, 태양, 별
                                return (
                                    <div
                                        key={idx}
                                        className={`selected-slot ${card ? 'filled' : ''}`}
                                        onClick={() => card && onToggleCard(card)}
                                    >
                                        {card ? (
                                            <div className="slot-card">
                                                <div className="slot-card-art">
                                                    <div className={`slot-art-symbol symbol-${idx + 1}`}>{symbols[idx]}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="slot-empty">
                                                <span className="slot-label">{labels[idx]}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 카드 스프레드 */}
                    <div className="table-mat">
                        {/* 덱 - 카드들이 여기서 나옴 */}
                        <div className={`card-deck-stack ${cardsRevealed ? 'spreading' : ''}`}>
                            <div className="deck-card"></div>
                            <div className="deck-card"></div>
                            <div className="deck-card"></div>
                        </div>
                        <div
                            className={`card-spread ${cardsRevealed ? 'revealed' : 'hidden'}`}
                            style={{ width: containerWidth }}
                        >
                            {shuffledDeck.map((card, index) => {
                                const isSelected = tarotSelectedCards.find(c => c.id === card.id);
                                const isDisabled = tarotSelectedCards.length >= 3 && !isSelected;
                                const selectedIndex = tarotSelectedCards.findIndex(c => c.id === card.id);

                                // 기본 설정
                                const total = shuffledDeck.length;
                                const centerIndex = (total - 1) / 2;
                                const t = (index - centerIndex) / centerIndex; // -1 ~ 1

                                // 자연스러운 ellipse curve
                                const ellipseWidth = containerWidth * 0.5;
                                const ellipseHeight = 180;

                                // ellipse 공식: x = a * t, y = b * sqrt(1 - t^2) 변형
                                // 위가 평평하고 아래로 curve되는 형태
                                // 마지막 카드만 조금 더 오른쪽으로 + 아래로
                                const lastCardOffsetX = index === total - 1 ? 8 : 0;
                                const lastCardOffsetY = index === total - 1 ? 18 : 0;
                                const lastCardTilt = index === total - 1 ? -4 : 0;
                                const x = t * ellipseWidth + lastCardOffsetX;
                                const y = (1 - Math.cos(t * Math.PI * 0.5)) * ellipseHeight + lastCardOffsetY;

                                // 카드 회전 - 부채꼴처럼 펼쳐지는 느낌
                                // 끝쪽으로 갈수록 안쪽으로 살짝 틀어짐 (손으로 펼친 느낌)
                                const edgeTilt = Math.pow(Math.abs(t), 2) * 22 * -Math.sign(t);
                                const baseRotation = t * 35 + edgeTilt + lastCardTilt;

                                // 미세한 랜덤 변화 (가장자리 40%로 갈수록 자연스럽게 증가)
                                const absT = Math.abs(t);
                                const edgeFactor = absT > 0.6 ? (absT - 0.6) / 0.4 : 0; // 0~1
                                const extremeEdge = absT > 0.9 ? (absT - 0.9) / 0.1 : 0; // 끝 10% 추가
                                const randomStrength = 1 + edgeFactor * 1.5 + extremeEdge * 1; // 1 ~ 3.5
                                const randomX = Math.sin(index * 7.3) * 3 * randomStrength;
                                const randomY = Math.cos(index * 5.7) * 2.5 * randomStrength;
                                const randomRot = Math.sin(index * 3.1) * 2 * randomStrength;

                                const finalX = x + randomX;
                                const finalY = y + randomY;
                                const rotation = baseRotation + randomRot;

                                // 펼쳐지는 애니메이션 딜레이 - 왼쪽에서 오른쪽으로 순서대로
                                const spreadDelay = index * 30; // 30ms씩 순차 딜레이 (더 빠르게)

                                // 시작 위치: 이전 카드의 최종 위치에서 시작
                                // index 0은 덱 위치(왼쪽 아래), 그 이후는 이전 카드 위치
                                let startX, startY;
                                if (index === 0) {
                                    // 첫 번째 카드는 덱 위치에서 시작
                                    startX = -ellipseWidth - 80;
                                    startY = ellipseHeight + 30;
                                } else {
                                    // 이전 카드의 최종 위치 계산
                                    const prevT = ((index - 1) - centerIndex) / centerIndex;
                                    const prevLastCardOffsetX = (index - 1) === total - 1 ? 8 : 0;
                                    const prevLastCardOffsetY = (index - 1) === total - 1 ? 18 : 0;
                                    const prevX = prevT * ellipseWidth + prevLastCardOffsetX;
                                    const prevY = (1 - Math.cos(prevT * Math.PI * 0.5)) * ellipseHeight + prevLastCardOffsetY;
                                    const prevRandomX = Math.sin((index - 1) * 7.3) * 3;
                                    const prevRandomY = Math.cos((index - 1) * 5.7) * 2.5;
                                    startX = prevX + prevRandomX;
                                    startY = prevY + prevRandomY;
                                }

                                return (
                                    <div
                                        key={card.id}
                                        className={`spread-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${cardsRevealed ? 'card-revealed' : ''}`}
                                        onClick={() => cardsRevealed && handleCardClick(card, isDisabled)}
                                        style={{
                                            width: cardSize.width,
                                            height: cardSize.height,
                                            transform: cardsRevealed
                                                ? `translate(${finalX}px, ${finalY}px) rotate(${rotation}deg)`
                                                : `translate(${startX}px, ${startY}px) rotate(0deg)`,
                                            zIndex: isSelected ? 200 + selectedIndex : 50 + index,
                                            transitionDelay: cardsRevealed ? `${spreadDelay}ms` : '0ms'
                                        }}
                                    >
                                        <div className="card-face">
                                            <div className="card-art">
                                                <div className="art-frame"></div>
                                                <div className="art-symbol">✧</div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="selection-number">{selectedIndex + 1}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 하단 안내 */}
                    <div className={`table-footer ${cardsRevealed ? 'visible' : ''}`}>
                        <p className="guide-text foreshadow-style">
                            {tarotSelectedCards.length === 0 && '마음이 속삭이는 카드를 선택하세요'}
                            {tarotSelectedCards.length === 1 && '두 장 더 선택하세요'}
                            {tarotSelectedCards.length === 2 && '마지막 한 장을 선택하세요'}
                            {tarotSelectedCards.length === 3 && '운명의 카드가 준비되었습니다'}
                        </p>

                        <button
                            className={`read-btn ${tarotSelectedCards.length === 3 ? 'ready' : ''}`}
                            onClick={onGenerateReading}
                            disabled={tarotSelectedCards.length !== 3 || loading}
                        >
                            {loading ? '해석 중...' : tarotSelectedCards.length === 3 ? '🌙 리딩 시작하기' : '카드를 3장 선택하세요'}
                        </button>
                    </div>
                </div>
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
