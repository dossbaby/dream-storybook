import { useState, useMemo, useEffect, useCallback } from 'react';
import QuestionSuggestionModal from './QuestionSuggestionModal';

// 인트로 텍스트
const INTRO_TEXTS = [
    '카드가 당신을 기다리고 있어요.',
    '마음속 질문에 집중하며 세 장을 선택하세요.'
];

// 랜덤 헤딩 (prompt 화면용)
const RANDOM_HEADINGS = [
    '지금 마음을 꺼내보세요.',
    '카드에게 뭘 물어볼까요?',
    '알고 싶은 게 있으세요?',
    '무슨 고민이에요?',
    '지금 가장 알고 싶은 게 뭐에요?'
];

// 타로 단계별 이모지와 색상
const TAROT_PHASE_CONFIG = [
    { emoji: '🔮', color: '#9b59b6' },
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

// 플레이스홀더 예시들 (랜덤 로테이션)
const PLACEHOLDER_EXAMPLES = [
    "이번 주 면접 결과를 기다리고 있는데, 붙었을까요?",
    "남자친구가 요즘 바쁘다며 연락이 뜸한데, 다음 주에 연락 올까요?",
    "이번 달 안에 이직 제안을 받을 수 있을까요?",
    "이번 주 안에 짝사랑하는 사람에게 고백해도 될까요?",
    "다음 달에 창업하려는데 성공할 수 있을까요?",
    "올해 안에 결혼할 수 있을까요?"
];


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

    // 랜덤 플레이스홀더 (컴포넌트 마운트 시 한 번만 선택)
    const randomPlaceholder = useMemo(() => {
        return PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)];
    }, []);

    // 랜덤 헤딩 (컴포넌트 마운트 시 한 번만 선택)
    const randomHeading = useMemo(() => {
        return RANDOM_HEADINGS[Math.floor(Math.random() * RANDOM_HEADINGS.length)];
    }, []);

    // 셔플된 덱
    const shuffledDeck = useMemo(() => {
        if (!tarotDeck || tarotDeck.length === 0) return [];
        return shuffleArray(tarotDeck);
    }, [tarotDeck]);

    // 화면 크기에 따른 카드 크기 - 55% 확대 (40% + 15%)
    const [cardSize, setCardSize] = useState({ width: 116, height: 174 });
    const [containerWidth, setContainerWidth] = useState(1440);
    const [ellipseHeight, setEllipseHeight] = useState(180);
    const [ellipseWidthRatio, setEllipseWidthRatio] = useState(0.5);

    // 인트로 상태 (fade in 방식)
    const [introPhase, setIntroPhase] = useState(0); // 0: 대기, 1: 첫번째 표시, 2: 두번째 표시, 3: fade out
    const [cardsRevealed, setCardsRevealed] = useState(false);
    const [cardsClickable, setCardsClickable] = useState(false); // 카드 클릭 가능 여부

    // 질문 추천 모달 상태
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);

    // 인트로 시퀀스 (fade in 방식 - 타이핑 없이)
    // 카드 스프레드: 22장 × 30ms = 660ms 딜레이 + 0.8s 애니메이션 = 약 1.5초
    useEffect(() => {
        if (tarotPhase !== 'selecting') {
            setIntroPhase(0);
            setCardsRevealed(false);
            setCardsClickable(false);
            return;
        }

        // 카드 스프레드 먼저 시작
        const timer0 = setTimeout(() => {
            setCardsRevealed(true);
        }, 300);

        // Phase 0 → 1: 0.5초 후 첫 번째 텍스트 fade in
        const timer1 = setTimeout(() => {
            setIntroPhase(1);
        }, 500);

        // 카드 스프레드 애니메이션 완료 후 클릭 가능
        // 78장 × 30ms = 2310ms + 800ms 애니메이션 = 3110ms (버퍼 포함 3200ms)
        const timerClickable = setTimeout(() => {
            setCardsClickable(true);
        }, 3200);

        // Phase 1 → 2: 1.2초 후 두 번째 텍스트 fade in
        const timer2 = setTimeout(() => {
            setIntroPhase(2);
        }, 1200);

        // fade out 제거 - 인트로 텍스트 항상 표시

        return () => {
            clearTimeout(timer0);
            clearTimeout(timer1);
            clearTimeout(timerClickable);
            clearTimeout(timer2);
        };
    }, [tarotPhase]);

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setContainerWidth(Math.min(width - 60, 1440));

            // 카드 크기 - 너비 기반
            if (width <= 480) {
                setCardSize({ width: 67, height: 99 }); // 55% 확대
            } else if (width <= 768) {
                setCardSize({ width: 83, height: 124 }); // 55% 확대
            } else if (width <= 1024) {
                setCardSize({ width: 99, height: 148 }); // 55% 확대
            } else {
                setCardSize({ width: 116, height: 174 }); // 55% 확대
            }

            // ellipse 크기 - 화면 높이 기반 (노트북 대응) - 1.5배로 키워서 더 둥근 spread
            if (height <= 800) {
                setEllipseHeight(135);
                setEllipseWidthRatio(0.35);
            } else if (height <= 900) {
                setEllipseHeight(150);
                setEllipseWidthRatio(0.4);
            } else {
                setEllipseHeight(270);
                setEllipseWidthRatio(0.5);
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // 카드 클릭
    const handleCardClick = (card, isDisabled, index) => {
        console.log('🃏 Card clicked!', {
            cardId: card.id,
            index,
            isDisabled,
            cardsClickable,
            selectedCount: tarotSelectedCards.length
        });
        if (!isDisabled) {
            onToggleCard(card);
        }
    };

    return (
        <div className="create-card tarot-input-card">
            {tarotPhase === 'question' && (
                <>
                    <div className="tarot-question-header">
                        <div className="mystical-orb tarot-orb">
                            <span className="orb-emoji">🔮</span>
                            <div className="orb-sparkles">
                                <span>✦</span>
                                <span>✧</span>
                                <span>✦</span>
                            </div>
                        </div>
                        <h2 className="create-title tarot-title">{randomHeading}</h2>
                        <p className="tarot-subtitle">질문을 구체적으로 적을수록 더 정확한 리딩을 받을 수 있어요</p>
                    </div>

                    <textarea
                        value={tarotQuestion}
                        onChange={(e) => setTarotQuestion(e.target.value)}
                        placeholder={randomPlaceholder}
                        className="dream-input tarot-input"
                        disabled={loading}
                        rows={4}
                    />
                    {error && <div className="error">{error}</div>}

                    <button
                        onClick={onStartSelection}
                        disabled={loading || !tarotQuestion.trim()}
                        className="submit-btn tarot-submit mystical-btn"
                    >
                        {loading ? '준비 중...' : '🃏 카드 뽑기'}
                    </button>

                    {/* 질문 추천 받기 링크 - 버튼 아래 */}
                    <button
                        className="suggestion-link"
                        onClick={() => setShowSuggestionModal(true)}
                        disabled={loading}
                    >
                        <span className="suggestion-emoji">✨</span>
                        <span className="suggestion-text">질문 추천 받기</span>
                    </button>

                    {/* 질문 추천 모달 */}
                    <QuestionSuggestionModal
                        isOpen={showSuggestionModal}
                        onClose={() => setShowSuggestionModal(false)}
                        onSelectQuestion={(q) => setTarotQuestion(q)}
                    />
                </>
            )}

            {tarotPhase === 'selecting' && (
                <div className="tarot-table">
                    {/* 리딩 취소 버튼 - 우측 상단 (질문 입력 화면으로 돌아감) */}
                    <button className="cancel-reading-btn" onClick={onCancel}>
                        리딩 취소
                    </button>

                    {/* 인트로 텍스트 - 3장 선택 시 fade out */}
                    <div className={`tarot-intro-text ${tarotSelectedCards.length === 3 ? 'all-ready' : ''}`}>
                        <p className={`intro-line intro-line-1 ${introPhase >= 1 ? 'visible' : ''}`}>
                            {INTRO_TEXTS[0]}
                        </p>
                        <p className={`intro-line intro-line-2 ${introPhase >= 2 ? 'visible' : ''}`}>
                            {INTRO_TEXTS[1]}
                        </p>
                    </div>

                    {/* 반짝이는 별 효과 - 40% 추가 */}
                    <div className={`table-stars ${tarotSelectedCards.length === 3 ? 'all-ready' : ''}`}>
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
                                            <div className={`slot-card ${tarotSelectedCards.length === 3 ? 'all-ready' : ''}`}>
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
                            className={`card-spread ${cardsRevealed ? 'revealed' : 'hidden'} selected-${tarotSelectedCards.length}`}
                            style={{ width: '100vw', maxWidth: '100vw' }}
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
                                const ellipseWidth = containerWidth * ellipseWidthRatio;
                                // ellipseHeight, ellipseWidthRatio는 상태에서 가져옴 (화면 높이 기반)

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
                                // index 0은 자신의 최종 위치에서 시작 (slide-in 방지)
                                let startX, startY;
                                if (index === 0) {
                                    // 첫 번째 카드는 자신의 최종 위치에서 시작 (슬라이드 방지)
                                    startX = finalX;
                                    startY = finalY;
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
                                        className={`spread-card ${isSelected ? `selected selected-order-${selectedIndex}` : ''} ${isDisabled ? 'disabled' : ''} ${cardsRevealed ? 'card-revealed' : ''}`}
                                        onClick={() => {
                                            console.log('👆 onClick fired for index:', index, 'cardsClickable:', cardsClickable);
                                            cardsClickable && handleCardClick(card, isDisabled, index);
                                        }}
                                        style={{
                                            width: cardSize.width,
                                            height: cardSize.height,
                                            transform: cardsRevealed
                                                ? `translate(${finalX}px, ${finalY}px) rotate(${rotation}deg)`
                                                : `translate(${startX}px, ${startY}px) rotate(${rotation}deg)`,
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
                        <p className={`guide-text foreshadow-style ${tarotSelectedCards.length === 3 ? 'rainbow-ready' : ''}`}>
                            {tarotSelectedCards.length === 0 && '마음이 속삭이는 카드를 선택하세요'}
                            {tarotSelectedCards.length === 1 && '두 장 더 선택하세요'}
                            {tarotSelectedCards.length === 2 && '마지막 한 장을 선택하세요'}
                            {tarotSelectedCards.length === 3 && '카드가 당신에게 하고 싶은 말이 있어요'}
                        </p>

                        <button
                            className={`read-btn ${tarotSelectedCards.length === 3 ? 'ready rainbow-btn' : ''}`}
                            onClick={onGenerateReading}
                            disabled={tarotSelectedCards.length !== 3 || loading}
                        >
                            {loading ? '해석 중...' : tarotSelectedCards.length === 3 ? '🔮 이야기 펼치기' : '카드를 3장 선택하세요'}
                        </button>
                    </div>
                </div>
            )}

{/* 분석 UI는 AnalysisOverlay로 통합됨 - App.jsx에서 렌더링 */}
        </div>
    );
};

export default TarotInput;
