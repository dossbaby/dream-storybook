import { useState, useEffect, useRef } from 'react';

// 폴백용 인사이트 (AI 생성 실패 시)
const FALLBACK_INSIGHTS = [
    "이 카드 조합은 100명 중 3명만 받는 희귀한 배치예요",
    "당신의 질문에 우주가 특별히 관심을 보이고 있어요",
    "이 리딩은 3일 후에 다시 보면 새로운 의미가 보일 거예요"
];

// 카드 위치별 라벨 (간결하게)
const CARD_LABELS = ['첫 번째', '두 번째', '세 번째'];

const TarotResultView = ({
    tarotResult,
    onBack,
    onRestart,
    whispers = [],
    onAddWhisper,
    viewerCount = 0,
    similarCount = 0
}) => {
    // Visual Novel 인트로 단계 (클릭 기반 진행)
    // 0: 시작 대기 (fade in)
    // 1: Hook 타이핑 중 (클릭하면 즉시 완료)
    // 2: Hook 완료, 클릭 대기
    // 3: Foreshadow 타이핑 중 (클릭하면 즉시 완료)
    // 4: Foreshadow 완료, 클릭 대기
    // 5: 인트로 종료, 결과 페이지 표시
    const [introPhase, setIntroPhase] = useState(0);
    const [hookTyped, setHookTyped] = useState('');
    const [foreshadowTyped, setForeshadowTyped] = useState('');
    const [pageRevealed, setPageRevealed] = useState(false);

    // 카드 뒤집기 상태 (순서대로만 열 수 있음)
    const [flippedCards, setFlippedCards] = useState([]);
    // Hidden Insight 봉인 해제 상태
    const [insightUnsealed, setInsightUnsealed] = useState(false);

    // 섹션 참조 (자동 스크롤용)
    const sectionRefs = useRef([]);
    const cardBarRef = useRef(null);

    // AI 생성 Jenny 전략 필드 사용 (없으면 폴백)
    const jenny = tarotResult.jenny || {};
    const rarity = tarotResult.rarity || {};

    // 숨겨진 인사이트 (AI 생성 우선)
    const hiddenInsight = jenny.hiddenInsight || FALLBACK_INSIGHTS[Math.floor(tarotResult.title?.length || 0) % FALLBACK_INSIGHTS.length];

    // Hook 텍스트 (신비로운 텍스트 기반 - 숫자/희귀도 제외)
    const hookText = jenny.hook || '당신의 질문에 카드가 응답했어요... 세 장의 카드가 이야기를 시작합니다.';

    // Foreshadow 텍스트
    const foreshadowText = jenny.foreshadow || '카드가 말하고 싶은 이야기가 있어요. 함께 들어볼까요?';

    // 히어로 이미지 (질문 기반 생성 이미지, 없으면 카드1 이미지 폴백)
    const heroImage = tarotResult.heroImage || tarotResult.card1Image || tarotResult.pastImage;

    // 카드 이미지 매핑 (4장)
    const cardImages = [
        tarotResult.card1Image || tarotResult.pastImage,
        tarotResult.card2Image || tarotResult.presentImage,
        tarotResult.card3Image || tarotResult.futureImage,
        tarotResult.conclusionImage
    ];

    // 스토리 리딩 또는 기존 리딩
    const storyReading = tarotResult.storyReading || {
        opening: tarotResult.reading?.past || '',
        card1Analysis: tarotResult.cardMeaning?.detail || '',
        card2Analysis: tarotResult.reading?.present || '',
        card3Analysis: tarotResult.reading?.future || '',
        conclusionCard: tarotResult.reading?.action || '',
        synthesis: tarotResult.cardMeaning?.summary || '',
        actionAdvice: tarotResult.cardMeaning?.advice || '',
        warning: '',
        timing: ''
    };

    // 카드 개수 (3장 또는 4장)
    const cardCount = tarotResult.cards?.length || 3;
    const hasConclusion = cardCount >= 4;

    // 모든 카드가 뒤집혔는지 확인
    const allCardsFlipped = flippedCards.length >= cardCount;

    // Visual Novel 인트로 시퀀스 - 클릭 기반 진행
    useEffect(() => {
        // Phase 0 → 1: 0.8초 후 Hook 타이핑 시작
        const startTimer = setTimeout(() => {
            setIntroPhase(1);
        }, 800);

        return () => clearTimeout(startTimer);
    }, []);

    // Hook 타이핑 효과 (85ms per char)
    useEffect(() => {
        if (introPhase === 1 && hookTyped.length < hookText.length) {
            const timer = setTimeout(() => {
                setHookTyped(hookText.slice(0, hookTyped.length + 1));
            }, 85); // 타이핑 속도
            return () => clearTimeout(timer);
        } else if (introPhase === 1 && hookTyped.length >= hookText.length) {
            // Hook 완료 → Phase 2 (클릭 대기)
            setIntroPhase(2);
        }
    }, [introPhase, hookTyped, hookText]);

    // Foreshadow 타이핑 효과 (70ms per char)
    useEffect(() => {
        if (introPhase === 3 && foreshadowTyped.length < foreshadowText.length) {
            const timer = setTimeout(() => {
                setForeshadowTyped(foreshadowText.slice(0, foreshadowTyped.length + 1));
            }, 70); // 타이핑 속도
            return () => clearTimeout(timer);
        } else if (introPhase === 3 && foreshadowTyped.length >= foreshadowText.length) {
            // Foreshadow 완료 → Phase 4 (클릭 대기)
            setIntroPhase(4);
        }
    }, [introPhase, foreshadowTyped, foreshadowText]);

    // 페이지 reveal 효과
    useEffect(() => {
        if (introPhase === 5) {
            setTimeout(() => setPageRevealed(true), 100);
        }
    }, [introPhase]);

    // 카드 뒤집기 핸들러 + 자동 스크롤
    const handleCardFlip = (index) => {
        // 인트로 완료 전에는 카드 선택 불가
        if (introPhase < 5) return;

        // 이미 뒤집힌 카드면 해당 섹션으로 스크롤만
        if (flippedCards.includes(index)) {
            scrollToSection(index);
            return;
        }

        // 첫 번째 카드이거나, 이전 카드가 이미 뒤집혔으면 뒤집기 가능
        if (index === 0 || flippedCards.includes(index - 1)) {
            setFlippedCards([...flippedCards, index]);
            // 약간의 딜레이 후 해당 섹션으로 스크롤
            setTimeout(() => scrollToSection(index), 400);
        }
    };

    // 섹션으로 스크롤 (페이지 전체 스크롤 사용)
    const scrollToSection = (index) => {
        const section = sectionRefs.current[index];
        if (section) {
            const stickyBarHeight = cardBarRef.current?.offsetHeight || 120;
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;

            // 이미지 상단이 보이도록 여유를 줌
            window.scrollTo({
                top: sectionTop - stickyBarHeight - 75,
                behavior: 'smooth'
            });
        }
    };

    // 인트로 클릭 핸들러 (단계별 진행)
    const handleIntroClick = () => {
        if (introPhase === 1) {
            // 타이핑 중이면 즉시 완료
            setHookTyped(hookText);
            setIntroPhase(2);
        } else if (introPhase === 2) {
            // Hook 완료 상태 → Foreshadow 시작
            setIntroPhase(3);
        } else if (introPhase === 3) {
            // Foreshadow 타이핑 중이면 즉시 완료
            setForeshadowTyped(foreshadowText);
            setIntroPhase(4);
        } else if (introPhase === 4) {
            // Foreshadow 완료 → 인트로 종료
            setIntroPhase(5);
        }
    };

    // 인트로 완전 스킵 (더블클릭 또는 특수 동작용)
    const handleSkipIntro = () => {
        setHookTyped(hookText);
        setForeshadowTyped(foreshadowText);
        setIntroPhase(5);
    };

    // 분석 텍스트 배열
    const analyses = [
        storyReading.card1Analysis,
        storyReading.card2Analysis,
        storyReading.card3Analysis,
        storyReading.conclusionCard
    ];

    // Jenny 전환 텍스트 배열
    const transitions = [
        jenny.card1Transition,
        jenny.card2Transition,
        jenny.card3Transition,
        null
    ];

    return (
        <div className={`tarot-result-page ${pageRevealed ? 'revealed' : ''}`}>
            {/* Visual Novel 인트로 오버레이 */}
            {introPhase < 5 && (
                <div className="vn-intro-overlay" onClick={handleIntroClick}>
                    {/* 신비로운 배경 글로우 */}
                    <div className="vn-bg-glow"></div>
                    <div className="vn-bg-glow secondary"></div>
                    <div className="vn-particles"></div>

                    <div className="vn-intro-content">
                        {/* 우아한 상단 장식 */}
                        <div className="vn-ornament top">~ ✧ ~</div>

                        {/* Hook */}
                        {introPhase >= 1 && (
                            <div className={`vn-hook ${introPhase >= 2 ? 'complete' : ''}`}>
                                <p className="vn-typing-text">
                                    {hookTyped}
                                    {introPhase === 1 && hookTyped.length < hookText.length && (
                                        <span className="vn-cursor">|</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Foreshadow */}
                        {introPhase >= 3 && (
                            <div className={`vn-foreshadow ${introPhase >= 4 ? 'complete' : ''}`}>
                                <p className="vn-typing-text">
                                    {foreshadowTyped}
                                    {introPhase === 3 && foreshadowTyped.length < foreshadowText.length && (
                                        <span className="vn-cursor">|</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* 우아한 하단 장식 */}
                        <div className="vn-ornament bottom">~ ✧ ~</div>

                        {/* 진행 안내 */}
                        <p className="vn-continue-hint">
                            {introPhase === 2 || introPhase === 4
                                ? '탭하여 계속...'
                                : introPhase === 1 || introPhase === 3
                                    ? '탭하면 건너뛰기'
                                    : ''}
                        </p>

                        {/* 스킵 버튼 */}
                        <button
                            className="vn-skip-btn"
                            onClick={(e) => { e.stopPropagation(); handleSkipIntro(); }}
                        >
                            <span className="skip-icon">»</span>SKIP
                        </button>
                    </div>
                </div>
            )}

            {/* 메인 콘텐츠 */}
            <div className="tarot-result-content">
                {/* 대각선 패턴 배경 */}
                <div className="modal-pattern-bg"></div>

                {/* 닫기 버튼 */}
                <button className="modal-close-btn" onClick={onBack}>✕</button>

                {/* 히어로 섹션 */}
                <div className="reading-hero">
                    {heroImage && (
                        <img src={heroImage} alt="" className="reading-hero-img" />
                    )}
                    <div className="reading-hero-overlay">
                        <span className="reading-type-badge">🔮 타로 리딩</span>
                        <h1 className="reading-title">{tarotResult.title}</h1>
                        <p className="reading-verdict">"{tarotResult.verdict}"</p>
                    </div>
                </div>
                {/* 히어로 하단 divider */}
                <div className="hero-divider"></div>

                {/* 질문 → Hook/Foreshadow 흐름 */}
                {introPhase >= 5 && (
                    <div className="question-answer-flow">
                        {/* 질문 인용 */}
                        {tarotResult.question && (
                            <div className="reading-quote">
                                <span className="quote-icon">💭</span>
                                <p>"{tarotResult.question}"</p>
                            </div>
                        )}
                        {/* 질문/답변 사이 divider */}
                        <div className="qa-divider">
                            <span className="qa-divider-star">✦</span>
                        </div>
                        {/* Hook & Foreshadow - 답변 요약 */}
                        <div className="result-intro-summary">
                            <p className="intro-hook-text">{hookText}</p>
                            <p className="intro-foreshadow-text">{foreshadowText}</p>
                        </div>
                    </div>
                )}

                {/* Persona Style 카드 바 */}
                <div
                    ref={cardBarRef}
                    className={`persona-card-bar ${introPhase >= 5 ? 'visible' : ''} ${allCardsFlipped ? 'all-revealed' : ''}`}
                >
                    {/* 배경 사선 패턴 */}
                    <div className="persona-bg-pattern"></div>

                    {/* 상단 텍스트 */}
                    <div className="persona-bar-header">
                        <span className="persona-bar-label">
                            {allCardsFlipped ? 'ALL CARDS REVEALED' : 'SELECT YOUR DESTINY'}
                        </span>
                    </div>

                    {/* 카드들 */}
                    <div className="persona-cards-row">
                        {tarotResult.cards?.slice(0, hasConclusion ? 4 : 3).map((card, i) => {
                            const isFlipped = flippedCards.includes(i);
                            const canFlip = i === 0 || flippedCards.includes(i - 1);
                            const isConclusion = hasConclusion && i === 3;

                            return (
                                <div
                                    key={card.id}
                                    className={`persona-card ${isFlipped ? 'revealed' : ''} ${canFlip && !isFlipped ? 'ready' : ''} ${isConclusion ? 'finale' : ''}`}
                                    onClick={() => handleCardFlip(i)}
                                    style={{ '--card-index': i }}
                                >
                                    {/* 카드 내부 */}
                                    <div className="persona-card-inner">
                                        {isFlipped ? (
                                            <>
                                                {cardImages[i] && (
                                                    <img src={cardImages[i]} alt={card.nameKo} className="persona-card-img" />
                                                )}
                                                <div className="persona-card-overlay">
                                                    <span className="persona-card-name">{card.nameKo}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="persona-card-back">
                                                {/* Pulse 링 - 텍스트 뒤에 */}
                                                {canFlip && (
                                                    <>
                                                        <div className="pulse-ring"></div>
                                                        <div className="pulse-ring"></div>
                                                    </>
                                                )}
                                                <span className="persona-card-symbol">{isConclusion ? '★' : '✦'}</span>
                                                {canFlip && <span className="persona-tap-hint">{isConclusion ? '결론 카드 오픈' : `카드 ${i + 1} 오픈`}</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* 카드 번호 */}
                                    <span className="persona-card-number">{isConclusion ? 'FINAL' : `0${i + 1}`}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 본문 - 카드별 해석 (카드가 하나라도 열렸을 때만 표시) */}
                {flippedCards.length > 0 && (
                <div className="reading-body">
                    {tarotResult.cards?.slice(0, hasConclusion ? 4 : 3).map((card, i) => {
                        const isFlipped = flippedCards.includes(i);
                        const isConclusion = hasConclusion && i === 3;

                        if (!isFlipped) return null;

                        return (
                            <section
                                key={card.id}
                                ref={el => sectionRefs.current[i] = el}
                                className={`card-chapter ${isConclusion ? 'chapter-finale' : ''} card-chapter-${i}`}
                            >
                                {/* 풀 와이드 히어로 이미지 */}
                                {cardImages[i] && (
                                    <div className="chapter-hero">
                                        <img src={cardImages[i]} alt={card.nameKo} className="chapter-hero-img" />
                                        <div className="chapter-hero-overlay">
                                            <span className="chapter-number">
                                                {isConclusion ? 'FINAL' : `0${i + 1}`}
                                            </span>
                                            <span className="chapter-badge">
                                                {isConclusion ? '✦ 운명의 결론' : `${CARD_LABELS[i]} 카드`}
                                            </span>
                                            <h3 className="chapter-card-name">{card.nameKo}</h3>
                                            <p className="chapter-card-en">{card.nameEn || card.name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* 카드별 구분 divider */}
                                <div className={`chapter-divider chapter-divider-${i}`}></div>

                                {/* 해석 본문 */}
                                <div className="chapter-content">
                                    <h2 className="chapter-title">
                                        <span className="title-accent">{isConclusion ? '★' : i + 1}</span>
                                        {isConclusion ? '운명이 전하는 메시지' : `${CARD_LABELS[i]} 카드가 말하는 것`}
                                    </h2>

                                    <div className="chapter-text">
                                        {analyses[i]?.split('\n').map((line, j) => (
                                            <p key={j}>{line}</p>
                                        ))}
                                    </div>

                                    {/* Jenny Transition - 다음 카드 힌트 */}
                                    {transitions[i] && (
                                        <div className="chapter-transition">
                                            <span className="transition-icon">→</span>
                                            <span>{transitions[i]}</span>
                                        </div>
                                    )}

                                    {/* Definitive Answer - 결론 카드 전용 */}
                                    {isConclusion && jenny.definitiveAnswer && (
                                        <div className="chapter-answer">
                                            <span className="answer-badge">✨ 최종 답변</span>
                                            <p className="answer-text">{jenny.definitiveAnswer}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}

                    {/* 종합 메시지 */}
                    {allCardsFlipped && storyReading.synthesis && (
                        <div className="synthesis-section fade-in-up">
                            <h2 className="reading-section-title">
                                <span className="section-icon">🔮</span>
                                {hasConclusion ? '네' : '세'} 장의 카드가 전하는 메시지
                            </h2>
                            <div className="synthesis-text reading-text">
                                {storyReading.synthesis.split('\n').map((line, i) => (
                                    <p key={i} className="reading-paragraph">{line}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hidden Insight - 봉인된 메시지 (bonus 위치로 이동) */}
                    {allCardsFlipped && (
                        <div className="sealed-insight-section fade-in-up">
                            {!insightUnsealed ? (
                                <div className="sealed-message" onClick={() => setInsightUnsealed(true)}>
                                    <div className="seal-visual">
                                        <span className="seal-icon">🌌</span>
                                        <div className="seal-glow"></div>
                                    </div>
                                    <div className="seal-text">차원의 틈</div>
                                    <div className="seal-hint">잠깐, 뭔가 더 있어요!!!</div>
                                    <button className="unseal-btn">✦ 틈새 엿보기</button>
                                </div>
                            ) : (
                                <div className="unsealed-insight">
                                    <h2 className="insight-header">
                                        <span className="section-icon">🌌</span>
                                        평행우주가 보낸 신호
                                    </h2>
                                    <div className="insight-content">
                                        <p className="insight-text reading-text">{hiddenInsight}</p>
                                        {jenny.hiddenInsightDetail && (
                                            <p className="insight-detail">{jenny.hiddenInsightDetail}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 조언 카드들 */}
                    {allCardsFlipped && (
                        <div className="advice-grid fade-in-up">
                            {storyReading.actionAdvice && (
                                <div className="advice-card">
                                    <span className="advice-icon">💡</span>
                                    <span className="advice-label">지금 할 수 있는 것</span>
                                    <p>{storyReading.actionAdvice}</p>
                                </div>
                            )}
                            {storyReading.warning && (
                                <div className="advice-card warning">
                                    <span className="advice-icon">⚠️</span>
                                    <span className="advice-label">주의할 점</span>
                                    <p>{storyReading.warning}</p>
                                </div>
                            )}
                            {storyReading.timing && (
                                <div className="advice-card timing">
                                    <span className="advice-icon">⏰</span>
                                    <span className="advice-label">행운의 타이밍</span>
                                    <p>{storyReading.timing}</p>
                                </div>
                            )}
                            {/* 공유 프리뷰 - 4번째 카드 */}
                            <div className="advice-card share-preview-card">
                                <span className="advice-icon">🔮</span>
                                <span className="advice-label">{tarotResult.title}</span>
                                <p className="share-preview-verdict">"{tarotResult.verdict}"</p>
                                <div className="share-preview-cards">
                                    {tarotResult.cards?.slice(0, 3).map((c, i) => (
                                        <span key={i}>{c.emoji}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 키워드 */}
                    {allCardsFlipped && tarotResult.keywords?.length > 0 && (
                        <div className="reading-keywords fade-in-up">
                            <span className="keywords-label">관련 상징</span>
                            <div className="keywords-tags">
                                {tarotResult.keywords.map((kw, i) => (
                                    <span key={i} className="keyword-tag">#{kw.word}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                )}

            </div>
        </div>
    );
};

export default TarotResultView;
