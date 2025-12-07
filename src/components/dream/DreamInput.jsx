import CustomQuestionSelector from '../common/CustomQuestionSelector';

// 단계별 이모지와 색상
const PHASE_CONFIG = [
    { emoji: '🌙', color: '#9b59b6' },  // 1: 접신 중
    { emoji: '🔮', color: '#8e44ad' },  // 2: 영혼 연결
    { emoji: '👁️', color: '#3498db' },  // 3: 통찰
    { emoji: '📖', color: '#2980b9' },  // 4: 해석
    { emoji: '🎨', color: '#e74c3c' },  // 5: 이미지 생성
    { emoji: '✨', color: '#f39c12' },  // 6: 마무리
    { emoji: '🌟', color: '#f1c40f' },  // 7: 완성
    { emoji: '💫', color: '#e056fd' },  // 8: 완료
];

const DreamInput = ({
    dreamDescription,
    setDreamDescription,
    detectedKeywords,
    showKeywordHints,
    setShowKeywordHints,
    keywordHints,
    dreamSymbols,
    loading,
    analysisPhase,
    progress,
    error,
    onBack,
    onGenerate,
    onAddKeywordHint,
    onFilterBySymbol,
    // 맞춤 질문 관련 props
    tier = 'free',
    selectedQuestion,
    customQuestion,
    onSelectPreset,
    onCustomQuestionChange,
    onOpenPremium
}) => {
    const currentPhase = PHASE_CONFIG[Math.min(analysisPhase, PHASE_CONFIG.length) - 1] || PHASE_CONFIG[0];

    return (
        <div className="create-card dream-theme">
            <h2 className="create-title">꿈을 말해봐</h2>

            {!loading && (
                <>
                    <div className="dream-input-wrapper">
                        <textarea
                            value={dreamDescription}
                            onChange={(e) => setDreamDescription(e.target.value)}
                            placeholder="어젯밤 꿈을 자세히 적어봐..."
                            className="dream-input"
                            disabled={loading}
                            onFocus={() => setShowKeywordHints(true)}
                            inputMode="text"
                            enterKeyHint="done"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                        <div className="input-footer">
                            <span className={`char-count ${dreamDescription.length < 10 ? 'warning' : dreamDescription.length > 50 ? 'good' : ''}`}>
                                {dreamDescription.length}자
                                {dreamDescription.length < 10 && <span className="char-hint"> (10자 이상 권장)</span>}
                                {dreamDescription.length >= 50 && <span className="char-hint"> ✨ 상세하게 적었네요!</span>}
                            </span>
                        </div>
                    </div>
                    {showKeywordHints && dreamDescription.length < 10 && (
                        <div className="keyword-hints">
                            <span className="hints-label">꿈에 이런 게 나왔어?</span>
                            <div className="hints-list">
                                {keywordHints.map((kw, i) => (
                                    <button key={i} className="hint-tag" onClick={() => onAddKeywordHint(kw)}>
                                        {dreamSymbols[kw]?.emoji} {kw}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {detectedKeywords.length > 0 && (
                        <div className="keywords-detected">
                            <span className="keywords-label">
                                ✨ 감지된 상징 <span className="keywords-sublabel">(클릭해서 관련 꿈 보기)</span>
                            </span>
                            <div className="keywords-list">
                                {detectedKeywords.map((k, i) => (
                                    <div
                                        key={i}
                                        className="keyword-tag-wrap clickable"
                                        onClick={() => onFilterBySymbol(k.keyword)}
                                    >
                                        <span className="keyword-tag">{k.emoji} {k.keyword}</span>
                                        <span className="keyword-hint">{k.hint}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* 맞춤 질문 선택 */}
                    {dreamDescription.trim().length >= 10 && (
                        <CustomQuestionSelector
                            type="dream"
                            tier={tier}
                            selectedQuestion={selectedQuestion}
                            customQuestion={customQuestion}
                            onSelectPreset={onSelectPreset}
                            onCustomChange={onCustomQuestionChange}
                            onOpenPremium={onOpenPremium}
                            disabled={loading}
                        />
                    )}

                    {error && <div className="error">{error}</div>}
                </>
            )}

            {/* 원형 분석 애니메이션 */}
            {loading && (
                <div className="analysis-animation">
                    <div
                        className="analysis-circle dream-circle"
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

            <button
                onClick={onGenerate}
                disabled={loading || !dreamDescription.trim()}
                className="submit-btn"
            >
                {loading ? '해독 중...' : '꿈 해독하기'}
            </button>
        </div>
    );
};

export default DreamInput;
