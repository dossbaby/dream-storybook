/**
 * 분석 단계 애니메이션 실행
 * @param {string[]} messages - 표시할 메시지 배열
 * @param {Function} setAnalysisPhase - 분석 단계 setter
 * @param {Function} setProgress - 진행 메시지 setter
 * @param {Function} setToast - 토스트 setter (optional)
 * @param {Function} _setDopaminePopup - 미사용 (하위 호환용)
 * @param {number} delay - 각 메시지 간 딜레이 (ms)
 */
export const runAnalysisAnimation = async (
    messages,
    setAnalysisPhase,
    setProgress,
    setToast,
    _setDopaminePopup,
    delay = 2000
) => {
    for (let i = 0; i < messages.length; i++) {
        setAnalysisPhase(i + 1);
        setProgress(messages[i]);

        if (setToast) {
            setToast('live', { type: 'sorting', message: messages[i] });
        }

        await new Promise(r => setTimeout(r, delay));
    }

    if (setToast) {
        setToast('live', null);
    }
};

/**
 * API 키 검증
 * @returns {{ claudeApiKey: string, geminiApiKey: string } | null}
 */
export const getApiKeys = () => {
    const claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!claudeApiKey || !geminiApiKey) {
        return null;
    }

    return { claudeApiKey, geminiApiKey };
};

/**
 * 꿈 분석 메시지 생성
 * @param {string} dreamDescription - 꿈 내용
 */
export const getDreamMessages = (dreamDescription) => [
    `흠... "${dreamDescription.slice(0, 15)}${dreamDescription.length > 15 ? '...' : ''}" 이라고?`,
    '오호... 흥미로운 무의식의 파편이 보이는군...',
    '네 영혼 깊숙한 곳에서 무언가가 속삭이고 있어...',
    '잠깐, 이건... 아주 특별한 징조일지도 몰라...',
    '자, 이제 네 진짜 모습을 보여줄게...',
];

/**
 * 타로 분석 메시지 생성
 * @param {string} question - 타로 질문
 */
export const getTarotMessages = (question) => [
    `흠... "${question.slice(0, 15)}${question.length > 15 ? '...' : ''}" 이라고?`,
    '첫 번째 카드가 속삭이고 있어...',
    '두 번째 카드에서 진실이 드러나...',
    '세 번째 카드... 운명의 길이 펼쳐지고 있어...',
    '자, 이제 카드의 비밀을 보여줄게...',
];

/**
 * 운세 분석 메시지 생성
 * @param {Object} fortuneInfo - 운세 타입 정보 { name, emoji }
 */
export const getFortuneMessages = (fortuneInfo) => [
    `오늘은 ${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}...`,
    `${fortuneInfo.emoji} ${fortuneInfo.name}을 살펴보고 있어...`,
    '운명의 실타래가 풀리고 있어...',
    '우주가 당신에게 메시지를 보내고 있어...',
    '자, 오늘의 운세를 알려줄게...',
];
