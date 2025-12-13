import { useState, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { runAnalysisAnimation, getApiKeys, getDreamMessages, getFortuneMessages } from '../utils/analysisHelpers';
import { useImageGeneration } from './useImageGeneration';
import { getModelConfig, AI_MODELS, getContentLength } from '../utils/aiConfig';
import {
    DETAILED_ANALYSIS_SYSTEM_PROMPT,
    callClaudeWithCache,
    callClaudeWithCacheStreaming,
    getTarotSystemPrompt,
    getDreamSystemPrompt,
    getFortuneSystemPrompt
} from '../utils/promptCache';

// 별자리 계산 함수
const getZodiacSign = (birthDate) => {
    if (!birthDate) return null;
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const signs = [
        { name: '물병자리', emoji: '♒', start: [1, 20], end: [2, 18] },
        { name: '물고기자리', emoji: '♓', start: [2, 19], end: [3, 20] },
        { name: '양자리', emoji: '♈', start: [3, 21], end: [4, 19] },
        { name: '황소자리', emoji: '♉', start: [4, 20], end: [5, 20] },
        { name: '쌍둥이자리', emoji: '♊', start: [5, 21], end: [6, 21] },
        { name: '게자리', emoji: '♋', start: [6, 22], end: [7, 22] },
        { name: '사자자리', emoji: '♌', start: [7, 23], end: [8, 22] },
        { name: '처녀자리', emoji: '♍', start: [8, 23], end: [9, 22] },
        { name: '천칭자리', emoji: '♎', start: [9, 23], end: [10, 23] },
        { name: '전갈자리', emoji: '♏', start: [10, 24], end: [11, 21] },
        { name: '사수자리', emoji: '♐', start: [11, 22], end: [12, 21] },
        { name: '염소자리', emoji: '♑', start: [12, 22], end: [1, 19] }
    ];

    for (const sign of signs) {
        const [startMonth, startDay] = sign.start;
        const [endMonth, endDay] = sign.end;

        if (startMonth === 12 && endMonth === 1) {
            if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
                return sign;
            }
        } else if (
            (month === startMonth && day >= startDay) ||
            (month === endMonth && day <= endDay)
        ) {
            return sign;
        }
    }
    return null;
};

// 나이 계산 함수 - AI가 해석에 참고하되 리딩에서 직접 언급하지 않음
const getAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// 이름에서 성 제외하고 이름만 추출 (예: "신동석" → "동석")
const getFirstName = (fullName) => {
    if (!fullName) return null;
    // 한글 이름인 경우: 2글자면 그대로, 3글자 이상이면 첫 글자(성) 제외
    if (/^[가-힣]+$/.test(fullName)) {
        return fullName.length >= 3 ? fullName.slice(1) : fullName;
    }
    // 영어 이름인 경우: 첫 단어만 사용
    return fullName.split(' ')[0];
};

// 공통 프로필 정보 블록 생성 (꿈/타로/사주 공통)
// nickname을 우선 사용, 없으면 name에서 성 제외한 이름 사용
const buildProfileBlock = (userProfile, readingType, userNickname = null) => {
    // 닉네임이 있으면 우선 사용
    const displayName = userNickname || getFirstName(userProfile?.name) || null;

    if ((!userProfile || Object.keys(userProfile).length === 0) && !displayName) {
        return `
## 호칭 규칙
- 프로필 정보 없음 → "당신" 사용
`;
    }

    const fullName = userProfile?.name || null;
    const firstName = displayName;  // 닉네임 우선, 없으면 성 제외한 이름
    const birthDate = userProfile?.birthDate || null;
    const birthTime = userProfile?.birthTime || null;
    const gender = userProfile?.gender || null;
    const mbti = userProfile?.mbti || null;
    const zodiac = getZodiacSign(birthDate);
    const age = getAge(birthDate);

    // 프로필 정보가 하나도 없고 닉네임도 없으면 기본 호칭
    if (!firstName && !birthDate && !gender && !mbti) {
        return `
## 호칭 규칙
- 프로필 정보 없음 → "당신" 사용
`;
    }

    let profileBlock = `
## 질문자 프로필
`;
    if (firstName) {
        profileBlock += `- 이름: ${firstName} (호칭: "${firstName}님")
`;
    }
    if (birthDate) {
        profileBlock += `- 생년월일: ${birthDate}`;
        if (age) profileBlock += ` (${age}세)`;
        if (zodiac) profileBlock += ` - ${zodiac.emoji} ${zodiac.name}`;
        profileBlock += `\n`;
    }
    if (birthTime) profileBlock += `- 태어난 시간: ${birthTime}\n`;
    if (gender) profileBlock += `- 성별: ${gender === 'female' ? '여성' : gender === 'male' ? '남성' : gender}\n`;
    if (mbti) profileBlock += `- MBTI: ${mbti}\n`;

    // 프로필 활용 가이드 - 최소한으로 사용하도록 변경
    profileBlock += `
⚠️ 프로필 활용 규칙:
- 이름이 있으면 "${firstName || 'OO'}님"으로 호칭 ("당신" 대신)
- 별자리/MBTI는 전체 리딩에서 1-2번만 자연스럽게 언급 (매 카드마다 반복 금지!)
- 나이는 해석에 참고하되 "OO세", "OO대" 등 직접 언급 금지 (프라이버시 보호)
- 억지로 끼워넣지 말고, 맥락에 맞을 때만 활용`;

    if (readingType === 'fortune') {
        profileBlock += `
- 사주 리딩: 생년월일+시간으로 사주팔자 분석`;
    }

    profileBlock += `\n`;

    return profileBlock;
};

/**
 * 통합 리딩 생성 훅
 * 꿈 해몽, 타로, 사주 생성을 단일 훅으로 통합
 *
 * AI Tier System:
 * - 텍스트: 모든 티어 Sonnet 4.5 + MrBeast 도파민 프롬프트
 * - 이미지: Free = Gemini Flash, Premium = Gemini 3 Pro Preview
 *
 * 프리미엄 차별화:
 * - Hidden Insight 블러 해제
 * - 심층 분석 잠금 해제
 * - 고품질 이미지
 * - 무제한 사용
 */
export const useReading = ({
    user,
    userProfile = {},
    userNickname = null,  // 닉네임 (리딩 호칭에 우선 사용)
    tier = 'free',  // 'free' | 'premium' | 'ultra'
    dreamTypes,
    onSaveDream,
    onSaveTarot,
    onSaveFortune,
    onNewDreamType,
    setToast,
    setDopaminePopup,
    setSavedDreamField
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState('');
    const [analysisPhase, setAnalysisPhase] = useState(0);
    const [imageProgress, setImageProgress] = useState({ current: 0, total: 5 }); // 이미지 생성 진행률

    // 실시간 스트리밍 데이터 (AnalysisOverlay용)
    const [streamingData, setStreamingData] = useState({
        topics: null,
        keywords: null,
        title: null,
        verdict: null,
        hook: null,
        foreshadow: null
    });
    // 이미지 준비 완료 상태 (Hero + Card1)
    const [isImagesReady, setIsImagesReady] = useState(false);

    const { generateSingleImage } = useImageGeneration(tier);

    // 현재 티어 설정 가져오기
    const modelConfig = getModelConfig(tier);
    const isPremium = tier === 'premium' || tier === 'ultra';

    /**
     * Claude API 호출 공통 함수 (캐싱 지원)
     * @param {string} systemPrompt - 시스템 프롬프트 (캐시 대상, null이면 캐싱 안함)
     * @param {string} userMessage - 사용자 메시지 (동적)
     * @param {number} maxTokens - 최대 토큰 수
     * @param {boolean} useKeywordModel - 키워드 생성 모델 사용 여부
     */
    const callClaudeApi = async (systemPrompt, userMessage, maxTokens = 1500, useKeywordModel = false) => {
        const apiKeys = getApiKeys();
        if (!apiKeys) throw new Error('API 키 설정 필요');

        const anthropic = new Anthropic({
            apiKey: apiKeys.claudeApiKey,
            dangerouslyAllowBrowser: true
        });

        // 모델 선택: Free/Premium = Sonnet, Ultra = Opus
        const model = useKeywordModel ? AI_MODELS.keywords : modelConfig.textModel;

        // 디버깅: 정확한 티어와 모델 표시
        const tierLabel = tier === 'ultra' ? '🔥 Ultra (Opus 4.5)' : (tier === 'premium' ? '⭐ Premium' : '🆓 Free');
        console.log(`🤖 AI Model: ${model} | Tier: ${tierLabel} | KeywordMode: ${useKeywordModel}`);

        let responseText;

        if (systemPrompt) {
            // 캐싱 사용: 시스템 프롬프트 분리
            responseText = await callClaudeWithCache(anthropic, systemPrompt, userMessage, model, maxTokens);
            console.log('💾 Using prompt caching for cost optimization');
        } else {
            // 캐싱 미사용: 기존 방식 (레거시 호환)
            const result = await anthropic.messages.create({
                model,
                max_tokens: maxTokens,
                messages: [{ role: "user", content: userMessage }]
            });
            responseText = result.content[0].text;
        }

        let cleanText = responseText
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
        return JSON.parse(cleanText);
    };

    // 심층 분석 생성 (꿈 전용) - 프리미엄 전용 기능 (캐싱 적용)
    const generateDetailedAnalysis = async (data, originalDream) => {
        // 무료 티어는 심층 분석 생성 안 함
        if (!isPremium) {
            console.log('📝 Free tier: Skipping detailed analysis');
            return null;
        }

        try {
            const apiKeys = getApiKeys();
            const client = new Anthropic({
                apiKey: apiKeys.claudeApiKey,
                dangerouslyAllowBrowser: true
            });

            console.log(`🤖 Detailed Analysis Model: ${modelConfig.textModel} (with caching)`);

            // 동적 사용자 메시지 (캐시 제외)
            const userMessage = `꿈: "${originalDream}"
유형: ${data.dreamType}
핵심: ${data.title}
한줄: ${data.verdict}
상징: ${data.keywords?.map(k => k.word).join(', ')}
질문자 이름: ${userProfile?.name || '(프로필 없음 - "당신" 사용)'}
⚠️ 이름이 있으면 반드시 "${userProfile?.name || 'OO'}님"으로 호칭! "당신" 사용 금지!
## 💭 섹션 제목에 ${userProfile?.name ? userProfile.name + '님의' : '당신의'} 마음이 보내는 신호 사용`;

            // 캐싱된 API 호출
            const responseText = await callClaudeWithCache(
                client,
                DETAILED_ANALYSIS_SYSTEM_PROMPT,
                userMessage,
                modelConfig.textModel,
                4000,
                'detailed'  // mode for analytics
            );
            return responseText;
        } catch (err) {
            console.error('심층 분석 생성 실패:', err);
            return null;
        }
    };

    // 꿈 해몽 생성
    const generateDreamReading = useCallback(async (dreamDescription, selectedDreamDate) => {
        if (!dreamDescription.trim()) {
            setError('꿈 내용을 입력해');
            return null;
        }

        const apiKeys = getApiKeys();
        if (!apiKeys) {
            setError('API 키 설정 필요');
            return null;
        }

        setLoading(true);
        setError('');
        setAnalysisPhase(1);
        setProgress('접신 중...');

        await runAnalysisAnimation(
            getDreamMessages(dreamDescription),
            setAnalysisPhase, setProgress, setToast, setDopaminePopup
        );

        try {
            // 분석 애니메이션 후 단계를 6으로 올림 (5개 메시지 완료 후 다음 단계)
            setAnalysisPhase(6);
            setProgress('꿈을 읽는 중...');

            const existingTypesList = Object.entries(dreamTypes).map(([key, val]) => `${key}(${val.name})`).join(', ');

            // 프로필 정보 블록 생성
            const profileBlock = buildProfileBlock(userProfile, 'dream', userNickname);

            // ═══════════════════════════════════════════════════════════════
            // 꿈 해몽 프롬프트 캐싱 구조:
            // - 시스템 프롬프트 (캐시됨, 90% 비용 절감): 규칙, 스타일, JSON 스키마
            // - 유저 메시지 (동적): 프로필, 꿈 유형 목록, 꿈 내용
            // ═══════════════════════════════════════════════════════════════

            // 시스템 프롬프트 (캐시 대상 - promptCache.js에서 관리)
            const dreamSystemPrompt = getDreamSystemPrompt(tier);

            // 유저 메시지 (동적 데이터만)
            const dreamUserMessage = `${profileBlock}

## 꿈 유형 - 매우 중요!!!
기존 유형: ${existingTypesList}

## 꿈 내용
"${dreamDescription}"`;

            // 캐싱 적용 API 호출 (90% 비용 절감)
            const data = await callClaudeApi(dreamSystemPrompt, dreamUserMessage, 3000);
            console.log('🎯 Dream API Response - jenny:', data.jenny); // 디버깅용

            // 타로 카드 토스트
            if (data.tarot?.name) {
                setProgress('🃏 타로 카드가 당신을 선택했어요...');
                setToast('tarotReveal', {
                    name: data.tarot.name,
                    meaning: data.tarot.meaning
                });
                await new Promise(r => setTimeout(r, 2500));
                setToast('tarotReveal', null);
            }

            // 새로운 꿈 유형 처리
            if (data.newDreamType && data.dreamType) {
                await onNewDreamType(data.dreamType, data.newDreamType);
                setToast('newType', {
                    emoji: data.newDreamType.emoji,
                    name: data.newDreamType.name,
                    desc: data.newDreamType.desc
                });
                setTimeout(() => setToast('newType', null), 5000);
            }

            // 이미지 + 심층 분석 병렬 생성
            setAnalysisPhase(5);
            setProgress('🌌 당신의 무의식이 그려지고 있어요...');

            const detailedAnalysisPromise = generateDetailedAnalysis(data, dreamDescription);
            const characterDesc = data.images.character;

            // Claude가 선택한 스튜디오 스타일과 색상 팔레트 (없으면 기본값)
            const studioStyle = data.studioStyle || 'random';
            const colorPalette = data.colorPalette || '';
            console.log(`🎨 Dream Style: studio=${studioStyle}, Colors: ${colorPalette || 'default'}`);

            // 프로필 기반 인물 설명 생성 (꿈)
            const getDreamPersonDesc = () => {
                if (!userProfile || !userProfile.gender) return 'a dreamer';
                const gender = userProfile.gender === 'female' ? 'young woman' : userProfile.gender === 'male' ? 'young man' : 'person';
                return gender;
            };
            const dreamPersonDesc = getDreamPersonDesc();

            // 히어로 이미지 - Claude 생성 프롬프트 그대로 사용 (스타일 일관성 유지)
            // 성별 정보는 프롬프트 뒤에 추가하여 스타일 prefix가 우선 적용되도록 함
            const dreamHeroBasePrompt = data.images.hero || 'surreal dreamscape, surrounded by symbolic dream imagery. Ethereal mist and soft moonlight. Subconscious emotions visualized as floating elements. Mystical atmosphere, cinematic composition';
            const dreamHeroPrompt = userProfile?.gender
                ? `${dreamHeroBasePrompt}. The dreamer is ${dreamPersonDesc}.`
                : dreamHeroBasePrompt;
            const heroImage = await generateSingleImage(dreamHeroPrompt, studioStyle, characterDesc, 'dream', colorPalette);
            await new Promise(r => setTimeout(r, 500));

            setProgress('🎨 당신의 꿈이 그림으로 피어나고 있어요...');
            const dreamImage = await generateSingleImage(data.images.dream, studioStyle, characterDesc, 'dream', colorPalette);
            await new Promise(r => setTimeout(r, 500));

            setProgress('🃏 우주의 카드가 펼쳐지고 있어요...');
            const tarotImage = await generateSingleImage(data.images.tarot, studioStyle, characterDesc, 'dream', colorPalette);
            await new Promise(r => setTimeout(r, 500));

            setProgress('✨ 꿈 속 비밀이 드러나고 있어요...');
            const meaningImage = await generateSingleImage(data.images.meaning, studioStyle, characterDesc, 'dream', colorPalette);

            const detailedAnalysis = await detailedAnalysisPromise;

            setProgress('🌙 당신만의 꿈 해몽이 완성되었어요');

            const resultData = {
                ...data,
                heroImage,
                dreamImage,
                tarotImage,
                meaningImage,
                originalDream: dreamDescription,
                detailedAnalysis
            };

            setProgress('');
            setAnalysisPhase(0);

            // 자동 저장
            if (user && onSaveDream) {
                setTimeout(async () => {
                    const savedId = await onSaveDream(resultData, true, selectedDreamDate);
                    if (savedId) {
                        setSavedDreamField?.('id', savedId);
                        setSavedDreamField?.('isPublic', true);
                        setToast('live', { type: 'save', message: '자동으로 저장되었어요!' });
                        setTimeout(() => setToast('live', null), 3000);
                    }
                }, 500);
            }

            return resultData;

        } catch (err) {
            setError(`실패: ${err.message}`);
            setProgress('');
            return null;
        } finally {
            setLoading(false);
        }
    }, [user, dreamTypes, generateSingleImage, onSaveDream, onNewDreamType, setToast, setDopaminePopup, setSavedDreamField]);

    // 타로 리딩 생성 (4장 카드 시스템 + 스토리텔링)
    // streamingCallbacks: { onHookReady, onImagesReady, onPartialUpdate }
    const generateTarotReading = useCallback(async (question, selectedCards, streamingCallbacks = {}) => {
        if (selectedCards.length !== 3 || !question.trim()) {
            setError('질문과 3장의 카드가 필요합니다');
            return null;
        }

        const apiKeys = getApiKeys();
        if (!apiKeys) {
            setError('API 키 설정 필요');
            return null;
        }

        setLoading(true);
        setError('');
        setAnalysisPhase(1); // Phase 1: 시작
        setProgress('카드가 당신을 읽고 있어요...');

        const [card1, card2, card3] = selectedCards;

        try {

            // 78장 덱에서 4번째 결론 카드 랜덤 선택 (선택된 3장 제외)
            const { TAROT_DECK } = await import('../utils/constants');
            const remainingCards = TAROT_DECK.filter(c => !selectedCards.find(s => s.id === c.id));
            const conclusionCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];

            // 프로필 정보 블록 생성
            const profileBlock = buildProfileBlock(userProfile, 'tarot', userNickname);

            // 현재 날짜/시간 컨텍스트 생성
            const now = new Date();
            const currentYear = now.getFullYear();
            const nextYear = currentYear + 1;
            const currentMonth = now.getMonth() + 1;
            const currentDay = now.getDate();
            const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
            const dateContext = `📅 오늘 날짜: ${currentYear}년 ${currentMonth}월 ${currentDay}일 (${dayOfWeek}요일)
- 올해 = ${currentYear}년, 내년 = ${nextYear}년 (⚠️ 절대 혼동 금지!)
- "내년", "내년 초", "내년 상반기" 등은 모두 ${nextYear}년을 의미합니다
- 질문에 "내년"이 있으면 반드시 ${nextYear}년 기준으로 답변하세요
- 시기를 언급할 때 반드시 오늘 날짜 기준으로 과거/현재/미래를 구분하세요
- 예: 오늘이 12월이면 "8월"은 과거 / "내년 2월"은 ${nextYear}년 2월 (미래)
- 올해가 거의 끝나가는 시점이면 "올해" 관련 질문에 대해 남은 기간을 고려하세요`;

            // ═══════════════════════════════════════════════════════════════
            // 타로 프롬프트 캐싱 구조:
            // - 시스템 프롬프트 (캐시됨, 90% 비용 절감): 규칙, 스타일, JSON 스키마
            // - 유저 메시지 (동적): 프로필, 질문, 카드 정보
            // ═══════════════════════════════════════════════════════════════

            // 시스템 프롬프트 (캐시 대상 - promptCache.js에서 관리)
            const tarotSystemPrompt = getTarotSystemPrompt(tier);

            // 유저 메시지 (동적 데이터만)
            const tarotUserMessage = `${profileBlock}

${dateContext}

## 질문
"${question}"

## 선택된 카드
1. ${card1.nameKo} (${card1.name}): ${card1.meaning}
2. ${card2.nameKo} (${card2.name}): ${card2.meaning}
3. ${card3.nameKo} (${card3.name}): ${card3.meaning}

## 결론 카드 (운명이 선물한 카드)
4. ${conclusionCard.nameKo} (${conclusionCard.name}): ${conclusionCard.meaning}

⚠️ 위 카드 이름들을 imagePrompt에 반영해주세요:
- card1ImagePrompt: ${card1.nameKo} 타로 심볼
- card2ImagePrompt: ${card2.nameKo} 타로 심볼
- card3ImagePrompt: ${card3.nameKo} 타로 심볼
- conclusionImagePrompt: ${conclusionCard.nameKo} 타로 심볼`;

            // 스트리밍 API 호출 (Progressive Loading)
            const anthropic = new Anthropic({
                apiKey: apiKeys.claudeApiKey,
                dangerouslyAllowBrowser: true
            });

            // ═══════════════════════════════════════════════════════════════
            // 이미지 생성: Claude가 모든 imagePrompt를 직접 생성
            // - heroImagePrompt: 질문 기반 (나이 20대, 성별 프로필 참고)
            // - card1~3ImagePrompt: 각 cardAnalysis 기반
            // - conclusionImagePrompt: conclusionCard 기반
            // ═══════════════════════════════════════════════════════════════

            // ═══════════════════════════════════════════════════════════════
            // 이미지 상태 및 Progressive UI
            // ═══════════════════════════════════════════════════════════════

            let studioStyle = 'random';
            let colorPalette = '';

            let heroImage = null;
            let card1Image = null;
            let card2Image = null;
            let card3Image = null;
            let conclusionImage = null;
            let hasTransitioned = false;

            let partialResult = {
                title: null,
                verdict: null,
                topics: null,
                keywords: null,
                jenny: { hook: null, foreshadow: null, hiddenInsight: null },
                storyReading: {},
                cards: [...selectedCards, conclusionCard],
                question,
                type: 'tarot',
                isStreaming: true,
                heroImage: null,
                card1Image: null,
                card2Image: null,
                card3Image: null,
                conclusionImage: null,
                cardReady: { card1: false, card2: false, card3: false, conclusion: false }
            };

            const checkAndTransition = () => {
                // Hero + Card1 이미지만 완료되면 전환 (card1Analysis 파싱 제거 - 중첩 JSON 파싱 문제)
                if (!hasTransitioned && heroImage && card1Image) {
                    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
                    console.log(`🚀 Hero + Card1 이미지 준비 완료 → 결과 페이지 전환 (${elapsedTime}s)`);
                    hasTransitioned = true;
                    setIsImagesReady(true); // AnalysisOverlay에 이미지 준비 완료 알림
                    partialResult.heroImage = heroImage;
                    partialResult.card1Image = card1Image;
                    partialResult.pastImage = card1Image;
                    partialResult.cardReady.card1 = true;
                    if (streamingCallbacks.onHookReady) {
                        streamingCallbacks.onHookReady({ ...partialResult });
                    }
                }
            };

            const updateCardReady = (cardNum, image, analysis) => {
                // Card 2: 이미지 + 분석 필요
                if (cardNum === 2) {
                    if (image) {
                        partialResult.card2Image = image;
                        partialResult.presentImage = image;
                    }
                    // 이미지와 분석이 모두 있어야 ready
                    const card2Analysis = analysis || partialResult.storyReading?.card2Analysis;
                    const card2Img = image || partialResult.card2Image;
                    if (card2Analysis && card2Img) {
                        partialResult.cardReady.card2 = true;
                    }
                }
                // Card 3: 이미지 + 분석 필요
                else if (cardNum === 3) {
                    if (image) {
                        partialResult.card3Image = image;
                        partialResult.futureImage = image;
                    }
                    const card3Analysis = analysis || partialResult.storyReading?.card3Analysis;
                    const card3Img = image || partialResult.card3Image;
                    if (card3Analysis && card3Img) {
                        partialResult.cardReady.card3 = true;
                    }
                }
                // Conclusion: 이미지 + 분석 + hiddenInsight 필요
                else if (cardNum === 4) {
                    if (image) {
                        partialResult.conclusionImage = image;
                    }
                    const conclusionAnalysis = analysis || partialResult.storyReading?.conclusionCard;
                    const conclusionImg = image || partialResult.conclusionImage;
                    const hiddenInsight = partialResult.jenny?.hiddenInsight || partialResult.hiddenInsight;
                    if (conclusionAnalysis && conclusionImg && hiddenInsight) {
                        partialResult.cardReady.conclusion = true;
                    }
                }
                if (hasTransitioned && streamingCallbacks.onPartialUpdate) {
                    streamingCallbacks.onPartialUpdate({ ...partialResult });
                }
            };

            // ═══════════════════════════════════════════════════════════════
            // 🎨 이미지 Promise 변수 (Claude가 생성한 프롬프트로 생성)
            // ═══════════════════════════════════════════════════════════════
            let heroPromise = null;
            let card1Promise = null;
            let card2Promise = null;
            let card3Promise = null;
            let conclusionPromise = null;

            // ═══════════════════════════════════════════════════════════════
            // ⏱️ 시간 측정
            // ═══════════════════════════════════════════════════════════════
            const startTime = Date.now();
            const elapsed = () => `(${((Date.now() - startTime) / 1000).toFixed(1)}s)`;

            console.log('⏱️ 타로 리딩 시작');

            // ═══════════════════════════════════════════════════════════════
            // 스트리밍 콜백: Claude가 생성한 imagePrompt로 이미지 생성
            // ═══════════════════════════════════════════════════════════════
            const streamCallbacks = {
                // 오버레이용 데이터 (가장 먼저 파싱) - streamingData로도 업데이트
                onTitle: (title) => {
                    console.log(`📝 Title 설정 ${elapsed()}:`, title.slice(0, 30) + '...');
                    partialResult.title = title;
                    setStreamingData(prev => ({ ...prev, title }));
                },
                onVerdict: (verdict) => {
                    console.log(`📝 Verdict 설정 ${elapsed()}:`, verdict);
                    partialResult.verdict = verdict;
                    setStreamingData(prev => ({ ...prev, verdict }));
                },
                onTopics: (topics) => {
                    console.log(`📝 Topics 설정 ${elapsed()}:`, topics);
                    partialResult.topics = topics;
                    setStreamingData(prev => ({ ...prev, topics }));
                },
                onKeywords: (keywords) => {
                    console.log(`📝 Keywords 설정 ${elapsed()}:`, keywords.map(k => k.word));
                    partialResult.keywords = keywords;
                    setStreamingData(prev => ({ ...prev, keywords }));
                },
                onHook: (hook) => {
                    console.log(`🎣 Hook 완료 ${elapsed()}:`, hook.slice(0, 50) + '...');
                    setProgress('당신의 이야기가 시작됩니다...');
                    partialResult.hook = hook;
                    partialResult.jenny.hook = hook; // 호환성
                    setStreamingData(prev => ({ ...prev, hook }));
                },
                onForeshadow: (foreshadow) => {
                    console.log(`✅ Foreshadow 완료 ${elapsed()}:`, foreshadow.slice(0, 50) + '...');
                    partialResult.foreshadow = foreshadow;
                    partialResult.jenny.foreshadow = foreshadow; // 호환성
                    setStreamingData(prev => ({ ...prev, foreshadow }));
                },
                // visualMode 감지 (레거시 호환성 - anime만 사용)
                onVisualMode: (mode) => {
                    console.log(`🎬 비주얼 모드 (anime only) ${elapsed()}:`, mode);
                },
                // studioStyle 감지 → 이미지 생성 전에 스튜디오 스타일 설정
                onStudioStyle: (style) => {
                    console.log(`🎬 스튜디오 스타일 설정 ${elapsed()}:`, style);
                    studioStyle = style;
                    setAnalysisPhase(2); // Phase 2: 스타일/컬러 파싱
                },
                // 레거시 호환: imageStyle → studioStyle로 처리
                onImageStyle: (style) => {
                    console.log(`🎨 [레거시] imageStyle → studioStyle ${elapsed()}:`, style);
                    studioStyle = style;
                    setAnalysisPhase(2);
                },
                // colorPalette 감지 → 이미지 생성 전에 색상 설정
                onColorPalette: (palette) => {
                    console.log(`🎨 컬러 설정 ${elapsed()}:`, palette);
                    colorPalette = palette;
                },
                // Hero 이미지 프롬프트 → Hero 이미지 생성 시작 (Claude가 질문 기반으로 생성)
                onHeroImagePrompt: (prompt) => {
                    console.log(`🎨 Hero 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    console.log(`🎨 [DEBUG] Hero 이미지 파라미터: studio=${studioStyle}, colors=${colorPalette}`);
                    setAnalysisPhase(3); // Phase 3: Hero 이미지 생성
                    setProgress('🌌 당신의 세계가 펼쳐지고 있어요...');
                    heroPromise = generateSingleImage(prompt, studioStyle, '', 'tarot', colorPalette)
                        .then(img => {
                            heroImage = img;
                            console.log(`✅ Hero 이미지 완료 ${elapsed()}`);
                            setAnalysisPhase(5); // Phase 5: 이미지 완료
                            checkAndTransition();
                            return img;
                        });
                },
                // Card1 분석 완료 → 저장만
                onCard1: (card1Analysis) => {
                    console.log(`🃏 Card1 분석 완료 ${elapsed()}`);
                    partialResult.storyReading.card1Analysis = card1Analysis;
                },
                // Card1 이미지 프롬프트 → 이미지 생성 시작
                onCard1ImagePrompt: (prompt) => {
                    console.log(`🎨 Card1 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    setAnalysisPhase(4); // Phase 4: Card1 이미지 생성
                    setProgress('🎨 첫 번째 카드가 피어나고 있어요...');
                    card1Promise = generateSingleImage(prompt, studioStyle, '', 'tarot', colorPalette)
                        .then(img => {
                            card1Image = img;
                            console.log(`✅ Card1 이미지 완료 ${elapsed()}`);
                            setAnalysisPhase(5); // Phase 5: 이미지 완료
                            checkAndTransition();
                            return img;
                        });
                },
                // Card2 분석 완료 → 저장 + ready 체크
                onCard2: (card2Analysis) => {
                    console.log(`🃏 Card2 분석 완료 ${elapsed()}`);
                    partialResult.storyReading.card2Analysis = card2Analysis;
                    // 이미지가 이미 완료됐으면 ready 상태로 업데이트
                    updateCardReady(2, null, card2Analysis);
                },
                // Card2 이미지 프롬프트 → 이미지 생성 시작
                onCard2ImagePrompt: (prompt) => {
                    console.log(`🎨 Card2 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    setProgress('🃏 두 번째 카드가 나타나고 있어요...');
                    card2Promise = generateSingleImage(prompt, studioStyle, '', 'tarot', colorPalette)
                        .then(img => {
                            card2Image = img;
                            console.log(`✅ Card2 이미지 완료 ${elapsed()}`);
                            updateCardReady(2, img, partialResult.storyReading.card2Analysis);
                            return img;
                        });
                },
                // Card3 분석 완료 → 저장 + ready 체크
                onCard3: (card3Analysis) => {
                    console.log(`🃏 Card3 분석 완료 ${elapsed()}`);
                    partialResult.storyReading.card3Analysis = card3Analysis;
                    // 이미지가 이미 완료됐으면 ready 상태로 업데이트
                    updateCardReady(3, null, card3Analysis);
                },
                // Card3 이미지 프롬프트 → 이미지 생성 시작
                onCard3ImagePrompt: (prompt) => {
                    console.log(`🎨 Card3 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    setProgress('✨ 세 번째 카드가 빛나고 있어요...');
                    card3Promise = generateSingleImage(prompt, studioStyle, '', 'tarot', colorPalette)
                        .then(img => {
                            card3Image = img;
                            console.log(`✅ Card3 이미지 완료 ${elapsed()}`);
                            updateCardReady(3, img, partialResult.storyReading.card3Analysis);
                            return img;
                        });
                },
                // Conclusion 분석 완료 → 저장 + ready 체크
                onConclusion: (conclusionAnalysis) => {
                    console.log(`🎁 Conclusion 분석 완료 ${elapsed()}`);
                    partialResult.storyReading.conclusionCard = conclusionAnalysis;
                    // 이미지와 hiddenInsight가 이미 완료됐으면 ready 상태로 업데이트
                    updateCardReady(4, null, conclusionAnalysis);
                },
                // Conclusion 이미지 프롬프트 → 이미지 생성 시작
                onConclusionImagePrompt: (prompt) => {
                    console.log(`🎨 Conclusion 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    setProgress('🎁 운명의 선물이 도착하고 있어요...');
                    conclusionPromise = generateSingleImage(prompt, studioStyle, '', 'tarot', colorPalette)
                        .then(img => {
                            conclusionImage = img;
                            console.log(`✅ Conclusion 이미지 완료 ${elapsed()}`);
                            updateCardReady(4, img, partialResult.storyReading.conclusionCard);
                            return img;
                        });
                },
                onHiddenInsight: (hiddenInsight) => {
                    console.log(`✅ Hidden Insight 완료 ${elapsed()}`);
                    partialResult.jenny.hiddenInsight = hiddenInsight;
                    partialResult.hiddenInsight = hiddenInsight; // 최상위에도 저장
                    // 이미지와 분석이 이미 완료됐으면 conclusion ready 상태로 업데이트
                    updateCardReady(4, null, null);
                },
                onProgress: (progressValue) => {
                    // 진행률 기반 메시지 업데이트
                    if (progressValue > 0.3 && progressValue < 0.5) {
                        setProgress('카드가 이야기를 엮어가고 있어요...');
                    } else if (progressValue > 0.5 && progressValue < 0.7) {
                        setProgress('운명의 실타래가 풀리고 있어요...');
                    } else if (progressValue > 0.7) {
                        setProgress('마지막 메시지를 전하고 있어요...');
                    }
                },
                onImages: () => {
                    console.log(`🖼️ Images prompts detected ${elapsed()}`);
                },
                onComplete: (buffer) => {
                    console.log(`✅ Streaming complete ${elapsed()}, buffer length:`, buffer.length);
                }
            };

            const responseText = await callClaudeWithCacheStreaming(
                anthropic,
                tarotSystemPrompt,  // 캐시됨 (90% 비용 절감)
                tarotUserMessage,   // 동적 데이터만
                modelConfig.textModel,
                10000,
                streamCallbacks,
                'tarot'
            );

            // JSON 파싱 (오류 시 스트리밍 중 수집된 데이터 사용)
            let data = {};
            try {
                let cleanText = responseText
                    .replace(/```json\n?/g, "")
                    .replace(/```\n?/g, "")
                    .trim();
                data = JSON.parse(cleanText);
            } catch (parseError) {
                console.warn('⚠️ JSON 파싱 오류, 스트리밍 데이터 사용:', parseError.message);
                // 스트리밍 중 수집된 partialResult 사용
                data = { ...partialResult };
            }

            // Claude가 선택한 이미지 스타일로 업데이트 (남은 이미지에 적용)
            if (data.studioStyle) {
                studioStyle = data.studioStyle;
                console.log(`🎨 Claude 선택 스튜디오 스타일: ${studioStyle}`);
            }
            if (data.colorPalette) {
                colorPalette = data.colorPalette;
            }

            // partialResult에 data 병합 (storyReading 등)
            partialResult = {
                ...partialResult,
                ...data,
                cards: [...selectedCards, conclusionCard],
                question,
                type: 'tarot',
                isStreaming: true
            };

            // 모든 이미지 Promise 완료 대기 (스트리밍 중 시작된 것들)
            const allPromises = [heroPromise];
            if (card1Promise) allPromises.push(card1Promise);
            if (card2Promise) allPromises.push(card2Promise);
            if (card3Promise) allPromises.push(card3Promise);
            if (conclusionPromise) allPromises.push(conclusionPromise);

            console.log(`⏳ ${allPromises.length}개 이미지 완료 대기 중... ${elapsed()}`);
            await Promise.all(allPromises);
            console.log(`🎉 모든 이미지 생성 완료 ${elapsed()}`);

            // 결론 카드 준비 여부 확인 (이미지 + 분석 + hiddenInsight 모두 필요)
            const conclusionReady = !!(
                conclusionImage &&
                (data.storyReading?.conclusionCard || partialResult.storyReading?.conclusionCard) &&
                (data.jenny?.hiddenInsight || data.hiddenInsight || partialResult.jenny?.hiddenInsight || partialResult.hiddenInsight)
            );

            const tarotResultData = {
                ...data,
                cards: [...selectedCards, conclusionCard],
                heroImage,
                card1Image,
                card2Image,
                card3Image,
                conclusionImage,
                // 호환성을 위한 기존 필드
                pastImage: card1Image,
                presentImage: card2Image,
                futureImage: card3Image,
                question,
                type: 'tarot',
                // 기본 공개 설정: 전체 공개 (public)
                visibility: 'public',
                // 스트리밍 완료 플래그 + 카드 준비 상태 (conclusion은 실제 데이터 확인)
                isStreaming: false,
                cardReady: { card1: true, card2: true, card3: true, conclusion: conclusionReady }
            };

            setProgress('');
            setAnalysisPhase(0);

            // 자동 저장 - 기본값: 전체 공개 (public)
            if (user && onSaveTarot) {
                setTimeout(async () => {
                    const savedId = await onSaveTarot(tarotResultData, { visibility: 'public' });
                    if (savedId) {
                        setSavedDreamField?.('id', savedId);
                        setSavedDreamField?.('visibility', 'public');
                        setToast('live', { type: 'save', message: '타로 리딩이 저장되었어요!' });
                        setTimeout(() => setToast('live', null), 3000);
                    }
                }, 500);
            }

            return tarotResultData;

        } catch (err) {
            console.error('타로 리딩 생성 실패:', err);
            setError('타로 리딩 생성에 실패했습니다.');
            return null;
        } finally {
            setLoading(false);
        }
    }, [user, generateSingleImage, onSaveTarot, setToast, setDopaminePopup, setSavedDreamField]);

    // 운세 리딩 생성
    const generateFortuneReading = useCallback(async (fortuneType, fortuneTypes) => {
        const apiKeys = getApiKeys();
        if (!apiKeys) {
            setError('API 키 설정 필요');
            return null;
        }

        setLoading(true);
        setError('');
        setAnalysisPhase(1);
        setProgress('별들이 정렬되고 있어요...');

        const selectedFortune = fortuneTypes[fortuneType];

        await runAnalysisAnimation(
            getFortuneMessages(selectedFortune),
            setAnalysisPhase, setProgress, null, setDopaminePopup
        );

        try {
            // 분석 애니메이션 후 단계를 6으로 올림 (5개 메시지 완료 후 다음 단계)
            setAnalysisPhase(6);
            setProgress('사주를 해석하는 중...');

            // 프로필 정보 블록 생성 (사주에서는 생년월일+시간으로 사주팔자 계산)
            const profileBlock = buildProfileBlock(userProfile, 'fortune', userNickname);

            // 현재 연도 동적 계산 (만세력 계산용)
            const currentYear = new Date().getFullYear();
            const nextYear = currentYear + 1;
            const todayFull = new Date();

            // ═══════════════════════════════════════════════════════════════
            // 사주 프롬프트 캐싱 구조:
            // - 시스템 프롬프트 (캐시됨, 90% 비용 절감): 규칙, 스타일, JSON 스키마
            // - 유저 메시지 (동적): 프로필, 날짜, 사주 유형
            // ═══════════════════════════════════════════════════════════════

            // 시스템 프롬프트 (캐시 대상 - promptCache.js에서 관리)
            const fortuneSystemPrompt = getFortuneSystemPrompt(tier);

            // 유저 메시지 (동적 데이터만)
            const fortuneUserMessage = `${profileBlock}

## 🚨 현재 연도 정보 (만세력 계산 필수!)
⚠️ 현재 연도: ${currentYear}년 (${todayFull.toISOString().split('T')[0]})
⚠️ 오늘 날짜: ${todayFull.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
⚠️ 올해 = ${currentYear}년, 내년 = ${nextYear}년 (절대 혼동 금지!)
- "내년", "내년 운세", "내년 상반기" 등은 모두 ${nextYear}년을 의미합니다

## 사주 유형
"${selectedFortune.name}"

⚠️ ${currentYear}년 기준으로 올해의 천간/지지, 대운, 세운을 계산해주세요.`;

            // 캐싱 적용 API 호출 (90% 비용 절감)
            const data = await callClaudeApi(fortuneSystemPrompt, fortuneUserMessage, 8000);
            console.log('🎯 Fortune API Response - jenny:', data.jenny); // 디버깅용

            // 프로필 기반 인물 설명 생성 (사주)
            const getFortunePersonDesc = () => {
                if (!userProfile || !userProfile.gender) return 'a person';
                const gender = userProfile.gender === 'female' ? 'young woman' : userProfile.gender === 'male' ? 'young man' : 'person';
                return gender;
            };
            const fortunePersonDesc = getFortunePersonDesc();

            // Claude가 선택한 스튜디오 스타일과 색상 팔레트 (없으면 기본값)
            const studioStyle = data.studioStyle || 'random';
            const colorPalette = data.colorPalette || '';
            console.log(`🎨 Fortune Style: studio=${studioStyle}, Colors: ${colorPalette || 'default'}`);

            // 이미지 생성
            setAnalysisPhase(5);
            setProgress('🌌 오늘의 사주가 그려지고 있어요...');

            // 사주 heroImage - Claude 생성 프롬프트 그대로 사용 (스타일 일관성 유지)
            // 성별 정보는 프롬프트 뒤에 추가하여 스타일 prefix가 우선 적용되도록 함
            const fortuneHeroBasePrompt = data.images.hero || 'gazing at the stars and cosmic energy, surrounded by zodiac symbols and mystical light. Fortune-telling atmosphere, cinematic composition';
            const fortuneHeroPrompt = userProfile?.gender
                ? `${fortuneHeroBasePrompt}. The person is ${fortunePersonDesc}.`
                : fortuneHeroBasePrompt;
            const heroImage = await generateSingleImage(fortuneHeroPrompt, studioStyle, '', 'fortune', colorPalette);
            await new Promise(r => setTimeout(r, 400));

            // 섹션별 이미지 생성 (section1/2/3 구조)
            const section1Category = data.sections?.section1?.category || '첫 번째 운';
            setProgress(`${data.sections?.section1?.icon || '✨'} ${section1Category} 이미지 생성 중...`);
            const section1Image = await generateSingleImage(data.images.section1, studioStyle, '', 'fortune', colorPalette);
            await new Promise(r => setTimeout(r, 500));

            const section2Category = data.sections?.section2?.category || '두 번째 운';
            setProgress(`${data.sections?.section2?.icon || '💫'} ${section2Category} 이미지 생성 중...`);
            const section2Image = await generateSingleImage(data.images.section2, studioStyle, '', 'fortune', colorPalette);
            await new Promise(r => setTimeout(r, 500));

            const section3Category = data.sections?.section3?.category || '세 번째 운';
            setProgress(`${data.sections?.section3?.icon || '🌟'} ${section3Category} 이미지 생성 중...`);
            const section3Image = await generateSingleImage(data.images.section3, studioStyle, '', 'fortune', colorPalette);

            setProgress('✨ 오늘의 사주가 완성되었어요');

            const fortuneResultData = {
                ...data,
                fortuneType,
                typeName: selectedFortune.name,
                typeEmoji: selectedFortune.emoji,
                heroImage,
                section1Image,
                section2Image,
                section3Image,
                type: 'fortune'
            };

            setProgress('');
            setAnalysisPhase(0);

            // 자동 저장
            if (user && onSaveFortune) {
                setTimeout(async () => {
                    const savedId = await onSaveFortune(fortuneResultData, true);
                    if (savedId) {
                        setSavedDreamField?.('id', savedId);
                        setSavedDreamField?.('isPublic', true);
                        setToast('live', { type: 'save', message: '사주가 저장되었어요!' });
                        setTimeout(() => setToast('live', null), 3000);
                    }
                }, 500);
            }

            return fortuneResultData;

        } catch (err) {
            console.error('사주 생성 실패:', err);
            setError('사주 생성에 실패했습니다.');
            return null;
        } finally {
            setLoading(false);
        }
    }, [user, generateSingleImage, onSaveFortune, setToast, setDopaminePopup, setSavedDreamField]);

    return {
        // 상태
        loading,
        error,
        progress,
        analysisPhase,
        imageProgress, // 이미지 생성 진행률 { current, total }
        // 실시간 스트리밍 데이터 (AnalysisOverlay용)
        streamingData,
        isImagesReady,
        // 티어 정보
        isPremium,
        modelConfig,
        // 함수
        generateDreamReading,
        generateTarotReading,
        generateFortuneReading,
        // 상태 리셋
        clearError: () => setError(''),
        clearProgress: () => setProgress(''),
        resetStreamingData: () => {
            setStreamingData({ topics: null, keywords: null, title: null, verdict: null, hook: null, foreshadow: null });
            setIsImagesReady(false);
        }
    };
};
