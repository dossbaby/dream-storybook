const TarotResultView = ({
    tarotResult,
    onBack,
    onRestart,
    onRevealSecret
}) => {
    return (
        <>
            <div className="card-container tarot-result-container">
                <div className="tarot-result-card enhanced">
                    <div className="tarot-result-header">
                        <span className="tarot-result-emoji">🃏</span>
                        <h2 className="tarot-result-title">{tarotResult.title}</h2>
                        <p className="tarot-result-verdict">{tarotResult.verdict}</p>
                        {tarotResult.affirmation && (
                            <p className="tarot-affirmation">"{tarotResult.affirmation}"</p>
                        )}
                    </div>

                    {/* 3장 카드 디스플레이 with 이미지 */}
                    <div className="tarot-cards-display enhanced">
                        {tarotResult.cards?.map((card, i) => {
                            const cardImages = [tarotResult.pastImage, tarotResult.presentImage, tarotResult.futureImage];
                            return (
                                <div key={card.id} className="tarot-card-result">
                                    <span className="card-number">{['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}</span>
                                    <div className="card-visual">
                                        {cardImages[i] ? (
                                            <img src={cardImages[i]} alt={card.nameKo} className="tarot-card-image" />
                                        ) : (
                                            <div className="card-emoji-container">
                                                <span className="card-emoji-large">{card.emoji}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-name-container">
                                        <span className="card-name-en">{card.name}</span>
                                        <span className="card-name-ko">{card.nameKo}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 요약 리딩 (운명의 비밀 열기 전) */}
                    {!tarotResult.showFullReading && (
                        <div className="tarot-short-reading">
                            <p>{tarotResult.shortReading}</p>
                            <button
                                className="reveal-secret-btn pulse-glow"
                                onClick={onRevealSecret}
                            >
                                ✨ 운명의 비밀 열어보기 ✨
                            </button>
                        </div>
                    )}

                    {/* 상세 리딩 (운명의 비밀 열기 후) */}
                    {tarotResult.showFullReading && (
                        <>
                            {/* 통합 카드 해석 */}
                            <div className="tarot-unified-reading">
                                <h3>🔮 세 장의 카드가 말하는 것</h3>
                                <p>{tarotResult.cardMeaning?.detail || tarotResult.reading?.past}</p>
                            </div>

                            <div className="tarot-readings detailed">
                                <div className="tarot-reading-item">
                                    <span className="reading-label">💡 핵심 메시지</span>
                                    <p>{tarotResult.cardMeaning?.summary || tarotResult.reading?.present}</p>
                                </div>
                                <div className="tarot-reading-item">
                                    <span className="reading-label">🌟 앞으로의 흐름</span>
                                    <p>{tarotResult.cardMeaning?.advice || tarotResult.reading?.future}</p>
                                </div>
                                <div className="tarot-reading-item action">
                                    <span className="reading-label">⚡ 행동 지침</span>
                                    <p>{tarotResult.reading?.action}</p>
                                </div>
                            </div>

                            {tarotResult.cardConnections && (
                                <div className="tarot-connections">
                                    <h3>🔗 카드들의 연결</h3>
                                    <p>{tarotResult.cardConnections}</p>
                                </div>
                            )}

                            <div className="tarot-overall">
                                <h3>✨ 종합 해석</h3>
                                <p>{tarotResult.overallMeaning}</p>
                            </div>

                            <div className="tarot-advice-section">
                                <div className="advice-item">
                                    <span className="advice-icon">💡</span>
                                    <div>
                                        <span className="advice-label">구체적 행동 조언</span>
                                        <p>{tarotResult.specificAdvice}</p>
                                    </div>
                                </div>
                                <div className="advice-item warning">
                                    <span className="advice-icon">⚠️</span>
                                    <div>
                                        <span className="advice-label">주의할 점</span>
                                        <p>{tarotResult.warning}</p>
                                    </div>
                                </div>
                                {tarotResult.timing && (
                                    <div className="advice-item timing">
                                        <span className="advice-icon">⏰</span>
                                        <div>
                                            <span className="advice-label">행운의 타이밍</span>
                                            <p>{tarotResult.timing}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {tarotResult.luckyElements && (
                                <div className="lucky-elements enhanced">
                                    <h4>🍀 행운의 요소</h4>
                                    <div className="lucky-grid">
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🎨</span>
                                            <span>{tarotResult.luckyElements.color}</span>
                                        </div>
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🔢</span>
                                            <span>{tarotResult.luckyElements.number}</span>
                                        </div>
                                        <div className="lucky-item">
                                            <span className="lucky-icon">📅</span>
                                            <span>{tarotResult.luckyElements.day}</span>
                                        </div>
                                        {tarotResult.luckyElements.direction && (
                                            <div className="lucky-item">
                                                <span className="lucky-icon">🧭</span>
                                                <span>{tarotResult.luckyElements.direction}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <button className="restart-btn" onClick={onRestart}>
                        다른 질문 하기
                    </button>
                </div>
            </div>
        </>
    );
};

export default TarotResultView;
