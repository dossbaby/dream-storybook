import LoadingOverlay from '../common/LoadingOverlay';

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
    onOpenSymbolShorts
}) => {
    return (
        <div className="create-card dream-theme">
            <h2 className="create-title">꿈을 말해봐</h2>
            <textarea
                value={dreamDescription}
                onChange={(e) => setDreamDescription(e.target.value)}
                placeholder="어젯밤 꿈을 자세히 적어봐..."
                className="dream-input"
                disabled={loading}
                onFocus={() => setShowKeywordHints(true)}
            />
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
                                onClick={() => onOpenSymbolShorts(k.keyword)}
                            >
                                <span className="keyword-tag">{k.emoji} {k.keyword}</span>
                                <span className="keyword-hint">{k.hint}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {error && <div className="error">{error}</div>}
            <LoadingOverlay
                isVisible={loading}
                phase={analysisPhase}
                progress={progress}
            />
            {!loading && progress && (
                <div className="progress">
                    <span className="progress-dot"></span>{progress}
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
