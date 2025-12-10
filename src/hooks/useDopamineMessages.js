import { useState, useCallback, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { AI_MODELS } from '../utils/aiConfig';

/**
 * 도파민 메시지 훅 - Haiku로 질문 기반 메시지 선생성
 *
 * 새로운 Phase 기반 타이밍 시스템:
 * - Phase 1 (0-15초): Hook 메시지 3개 빠르게 (5초 간격)
 * - Phase 2 (15초~API완료): 중간 메시지들 천천히 순환 (8초 간격), 마지막 도달 시 반복
 * - Phase 3 (API 완료): isComplete = true → 완료 메시지 표시
 */
export const useDopamineMessages = () => {
    const [messages, setMessages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [emotionPhrase, setEmotionPhrase] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [phase, setPhase] = useState(1); // 1: Hook, 2: 순환, 3: 완료

    const intervalRef = useRef(null);
    const phaseTimeoutRef = useRef(null);
    const messagesRef = useRef([]);

    /**
     * Haiku API로 질문 기반 도파민 메시지 생성
     */
    const generateDopamineMessages = useCallback(async (question, readingType, claudeApiKey) => {
        if (!claudeApiKey || !question) {
            console.warn('도파민 메시지 생성 실패: API 키 또는 질문 없음');
            return null;
        }

        try {
            const anthropic = new Anthropic({
                apiKey: claudeApiKey,
                dangerouslyAllowBrowser: true
            });

            const typeContext = {
                dream: '꿈 해몽',
                tarot: '타로 리딩',
                fortune: '사주 풀이'
            };

            const prompt = `사용자 질문: "${question}"
리딩 종류: ${typeContext[readingType] || '운세 리딩'}

## 현재 상황
사용자가 타로 카드 3장을 선택 완료, AI가 해석 중.

## 핵심 미션
사용자 질문에서 키워드를 추출해서 메시지에 자연스럽게 녹여!
"이 AI가 진짜 내 질문을 분석하고 있구나!" 느낌을 줘야 해.

## 예시: "그 사람이 나를 좋아할까?"
✓ "음... '좋아한다'는 게 어떤 의미인지 카드에서 찾고 있어요..."
✓ "그 사람의 마음속... 뭔가 복잡한 게 있네요..."
✓ "'나를'이라는 단어에 담긴 감정이 느껴져요..."
✓ "상대방의 진심을 카드가 읽으려 하고 있어요..."
✓ "좋아하는 마음... 카드가 뭔가를 말하려 해요..."

## 예시: "이직해도 될까?"
✓ "새로운 시작... 카드에서 신호가 오고 있어요..."
✓ "'이직'이라는 단어 뒤에 숨은 감정을 읽고 있어요..."
✓ "지금 직장에서 느끼는 감정... 카드가 알고 있네요..."
✓ "변화를 원하는 마음, 카드가 감지했어요..."

## 절대 금지 ❌
- 일반적인 "카드를 보고 있어요", "흥미롭네요" (로봇 같음!)
- 결론/스포일러: "좋아요", "안 좋아요", "만나요", "헤어져요"
- "답이 보여요", "알겠어요" 같은 결론 암시
- "스프레드 펼치는 중" (이미 끝남)

## 메시지 스타일
- 질문의 핵심 키워드를 메시지에 포함
- 감정적 공감 ("음...", "어...", "잠깐...")
- 신비로운 분위기 유지
- 구어체, 자연스러운 말투

## 메시지 구성 (25개)
1-5: 시작 (질문 읽기, 감정 공감, 분석 시작)
6-12: 탐색 (카드/별 살펴보기, 흥미로운 발견 암시)
13-18: 심화 (더 깊이 분석, 연결고리 찾기)
19-22: 정리 (전체 그림 맞추기)
23-25: 마무리 (곧 완료 예고)

## keywords
질문에서 추출한 핵심 키워드 3-5개.

JSON만 반환 (messages는 25개):
{
  "emotionPhrase": "질문자의 감정 상태 한 문장",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "messages": [
    "시작 1", "시작 2", "시작 3", "시작 4", "시작 5",
    "탐색 6", "탐색 7", "탐색 8", "탐색 9", "탐색 10", "탐색 11", "탐색 12",
    "심화 13", "심화 14", "심화 15", "심화 16", "심화 17", "심화 18",
    "정리 19", "정리 20", "정리 21", "정리 22",
    "마무리 23", "마무리 24", "마무리 25"
  ]
}`;

            console.log(`🚀 Generating dopamine messages with Haiku: ${AI_MODELS.dopamine}`);

            const response = await anthropic.messages.create({
                model: AI_MODELS.dopamine,
                max_tokens: 1000,
                messages: [{ role: "user", content: prompt }]
            });

            const responseText = response.content[0].text;
            let cleanText = responseText
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            // JSON 파싱 시도 - 실패 시 기본 메시지 반환
            try {
                const result = JSON.parse(cleanText);
                console.log('✅ Dopamine messages generated:', result.messages?.length);
                return result;
            } catch (parseError) {
                console.warn('JSON 파싱 실패, 기본 메시지 사용:', parseError.message);
                // 기본 도파민 메시지 반환
                return {
                    emotionPhrase: '당신의 질문을 읽고 있어요...',
                    keywords: [],
                    messages: [
                        '질문을 받았어요... 흥미로운 느낌이 들어요',
                        '음... 뭔가 보이기 시작하는데요',
                        '카드가 반응하고 있어요',
                        '당신의 마음이 느껴져요',
                        '잠시만요, 뭔가 특별한 게 있어요',
                        '카드가 천천히 열리고 있어요...',
                        '숨겨진 메시지가 보이기 시작해요',
                        '이건... 예상 밖이에요',
                        '흥미로운 패턴이 나타나고 있어요',
                        '당신의 상황이 점점 선명해져요',
                        '카드가 더 많은 걸 말해주고 있어요',
                        '잠깐, 여기 중요한 게 있어요',
                        '깊이 들어가볼게요...',
                        '이 부분은 주의 깊게 봐야 해요',
                        '연결고리가 보이기 시작해요',
                        '뭔가 의미 있는 게 나오고 있어요',
                        '흥미롭네요... 이건 좀 특별해요',
                        '패턴이 완성되어 가고 있어요',
                        '전체 그림이 맞춰지고 있어요',
                        '거의 다 봤어요...',
                        '마지막 조각을 맞추는 중이에요',
                        '중요한 메시지를 정리하고 있어요',
                        '곧 다 보여드릴게요',
                        '마무리하고 있어요...',
                        '결과가 거의 완성됐어요!'
                    ]
                };
            }
        } catch (err) {
            console.error('도파민 메시지 생성 실패:', err);
            return null;
        }
    }, []);

    /**
     * Phase 기반 도파민 메시지 큐 시작
     * - Phase 1: 시작 메시지 (0-4) 빠르게
     * - Phase 2: 탐색/심화/정리 메시지 (5-21) 천천히 순환
     * - API 완료 시: stopQueue 호출로 종료
     */
    const startQueue = useCallback((messageList, emotion, _, keywordList = []) => {
        if (!messageList || messageList.length === 0) {
            console.warn('도파민 큐 시작 실패: 메시지 없음');
            return;
        }

        // 이전 타이머들 정리
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);

        setMessages(messageList);
        messagesRef.current = messageList;
        setEmotionPhrase(emotion || '');
        setKeywords(keywordList);
        setCurrentIndex(0);
        setIsActive(true);
        setIsComplete(false);
        setPhase(1);

        console.log(`▶️ Dopamine queue started: ${messageList.length} messages (Phase 1 - Start)`);

        // === Phase 1: 시작 메시지 (인덱스 0-4) 빠르게 4초 간격 ===
        let startIndex = 0;
        intervalRef.current = setInterval(() => {
            startIndex++;
            if (startIndex < 5 && startIndex < messagesRef.current.length) {
                setCurrentIndex(startIndex);
            } else {
                // Phase 1 완료 → Phase 2로 전환
                clearInterval(intervalRef.current);
                startPhase2();
            }
        }, 4000); // 4초 간격
    }, []);

    /**
     * Phase 2: 탐색/심화/정리 메시지 순환 (인덱스 5-21)
     * API 완료까지 순서대로 진행 후 마지막 구간에서 반복
     */
    const startPhase2 = useCallback(() => {
        setPhase(2);
        console.log('▶️ Phase 2 started - 탐색/심화/정리 순환');

        // 탐색/심화/정리 메시지 범위 (인덱스 5-21, 총 17개)
        const loopStart = 5;
        const loopEnd = Math.min(21, messagesRef.current.length - 4); // 마무리 3개 제외
        let loopIndex = loopStart;

        setCurrentIndex(loopStart);

        intervalRef.current = setInterval(() => {
            loopIndex++;
            if (loopIndex > loopEnd) {
                // 정리 구간(19-21)에서만 반복
                loopIndex = Math.max(18, loopStart);
            }
            setCurrentIndex(loopIndex);
        }, 6000); // 6초 간격
    }, []);

    /**
     * 도파민 큐 정지 및 완료 처리
     * API 완료 시 호출 → 완료 예고 메시지 표시
     */
    const stopQueue = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (phaseTimeoutRef.current) {
            clearTimeout(phaseTimeoutRef.current);
            phaseTimeoutRef.current = null;
        }

        setPhase(3);
        setIsActive(false);
        setIsComplete(true);

        // 마무리 메시지 중 하나 선택 (인덱스 22-24)
        const completionIndex = Math.min(23, messagesRef.current.length - 1);
        setCurrentIndex(completionIndex);

        console.log('⏹️ Dopamine queue stopped - Phase 3 (완료)');
    }, []);

    /**
     * 완전 리셋
     */
    const reset = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (phaseTimeoutRef.current) {
            clearTimeout(phaseTimeoutRef.current);
            phaseTimeoutRef.current = null;
        }
        setMessages([]);
        setCurrentIndex(0);
        setIsActive(false);
        setIsComplete(false);
        setEmotionPhrase('');
        setKeywords([]);
        setPhase(1);
        messagesRef.current = [];
    }, []);

    /**
     * 현재 메시지 가져오기
     */
    const getCurrentMessage = useCallback(() => {
        if (messages.length === 0) return null;
        return messages[Math.min(currentIndex, messages.length - 1)];
    }, [messages, currentIndex]);

    /**
     * 진행률 계산 (0-100)
     */
    const getProgress = useCallback(() => {
        if (messages.length === 0) return 0;
        return Math.round((currentIndex / (messages.length - 1)) * 100);
    }, [messages.length, currentIndex]);

    return {
        // 상태
        messages,
        currentIndex,
        isActive,
        isComplete,
        emotionPhrase,
        keywords,
        phase,

        // 계산된 값
        currentMessage: getCurrentMessage(),
        progress: getProgress(),
        totalMessages: messages.length,

        // 함수
        generateDopamineMessages,
        startQueue,
        stopQueue,
        reset
    };
};
