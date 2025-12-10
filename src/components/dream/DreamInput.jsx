import { useMemo } from 'react';
import CustomQuestionSelector from '../common/CustomQuestionSelector';

// 랜덤 헤딩 (prompt 화면용)
const RANDOM_HEADINGS = [
    '어젯밤 무슨 꿈 꾸셨어요?',
    '어떤 꿈이었나요?',
    '꿈이 뭘 말하는지 궁금하세요?',
    '꿈속에서 무슨 일이 있었어요?',
    '어떤 장면이 떠올라요?'
];

// 플레이스홀더 예시들 (랜덤 로테이션)
const PLACEHOLDER_EXAMPLES = [
    "높은 건물에서 떨어지는 꿈을 꿨어요",
    "돌아가신 할머니가 나오셨는데 웃고 계셨어요",
    "이빨이 빠지는 꿈이었는데 피가 났어요",
    "하늘을 나는 꿈을 꿨어요, 너무 자유로웠어요",
    "물에 빠지는 꿈인데 숨을 쉴 수 있었어요",
    "뱀이 나와서 쫓아왔는데 도망치지 못했어요"
];

const DreamInput = ({
    dreamDescription,
    setDreamDescription,
    detectedKeywords,
    loading,
    analysisPhase,
    progress,
    error,
    onBack,
    onGenerate,
    onFilterBySymbol,
    // 맞춤 질문 관련 props
    tier = 'free',
    selectedQuestion,
    customQuestion,
    onSelectPreset,
    onCustomQuestionChange,
    onOpenPremium
}) => {
    // 랜덤 플레이스홀더 (컴포넌트 마운트 시 한 번만 선택)
    const randomPlaceholder = useMemo(() => {
        return PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)];
    }, []);

    // 랜덤 헤딩 (컴포넌트 마운트 시 한 번만 선택)
    const randomHeading = useMemo(() => {
        return RANDOM_HEADINGS[Math.floor(Math.random() * RANDOM_HEADINGS.length)];
    }, []);

    return (
        <div className="create-card dream-input-card dream-theme">
            {!loading && (
                <>
                    <div className="dream-question-header">
                        <div className="mystical-orb dream-orb">
                            <span className="orb-emoji">🌙</span>
                            <div className="orb-sparkles dream-sparkles">
                                <span>✦</span>
                                <span>✧</span>
                                <span>✦</span>
                            </div>
                        </div>
                        <h2 className="create-title dream-title">{randomHeading}</h2>
                        <p className="dream-subtitle">꿈을 구체적으로 적을수록 꿈 풀이가 더 정확해요</p>
                    </div>
                    <textarea
                        value={dreamDescription}
                        onChange={(e) => setDreamDescription(e.target.value)}
                        placeholder={randomPlaceholder}
                        className="dream-input dream-textarea"
                        disabled={loading}
                        inputMode="text"
                        enterKeyHint="done"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        rows={4}
                    />
                    {detectedKeywords.length > 0 && (
                        <div className="keywords-detected dream-keywords">
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
                    <button
                        onClick={onGenerate}
                        disabled={loading || !dreamDescription.trim()}
                        className="submit-btn dream-submit mystical-btn"
                    >
                        {loading ? '해독 중...' : '🌙 꿈 풀기'}
                    </button>
                </>
            )}
        </div>
    );
};

export default DreamInput;
