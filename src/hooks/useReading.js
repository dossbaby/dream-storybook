import { useState, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { runAnalysisAnimation, getApiKeys, getDreamMessages, getTarotMessages, getFortuneMessages } from '../utils/analysisHelpers';
import { useImageGeneration } from './useImageGeneration';

/**
 * 통합 리딩 생성 훅
 * 꿈 해몽, 타로, 운세 생성을 단일 훅으로 통합
 */
export const useReading = ({
    user,
    dreamTypes,
    onSaveDream,
    onSaveTarot,
    onSaveFortune,
    onNewDreamType,
    setToast,
    setDopaminePopup
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState('');
    const [analysisPhase, setAnalysisPhase] = useState(0);

    const { generateSingleImage } = useImageGeneration();

    // Claude API 호출 공통 함수
    const callClaudeApi = async (prompt, maxTokens = 1500) => {
        const apiKeys = getApiKeys();
        if (!apiKeys) throw new Error('API 키 설정 필요');

        const anthropic = new Anthropic({
            apiKey: apiKeys.claudeApiKey,
            dangerouslyAllowBrowser: true
        });

        const result = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: maxTokens,
            messages: [{ role: "user", content: prompt }]
        });

        let cleanText = result.content[0].text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
        return JSON.parse(cleanText);
    };

    // 심층 분석 생성 (꿈 전용)
    const generateDetailedAnalysis = async (data, originalDream) => {
        try {
            const apiKeys = getApiKeys();
            const client = new Anthropic({
                apiKey: apiKeys.claudeApiKey,
                dangerouslyAllowBrowser: true
            });

            const response = await client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: `당신은 30년 경력의 꿈 해몽가이자 에세이스트입니다. 친구에게 편하게 이야기하듯 꿈을 풀이해주세요.

꿈: "${originalDream}"
유형: ${data.dreamType}
핵심: ${data.title}
한줄: ${data.verdict}
상징: ${data.keywords?.map(k => k.word).join(', ')}

## 작성 규칙
- 2000자 이상 작성
- **굵은 글씨**, 번호 매기기(1. 2. 3.), 글머리 기호(-) 절대 사용 금지
- 에세이처럼 자연스러운 문단으로만 구성
- 각 섹션은 "## 이모지 제목" 형식으로만 구분
- 문체: 친근하고 따뜻하게, 때론 시적으로

## 섹션 구성
## 🌙 이 꿈을 처음 봤을 때
(첫인상, 분위기 묘사를 서정적으로)

## 🔮 꿈속 상징들이 말하는 것
(각 상징의 의미를 이야기체로 풀어서)

## 💭 당신의 마음이 보내는 신호
(무의식이 전하려는 메시지를 부드럽게)

## 🌊 흐르는 감정의 물결
(꿈에서 느꼈을 감정과 현실의 연결)

## ✨ 내일을 위한 작은 속삭임
(실천 가능한 조언을 자연스럽게)

## 🌟 마지막으로
(따뜻한 응원의 말)`
                }]
            });
            return response.content[0].text;
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
            setAnalysisPhase(4);
            setProgress('꿈을 읽는 중...');

            const existingTypes = Object.keys(dreamTypes).join('/');
            const analysisPrompt = `너는 30년 경력의 무속인이자 융 심리학 전문가다.
꿈을 보면 그 사람이 최근 겪고 있는 일, 숨기고 있는 감정, 본인도 모르는 욕망이 다 보인다.

## 핵심 원칙
1. 구체적으로 추측해라.
2. 꿈의 디테일을 절대 무시하지 마.
3. 표면적 해석은 짧게, 진짜 의미는 소름끼칠 정도로 깊게.
4. 마지막엔 반드시 행동 지침을 줘.

## 꿈 유형
기존 유형: ${existingTypes}
만약 이 꿈이 기존 유형에 딱 맞지 않는 독특한 꿈이라면, 새로운 유형을 만들어도 좋아.
새 유형을 만들 경우 newDreamType 필드를 채워줘.

꿈 내용: "${dreamDescription}"

JSON만 반환:
{
  "title": "제목 (4-8글자)",
  "verdict": "핵심 한마디 (20자 이내)",
  "dreamType": "기존 유형 key 또는 새로운 유형 key (영어 소문자)",
  "newDreamType": null 또는 {"name": "한글 이름", "emoji": "이모지", "desc": "설명 20자", "color": "#hex색상"},
  "rarity": "0.1~5.0 사이 숫자",
  "keywords": [{"word": "명사형 키워드 (2-4글자, 예: 하늘, 물, 추락, 엄마, 바다)", "surface": "표면적 의미", "hidden": "숨겨진 의미"}],
  "reading": {"situation": "상황 (50자)", "unconscious": "무의식 (60자)", "warning": "경고 (40자)", "action": "행동 (30자)"},
  "tarot": {"name": "타로 카드 이름 (영어)", "meaning": "의미 (40자)"},
  "dreamMeaning": {"summary": "핵심 의미 (80자)", "detail": "상세 해석 (150자)", "future": "미래 (50자)"},
  "shareText": "공유용 한 줄 (30자)",
  "images": {"character": "캐릭터 외모 (영어 40단어)", "dream": "꿈 장면 (영어 40단어)", "tarot": "타로 장면 (영어 40단어)", "meaning": "의미 장면 (영어 40단어)"}
}
keywords는 꿈에서 핵심 상징물 3개. 반드시 명사형으로 (예: 비행, 추락, 물, 불, 죽음, 엄마, 집, 학교). 문장이 아닌 단어만!`;

            const data = await callClaudeApi(analysisPrompt, 1500);

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
            setProgress('🎨 당신의 꿈이 그림으로 피어나고 있어요...');

            const detailedAnalysisPromise = generateDetailedAnalysis(data, dreamDescription);
            const characterDesc = data.images.character;

            const dreamImage = await generateSingleImage(data.images.dream, 'dream', characterDesc);
            await new Promise(r => setTimeout(r, 500));

            setProgress('🃏 우주의 카드가 펼쳐지고 있어요...');
            const tarotImage = await generateSingleImage(data.images.tarot, 'dream', characterDesc);
            await new Promise(r => setTimeout(r, 500));

            setProgress('✨ 꿈 속 비밀이 드러나고 있어요...');
            const meaningImage = await generateSingleImage(data.images.meaning, 'dream', characterDesc);

            const detailedAnalysis = await detailedAnalysisPromise;

            setProgress('🌙 당신만의 꿈 해몽이 완성되었어요');

            const resultData = {
                ...data,
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
                    const savedId = await onSaveDream(resultData, false, selectedDreamDate);
                    if (savedId) {
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
    }, [user, dreamTypes, generateSingleImage, onSaveDream, onNewDreamType, setToast, setDopaminePopup]);

    // 타로 리딩 생성
    const generateTarotReading = useCallback(async (question, selectedCards) => {
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
        setAnalysisPhase(1);
        setProgress('카드가 당신을 읽고 있어요...');

        const [past, present, future] = selectedCards;

        await runAnalysisAnimation(
            getTarotMessages(question, past, present, future),
            setAnalysisPhase, setProgress, null, setDopaminePopup
        );

        try {
            setAnalysisPhase(4);
            setProgress('카드를 해석하는 중...');

            const tarotPrompt = `너는 30년 경력의 신비로운 타로 마스터다.
카드를 보면 그 사람의 과거, 현재, 미래가 다 보인다.

## 핵심 원칙
1. 구체적으로 해석해라.
2. 카드의 상징을 절대 무시하지 마.
3. 표면적 해석은 짧게, 진짜 의미는 소름끼칠 정도로 깊게.
4. 마지막엔 반드시 행동 지침을 줘.

질문: "${question}"

선택된 카드:
1. 과거 - ${past.nameKo} (${past.name}): ${past.meaning}
2. 현재 - ${present.nameKo} (${present.name}): ${present.meaning}
3. 미래 - ${future.nameKo} (${future.name}): ${future.meaning}

JSON만 반환:
{
  "title": "제목 (4-8글자)",
  "verdict": "핵심 한마디 (20자 이내)",
  "rarity": "0.1~5.0 사이 숫자 (카드 조합의 희귀도)",
  "keywords": [{"word": "핵심 키워드", "surface": "표면적 의미", "hidden": "숨겨진 의미"}],
  "reading": {"past": "과거 해석 (80자)", "present": "현재 해석 (80자)", "future": "미래 해석 (80자)", "action": "행동 지침 (50자)"},
  "cardMeaning": {"summary": "핵심 의미 (100자)", "detail": "상세 해석 (200자)", "advice": "조언 (80자)"},
  "shareText": "공유용 한 줄 (30자)",
  "images": {"past": "과거 카드 장면 - ${past.name} 카드의 신비로운 장면 (영어 40단어)", "present": "현재 카드 장면 - ${present.name} 카드의 신비로운 장면 (영어 40단어)", "future": "미래 카드 장면 - ${future.name} 카드의 신비로운 장면 (영어 40단어)"},
  "luckyElements": {"color": "행운의 색", "number": "행운의 숫자", "day": "행운의 요일"}
}
keywords는 이 리딩의 핵심 상징 3개.`;

            const data = await callClaudeApi(tarotPrompt, 2000);

            // 이미지 생성
            setAnalysisPhase(5);
            setProgress('🎨 카드가 그림으로 피어나고 있어요...');

            const pastImage = await generateSingleImage(data.images.past, 'tarot');
            await new Promise(r => setTimeout(r, 500));

            setProgress('🃏 현재의 카드가 펼쳐지고 있어요...');
            const presentImage = await generateSingleImage(data.images.present, 'tarot');
            await new Promise(r => setTimeout(r, 500));

            setProgress('✨ 미래가 드러나고 있어요...');
            const futureImage = await generateSingleImage(data.images.future, 'tarot');

            setProgress('🌙 당신의 타로 리딩이 완성되었어요');

            const tarotResultData = {
                ...data,
                cards: selectedCards,
                pastImage,
                presentImage,
                futureImage,
                question,
                type: 'tarot'
            };

            setProgress('');
            setAnalysisPhase(0);

            // 자동 저장
            if (user && onSaveTarot) {
                setTimeout(async () => {
                    const savedId = await onSaveTarot(tarotResultData, false);
                    if (savedId) {
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
    }, [user, generateSingleImage, onSaveTarot, setToast, setDopaminePopup]);

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
            setAnalysisPhase(4);
            setProgress('운세를 해석하는 중...');

            const fortunePrompt = `너는 30년 경력의 운세 전문가다.
동양 철학과 서양 점성술을 융합해 운세를 본다.

## 핵심 원칙
1. 구체적으로 예측해라.
2. 시간대별로 세분화해라.
3. 실천 가능한 조언을 줘.

오늘 날짜: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
운세 유형: ${selectedFortune.name}

JSON만 반환:
{
  "title": "제목 (4-8글자)",
  "verdict": "핵심 한마디 (20자 이내)",
  "rarity": "0.1~5.0 사이 숫자 (오늘 운의 희귀도)",
  "score": "1-100 사이 숫자 (종합 운세 점수)",
  "keywords": [{"word": "핵심 키워드", "surface": "표면적 의미", "hidden": "숨겨진 의미"}],
  "reading": {"morning": "아침 운세 (80자)", "afternoon": "오후 운세 (80자)", "evening": "저녁 운세 (80자)", "action": "행동 지침 (50자)"},
  "fortuneMeaning": {"summary": "핵심 의미 (100자)", "detail": "상세 해석 (200자)", "advice": "조언 (80자)"},
  "shareText": "공유용 한 줄 (30자)",
  "images": {"morning": "아침 장면 - 희망적이고 신선한 아침 풍경 (영어 40단어)", "afternoon": "오후 장면 - 활기차고 역동적인 장면 (영어 40단어)", "evening": "저녁 장면 - 평화롭고 성찰적인 저녁 (영어 40단어)"},
  "luckyElements": {"color": "행운의 색", "number": "행운의 숫자", "direction": "행운의 방향"}
}
keywords는 오늘 운세의 핵심 상징 3개.`;

            const data = await callClaudeApi(fortunePrompt, 2000);

            // 이미지 생성
            setAnalysisPhase(5);
            setProgress('🌅 아침의 기운이 그려지고 있어요...');

            const morningImage = await generateSingleImage(data.images.morning, 'fortune');
            await new Promise(r => setTimeout(r, 500));

            setProgress('☀️ 오후의 에너지가 펼쳐지고 있어요...');
            const afternoonImage = await generateSingleImage(data.images.afternoon, 'fortune');
            await new Promise(r => setTimeout(r, 500));

            setProgress('🌙 저녁의 평화가 드러나고 있어요...');
            const eveningImage = await generateSingleImage(data.images.evening, 'fortune');

            setProgress('✨ 오늘의 운세가 완성되었어요');

            const fortuneResultData = {
                ...data,
                fortuneType,
                typeName: selectedFortune.name,
                typeEmoji: selectedFortune.emoji,
                morningImage,
                afternoonImage,
                eveningImage,
                type: 'fortune'
            };

            setProgress('');
            setAnalysisPhase(0);

            // 자동 저장
            if (user && onSaveFortune) {
                setTimeout(async () => {
                    const savedId = await onSaveFortune(fortuneResultData, false);
                    if (savedId) {
                        setToast('live', { type: 'save', message: '운세가 저장되었어요!' });
                        setTimeout(() => setToast('live', null), 3000);
                    }
                }, 500);
            }

            return fortuneResultData;

        } catch (err) {
            console.error('운세 생성 실패:', err);
            setError('운세 생성에 실패했습니다.');
            return null;
        } finally {
            setLoading(false);
        }
    }, [user, generateSingleImage, onSaveFortune, setToast, setDopaminePopup]);

    return {
        // 상태
        loading,
        error,
        progress,
        analysisPhase,
        // 함수
        generateDreamReading,
        generateTarotReading,
        generateFortuneReading,
        // 상태 리셋
        clearError: () => setError(''),
        clearProgress: () => setProgress('')
    };
};
