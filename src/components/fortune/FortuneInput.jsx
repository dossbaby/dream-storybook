// 사주 단계별 이모지와 색상
const FORTUNE_PHASE_CONFIG = [
    { emoji: '☯️', color: '#1abc9c' },  // 1: 시작
    { emoji: '🌳', color: '#16a085' },  // 2: 목(木)
    { emoji: '🔥', color: '#e74c3c' },  // 3: 화(火)
    { emoji: '🌍', color: '#f39c12' },  // 4: 토(土)
    { emoji: '⚔️', color: '#bdc3c7' },  // 5: 금(金)
    { emoji: '💧', color: '#3498db' },  // 6: 수(水)
    { emoji: '🔮', color: '#9b59b6' },  // 7: 사주 분석
    { emoji: '✨', color: '#f1c40f' },  // 8: 완료
];

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
    const currentPhase = FORTUNE_PHASE_CONFIG[Math.min(analysisPhase, FORTUNE_PHASE_CONFIG.length) - 1] || FORTUNE_PHASE_CONFIG[0];

    return (
        <div className="create-card fortune-theme">
            <h2 className="create-title fortune-title">오늘의 사주를 확인하세요</h2>

            {!loading && (
                <>
                    <div className="fortune-type-selector">
                        <button
                            className={`fortune-type-btn ${fortuneType === 'today' ? 'active' : ''}`}
                            onClick={() => setFortuneType('today')}
                        >
                            ☯️ 오늘 사주
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
                        <label>생년월일 (필수)</label>
                        <input
                            type="date"
                            value={fortuneBirthdate}
                            onChange={(e) => setFortuneBirthdate(e.target.value)}
                            className="birthdate-input"
                        />
                    </div>

                    {error && <div className="error">{error}</div>}
                </>
            )}

            {loading && (
                <div className="analysis-animation">
                    <div
                        className="analysis-circle fortune-circle"
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
                disabled={loading}
                className="submit-btn fortune-submit"
            >
                {loading ? '사주 분석 중...' : '🔮 사주 확인하기'}
            </button>
        </div>
    );
};

export default FortuneInput;
