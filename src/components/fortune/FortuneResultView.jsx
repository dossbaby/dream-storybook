import { useState, useEffect, useRef } from 'react';

// 폴백용 인사이트/트위스트 (AI 생성 실패 시)
const FALLBACK_INSIGHTS = [
    "오늘의 사주에서 특별한 기운이 감지됐어요",
    "이 사주풀이를 다시 저녁에 보면 새로운 의미가 보일 거예요",
    "오늘 당신에게 좋은 기운이 숨어있어요"
];

const FortuneResultView = ({
    fortuneResult,
    onBack,
    onRestart,
    whispers = [],
    onAddWhisper,
    viewerCount = 0,
    similarCount = 0
}) => {
    const [whisperText, setWhisperText] = useState('');
    // 섹션 공개 상태
    const [revealedSections, setRevealedSections] = useState([]);
    // 숨겨진 인사이트 봉인 해제 상태
    const [insightUnsealed, setInsightUnsealed] = useState(false);

    // 섹션 참조 (자동 스크롤용)
    const sectionRefs = useRef([]);
    const containerRef = useRef(null);

    // AI 생성 Jenny 전략 필드 사용 (없으면 폴백)
    const jenny = fortuneResult.jenny || {};
    const rarity = fortuneResult.rarity || {};
    const sajuInfo = fortuneResult.sajuInfo || {};

    // 숨겨진 인사이트 (AI 생성 우선)
    const hiddenInsight = jenny.hiddenInsight || FALLBACK_INSIGHTS[Math.floor(fortuneResult.overallScore || 0) % FALLBACK_INSIGHTS.length];

    // 희귀도 정보
    const rarityText = rarity.description || (rarity.percent ? `${rarity.outOf || 100}명 중 ${Math.round((rarity.percent / 100) * (rarity.outOf || 100))}명만 받는 사주` : '');

    // 섹션 정보 (유연한 카테고리 기반 - 연애운/재물운/건강운 등)
    const sectionsData = fortuneResult.sections || {};
    const sections = [
        {
            id: 'section1',
            icon: sectionsData.section1?.icon || '✨',
            label: sectionsData.section1?.category || '첫 번째 운',
            title: sectionsData.section1?.title || '',
            content: sectionsData.section1?.analysis,
            transition: jenny.section1Transition,
            image: fortuneResult.section1Image
        },
        {
            id: 'section2',
            icon: sectionsData.section2?.icon || '💫',
            label: sectionsData.section2?.category || '두 번째 운',
            title: sectionsData.section2?.title || '',
            content: sectionsData.section2?.analysis,
            transition: jenny.section2Transition,
            image: fortuneResult.section2Image
        },
        {
            id: 'section3',
            icon: sectionsData.section3?.icon || '🌟',
            label: sectionsData.section3?.category || '세 번째 운',
            title: sectionsData.section3?.title || '',
            content: sectionsData.section3?.analysis,
            transition: null,
            image: fortuneResult.section3Image
        }
    ];

    // 모든 섹션이 공개되었는지
    const allSectionsRevealed = revealedSections.length >= sections.length;

    // 섹션 클릭 핸들러 + 자동 스크롤
    const handleSectionClick = (index) => {
        // 이미 공개된 섹션이면 스크롤만
        if (revealedSections.includes(index)) {
            scrollToSection(index);
            return;
        }

        // 첫 번째 섹션이거나, 이전 섹션이 이미 공개되었으면 공개 가능
        if (index === 0 || revealedSections.includes(index - 1)) {
            setRevealedSections([...revealedSections, index]);
            setTimeout(() => scrollToSection(index), 300);
        }
    };

    // 섹션으로 스크롤
    const scrollToSection = (index) => {
        const section = sectionRefs.current[index];
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="fortune-result-overlay" ref={containerRef}>
            <div className="fortune-result-modal">
                {/* 대각선 패턴 배경 */}
                <div className="modal-pattern-bg"></div>

                {/* 닫기 버튼 */}
                <button className="modal-close-btn" onClick={onBack}>✕</button>

                {/* 히어로 섹션 (heroImage 우선, 없으면 morningImage 폴백) */}
                <div className="reading-hero fortune-hero">
                    {(fortuneResult.heroImage || fortuneResult.morningImage || fortuneResult.image) && (
                        <img src={fortuneResult.heroImage || fortuneResult.morningImage || fortuneResult.image} alt="" className="reading-hero-img" />
                    )}
                    <div className="reading-hero-overlay">
                        {/* 뱃지 */}
                        <span className="reading-type-badge fortune-badge">
                            🔮 오늘의 사주
                        </span>

                        {/* 희귀도 훅 */}
                        {rarityText && (
                            <div className="rarity-hook">
                                <span>✨</span> {rarityText}
                            </div>
                        )}

                        {/* 제목 */}
                        <h1 className="reading-title">{fortuneResult.title}</h1>

                        {/* 핵심 메시지 */}
                        <p className="reading-verdict">"{fortuneResult.verdict}"</p>

                        {/* 운세 점수 */}
                        <div className="fortune-score-display">
                            <div className="score-circle">
                                <span className="score-number">{fortuneResult.overallScore}</span>
                                <span className="score-unit">점</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky 카테고리 선택 바 */}
                <div className="sticky-card-bar fortune-time-bar">
                    <p className="card-bar-instruction">
                        {revealedSections.length === 0
                            ? "운세를 탭해서 사주풀이를 확인하세요"
                            : !allSectionsRevealed
                                ? "다음 운세를 탭하세요"
                                : "모든 사주 운세 공개됨"}
                    </p>
                    <div className="card-bar-cards time-bar-items">
                        {sections.map((section, i) => {
                            const isRevealed = revealedSections.includes(i);
                            const canReveal = i === 0 || revealedSections.includes(i - 1);

                            return (
                                <div
                                    key={section.id}
                                    className={`card-bar-item time-item ${isRevealed ? 'flipped' : ''} ${canReveal && !isRevealed ? 'can-flip' : ''}`}
                                    onClick={() => handleSectionClick(i)}
                                >
                                    {isRevealed ? (
                                        <>
                                            <span className="card-bar-emoji">{section.icon}</span>
                                            <span className="card-bar-name">{section.label}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="card-bar-icon">🔮</span>
                                            {canReveal && <span className="card-bar-tap">TAP</span>}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 확언 인용 */}
                {fortuneResult.affirmation && (
                    <div className="reading-quote fortune-affirmation-quote">
                        <span className="quote-icon">💫</span>
                        <p>"{fortuneResult.affirmation}"</p>
                    </div>
                )}

                {/* Jenny Foreshadow */}
                {jenny.foreshadow && (
                    <div className="jenny-foreshadow-box">
                        <span className="foreshadow-icon">🔮</span>
                        <p>{jenny.foreshadow}</p>
                    </div>
                )}

                {/* 본문 - 카테고리별 사주 운세 */}
                <div className="reading-body">
                    {/* 사주팔자 정보 (있을 경우) */}
                    {sajuInfo.yearPillar && revealedSections.length > 0 && (
                        <div className="saju-pillars-section">
                            <h3 className="saju-pillars-title">📜 사주팔자</h3>
                            <div className="saju-pillars-grid">
                                <div className="saju-pillar">
                                    <span className="pillar-label">년주</span>
                                    <span className="pillar-value">{sajuInfo.yearPillar}</span>
                                </div>
                                <div className="saju-pillar">
                                    <span className="pillar-label">월주</span>
                                    <span className="pillar-value">{sajuInfo.monthPillar}</span>
                                </div>
                                <div className="saju-pillar">
                                    <span className="pillar-label">일주</span>
                                    <span className="pillar-value">{sajuInfo.dayPillar}</span>
                                </div>
                                {sajuInfo.hourPillar && (
                                    <div className="saju-pillar">
                                        <span className="pillar-label">시주</span>
                                        <span className="pillar-value">{sajuInfo.hourPillar}</span>
                                    </div>
                                )}
                            </div>
                            {sajuInfo.mainElement && (
                                <div className="saju-element-info">
                                    <span>주요 오행: <strong>{sajuInfo.mainElement}</strong></span>
                                    {sajuInfo.yongsin && <span> | 용신: <strong>{sajuInfo.yongsin}</strong></span>}
                                </div>
                            )}
                            {sajuInfo.currentYearRelation && (
                                <p className="saju-year-relation">{sajuInfo.currentYearRelation}</p>
                            )}
                        </div>
                    )}

                    {sections.map((section, i) => {
                        const isRevealed = revealedSections.includes(i);

                        if (!isRevealed) return null;

                        return (
                            <div
                                key={section.id}
                                ref={el => sectionRefs.current[i] = el}
                                className="card-section fortune-time-section"
                            >
                                {/* 섹션 이미지 */}
                                {section.image && (
                                    <div className="section-image-container">
                                        <img src={section.image} alt={section.label} className="section-image" />
                                    </div>
                                )}

                                {/* 섹션 헤더 */}
                                <h2 className="reading-section-title">
                                    {section.icon} {section.label}
                                    {section.title && <span className="section-subtitle"> - {section.title}</span>}
                                </h2>

                                {/* 운세 내용 */}
                                <div className="section-analysis">
                                    {section.content?.split('\n').map((para, idx) => (
                                        <p key={idx} className="reading-paragraph">{para}</p>
                                    ))}
                                </div>

                                {/* Jenny Transition - 다음 카테고리로 유도 */}
                                {section.transition && (
                                    <div className="jenny-transition">
                                        <span>{section.transition}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* 종합 분석 - 모든 섹션 공개 후 */}
                    {allSectionsRevealed && (
                        <>
                            {/* 종합 사주 분석 */}
                            {fortuneResult.synthesisAnalysis && (
                                <div className="synthesis-section fortune-detail-section">
                                    <h2 className="reading-section-title">
                                        🔮 종합 사주 분석
                                    </h2>
                                    <div className="synthesis-text">
                                        {fortuneResult.synthesisAnalysis.split('\n').map((line, i) => (
                                            <p key={i} className="reading-paragraph">{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Jenny Twist - 반전 메시지 */}
                            {jenny.twist && (
                                <div className="jenny-twist-box fortune-twist">
                                    <span className="twist-emoji">{jenny.twist.emoji || '🔮'}</span>
                                    <h4 className="twist-title">{jenny.twist.title || '숨겨진 메시지'}</h4>
                                    <p className="twist-message">{jenny.twist.message}</p>
                                </div>
                            )}

                            {/* Jenny Bonus - 질문 이상의 가치 */}
                            {jenny.bonus && (
                                <div className="jenny-bonus-box">
                                    <span className="bonus-icon">🎁</span>
                                    <p className="bonus-text">{jenny.bonus}</p>
                                </div>
                            )}

                            {/* DO / DON'T 카드 */}
                            <div className="advice-grid fortune-advice-grid">
                                {fortuneResult.doList?.length > 0 && (
                                    <div className="advice-card do-card">
                                        <span className="advice-icon">✅</span>
                                        <span className="advice-label">오늘 하면 좋은 것</span>
                                        <ul className="do-dont-list">
                                            {fortuneResult.doList.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {fortuneResult.dontList?.length > 0 && (
                                    <div className="advice-card warning dont-card">
                                        <span className="advice-icon">❌</span>
                                        <span className="advice-label">오늘 피해야 할 것</span>
                                        <ul className="do-dont-list">
                                            {fortuneResult.dontList.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* 궁합 */}
                            {fortuneResult.compatibility && (
                                <div className="advice-card compatibility-card">
                                    <span className="advice-icon">💕</span>
                                    <span className="advice-label">오늘의 궁합</span>
                                    <p>{fortuneResult.compatibility}</p>
                                </div>
                            )}

                            {/* 행운의 요소 */}
                            {fortuneResult.luckyElements && (
                                <div className="lucky-elements-section">
                                    <h3 className="lucky-title">🍀 행운의 요소</h3>
                                    <div className="lucky-grid">
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🎨</span>
                                            <span className="lucky-label">색상</span>
                                            <span className="lucky-value">{fortuneResult.luckyElements.color}</span>
                                        </div>
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🔢</span>
                                            <span className="lucky-label">숫자</span>
                                            <span className="lucky-value">{fortuneResult.luckyElements.number}</span>
                                        </div>
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🧭</span>
                                            <span className="lucky-label">방향</span>
                                            <span className="lucky-value">{fortuneResult.luckyElements.direction}</span>
                                        </div>
                                        <div className="lucky-item">
                                            <span className="lucky-icon">⏰</span>
                                            <span className="lucky-label">시간</span>
                                            <span className="lucky-value">{fortuneResult.luckyElements.time}</span>
                                        </div>
                                        {fortuneResult.luckyElements.item && (
                                            <div className="lucky-item">
                                                <span className="lucky-icon">🎁</span>
                                                <span className="lucky-label">아이템</span>
                                                <span className="lucky-value">{fortuneResult.luckyElements.item}</span>
                                            </div>
                                        )}
                                        {fortuneResult.luckyElements.month && (
                                            <div className="lucky-item">
                                                <span className="lucky-icon">📅</span>
                                                <span className="lucky-label">행운의 달</span>
                                                <span className="lucky-value">{fortuneResult.luckyElements.month}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 키워드 */}
                            {fortuneResult.keywords?.length > 0 && (
                                <div className="reading-keywords">
                                    <span className="keywords-label">오늘의 키워드</span>
                                    <div className="keywords-tags">
                                        {fortuneResult.keywords.map((kw, i) => (
                                            <span key={i} className="keyword-tag">#{kw.word || kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Hidden Insight - 봉인된 메시지 */}
                            <div className="sealed-insight-section">
                                {!insightUnsealed ? (
                                    <div className="sealed-message" onClick={() => setInsightUnsealed(true)}>
                                        <div className="seal-visual">
                                            <span className="seal-icon">🔮</span>
                                            <div className="seal-glow"></div>
                                        </div>
                                        <div className="seal-text">봉인된 메시지</div>
                                        <div className="seal-hint">오늘 하루가 끝나기 전 확인하세요</div>
                                        <button className="unseal-btn">봉인 해제하기</button>
                                    </div>
                                ) : (
                                    <div className="unsealed-insight">
                                        <div className="insight-header">
                                            <span>👁️</span> 숨겨진 메시지
                                        </div>
                                        <p className="insight-text">{hiddenInsight}</p>
                                        {jenny.hiddenInsightDetail && (
                                            <p className="insight-detail">{jenny.hiddenInsightDetail}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 공유 섹션 */}
                            <div className="share-section">
                                <div className="share-preview fortune-share-preview">
                                    <span className="share-emoji">🔮</span>
                                    <p className="share-title">{fortuneResult.title}</p>
                                    <p className="share-score">{fortuneResult.overallScore}점</p>
                                    <p className="share-verdict">"{fortuneResult.verdict}"</p>
                                </div>
                                <button className="share-btn" onClick={() => {
                                    const rarityInfo = rarityText ? `\n${rarityText}\n` : '';
                                    const text = `🔮 오늘의 사주${rarityInfo}\n\n"${fortuneResult.title}"\n점수: ${fortuneResult.overallScore}점\n\n${fortuneResult.verdict}\n\n#오늘사주 #사주`;
                                    navigator.clipboard.writeText(text);
                                    alert('공유 텍스트가 복사되었어요!');
                                }}>
                                    📤 친구에게 공유하기
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* 하단 버튼들 */}
                <div className="modal-actions">
                    <button className="action-btn secondary" onClick={onBack}>
                        ← 뒤로가기
                    </button>
                    <button className="action-btn primary fortune-primary" onClick={onRestart}>
                        🔮 다른 사주 보기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FortuneResultView;
