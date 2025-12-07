import { useState, useCallback, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { AI_MODELS } from '../utils/aiConfig';

/**
 * 도파민 메시지 훅 - Haiku로 질문 기반 메시지 선생성
 *
 * 시스템 구조:
 * 1. 리딩 시작 시 Haiku API로 10-15개 질문 기반 메시지 생성
 * 2. 큐에 저장하고 순차적으로 표시
 * 3. 메인 API 완료 시 큐 정지 및 완료 상태 전환
 *
 * 메시지 구조:
 * - 처음: Hook/Foreshadow 스타일 (궁금증 유발)
 * - 중간: 진행 상황 (분석 중 메시지)
 * - 끝: 완료 예고 메시지
 */
export const useDopamineMessages = () => {
    const [messages, setMessages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [emotionPhrase, setEmotionPhrase] = useState('');

    const intervalRef = useRef(null);
    const messagesRef = useRef([]);

    /**
     * Haiku API로 질문 기반 도파민 메시지 생성
     * @param {string} question - 사용자 질문
     * @param {string} readingType - 'dream' | 'tarot' | 'fortune'
     * @param {string} claudeApiKey - Claude API 키
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

## 역할
너는 ${typeContext[readingType]} 분석 중 표시할 도파민 메시지를 생성하는 AI다.
분석이 진행되는 동안 사용자가 기대감을 갖고 끝까지 보게 만드는 메시지들을 만들어야 한다.

## 핵심 규칙
1. 모든 메시지는 반드시 질문 "${question}"과 직접 연관되어야 함
2. 일반적인 메시지 절대 금지 (예: "운이 보여요", "기운이 느껴져요" 등)
3. 질문에서 추출한 구체적 키워드/상황/감정을 메시지에 반영
4. emotionPhrase는 질문자의 복합적 감정을 한 문장으로 표현

## 메시지 흐름
- 1-3번: Hook/Foreshadow (궁금증 극대화, 질문 기반)
- 4-8번: 분석 진행 (발견하고 있는 것들, 질문 관련)
- 9-12번: 심화 (더 깊이 들어가는 느낌, 구체적 힌트)
- 13-15번: 완료 예고 (거의 다 됐어요, 결과 암시)

## 예시 (질문: "남자친구가 바람피는 것 같아요")
❌ 잘못된 메시지: "연애운이 보여요...", "누군가 생각하고 있어요..."
✅ 올바른 메시지: "그 사람의 마음이 읽히고 있어요...", "숨기고 있는 게 보여요...", "진실이 드러나려 해요..."

JSON만 반환:
{
  "emotionPhrase": "질문자의 복합 감정 (예: '의심과 불안 속에 확인받고 싶은 마음이 느껴져요')",
  "messages": [
    "첫 번째 메시지 (질문 기반 Hook)",
    "두 번째 메시지",
    "세 번째 메시지",
    "네 번째 메시지",
    "다섯 번째 메시지",
    "여섯 번째 메시지",
    "일곱 번째 메시지",
    "여덟 번째 메시지",
    "아홉 번째 메시지",
    "열 번째 메시지",
    "열한 번째 메시지",
    "열두 번째 메시지"
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
     * 도파민 메시지 큐 시작
     * @param {Array} messageList - 메시지 배열
     * @param {string} emotion - 감정 구문
     * @param {number} intervalMs - 메시지 간격 (기본 4초)
     */
    const startQueue = useCallback((messageList, emotion, intervalMs = 4000) => {
        if (!messageList || messageList.length === 0) {
            console.warn('도파민 큐 시작 실패: 메시지 없음');
            return;
        }

        // 이전 interval 정리
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setMessages(messageList);
        messagesRef.current = messageList;
        setEmotionPhrase(emotion || '');
        setCurrentIndex(0);
        setIsActive(true);
        setIsComplete(false);

        console.log(`▶️ Dopamine queue started: ${messageList.length} messages`);

        // 첫 메시지 즉시 표시
        // interval로 다음 메시지들 순차 표시
        intervalRef.current = setInterval(() => {
            setCurrentIndex(prev => {
                const nextIndex = prev + 1;
                // 마지막 메시지에 도달하면 멈추고 대기 (isComplete가 될 때까지)
                if (nextIndex >= messagesRef.current.length) {
                    return prev; // 마지막 메시지 유지
                }
                return nextIndex;
            });
        }, intervalMs);
    }, []);

    /**
     * 도파민 큐 정지 및 완료 처리
     */
    const stopQueue = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsActive(false);
        setIsComplete(true);
        console.log('⏹️ Dopamine queue stopped');
    }, []);

    /**
     * 완전 리셋
     */
    const reset = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setMessages([]);
        setCurrentIndex(0);
        setIsActive(false);
        setIsComplete(false);
        setEmotionPhrase('');
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
