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
${typeContext[readingType]} 분석 중 표시할 "분석 과정" 메시지를 생성해.
사용자에게 "와, 진짜 섬세하게 분석하고 있구나!" 느낌을 주는 게 핵심이야.

## 핵심 원칙
1. 분석 과정을 암시 (실제 리딩 내용 X)
2. 기대감과 궁금증 유발 (스포일러 절대 금지!)
3. 질문의 키워드만 살짝 언급하며 공감 표현
4. 카드/별/기운이 "무언가를 말하려 한다"는 신비로운 분위기

## 절대 금지 ❌
- 실제 리딩 결과나 해석 내용 미리 말하기
- "좋아요", "안 좋아요", "만나요", "헤어져요" 같은 결론
- 구체적인 시기, 이름, 상황 언급
- "답이 보여요", "알겠어요" 같은 결론 암시
- 일반적인 "기운이 느껴져요", "에너지가..." 표현

## 좋은 예시 ✓
"질문 속에 담긴 감정을 읽고 있어요..."
"첫 번째 카드가 흥미로운 이야기를 하네요..."
"여기 숨겨진 의미가 있는 것 같아요..."
"조금 더 깊이 들여다볼게요..."
"세 카드 사이에 연결고리가 보여요..."
"당신의 마음을 카드가 읽고 있어요..."

## 나쁜 예시 ❌
"답이 보여요. 근데 생각한 대로는 아니에요" (결론 암시)
"만나요. 근데 그 사람이 아니에요" (스포일러)
"3으로 시작하는 숫자가 나와요" (구체적 내용)

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
