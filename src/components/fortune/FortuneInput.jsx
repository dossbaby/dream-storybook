const FortuneInput = ({
    fortuneType,
    setFortuneType,
    fortuneBirthdate,
    setFortuneBirthdate,
    loading,
    analysisPhase,
    progress,
    error,
    onBack,
    onGenerate
}) => {
    return (
        <div className="create-card fortune-theme">
            <h2 className="create-title fortune-title">오늘의 운세를 확인하세요</h2>

            <div className="fortune-type-selector">
                <button
                    className={`fortune-type-btn ${fortuneType === 'today' ? 'active' : ''}`}
                    onClick={() => setFortuneType('today')}
                >
                    🌅 오늘 운세
                </button>
                <button
                    className={`fortune-type-btn ${fortuneType === 'love' ? 'active' : ''}`}
                    onClick={() => setFortuneType('love')}
                >
                    💕 연애운
                </button>
                <button
                    className={`fortune-type-btn ${fortuneType === 'career' ? 'active' : ''}`}
                    onClick={() => setFortuneType('career')}
                >
                    💼 직장운
                </button>
                <button
                    className={`fortune-type-btn ${fortuneType === 'money' ? 'active' : ''}`}
                    onClick={() => setFortuneType('money')}
                >
                    💰 재물운
                </button>
            </div>

            <div className="fortune-birthdate">
                <label>생년월일 (선택)</label>
                <input
                    type="date"
                    value={fortuneBirthdate}
                    onChange={(e) => setFortuneBirthdate(e.target.value)}
                    className="birthdate-input"
                />
            </div>

            {error && <div className="error">{error}</div>}

            {loading && (
                <div className="analysis-animation">
                    <div className="analysis-circle fortune-circle">
                        <div className={`analysis-ring ${analysisPhase >= 1 ? 'active' : ''}`}></div>
                        <div className={`analysis-ring ring-2 ${analysisPhase >= 2 ? 'active' : ''}`}></div>
                        <div className={`analysis-ring ring-3 ${analysisPhase >= 3 ? 'active' : ''}`}></div>
                        <div className="analysis-core">🔮</div>
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
                disabled={loading}
                className="submit-btn fortune-submit"
            >
                {loading ? '운세 확인 중...' : '🔮 운세 확인하기'}
            </button>
        </div>
    );
};

export default FortuneInput;
