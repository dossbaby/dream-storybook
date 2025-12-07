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

## 너의 역할
${typeContext[readingType]} 분석 중 표시할 Hook/Foreshadow 스타일 메시지를 생성해.

## MrBeast 도파민 원칙
- Hook: 답 먼저 + 반전 ("만나요. 근데 그 사람이 아니에요")
- Foreshadow: 못 보면 잠 못 잠 ("누군지 힌트가 나와요...")
- 구체적 디테일: 이름, 시기, 상황을 암시

## 절대 금지
❌ "운이 보여요", "기운이 느껴져요", "에너지가 읽혀요" (일반적인 표현)
❌ 질문과 무관한 뻔한 메시지
❌ "잠시만요", "기다려주세요" 같은 단순 로딩 메시지

## 메시지 흐름 (12개)
1-3: Hook/Foreshadow (질문에 대한 첫인상, 반전 암시) - 처음 15초
4-9: 발견/심화 (숨겨진 것들, 구체적 힌트) - API 완료까지 순환
10-12: 완료 예고 (거의 다 됐어요, 결과 기대감) - 마지막

## 질문별 예시
"남친이 바람피는 것 같아요"
→ "답이 보여요. 근데 생각한 대로는 아니에요..."
→ "숨기고 있는 게 있어요. 확실히."
→ "그 사람 마음에 제3자가... 있긴 해요."

"이직해도 될까요"
→ "가도 돼요. 근데 지금은 아니에요."
→ "타이밍이 보이는데... 좀 놀라실 수도."
→ "3으로 시작하는 숫자가 계속 나와요."

## keywords
질문에서 추출한 핵심 키워드 3-5개.

JSON만 반환:
{
  "emotionPhrase": "질문자의 복합 감정 한 문장",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "messages": [
    "Hook 메시지 1",
    "Hook 메시지 2",
    "Foreshadow 메시지 3",
    "발견 메시지 4",
    "발견 메시지 5",
    "심화 메시지 6",
    "심화 메시지 7",
    "심화 메시지 8",
    "심화 메시지 9",
    "완료 예고 10",
    "완료 예고 11",
    "완료 예고 12"
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

            const result = JSON.parse(cleanText);
            console.log('✅ Dopamine messages generated:', result.messages?.length);

            return result;
        } catch (err) {
            console.error('도파민 메시지 생성 실패:', err);
            return null;
        }
    }, []);

    /**
     * Phase 기반 도파민 메시지 큐 시작
     * - Phase 1: Hook 메시지 (0-3) 빠르게
     * - Phase 2: 발견/심화 메시지 (3-9) 순환하며 천천히
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

        console.log(`▶️ Dopamine queue started: ${messageList.length} messages (Phase 1 - Hook)`);

        // === Phase 1: Hook 메시지 (인덱스 0-2) 빠르게 5초 간격 ===
        let hookIndex = 0;
        intervalRef.current = setInterval(() => {
            hookIndex++;
            if (hookIndex < 3 && hookIndex < messagesRef.current.length) {
                setCurrentIndex(hookIndex);
            } else {
                // Phase 1 완료 → Phase 2로 전환
                clearInterval(intervalRef.current);
                startPhase2();
            }
        }, 5000); // 5초 간격
    }, []);

    /**
     * Phase 2: 발견/심화 메시지 순환 (인덱스 3-8)
     * API 완료까지 무한 순환
     */
    const startPhase2 = useCallback(() => {
        setPhase(2);
        console.log('▶️ Phase 2 started - 발견/심화 순환');

        // 발견/심화 메시지 범위 (인덱스 3-8, 총 6개)
        const loopStart = 3;
        const loopEnd = Math.min(8, messagesRef.current.length - 1);
        let loopIndex = loopStart;

        setCurrentIndex(loopStart);

        intervalRef.current = setInterval(() => {
            loopIndex++;
            if (loopIndex > loopEnd) {
                loopIndex = loopStart; // 순환
            }
            setCurrentIndex(loopIndex);
        }, 8000); // 8초 간격 (더 천천히)
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

        // 완료 예고 메시지 중 하나 선택 (인덱스 9-11)
        const completionIndex = Math.min(10, messagesRef.current.length - 1);
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
