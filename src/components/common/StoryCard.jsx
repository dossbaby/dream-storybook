const StoryCard = ({ card, index, dreamTypeInfo, onDetailedReading, isPremium = false, onOpenPremium }) => {
    return (
        <div className={`story-card ${card.type} glow-card`}>
            {/* 꿈 - 첫 번째 카드 */}
            {card.type === 'dream' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay" />
                    </div>
                    <div className="card-glow-effect">
                        <div className="glow-sparkles">
                            {[...Array(6)].map((_, idx) => <span key={idx} className="sparkle" style={{ '--i': idx }} />)}
                        </div>
                    </div>
                    <div className="card-content">
                        <span className="card-label">{card.label}</span>
                        {dreamTypeInfo && (
                            <div className="dream-type-badge">
                                <span className="badge-emoji">{dreamTypeInfo.emoji}</span>
                                <div className="badge-info">
                                    <span className="badge-name">{dreamTypeInfo.name}</span>
                                    <span className="badge-desc">{dreamTypeInfo.desc}</span>
                                </div>
                            </div>
                        )}
                        <h1 className="card-title">{card.title}</h1>
                        <p className="card-verdict">"{card.verdict}"</p>
                        <div className="rarity-badge">
                            <span className="rarity-label">이 꿈을 꾸는 사람</span>
                            <span className="rarity-value">{card.rarity}%</span>
                        </div>
                    </div>
                </>
            )}
            {/* 꿈 - 타로 카드 */}
            {card.type === 'tarot' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay" />
                    </div>
                    <div className="card-content">
                        <span className="card-label">{card.label}</span>
                        <div className="tarot-info">
                            <span className="tarot-name">{card.tarot?.name}</span>
                            <p className="tarot-meaning">{card.tarot?.meaning}</p>
                        </div>
                        <div className="keywords-list-card">
                            {card.keywords?.map((k, j) => (
                                <div key={j} className="keyword-item">
                                    <span className="kw-word">"{k.word}"</span>
                                    <span className="kw-hidden">{k.hidden}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            {/* 꿈 - 의미 카드 */}
            {card.type === 'meaning' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay" />
                    </div>
                    <div className="card-content meaning-content">
                        <span className="card-label">{card.label}</span>
                        <p className="meaning-summary">{card.dreamMeaning?.summary}</p>
                        <p className="meaning-detail">{card.dreamMeaning?.detail}</p>
                        <button
                            className={`inline-detailed-btn ${!isPremium ? 'locked' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isPremium) {
                                    onDetailedReading?.();
                                } else {
                                    onOpenPremium?.('detailed_analysis');
                                }
                            }}
                        >
                            {isPremium ? '✨ 운명의 비밀 열어보기' : '🔒 프리미엄으로 확인'}
                        </button>
                    </div>
                </>
            )}
            {/* 타로 - 과거 카드 */}
            {card.type === 'tarot-past' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay tarot-overlay" />
                    </div>
                    <div className="card-glow-effect">
                        <div className="glow-sparkles">
                            {[...Array(6)].map((_, idx) => <span key={idx} className="sparkle" style={{ '--i': idx }} />)}
                        </div>
                    </div>
                    <div className="card-content">
                        <span className="card-label">🃏 {card.label}</span>
                        {/* 사용자 질문 표시 */}
                        {card.question && (
                            <div className="user-question-badge">
                                <span className="question-icon">💭</span>
                                <span className="question-text">"{card.question}"</span>
                            </div>
                        )}
                        <div className="tarot-card-badge">
                            <span className="tarot-card-emoji">{card.card?.emoji}</span>
                            <span className="tarot-card-name">{card.card?.nameKo}</span>
                        </div>
                        <h1 className="card-title">{card.title}</h1>
                        <p className="card-verdict">"{card.verdict}"</p>
                        <div className="rarity-badge tarot-rarity">
                            <span className="rarity-label">이 조합의 희귀도</span>
                            <span className="rarity-value">{card.rarity}%</span>
                        </div>
                    </div>
                </>
            )}
            {/* 타로 - 현재 카드 */}
            {card.type === 'tarot-present' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay tarot-overlay" />
                    </div>
                    <div className="card-content">
                        <span className="card-label">🃏 {card.label}</span>
                        <div className="tarot-card-badge">
                            <span className="tarot-card-emoji">{card.card?.emoji}</span>
                            <span className="tarot-card-name">{card.card?.nameKo}</span>
                        </div>
                        <p className="card-reading">{card.reading}</p>
                        <div className="keywords-list-card">
                            {card.keywords?.map((k, j) => (
                                <div key={j} className="keyword-item">
                                    <span className="kw-word">"{k.word}"</span>
                                    <span className="kw-hidden">{k.hidden}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            {/* 타로 - 미래 카드 */}
            {card.type === 'tarot-future' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay tarot-overlay" />
                    </div>
                    <div className="card-content meaning-content">
                        <span className="card-label">🃏 {card.label}</span>
                        <div className="tarot-card-badge">
                            <span className="tarot-card-emoji">{card.card?.emoji}</span>
                            <span className="tarot-card-name">{card.card?.nameKo}</span>
                        </div>
                        <p className="meaning-summary">{card.cardMeaning?.summary}</p>
                        <p className="meaning-detail">{card.cardMeaning?.detail}</p>
                        {card.luckyElements && (
                            <div className="lucky-elements-mini">
                                <span>🎨 {card.luckyElements.color}</span>
                                <span>🔢 {card.luckyElements.number}</span>
                                <span>📅 {card.luckyElements.day}</span>
                            </div>
                        )}
                    </div>
                </>
            )}
            {/* 타로 - 결론 카드 (운명의 선물) */}
            {card.type === 'tarot-conclusion' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay tarot-overlay conclusion-overlay" />
                    </div>
                    <div className="card-glow-effect conclusion-glow">
                        <div className="glow-sparkles">
                            {[...Array(8)].map((_, idx) => <span key={idx} className="sparkle gold" style={{ '--i': idx }} />)}
                        </div>
                    </div>
                    <div className="card-content conclusion-content">
                        <span className="card-label conclusion-label">🎁 {card.label}</span>
                        <div className="tarot-card-badge conclusion-badge">
                            <span className="tarot-card-emoji">{card.card?.emoji}</span>
                            <span className="tarot-card-name">{card.card?.nameKo}</span>
                        </div>
                        <p className="conclusion-reading">{card.reading}</p>
                        <div className="conclusion-message">
                            <span className="conclusion-icon">✨</span>
                            <span className="conclusion-text">운명이 당신에게 보내는 선물</span>
                        </div>
                    </div>
                </>
            )}
            {/* 운세 - 아침 카드 */}
            {card.type === 'fortune-morning' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay fortune-overlay" />
                    </div>
                    <div className="card-glow-effect">
                        <div className="glow-sparkles">
                            {[...Array(6)].map((_, idx) => <span key={idx} className="sparkle" style={{ '--i': idx }} />)}
                        </div>
                    </div>
                    <div className="card-content">
                        <span className="card-label">🌅 {card.label}</span>
                        <h1 className="card-title">{card.title}</h1>
                        <p className="card-verdict">"{card.verdict}"</p>
                        <div className="fortune-score-badge">
                            <span className="score-label">오늘의 운세 점수</span>
                            <span className="score-value">{card.score}점</span>
                        </div>
                        <div className="rarity-badge fortune-rarity">
                            <span className="rarity-label">오늘 운의 희귀도</span>
                            <span className="rarity-value">{card.rarity}%</span>
                        </div>
                    </div>
                </>
            )}
            {/* 운세 - 오후 카드 */}
            {card.type === 'fortune-afternoon' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay fortune-overlay" />
                    </div>
                    <div className="card-content">
                        <span className="card-label">☀️ {card.label}</span>
                        <p className="card-reading">{card.reading}</p>
                        <div className="keywords-list-card">
                            {card.keywords?.map((k, j) => (
                                <div key={j} className="keyword-item">
                                    <span className="kw-word">"{k.word}"</span>
                                    <span className="kw-hidden">{k.hidden}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            {/* 운세 - 저녁 카드 */}
            {card.type === 'fortune-evening' && (
                <>
                    <div className="card-bg">
                        {card.image ? <img src={card.image} alt="" /> : <div className="card-bg-placeholder" />}
                        <div className="card-overlay fortune-overlay" />
                    </div>
                    <div className="card-content meaning-content">
                        <span className="card-label">🌙 {card.label}</span>
                        <p className="meaning-summary">{card.fortuneMeaning?.summary}</p>
                        <p className="meaning-detail">{card.fortuneMeaning?.detail}</p>
                        {card.luckyElements && (
                            <div className="lucky-elements-mini">
                                <span>🎨 {card.luckyElements.color}</span>
                                <span>🔢 {card.luckyElements.number}</span>
                                <span>🧭 {card.luckyElements.direction}</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StoryCard;
