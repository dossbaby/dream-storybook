import { DOPAMINE_HINTS } from './constants';

/**
 * 분석 단계 애니메이션 실행
 * @param {string[]} messages - 표시할 메시지 배열
 * @param {Function} setAnalysisPhase - 분석 단계 setter
 * @param {Function} setProgress - 진행 메시지 setter
 * @param {Function} setToast - 토스트 setter (optional)
 * @param {Function} setDopaminePopup - 도파민 팝업 setter
 * @param {number} delay - 각 메시지 간 딜레이 (ms)
 */
export const runAnalysisAnimation = async (
    messages,
    setAnalysisPhase,
    setProgress,
    setToast,
    setDopaminePopup,
    delay = 2000
) => {
    for (let i = 0; i < messages.length; i++) {
        setAnalysisPhase(i + 1);
        setProgress(messages[i]);

        if (setToast) {
            setToast('live', { type: 'sorting', message: messages[i] });
        }

        // 2번째, 4번째 메시지에서 도파민 팝업 표시
        if ((i === 1 || i === 3) && setDopaminePopup) {
            const randomHint = DOPAMINE_HINTS[Math.floor(Math.random() * DOPAMINE_HINTS.length)];
            setDopaminePopup(randomHint);
            setTimeout(() => setDopaminePopup(null), 1800);
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
 * @param {Object} past - 과거 카드
 * @param {Object} present - 현재 카드
 * @param {Object} future - 미래 카드
 */
export const getTarotMessages = (question, past, present, future) => [
    `흠... "${question.slice(0, 15)}${question.length > 15 ? '...' : ''}" 이라고?`,
    `${past.nameKo}... 과거가 속삭이고 있군...`,
    `${present.nameKo}... 현재의 진실이 보여...`,
    `${future.nameKo}... 운명의 길이 펼쳐지고 있어...`,
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
