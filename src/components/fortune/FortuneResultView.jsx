const FortuneResultView = ({
    fortuneResult,
    onBack,
    onRestart,
    onRevealSecret
}) => {
    return (
        <>
            <div className="card-container fortune-result-container">
                <div className="fortune-result-card">
                    <div className="fortune-result-header">
                        {fortuneResult.image && (
                            <img src={fortuneResult.image} alt="운세" className="fortune-header-image" />
                        )}
                        <span className="fortune-result-emoji">{fortuneResult.emoji || fortuneResult.typeEmoji}</span>
                        <h2 className="fortune-result-title">{fortuneResult.title}</h2>
                        <p className="fortune-result-type">{fortuneResult.typeName}</p>
                        <p className="fortune-result-verdict">{fortuneResult.verdict}</p>

                        {/* 운세 점수 게이지 */}
                        <div className="fortune-score-container">
                            <div className="fortune-score-bar">
                                <div
                                    className="fortune-score-fill"
                                    style={{ width: `${fortuneResult.overallScore}%` }}
                                ></div>
                            </div>
                            <span className="fortune-score-text">{fortuneResult.overallScore}점</span>
                        </div>

                        {fortuneResult.affirmation && (
                            <p className="fortune-affirmation">"{fortuneResult.affirmation}"</p>
                        )}
                    </div>

                    {/* 요약 운세 (운명의 비밀 열기 전) */}
                    {!fortuneResult.showFullReading && (
                        <div className="fortune-short-reading">
                            <p>{fortuneResult.shortReading}</p>
                            <button
                                className="reveal-secret-btn pulse-glow fortune-reveal"
                                onClick={onRevealSecret}
                            >
                                ✨ 운명의 비밀 열어보기 ✨
                            </button>
                        </div>
                    )}

                    {/* 상세 운세 (운명의 비밀 열기 후) */}
                    {fortuneResult.showFullReading && (
                        <>
                            {/* 시간대별 운세 */}
                            <div className="fortune-timeline">
                                <div className="timeline-item">
                                    <span className="timeline-icon">🌅</span>
                                    <span className="timeline-label">아침 (06-12시)</span>
                                    <p>{fortuneResult.morningFortune}</p>
                                </div>
                                <div className="timeline-item">
                                    <span className="timeline-icon">☀️</span>
                                    <span className="timeline-label">오후 (12-18시)</span>
                                    <p>{fortuneResult.afternoonFortune}</p>
                                </div>
                                <div className="timeline-item">
                                    <span className="timeline-icon">🌙</span>
                                    <span className="timeline-label">저녁 (18-24시)</span>
                                    <p>{fortuneResult.eveningFortune}</p>
                                </div>
                            </div>

                            {/* 상세 분석 */}
                            <div className="fortune-detailed">
                                <h3>🔮 상세 운세</h3>
                                <p>{fortuneResult.detailedReading}</p>
                            </div>

                            {/* DO / DON'T 리스트 */}
                            <div className="fortune-do-dont">
                                <div className="do-list">
                                    <h4>✅ 오늘 하면 좋은 것</h4>
                                    <ul>
                                        {fortuneResult.doList?.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="dont-list">
                                    <h4>❌ 오늘 피해야 할 것</h4>
                                    <ul>
                                        {fortuneResult.dontList?.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* 궁합 */}
                            {fortuneResult.compatibility && (
                                <div className="fortune-compatibility">
                                    <h4>💕 오늘의 궁합</h4>
                                    <p>{fortuneResult.compatibility}</p>
                                </div>
                            )}

                            {/* 행운의 요소 */}
                            {fortuneResult.luckyElements && (
                                <div className="lucky-elements fortune-lucky">
                                    <h4>🍀 행운의 요소</h4>
                                    <div className="lucky-grid extended">
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🎨</span>
                                            <span>{fortuneResult.luckyElements.color}</span>
                                        </div>
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🔢</span>
                                            <span>{fortuneResult.luckyElements.number}</span>
                                        </div>
                                        <div className="lucky-item">
                                            <span className="lucky-icon">🧭</span>
                                            <span>{fortuneResult.luckyElements.direction}</span>
                                        </div>
                                        <div className="lucky-item">
                                            <span className="lucky-icon">⏰</span>
                                            <span>{fortuneResult.luckyElements.time}</span>
                                        </div>
                                        {fortuneResult.luckyElements.item && (
                                            <div className="lucky-item">
                                                <span className="lucky-icon">🎁</span>
                                                <span>{fortuneResult.luckyElements.item}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <button className="restart-btn fortune-restart" onClick={onRestart}>
                        다른 운세 보기
                    </button>
                </div>
            </div>
        </>
    );
};

export default FortuneResultView;
