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
    return (
        <div className="create-card tarot-theme">
            {tarotPhase === 'question' && (
                <>
                    <h2 className="create-title tarot-title">무엇이 궁금하세요?</h2>
                    <textarea
                        value={tarotQuestion}
                        onChange={(e) => setTarotQuestion(e.target.value)}
                        placeholder={`타로에게 물어보고 싶은 것을 자유롭게 적어주세요...

예시:
• 지금 사귀는 사람과의 미래가 궁금해요
• 이직을 해야 할지 고민이에요
• 올해 나에게 어떤 일이 일어날까요?
• 지금 내가 가고 있는 방향이 맞는 걸까요?`}
                        className="dream-input tarot-input"
                        disabled={loading}
                        rows={6}
                    />
                    {error && <div className="error">{error}</div>}
                    <button
                        onClick={onStartSelection}
                        disabled={loading || !tarotQuestion.trim()}
                        className="submit-btn tarot-submit"
                    >
                        {loading ? '준비 중...' : '🃏 카드 뽑으러 가기'}
                    </button>
                </>
            )}

            {tarotPhase === 'selecting' && (
                <>
                    <h2 className="create-title tarot-title">운명의 카드를 선택하세요</h2>
                    <p className="tarot-selection-subtitle">
                        {tarotSelectedCards.length === 0 && '직감을 믿고 3장의 카드를 뽑아주세요'}
                        {tarotSelectedCards.length === 1 && '좋아요... 두 장 더 선택해주세요'}
                        {tarotSelectedCards.length === 2 && '마지막 한 장을 선택해주세요'}
                        {tarotSelectedCards.length === 3 && '✨ 운명의 카드가 모두 모였습니다'}
                    </p>

                    {/* 선택된 카드 슬롯 */}
                    <div className={`tarot-slots ${tarotSelectedCards.length === 3 ? 'complete' : ''}`}>
                        <div className={`tarot-slot ${tarotSelectedCards[0] ? 'filled' : ''}`}>
                            <span className="slot-label">첫 번째</span>
                            <div className="slot-card">
                                {tarotSelectedCards[0] ? (
                                    <div className="slot-card-selected">
                                        <span className="slot-card-symbol">Ⅰ</span>
                                        <span className="slot-card-glow"></span>
                                    </div>
                                ) : (
                                    <div className="slot-card-empty">
                                        <span className="slot-card-question">?</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`tarot-slot ${tarotSelectedCards[1] ? 'filled' : ''}`}>
                            <span className="slot-label">두 번째</span>
                            <div className="slot-card">
                                {tarotSelectedCards[1] ? (
                                    <div className="slot-card-selected">
                                        <span className="slot-card-symbol">Ⅱ</span>
                                        <span className="slot-card-glow"></span>
                                    </div>
                                ) : (
                                    <div className="slot-card-empty">
                                        <span className="slot-card-question">?</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`tarot-slot ${tarotSelectedCards[2] ? 'filled' : ''}`}>
                            <span className="slot-label">세 번째</span>
                            <div className="slot-card">
                                {tarotSelectedCards[2] ? (
                                    <div className="slot-card-selected">
                                        <span className="slot-card-symbol">Ⅲ</span>
                                        <span className="slot-card-glow"></span>
                                    </div>
                                ) : (
                                    <div className="slot-card-empty">
                                        <span className="slot-card-question">?</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 타로 카드 스프레드 */}
                    <div className="tarot-spread">
                        {tarotDeck.map((card, index) => {
                            const isSelected = tarotSelectedCards.find(c => c.id === card.id);
                            const isDisabled = tarotSelectedCards.length >= 3 && !isSelected;
                            return (
                                <div
                                    key={card.id}
                                    className={`tarot-card-back ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                    style={{
                                        '--card-index': index,
                                        transform: `rotate(${(index - 10.5) * 3}deg) translateY(${Math.abs(index - 10.5) * 2}px)`
                                    }}
                                    onClick={() => !isDisabled && onToggleCard(card)}
                                >
                                    <div className="card-back-design">
                                        <div className="card-back-border"></div>
                                        <div className="card-back-inner">
                                            <div className="card-back-pattern">
                                                <span className="pattern-star">✦</span>
                                                <span className="pattern-moon">☽</span>
                                                <span className="pattern-star">✦</span>
                                            </div>
                                            <div className="card-back-center">
                                                <span className="card-back-eye">👁</span>
                                            </div>
                                            <div className="card-back-pattern">
                                                <span className="pattern-star">✦</span>
                                                <span className="pattern-sun">☀</span>
                                                <span className="pattern-star">✦</span>
                                            </div>
                                        </div>
                                        <div className="card-back-shimmer"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        className="submit-btn tarot-submit"
                        onClick={onGenerateReading}
                        disabled={tarotSelectedCards.length !== 3 || loading}
                    >
                        {loading ? '운명을 읽는 중...' : '✨ 카드 해석하기'}
                    </button>
                </>
            )}

            {(tarotPhase === 'revealing' || tarotPhase === 'reading') && loading && (
                <div className="analysis-animation">
                    <div className="analysis-circle tarot-circle">
                        <div className={`analysis-ring ${analysisPhase >= 1 ? 'active' : ''}`}></div>
                        <div className={`analysis-ring ring-2 ${analysisPhase >= 2 ? 'active' : ''}`}></div>
                        <div className={`analysis-ring ring-3 ${analysisPhase >= 3 ? 'active' : ''}`}></div>
                        <div className="analysis-core">🃏</div>
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
