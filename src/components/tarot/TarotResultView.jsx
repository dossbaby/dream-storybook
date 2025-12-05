import { useState } from 'react';

// 아르카나 색상
const ARCANA_COLORS = {
    major: { bg: 'linear-gradient(145deg, rgba(255, 215, 0, 0.2), rgba(255, 180, 0, 0.1))', border: '#ffd700', glow: '0 0 30px rgba(255, 215, 0, 0.5)' },
    wands: { bg: 'linear-gradient(145deg, rgba(255, 87, 51, 0.2), rgba(255, 120, 80, 0.1))', border: '#ff5733', glow: '0 0 30px rgba(255, 87, 51, 0.5)' },
    cups: { bg: 'linear-gradient(145deg, rgba(52, 152, 219, 0.2), rgba(100, 180, 230, 0.1))', border: '#3498db', glow: '0 0 30px rgba(52, 152, 219, 0.5)' },
    swords: { bg: 'linear-gradient(145deg, rgba(149, 165, 166, 0.2), rgba(180, 190, 190, 0.1))', border: '#95a5a6', glow: '0 0 30px rgba(149, 165, 166, 0.5)' },
    pentacles: { bg: 'linear-gradient(145deg, rgba(39, 174, 96, 0.2), rgba(80, 200, 120, 0.1))', border: '#27ae60', glow: '0 0 30px rgba(39, 174, 96, 0.5)' },
};

const TarotResultView = ({
    tarotResult,
    onBack,
    onRestart,
    onRevealSecret
}) => {
    const [activeCardIndex, setActiveCardIndex] = useState(null);

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

    return (
        <div className="card-container tarot-result-container">
            <div className="tarot-result-card premium">
                {/* 헤더 */}
                <div className="tarot-result-header premium-header">
                    <div className="header-glow"></div>
                    <div className="result-badge">
                        <span className="badge-emoji">🔮</span>
                        <span className="badge-text">타로 리딩</span>
                    </div>
                    {/* 사용자 질문 표시 */}
                    {tarotResult.question && (
                        <div className="user-question-display">
                            <span className="question-label">💭 당신의 질문</span>
                            <p className="question-text">"{tarotResult.question}"</p>
                        </div>
                    )}
                    <h2 className="tarot-result-title premium-title">{tarotResult.title}</h2>
                    <p className="tarot-result-verdict premium-verdict">{tarotResult.verdict}</p>
                    {tarotResult.affirmation && (
                        <div className="tarot-affirmation premium-affirmation">
                            <span className="affirmation-icon">✨</span>
                            <span className="affirmation-text">"{tarotResult.affirmation}"</span>
                        </div>
                    )}
                </div>

                {/* 카드 디스플레이 (3~4장) */}
                <div className={`tarot-cards-display premium-cards ${hasConclusion ? 'four-cards' : 'three-cards'}`}>
                    {tarotResult.cards?.slice(0, 4).map((card, i) => {
                        const arcanaStyle = ARCANA_COLORS[card.arcana] || ARCANA_COLORS.major;
                        const isConclusion = hasConclusion && i === 3;
                        const isActive = activeCardIndex === i;

                        return (
                            <div
                                key={card.id}
                                className={`tarot-card-result premium-card ${isConclusion ? 'conclusion-card' : ''} ${isActive ? 'active' : ''}`}
                                style={{
                                    '--card-bg': arcanaStyle.bg,
                                    '--card-border': arcanaStyle.border,
                                    '--card-glow': arcanaStyle.glow,
                                }}
                                onClick={() => setActiveCardIndex(isActive ? null : i)}
                            >
                                {/* 카드 번호 */}
                                <div className={`card-number-badge ${isConclusion ? 'gift' : ''}`}>
                                    {isConclusion ? '🎁' : ['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}
                                </div>

                                {/* 카드 이미지 */}
                                <div className="card-image-frame">
                                    {cardImages[i] ? (
                                        <img src={cardImages[i]} alt={card.nameKo} className="card-image" />
                                    ) : (
                                        <div className="card-emoji-fallback">
                                            <span>{card.emoji}</span>
                                        </div>
                                    )}
                                    <div className="card-image-overlay"></div>
                                </div>
                                {/* 카드 이름 - 이미지 바깥 아래에 표시 */}
                                <div className="card-name-plate">
                                    <span className="card-name-ko">{card.nameKo}</span>
                                    <span className="card-name-en">{card.name}</span>
                                </div>

                                {isConclusion && (
                                    <div className="conclusion-label">운명의 선물</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 요약 리딩 */}
                {!tarotResult.showFullReading && (
                    <div className="tarot-short-reading premium-teaser">
                        <div className="teaser-content">
                            <p>{tarotResult.shortReading || storyReading.opening?.slice(0, 100) + '...'}</p>
                        </div>
                        <button
                            className="reveal-secret-btn premium-reveal-btn"
                            onClick={onRevealSecret}
                        >
                            <span className="reveal-icon">🔮</span>
                            <span className="reveal-text">운명의 비밀 열어보기</span>
                            <span className="reveal-sparkle">✨</span>
                        </button>
                    </div>
                )}

                {/* 상세 스토리 리딩 */}
                {tarotResult.showFullReading && (
                    <div className="tarot-story-reading">
                        {/* 도입부 */}
                        <div className="story-section opening">
                            <div className="section-header">
                                <span className="section-icon">🌟</span>
                                <span className="section-title">당신의 이야기</span>
                            </div>
                            <div className="story-text">{storyReading.opening}</div>
                        </div>

                        {/* 카드별 해석 */}
                        {tarotResult.cards?.slice(0, hasConclusion ? 4 : 3).map((card, i) => {
                            const analyses = [
                                storyReading.card1Analysis,
                                storyReading.card2Analysis,
                                storyReading.card3Analysis,
                                storyReading.conclusionCard
                            ];
                            const isConclusion = hasConclusion && i === 3;

                            return (
                                <div key={card.id} className={`story-section card-analysis ${isConclusion ? 'conclusion' : ''}`}>
                                    <div className="section-header">
                                        <span className="section-icon">{card.emoji}</span>
                                        <span className="section-title">
                                            {isConclusion ? '🎁 운명이 선물한 카드' : `${['첫', '두', '세'][i]} 번째 카드`}
                                        </span>
                                        <span className="card-name-inline">{card.nameKo}</span>
                                    </div>
                                    <div className="story-text">{analyses[i]}</div>
                                </div>
                            );
                        })}

                        {/* 종합 메시지 */}
                        <div className="story-section synthesis">
                            <div className="section-header">
                                <span className="section-icon">🔮</span>
                                <span className="section-title">{hasConclusion ? '네' : '세'} 장의 카드가 말하는 것</span>
                            </div>
                            <div className="story-text highlight">{storyReading.synthesis}</div>
                        </div>

                        {/* 행동 조언 그리드 */}
                        <div className="advice-grid">
                            <div className="advice-card action">
                                <div className="advice-header">
                                    <span className="advice-icon">💡</span>
                                    <span className="advice-title">지금 할 수 있는 것</span>
                                </div>
                                <div className="advice-text">{storyReading.actionAdvice}</div>
                            </div>

                            {storyReading.warning && (
                                <div className="advice-card warning">
                                    <div className="advice-header">
                                        <span className="advice-icon">⚠️</span>
                                        <span className="advice-title">주의할 점</span>
                                    </div>
                                    <div className="advice-text">{storyReading.warning}</div>
                                </div>
                            )}

                            {storyReading.timing && (
                                <div className="advice-card timing">
                                    <div className="advice-header">
                                        <span className="advice-icon">⏰</span>
                                        <span className="advice-title">행운의 타이밍</span>
                                    </div>
                                    <div className="advice-text">{storyReading.timing}</div>
                                </div>
                            )}
                        </div>

                        {/* 행운의 요소 */}
                        {tarotResult.luckyElements && (
                            <div className="lucky-elements premium-lucky">
                                <div className="lucky-header">
                                    <span>🍀</span>
                                    <span>행운의 요소</span>
                                </div>
                                <div className="lucky-grid">
                                    <div className="lucky-item">
                                        <span className="lucky-icon">🎨</span>
                                        <span className="lucky-label">색</span>
                                        <span className="lucky-value">{tarotResult.luckyElements.color}</span>
                                    </div>
                                    <div className="lucky-item">
                                        <span className="lucky-icon">🔢</span>
                                        <span className="lucky-label">숫자</span>
                                        <span className="lucky-value">{tarotResult.luckyElements.number}</span>
                                    </div>
                                    <div className="lucky-item">
                                        <span className="lucky-icon">📅</span>
                                        <span className="lucky-label">요일</span>
                                        <span className="lucky-value">{tarotResult.luckyElements.day}</span>
                                    </div>
                                    {tarotResult.luckyElements.direction && (
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🧭</span>
                                            <span className="lucky-label">방향</span>
                                            <span className="lucky-value">{tarotResult.luckyElements.direction}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 키워드 */}
                        {tarotResult.keywords?.length > 0 && (
                            <div className="keywords-section">
                                <div className="keywords-header">핵심 키워드</div>
                                <div className="keywords-list">
                                    {tarotResult.keywords.map((kw, i) => (
                                        <div key={i} className="keyword-chip">
                                            <span className="keyword-word">#{kw.word}</span>
                                            {kw.hidden && <span className="keyword-hidden">{kw.hidden}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button className="restart-btn premium-restart" onClick={onRestart}>
                    <span>🃏</span>
                    <span>다른 질문하기</span>
                </button>
            </div>
        </div>
    );
};

export default TarotResultView;
