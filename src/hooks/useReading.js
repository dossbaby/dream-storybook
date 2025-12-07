import { useState, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { runAnalysisAnimation, getApiKeys, getDreamMessages, getTarotMessages, getFortuneMessages } from '../utils/analysisHelpers';
import { DOPAMINE_HINTS } from '../utils/constants';
import { useImageGeneration } from './useImageGeneration';
import { getModelConfig, AI_MODELS, getContentLength } from '../utils/aiConfig';
import {
    DETAILED_ANALYSIS_SYSTEM_PROMPT,
    callClaudeWithCache
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

// 나이 계산 함수
const calculateAge = (birthDate) => {
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
const buildProfileBlock = (userProfile, readingType) => {
    if (!userProfile || Object.keys(userProfile).length === 0) {
        return `
## 호칭 규칙
- 프로필 정보 없음 → "당신" 사용
`;
    }

    const fullName = userProfile.name || null;
    const firstName = getFirstName(fullName);  // 성 제외한 이름
    const birthDate = userProfile.birthDate || null;
    const birthTime = userProfile.birthTime || null;
    const gender = userProfile.gender || null;
    const mbti = userProfile.mbti || null;
    const zodiac = getZodiacSign(birthDate);
    const age = calculateAge(birthDate);

    // 프로필 정보가 하나도 없으면 기본 호칭
    if (!fullName && !birthDate && !gender && !mbti) {
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
- 별자리/MBTI/나이는 전체 리딩에서 1-2번만 자연스럽게 언급 (매 카드마다 반복 금지!)
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

    const { generateSingleImage } = useImageGeneration(tier);

    // 도파민 팝업 표시 헬퍼 (긴 작업 중 랜덤 표시)
    const showRandomDopamine = useCallback(() => {
        if (setDopaminePopup) {
            const randomHint = DOPAMINE_HINTS[Math.floor(Math.random() * DOPAMINE_HINTS.length)];
            setDopaminePopup(randomHint);
            setTimeout(() => setDopaminePopup(null), 2500);
        }
    }, [setDopaminePopup]);

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
            const profileBlock = buildProfileBlock(userProfile, 'dream');

            // 티어별 글자 수 설정
            const dreamSummaryLen = getContentLength('dream', 'summary', tier);
            const dreamDetailLen = getContentLength('dream', 'detail', tier);
            const dreamHiddenLen = getContentLength('dream', 'hiddenInsight', tier);

            // MrBeast + Jenny Hoyos 텍스트 도파민 기반 꿈 해몽 프롬프트
            const analysisPrompt = `너는 30년 경력의 무속인이자 융 심리학 전문가다.
꿈을 보면 그 사람이 최근 겪고 있는 일, 숨기고 있는 감정, 본인도 모르는 욕망이 다 보인다.
${profileBlock}

## MrBeast 원칙 → 텍스트 도파민 구조 (이름 '지연' 예시)
| 단계 | 역할 | 원칙 |
|------|------|------|
| Hook | 핵심 의미 먼저 + 반전 | "지연님, 물에 빠지는 꿈? 나쁜 꿈 아니에요. 오히려 지금 지연님한테 필요한 신호예요." |
| Foreshadow | 못 보면 잠 못 잠 | 숨겨진 무의식의 메시지 암시 |
| Keywords | 5-7문장씩 (기존 대비 3배) | 상황 → 감정 → 숨은 맥락 |
| Bonus | 질문 이상의 가치 | 꿈이 알려주는 실제 행동 |
| Hidden | 4-6문장 마지막 선물 | 구체적 디테일 (시기, 상황, 숨겨진 감정) |

⚠️ 위 예시처럼 "당신" 대신 반드시 프로필의 이름을 사용! "당신" 절대 금지!

## 🚨 개인화 정보 사용 규칙 (필수!)
프로필 정보(이름, MBTI, 별자리, 나이 등)는 **전체 리딩에서 1-2번만** 사용!
- ❌ 잘못된 예: hook에 이름, 각 keyword마다 MBTI... → 난발 = 역효과
- ✅ 올바른 예: 가장 임팩트 있는 순간(결론이나 hidden insight)에 1-2번만 → 감동
- 이름은 자연스럽게 1-2번 사용, MBTI/별자리/나이는 정말 관련 있을 때만 딱 1번

## 핵심 원칙
1. Hook에서 핵심 의미 먼저 + 반전으로 시작 ("OO님, 무서운 꿈이죠? 근데 좋은 꿈이에요.")
2. 각 상징 해석은 5-7문장 (표면 의미 → 숨겨진 의미 → 미처 몰랐던 것)
3. 문장 끝에서 반전 ("도망치는 거죠? 근데 진짜 도망치고 싶은 건 그게 아니에요")
4. 구체적 디테일이 도파민 ("이번 달 안에 뭔가 있어요", "주변에 ㅇ 들어가는 이름 있어요?")
5. 심리 분석: 꿈 뒤 숨은 진짜 심리를 짚어라 ("이 꿈을 굳이 물어보신 건... 이미 답을 알면서 확인받고 싶은 거죠")

## 꿈 유형 - 매우 중요!!!
기존 유형: ${existingTypesList}

⚠️ 반드시 기존 유형 중 하나를 선택해! 새로운 유형은 정말 기존 유형 중 어떤 것도 맞지 않을 때만 만들어.
- 무언가를 찾거나 탐험하는 꿈 → seeker(탐색자)
- 누군가를 보호하거나 지키는 꿈 → guardian(수호자)
- 자유롭게 떠도는 꿈 → wanderer(방랑자)
- 아픔이나 치유와 관련된 꿈 → healer(치유자)
- 예지몽이나 상징적 메시지 → prophet(예언자)
- 어둠이나 두려움과 관련된 꿈 → shadow(그림자)

newDreamType은 null로 설정하고, dreamType에 기존 유형 key를 넣어.

꿈 내용: "${dreamDescription}"

JSON만 반환:
{
  "title": "제목 (4-8글자)",
  "verdict": "핵심 한마디 (20자 이내)",
  "affirmation": "오늘의 확언 (나는 ~한다 형식, 15자 이내)",
  "dreamType": "기존 유형 key (영어 소문자)",
  "newDreamType": null,

  "jenny": {
    "hook": "⚠️프로필 이름 사용 필수! 핵심 의미 먼저 + 반전. 매번 완전히 다른 시작! (다양한 예: '결론부터요, OO님' / 'OO님, 이 꿈 좋은 꿈이에요' / '잠깐, 이건 그냥 꿈이 아니에요' / 'OO님 지금 뭔가 놓치고 있어요' / '먼저 말씀드릴게요' 등 - 예시 그대로 쓰지 말고 창의적으로!)",
    "foreshadow": "⚠️프로필 이름 사용! 궁금증 유발 멘트 - 매번 새롭게! (참고: 끝까지 보면 진짜 메시지 드러남 / 마지막에 중요한 게 있음 / 스크롤 내리면 숨겨진 의미 등 - 본인만의 표현으로)",
    "situationTransition": "다음 내용 궁금증 유발 - 매번 다른 표현! (참고: 여기서 끝 아님 / 더 있음 / 중요한 게 남음 등 느낌으로 창의적 변형)",
    "unconsciousTransition": "마지막 선물 암시 - 매번 새로운 말투! (참고: 깊이 들어가면 / 원래 안 말하려던 건데 / 비밀인데 / 더 있어요 등 느낌으로 자유롭게)",
    "bonus": "⚠️프로필 이름 사용! 질문 이상의 가치 - 매번 창의적으로! (참고: 안 물어봤는데 / 덤으로 / 이건 서비스 / 하나 더 등 느낌)",
    "twist": {
      "emoji": "🌙",
      "title": "숨겨진 메시지",
      "message": "반전 메시지 (80자) - 표면과 다른 진짜 의미. 문장 끝 반전 필수. 소름끼치는 인사이트. 매번 새로운 통찰!"
    },
    "hiddenInsight": "⚠️프로필 이름으로 호칭! \${dreamHiddenLen}자 이상 봉인 해제 메시지. 매번 완전히 다른 인사이트와 표현! 구조: 의외의 시작 → 꿈이 말하는 것 → 지금 상황 연결 → 구체적 예언/조언 → 기억할 것. 예시 문장 절대 복사 금지!",
    "shareHook": "공유 유도 - 매번 다르게! (참고: 소름/신기/대박이면 공유 / 친구한테 보여줘 등 느낌)",
    "rewatchHook": "재방문 유도 - 매번 새롭게! (참고: 내일 다시 보면 / 일주일 후에 / 기억해뒀다가 등 느낌)"
  },

  "rarity": {
    "percent": "희귀도 숫자 (0.1~5.0)",
    "outOf": 1000,
    "description": "희귀도 설명"
  },

  "keywords": [
    {"word": "질문 '${dreamDescription}'에서 추출한 주제 키워드 (명사형, 2-4글자)", "surface": "표면적 의미 (50자)", "hidden": "5-7문장 숨겨진 의미 (300자 이상). 1) 이 상징이 보여주는 것 2) 질문자가 느끼고 있을 감정 3) 숨겨진 맥락 4) 왜 이 상징이 나왔는지 5) 미처 생각 못한 부분. But-Therefore 구조."},
    {"word": "질문에서 추출한 핵심 키워드1 (명사형, 2-4글자)", "surface": "표면적 의미 (50자)", "hidden": "5-7문장 숨겨진 의미 (300자 이상). 첫 상징과 연결. '근데' 반전 포함."},
    {"word": "질문에서 추출한 핵심 키워드2 (명사형, 2-4글자)", "surface": "표면적 의미 (50자)", "hidden": "5-7문장 숨겨진 의미 (300자 이상). 앞의 흐름이 어디로 향하는지. 구체적 시기/상황 힌트."}
  ],

  "reading": {
    "situation": "5-7문장 상황 해석 (300자 이상) - jenny.hook 느낌으로 시작. 현재 상황/배경 → 감정 짚기 → 숨겨진 맥락 → 미처 몰랐던 것",
    "unconscious": "5-7문장 무의식 해석 (300자 이상) - But-Therefore 구조. '~처럼 보이지만, 사실은...' 예상과 다른 요소 → 숨겨진 면 → 모르던 정보",
    "warning": "경고/주의 (100자) - 구체적 시기/상황 포함",
    "action": "행동 지침 (100자) - 구체적이고 실천 가능하게"
  },

  "tarot": {"name": "타로 카드 이름 (영어)", "meaning": "의미 (40자)"},

  "dreamMeaning": {
    "summary": "핵심 의미 (\${dreamSummaryLen}자) - jenny.twist 반영. 확정 답 + Twist",
    "detail": "상세 해석 (\${dreamDetailLen}자 이상) - 스토리텔링으로 풀어서. But-Therefore 구조",
    "future": "미래 암시 (150자) - 이 꿈이 예고하는 것. 구체적 시기/상황"
  },

  "shareText": "공유용 한 줄 (30자) - 구체적 디테일로 공유하고 싶게",

  "imageStyle": "꿈 분위기에 맞는 애니메 스타일 키 (다음 중 하나 선택): shinkai(로맨틱/몽환/황금빛석양), kyoani(감성적/섬세/파스텔), ghibli(따뜻한/마법적/향수), mappa_dark(다크/그릿티/성숙-악몽/공포), mappa_action(역동적/강렬한액션), ufotable(화려한이펙트/CGI블렌드), trigger(네온/대담한기하학), sciencesaru(실험적/컬러워시), shojo(우아/스파클/로맨틱), webtoon(클린/디지털/에픽), cgi_gem(보석/반짝임/환상), minimalist(깔끔/여백/절제). 무서운/악몽은 mappa_dark, 평화로운 꿈은 ghibli/kyoani, 신비로운 꿈은 sciencesaru/cgi_gem 추천",

  "images": {
    "hero": "꿈을 꾼 사람의 심리와 감정을 시각화한 신비로운 장면. 꿈 내용에서 느껴지는 핵심 감정(두려움, 희망, 혼란, 그리움 등)을 추상적이고 감성적으로 표현. (스타일 prefix 없이 장면만 영어 50단어)",
    "character": "캐릭터 외모 (영어 40단어)",
    "dream": "꿈 장면 (스타일 prefix 없이 장면만 영어 40단어)",
    "tarot": "타로 장면 (스타일 prefix 없이 장면만 영어 40단어)",
    "meaning": "의미 장면 (스타일 prefix 없이 장면만 영어 40단어)"
  }
}

⚠️ keywords 규칙: 질문 "${dreamDescription}"에서 직접 추출!
- 주제 키워드 1개: 질문의 핵심 테마 (명사형, 2-4글자)
- 핵심 키워드 2개: 질문에 등장한 주요 상징/개념 (명사형, 2-4글자)
- 반드시 명사형! 문장 금지!`;

            // 캐싱 미적용 (프롬프트 구조가 복잡하여 분리 어려움)
            // 추후 프롬프트 리팩터링 시 캐싱 적용 가능
            const data = await callClaudeApi(null, analysisPrompt, 3000);
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

            // Claude가 선택한 이미지 스타일 (없으면 기본값)
            const imageStyle = data.imageStyle || 'shinkai';
            console.log(`🎨 Dream Image Style: ${imageStyle}`);

            // 프로필 기반 인물 설명 생성 (꿈)
            const getDreamPersonDesc = () => {
                if (!userProfile || !userProfile.gender) return 'a dreamer';
                const gender = userProfile.gender === 'female' ? 'young woman' : userProfile.gender === 'male' ? 'young man' : 'person';
                return gender;
            };
            const dreamPersonDesc = getDreamPersonDesc();

            // 히어로 이미지 (프로필이 있으면 인물 중심, 없으면 기존 프롬프트) - dreamImage와 별도
            // dreamPersonDesc는 프로필 정보 유지, 색상은 Claude가 자유롭게 결정
            const dreamHeroPrompt = userProfile?.gender
                ? `${dreamPersonDesc} in a surreal dreamscape, surrounded by symbolic dream imagery. Ethereal mist and soft moonlight. Subconscious emotions visualized as floating elements around them. Mystical atmosphere, cinematic composition`
                : data.images.hero;
            const heroImage = await generateSingleImage(dreamHeroPrompt, imageStyle, characterDesc, 'dream');
            await new Promise(r => setTimeout(r, 500));

            setProgress('🎨 당신의 꿈이 그림으로 피어나고 있어요...');
            const dreamImage = await generateSingleImage(data.images.dream, imageStyle, characterDesc, 'dream');
            await new Promise(r => setTimeout(r, 500));

            setProgress('🃏 우주의 카드가 펼쳐지고 있어요...');
            const tarotImage = await generateSingleImage(data.images.tarot, imageStyle, characterDesc, 'dream');
            await new Promise(r => setTimeout(r, 500));

            setProgress('✨ 꿈 속 비밀이 드러나고 있어요...');
            const meaningImage = await generateSingleImage(data.images.meaning, imageStyle, characterDesc, 'dream');

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

        const [card1, card2, card3] = selectedCards;

        await runAnalysisAnimation(
            getTarotMessages(question),
            setAnalysisPhase, setProgress, null, null  // 초반에는 도파민 팝업 안 띄움
        );

        // interval 변수들을 try 밖에 선언 (에러 시 정리 위해)
        let dopamineInterval = null;
        let imageInterval = null;

        try {
            // 6단계: API 호출 단계 (5개의 애니메이션 메시지 이후)
            setAnalysisPhase(6);
            setProgress('운명의 이야기를 엮는 중...');

            // API 호출 중 도파민 팝업 (긴 작업이므로 여러 번 표시)
            showRandomDopamine();
            dopamineInterval = setInterval(() => {
                showRandomDopamine();
            }, 8000); // 8초마다 새로운 힌트

            // 78장 덱에서 4번째 결론 카드 랜덤 선택 (선택된 3장 제외)
            const { TAROT_DECK } = await import('../utils/constants');
            const remainingCards = TAROT_DECK.filter(c => !selectedCards.find(s => s.id === c.id));
            const conclusionCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];

            // 프로필 정보 블록 생성
            const profileBlock = buildProfileBlock(userProfile, 'tarot');

            // 티어별 글자 수 설정
            const tarotCardLen = getContentLength('tarot', 'cardAnalysis', tier);
            const tarotConclusionLen = getContentLength('tarot', 'conclusion', tier);
            const tarotHiddenLen = getContentLength('tarot', 'hiddenInsight', tier);

            // MrBeast + Jenny Hoyos 텍스트 도파민 기반 프롬프트 (dopamine-prompt-guide.md 완전 반영)
            const tarotPrompt = `너는 30년 경력의 신비로운 타로 마스터다. 카드 리딩을 할 때 단순한 해석이 아니라 그 사람의 인생 이야기를 들려주듯이 깊고 감동적으로 풀어낸다.
${profileBlock}

###### 🚨🚨🚨 최우선 규칙: 카드 분석 길이 🚨🚨🚨
각 카드 분석(card1Analysis, card2Analysis, card3Analysis)은 반드시:
- 최소 ${tarotCardLen}자 이상
- 6개 섹션 모두 포함: 상황/배경 → 감정 → 숨은 맥락 → 원인 → 미처 몰랐던 것 → 반전/디테일

conclusionCard는 반드시:
- 최소 ${tarotConclusionLen}자 이상
- 확실한 답 + 예상 밖 방식 + 감동적인 마무리

- 짧게 쓰면 실패로 간주됨

예시 길이 참고 (이름이 '수진'인 경우 - 반드시 이렇게 이름 사용!):
"수진님, 이 카드가 말하는 건요, 지금 수진님이 기다리고 있다는 거예요. 근데 그냥 기다리는 게 아니라, 뭔가 확신이 없어서 움직이지 못하고 있는 거예요. 매일 폰 확인하시잖아요. 혹시 연락 왔나. 그 마음 카드가 다 보고 있어요. 사실 수진님 마음속으로는 이미 답을 알고 계시잖아요. 근데 그게 맞는지 확인받고 싶은 거죠. 혼자 결정하기 무서운 거예요. 틀리면 어떡하나. 그 두려움이 발목 잡고 있어요. 이 상황이 생긴 이유가 있어요. 예전에 비슷한 상황에서 상처받은 적 있으시죠? 믿었는데 배신당했거나, 기대했는데 무너진 적. 그때 기억 때문에 지금 조심스러운 거예요. 카드가 그걸 보여주고 있어요. 근데 여기서 중요한 게 있어요. 수진님이 모르는 게 하나 있어요. 상대방도 같은 마음이에요. 그 사람도 확신이 없어서 기다리고 있어요. 서로 눈치만 보고 있는 거예요. 웃기죠? 둘 다 같은 마음인데. 이 카드는 그 답답한 상황을 정확히 보여주고 있어요. 수진님, 누군가 먼저 움직여야 해요."
⚠️ 위 예시처럼 "당신" 대신 반드시 프로필의 이름을 사용할 것!

## 🚨 개인화 정보 사용 규칙 (필수!)
프로필 정보(이름, MBTI, 별자리, 나이 등)는 **전체 리딩에서 1-2번만** 사용!
- ❌ 잘못된 예: hook에 이름, foreshadow에 MBTI, card1에 별자리, card2에 나이... → 난발 = 역효과
- ✅ 올바른 예: 가장 임팩트 있는 순간(결론이나 hidden insight)에 1-2번만 → 감동
- 이름은 자연스럽게 1-2번 사용 (예: "동석님, 이건 말 안 하려고 했는데...")
- MBTI/별자리/나이는 정말 관련 있을 때만 딱 1번 (예: "사자자리 특유의 자존심이...")

## MrBeast 원칙 → 텍스트 도파민 구조
| 단계 | 역할 | MrBeast 원칙 |
|------|------|--------------|
| Hook | 클릭 + 시청 동시 | First 5 seconds - 답 먼저 + 반전 |
| Foreshadow | 못 보면 잠 못 잠 | Curiosity spike - 내용으로만 궁금증 |
| Cards/Main | 질문에 답함 | Match expectations - But-Therefore 구조 |
| Bonus | 질문 이상의 가치 | EXCEED expectations - "이건 안 물어보셨는데..." |
| Hidden | 마지막 선물 | Payoff at the end - 구체적 디테일 (이름힌트, 시기, 상황) |

## ⚠️ 핵심 규칙 (반드시 준수!)
| 항목 | 원칙 | 적용 |
|------|------|------|
| Hook | 답 먼저 + 반전 | "만나요. 근데 그 사람이 아니에요." |
| Foreshadow | 카드 순서 프레임 제거 | "누군지 힌트가 나와요" (O) / "세 번째 카드에서" (X) |
| Card 1-3 | **\${tarotCardLen}자+** | 상황 → 감정 → 숨은 맥락 → 미처 몰랐던 것 → 심층 분석 |
| Conclusion | **\${tarotConclusionLen}자+** | 확실한 답 + Twist + 감동적 마무리 |
| Bonus | 기대 초과 | "이건 안 물어보셨는데..." |
| Hidden Insight | **\${tarotHiddenLen}자+, EXCEED + Payoff** | 타로만 봤는데 이것까지! 이름힌트, 시기, 구체적 행동 가이드 |
| 텍스트 도파민 | 문장 끝 반전, 구체적 디테일 | "이 사람 이름에 ㅇ 들어가요" |
| 심리 분석 | 질문 뒤 숨은 진짜 심리 | "이미 답 알면서 확인받고 싶은 거죠" |

## ❌ 절대 금지 사항
- Hook에서 희귀도/카드조합/숫자/통계 언급 금지 ("1000명 중 17명" 같은 표현 절대 금지!)
- Foreshadow에서 카드 순서 언급 금지 ("첫 번째 카드", "세 번째 카드", "네 번째 카드" 금지!)
- 짧은 분석 금지 - 카드 1,2,3은 반드시 \${tarotCardLen}자 이상! 결론은 \${tarotConclusionLen}자 이상!

## 질문 유형별 심리 분석 (질문자의 숨은 심리 파악)
- 연애/관계: '이 사람 맞아?' → 이미 답을 알면서 확인받고 싶은 마음
- 직장/커리어: '해도 될까?' → 실패 두려움과 도전 욕구의 충돌
- 결정/선택: 'A vs B' → 이미 기운 마음이 있음
- 금전/사업: '될까?' → 불안과 기대의 교차
- 이별/정리: '끝낼까?' → 아직 미련이 있는지 확인하려는 심리
- 타이밍: '언제?' → '지금은 안 되는 건가?' 하는 조급함
- 건강/에너지: '괜찮을까?' → 두려움 속 희망을 찾으려는 마음
- 미래/방향: '어떻게 될까?' → 불확실함에 대한 불안과 기대

## 텍스트 도파민 vs 영상 도파민
- 영상: 시각적 자극 (표정, 편집) → 텍스트: 구체적 디테일 (이름, 날짜, 상황)
- 영상: 시간이 흘러가며 긴장 → 텍스트: 문장 끝에서 반전
- 영상: BGM, 효과음 → 텍스트: '이건 말 안 하려고 했는데' 같은 문구
- 영상: 다음 장면 기대 → 텍스트: 다음 문장에 뭐가 있을지 기대

질문: "${question}"

선택된 카드:
1. ${card1.nameKo} (${card1.name}): ${card1.meaning}
2. ${card2.nameKo} (${card2.name}): ${card2.meaning}
3. ${card3.nameKo} (${card3.name}): ${card3.meaning}

결론 카드 (운명이 선물한 카드):
4. ${conclusionCard.nameKo} (${conclusionCard.name}): ${conclusionCard.meaning}

## JSON 형식으로만 반환:
{
  "title": "제목 (4-8글자)",
  "verdict": "핵심 메시지 (20자 이내)",
  "affirmation": "오늘의 확언 (나는 ~한다 형식, 15자 이내)",
  "topic": "주제 (연애/직장/금전/학업/건강/인간관계/미래/결정 중 하나)",

  "jenny": {
    "hook": "⚠️질문자가 '뭐야 이거?' 하고 멈출 수밖에 없는 첫 마디. 답 먼저 + 반전 구조. 군더더기 없이. ❌금지: 희귀도/카드조합/숫자 절대 금지! 🚨매번 완전히 다른 시작 필수! 예시는 참고만, 그대로 복사 금지! 느낌만 살려서 창의적으로: 연애→답/결과 먼저 + '근데' 반전 / 금전→방향 제시 + 예상 밖 루트 / 직장→결정 방향 + 숨은 이유 / 결정→답 + 의외의 전개. 시작어도 매번 다르게(OO님~/잠깐요~/먼저요~/글쎄요~ 등 다양하게)",
    "foreshadow": "⚠️Hook에서 던진 의외성을 안 보면 잠 못 잘 정도로 궁금하게. '뭔데?' '어떻게?' '왜?'를 자극. ❌금지: 카드 순서 언급 절대 금지! 🚨매번 새로운 표현! 예시 복사 금지! 느낌: 힌트 있음/이유 나옴/타이밍 보임/상대방 마음 보임 등 내용으로 궁금증 유발",
    "bonus": "⚠️질문에 답한 직후, '어? 이것까지?' 하는 순간. 예상 못한 정보가 툭 튀어나오는 텍스트 도파민. 🚨매번 완전히 다른 방식으로! 느낌: 안 물어봤는데/추가로/참고로/그리고 등 + 구체적 정보(시기/이름힌트/상황). 예시 문장 절대 복사 금지, 창의적으로!",
    "twist": {
      "emoji": "🔮",
      "title": "숨겨진 진실",
      "message": "반전 메시지 (80자) - 결론 카드에서 발견한 예상치 못한 인사이트. 문장 끝 반전 필수. 구체적 디테일 포함. 매번 새로운 통찰!"
    },
    "hiddenInsight": "🚨반드시 \${tarotHiddenLen}자 이상 작성! EXCEED expectations! 🚨매번 완전히 다른 도입/표현 필수! 예시 문장 절대 복사 금지! 구조만 참고: 1)의외의 도입 2-3문장(비밀/추가정보/느낌 등 다양한 시작) 2)핵심 정보 4-5문장(이름힌트/시기/상황/감정) 3)예상 못한 추가 4-5문장(질문 외 정보) 4)행동 가이드 3-4문장 5)기억할 것 2-3문장. 창의적 표현 필수!",
    "shareHook": "공유 유도 - 매번 다르게! (느낌: 드문 조합/신기하면/대박이면 공유 등)"
  },

  "rarity": {
    "percent": "희귀도 숫자 (0.1~5.0)",
    "outOf": 1000,
    "description": "희귀도 설명"
  },

  "keywords": [
    {"word": "질문 '${question}'에서 추출한 주제 키워드 (명사형, 2-4글자)", "surface": "표면 의미", "hidden": "숨은 의미"},
    {"word": "질문에서 추출한 핵심 키워드1 (명사형, 2-4글자)", "surface": "표면 의미", "hidden": "숨은 의미"},
    {"word": "질문에서 추출한 핵심 키워드2 (명사형, 2-4글자)", "surface": "표면 의미", "hidden": "숨은 의미"}
  ],

  "storyReading": {
    "opening": "도입부 (200자 이상) - jenny.hook을 자연스럽게 녹여서 시작. 질문 뒤 숨은 심리 짚기. 🚨매번 완전히 다른 도입! 예시 복사 금지! 느낌: 질문자 심리 읽기 + 공감 + 답을 알려주겠다는 암시. 창의적으로!",
    "card1Analysis": "🚨반드시 \${tarotCardLen}자 이상 작성! 이것보다 짧으면 실패! 구조: 1)현재 상황/배경 4-5문장 2)질문자 감정 3-4문장 3)숨겨진 맥락 4-5문장 4)원인 분석 3-4문장 5)미처 몰랐던 것 3-4문장 6)반전/디테일 2-3문장. 말투는 친근하게 '~예요', '~거예요', '~잖아요' 사용. 문장마다 줄바꿈 없이 이어서 작성.",
    "card2Analysis": "🚨반드시 \${tarotCardLen}자 이상 작성! But 구조. 1)첫 카드 연결 3-4문장 2)'근데' 예상과 다른 요소 4-5문장 3)숨겨진 면 4-5문장 4)모르던 정보 3-4문장 5)의미 2-3문장 6)반전/디테일 2-3문장. 말투 친근하게.",
    "card3Analysis": "🚨반드시 \${tarotCardLen}자 이상 작성! Therefore 구조. 1)흐름 방향 3-4문장 2)미래 일어날 일 4-5문장 3)변화 조짐 4-5문장 4)시기/상황 힌트 3-4문장 5)결과 예측 2-3문장 6)행동 가이드/반전 2-3문장. 말투 친근하게.",
    "conclusionCard": "🚨반드시 \${tarotConclusionLen}자 이상 작성! 결론 카드는 가장 길고 감동적이어야 함! 1)확실한 답 5-6문장 2)예상 밖 방식 8-10문장 3)마무리 5-6문장. 말투 친근하게.",
    "synthesis": "🚨종합 메시지 (500자 이상) - 4장의 카드가 함께 말하는 것. EXCEED expectations! 확정 답 3-4문장 + Twist 4-5문장 + 핵심 조언 3-4문장 + 구체적 타이밍/행동 2-3문장. 질문에 대한 답을 넘어서 기대 이상의 가치를 주세요.",
    "actionAdvice": "구체적 행동 조언 (150자 이상) - 오늘/이번 주에 실제로 할 수 있는 것. 구체적인 시간, 장소, 행동 포함.",
    "warning": "주의할 점 (100자) - 반드시 피해야 할 것",
    "timing": "행운의 타이밍 (80자) - 구체적 시기/상황/조건"
  },

  "shortReading": "요약 (50자) - 못 보면 잠 못 잘 정도로 궁금하게. 구체적 디테일 포함.",
  "shareText": "공유용 (30자) - 구체적 디테일로 공유하고 싶게",

  "imageStyle": "질문 분위기에 맞는 애니메 스타일 키 (다음 중 하나 선택): shinkai(로맨틱/몽환/황금빛석양), kyoani(감성적/섬세/파스텔), ghibli(따뜻한/마법적/향수), mappa_dark(다크/그릿티/성숙), mappa_action(역동적/강렬한액션), ufotable(화려한이펙트/CGI블렌드), trigger(네온/대담한기하학), sciencesaru(실험적/컬러워시), shojo(우아/스파클/로맨틱), webtoon(클린/디지털/에픽), cgi_gem(보석/반짝임/환상), minimalist(깔끔/여백/절제). 연애/감성 질문은 shinkai/kyoani/shojo, 어두운/불안한 질문은 mappa_dark/trigger, 도전/변화 질문은 mappa_action/ufotable/webtoon, 신비/환상 질문은 ghibli/sciencesaru/cgi_gem 추천",

  "images": {
    "hero": "질문자의 질문 '${question}'에서 느껴지는 감정과 심리를 시각화한 신비로운 장면. 질문의 본질적인 감정(기다림, 불안, 희망, 갈등 등)을 표현. (스타일 prefix 없이 장면만 영어 50단어)",
    "card1": "${card1.name} 카드의 신비로운 장면 (스타일 prefix 없이 장면만 영어 45단어)",
    "card2": "${card2.name} 카드의 신비로운 장면 (스타일 prefix 없이 장면만 영어 45단어)",
    "card3": "${card3.name} 카드의 신비로운 장면 (스타일 prefix 없이 장면만 영어 45단어)",
    "conclusion": "${conclusionCard.name} 카드의 신비로운 장면 (스타일 prefix 없이 장면만 영어 45단어)"
  },

  "luckyElements": {
    "color": "행운의 색",
    "number": "행운의 숫자",
    "day": "행운의 요일",
    "direction": "행운의 방향"
  }
}`;

            // 캐싱 미적용 (프롬프트 구조가 복잡하여 분리 어려움)
            const data = await callClaudeApi(null, tarotPrompt, 8000);

            // API 호출 완료 - 도파민 interval 정리
            clearInterval(dopamineInterval);

            // 프로필 기반 인물 설명 생성
            const getPersonDescription = () => {
                if (!userProfile || !userProfile.gender) return 'a mysterious person';
                const gender = userProfile.gender === 'female' ? 'young woman' : userProfile.gender === 'male' ? 'young man' : 'person';
                const age = userProfile.birthDate ? `in their ${Math.floor((new Date().getFullYear() - new Date(userProfile.birthDate).getFullYear()) / 10) * 10}s` : '';
                return `a ${gender} ${age}`.trim();
            };
            const personDesc = getPersonDescription();

            // 5장 이미지 생성 - 7단계 시작 (히어로 + 4장 카드)
            setAnalysisPhase(7);
            setProgress('🌌 당신의 이야기가 그려지고 있어요...');

            // 이미지 생성 중 도파민 팝업 interval 시작
            showRandomDopamine();
            imageInterval = setInterval(() => {
                showRandomDopamine();
            }, 6000); // 6초마다 새로운 힌트

            // Claude가 선택한 이미지 스타일 (없으면 기본값)
            const imageStyle = data.imageStyle || 'shinkai';
            console.log(`🎨 Tarot Image Style: ${imageStyle}`);

            // heroImage에 인물 정보 추가 (별도 프롬프트로 card1과 구분)
            // personDesc는 프로필 정보 유지, 색상은 Claude가 자유롭게 결정
            const heroPrompt = userProfile?.gender
                ? `${personDesc} standing in a mystical tarot reading scene, surrounded by cosmic energy and floating tarot cards. Cinematic composition, mystical atmosphere`
                : data.images.hero;
            const heroImage = await generateSingleImage(heroPrompt, imageStyle, '', 'tarot');
            await new Promise(r => setTimeout(r, 400));

            setProgress('🎨 첫 번째 카드가 그림으로 피어나고 있어요...');
            const card1Image = await generateSingleImage(data.images.card1, imageStyle, '', 'tarot');
            await new Promise(r => setTimeout(r, 400));

            setProgress('🃏 두 번째 카드가 모습을 드러내요...');
            const card2Image = await generateSingleImage(data.images.card2, imageStyle, '', 'tarot');
            await new Promise(r => setTimeout(r, 400));

            setProgress('✨ 세 번째 카드가 빛나고 있어요...');
            const card3Image = await generateSingleImage(data.images.card3, imageStyle, '', 'tarot');
            await new Promise(r => setTimeout(r, 400));

            setProgress('🌟 결론 카드가 운명처럼 나타나요...');
            const conclusionImage = await generateSingleImage(data.images.conclusion, imageStyle, '', 'tarot');

            // 이미지 생성 완료 - interval 정리
            clearInterval(imageInterval);

            // 8단계: 완료
            setAnalysisPhase(8);
            setProgress('🔮 당신만의 타로 스토리가 완성되었어요');

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
                type: 'tarot'
            };

            setProgress('');
            setAnalysisPhase(0);

            // 자동 저장
            if (user && onSaveTarot) {
                setTimeout(async () => {
                    const savedId = await onSaveTarot(tarotResultData, true);
                    if (savedId) {
                        setSavedDreamField?.('id', savedId);
                        setSavedDreamField?.('isPublic', true);
                        setToast('live', { type: 'save', message: '타로 리딩이 저장되었어요!' });
                        setTimeout(() => setToast('live', null), 3000);
                    }
                }, 500);
            }

            return tarotResultData;

        } catch (err) {
            console.error('타로 리딩 생성 실패:', err);
            setError('타로 리딩 생성에 실패했습니다.');
            // 에러 시 interval 정리 및 도파민 팝업 숨김
            if (dopamineInterval) clearInterval(dopamineInterval);
            if (imageInterval) clearInterval(imageInterval);
            setDopaminePopup?.(null);
            return null;
        } finally {
            setLoading(false);
            // finally에서도 interval 정리 (안전 장치)
            if (dopamineInterval) clearInterval(dopamineInterval);
            if (imageInterval) clearInterval(imageInterval);
        }
    }, [user, generateSingleImage, onSaveTarot, setToast, setDopaminePopup, setSavedDreamField, showRandomDopamine]);

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
            const profileBlock = buildProfileBlock(userProfile, 'fortune');

            // 현재 연도 동적 계산 (만세력 계산용)
            const currentYear = new Date().getFullYear();
            const todayFull = new Date();

            // 티어별 글자 수 설정
            const fortuneSectionLen = getContentLength('fortune', 'section', tier);
            const fortuneOverallLen = getContentLength('fortune', 'overall', tier);
            const fortuneHiddenLen = getContentLength('fortune', 'hiddenInsight', tier);

            // MrBeast + Jenny Hoyos 텍스트 도파민 기반 사주 프롬프트
            const fortunePrompt = `너는 30년 경력의 사주명리학 전문가다.
동양 사주명리학을 바탕으로 사주풀이를 하되, 사람들이 끝까지 보고 공유하고 싶게 만드는 콘텐츠를 만든다.
${profileBlock}

## 🚨🚨🚨 만세력/사주팔자 계산 시 필수 확인 사항 🚨🚨🚨
⚠️ 현재 연도: ${currentYear}년 (${todayFull.toISOString().split('T')[0]})
⚠️ 사주팔자 계산 시 반드시 위 현재 연도(${currentYear}년)를 기준으로 만세력을 계산하세요!
⚠️ 2024년이 아님! ${currentYear}년 기준으로 올해의 천간/지지, 대운, 세운을 계산해야 합니다.

프로필에 생년월일과 태어난 시간이 있다면:
1. 사주팔자(년주/월주/일주/시주)를 정확히 계산
   - 년주(年柱): 태어난 해의 천간/지지 → 조상운, 초년운
   - 월주(月柱): 태어난 달의 천간/지지 → 부모운, 청년운
   - 일주(日柱): 태어난 날의 천간/지지 → 본인 성격, 배우자운
   - 시주(時柱): 태어난 시간의 천간/지지 → 자녀운, 말년운
2. ${currentYear}년 세운(歲運)과 본인 사주의 관계 분석
3. 오행(목/화/토/금/수) 균형과 용신 파악
4. 현재 대운(大運)과 ${currentYear}년 운세 연결

###### 🚨🚨🚨 최우선 규칙: 각 분석 길이 🚨🚨🚨
각 섹션 분석(section1Analysis, section2Analysis, section3Analysis)은 반드시:
- 최소 \${fortuneSectionLen}자 이상
- 6개 섹션 모두 포함: 사주 분석 → 현재 상황 → 감정 → 숨은 맥락 → 원인 → 미처 몰랐던 것 → 반전/디테일

synthesisAnalysis(종합 분석)는 반드시:
- 최소 \${fortuneOverallLen}자 이상
- 사주팔자 종합 해석 + 확실한 답 + 예상 밖 방식 + EXCEED bonus + 감동적인 마무리

- 짧게 쓰면 실패로 간주됨

예시 길이 참고 (이름이 '민지'인 경우 - 반드시 이렇게 이름 사용!):
"민지님, 사주를 보니까요, 지금 민지님이 뭔가를 기다리고 있어요. 근데 그냥 기다리는 게 아니라, 확신이 없어서 움직이지 못하고 있는 거예요. ${currentYear}년 세운을 보면 변화의 기운이 강하게 들어오고 있어요. 특히 민지님 사주에서 일주가 [천간]이시잖아요. 이게 올해 세운과 만나면서 엄청난 변화가 예고되어 있어요. 근데 여기서 중요한 게 있어요. 민지님이 모르는 게 하나 있어요. 이 변화가 민지님이 생각하는 방향이 아닐 수 있어요. 더 좋은 방향으로요. 민지님 사주에서 용신이 [오행]인데, 올해 이 기운이 강하게 들어와요. 이게 뭘 의미하냐면... (계속)"
⚠️ 위 예시처럼 "당신" 대신 반드시 프로필의 이름을 사용할 것!

## 🚨 개인화 정보 사용 규칙 (필수!)
프로필 정보(이름, MBTI, 별자리, 나이 등)는 **전체 리딩에서 1-2번만** 사용!
- ❌ 잘못된 예: hook에 이름, 각 section마다 MBTI... → 난발 = 역효과
- ✅ 올바른 예: 가장 임팩트 있는 순간(synthesis나 hidden insight)에 1-2번만 → 감동
- 이름은 자연스럽게 1-2번 사용, MBTI/별자리/나이는 정말 관련 있을 때만 딱 1번

## MrBeast 원칙 → 텍스트 도파민 구조
| 단계 | 역할 | MrBeast 원칙 |
|------|------|--------------|
| Hook | 클릭 + 시청 동시 | First 5 seconds - 답 먼저 + 반전 |
| Foreshadow | 못 보면 잠 못 잠 | Curiosity spike - 내용으로만 궁금증 |
| Sections | 질문에 답함 | Match expectations - But-Therefore 구조 |
| Bonus | 질문 이상의 가치 | EXCEED expectations - "이건 안 물어보셨는데..." |
| Hidden | 마지막 선물 | Payoff at the end - 구체적 디테일 (시기, 상황, 이름힌트) |

## ⚠️ 핵심 규칙 (반드시 준수!)
| 항목 | 원칙 | 적용 |
|------|------|------|
| Hook | 답 먼저 + 반전 | "올해 대박나요. 근데 상반기가 아니에요." |
| Foreshadow | 섹션 순서 프레임 제거 | "어디서 터지는지 나와요" (O) / "세 번째 섹션에서" (X) |
| Section 1-3 | **\${fortuneSectionLen}자+** | 사주분석 → 상황 → 감정 → 숨은 맥락 → 미처 몰랐던 것 → 심층 분석 |
| Synthesis | **\${fortuneOverallLen}자+** | 사주 종합 + 확실한 답 + Twist + EXCEED + 감동적 마무리 |
| Bonus | 기대 초과 | "이건 안 물어보셨는데..." |
| Hidden Insight | **\${fortuneHiddenLen}자+, EXCEED + Payoff** | 사주만 봤는데 이것까지! 이름힌트, 시기, 구체적 행동 가이드 |
| 텍스트 도파민 | 문장 끝 반전, 구체적 디테일 | "${currentYear}년 하반기에 뭔가 있어요" |

## 섹션 카테고리 분류 규칙
사주 유형 "${selectedFortune.name}"을 바탕으로, 질문자에게 가장 의미 있는 3가지 카테고리를 유연하게 선정하세요.
예시 카테고리 조합 (질문/상황에 따라 자유롭게):
- 연애운/재물운/건강운
- 직장운/인간관계운/발전운
- 올해운세/이번달운세/이번주운세
- 사업운/투자운/협력운
- 학업운/시험운/진로운
- 결혼운/출산운/가족운

오늘 날짜: ${todayFull.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
사주 유형: ${selectedFortune.name}

JSON만 반환:
{
  "title": "제목 (4-8글자)",
  "verdict": "핵심 한마디 (20자 이내)",
  "affirmation": "오늘의 확언 (나는 ~한다 형식, 15자 이내)",
  "overallScore": 1-100 사이 숫자 (종합 사주 점수),

  "sajuInfo": {
    "yearPillar": "년주 (예: 갑자, 을축 등)",
    "monthPillar": "월주",
    "dayPillar": "일주",
    "hourPillar": "시주 (시간 정보 있을 경우)",
    "mainElement": "주요 오행 (목/화/토/금/수)",
    "yongsin": "용신",
    "currentYearRelation": "${currentYear}년 세운과의 관계 설명 (50자)"
  },

  "jenny": {
    "hook": "⚠️답 먼저 + 반전 구조. 사주 기반 핵심 메시지. 🚨매번 완전히 다른 시작 필수! 예시 복사 금지! 느낌만 참고: ${currentYear}년 운세 방향 + '근데' 반전 / 결과 먼저 + 예상 밖 방식 / 핵심 + 의외성. 시작어도 매번 다르게(OO님~/먼저~/잠깐~/결론은~ 등 창의적으로)",
    "foreshadow": "⚠️못 보면 잠 못 잘 궁금증. 섹션 순서 언급 금지! 🚨매번 새로운 표현! 느낌: 어디서 터지는지/시기가/방법이/누구랑 등 내용 기반 궁금증 유발. 예시 복사 금지!",
    "section1Transition": "다음 섹션 궁금증 유발 - 🚨매번 다른 표현! (느낌: 더 있음/끝 아님/중요한 게/이제 본론 등으로 자유롭게)",
    "section2Transition": "마지막 선물 암시 - 🚨매번 새로운 말투! (느낌: 핵심 남음/비밀/추가로/깊이 들어가면 등으로 창의적으로)",
    "bonus": "⚠️질문 이상의 가치. EXCEED expectations! 🚨매번 완전히 다른 방식! 예시 복사 금지! 느낌: 안 물어봤는데/추가로/서비스로 + 구체적 정보(시기/이름힌트/상황). 창의적으로!",
    "twist": {
      "emoji": "🔮",
      "title": "숨겨진 운명의 시간",
      "message": "반전 메시지 (80자) - 사주에서 발견한 예상치 못한 인사이트. 문장 끝 반전 필수. 구체적 디테일. 매번 새로운 통찰!"
    },
    "hiddenInsight": "🚨반드시 \${fortuneHiddenLen}자 이상 작성! EXCEED expectations! 🚨매번 완전히 다른 도입/표현 필수! 예시 문장 절대 복사 금지! 구조만 참고: 1)의외의 도입 2-3문장(비밀/추가/느낌 등 다양한 시작) 2)핵심 정보 4-5문장(이름힌트/시기/상황/기회위험) 3)예상 못한 추가 4-5문장 4)행동 가이드 3-4문장 5)기억할 것 2-3문장. 창의적 표현 필수!",
    "shareHook": "공유 유도 - 매번 다르게! (느낌: 소름/신기/대박이면 공유 등)"
  },

  "rarity": {
    "percent": "희귀도 숫자 (0.1~5.0)",
    "outOf": 1000,
    "description": "희귀도 설명 (예: '${currentYear}년에 이런 사주 조합은 1000명 중 17명만')"
  },

  "sections": {
    "section1": {
      "category": "첫 번째 카테고리 이름 (예: 연애운, 재물운, 직장운 등)",
      "icon": "카테고리 이모지",
      "title": "섹션 제목 (10자 이내)",
      "analysis": "🚨반드시 \${fortuneSectionLen}자 이상 작성! 구조: 1)사주 분석 4-5문장(년주/월주/일주 연결) 2)현재 상황 3-4문장 3)감정/심리 3-4문장 4)숨겨진 맥락 4-5문장 5)미처 몰랐던 것 3-4문장 6)반전/디테일 2-3문장. 말투는 친근하게 '~예요', '~거예요', '~잖아요' 사용."
    },
    "section2": {
      "category": "두 번째 카테고리 이름",
      "icon": "카테고리 이모지",
      "title": "섹션 제목 (10자 이내)",
      "analysis": "🚨반드시 \${fortuneSectionLen}자 이상 작성! But 구조. 1)첫 섹션 연결 3-4문장 2)'근데' 예상과 다른 요소 4-5문장 3)숨겨진 면 4-5문장 4)모르던 정보 3-4문장 5)반전/디테일 2-3문장. 말투 친근하게."
    },
    "section3": {
      "category": "세 번째 카테고리 이름",
      "icon": "카테고리 이모지",
      "title": "섹션 제목 (10자 이내)",
      "analysis": "🚨반드시 \${fortuneSectionLen}자 이상 작성! Therefore 구조. 1)흐름 방향 3-4문장 2)앞으로 일어날 일 4-5문장 3)변화 조짐 4-5문장 4)시기/상황 힌트 3-4문장 5)행동 가이드/반전 2-3문장. 말투 친근하게."
    }
  },

  "synthesisAnalysis": "🚨반드시 \${fortuneOverallLen}자 이상 작성! 사주 종합 분석은 가장 길고 감동적이어야 함! 1)사주팔자 종합 해석 5-6문장 2)${currentYear}년 운세 핵심 5-6문장 3)EXCEED bonus (안 물어본 것까지) 5-6문장 4)구체적 행동 가이드 3-4문장 5)감동적 마무리 3-4문장. 말투 친근하게.",

  "keywords": [
    {"word": "질문 '${question}'에서 추출한 주제 키워드 (명사형, 2-4글자)", "surface": "표면적 의미 (50자)", "hidden": "5-7문장 숨겨진 의미 (300자 이상). But-Therefore 구조."},
    {"word": "질문에서 추출한 핵심 키워드1 (명사형, 2-4글자)", "surface": "표면적 의미 (50자)", "hidden": "5-7문장 숨겨진 의미 (300자 이상). '근데' 반전 포함."},
    {"word": "질문에서 추출한 핵심 키워드2 (명사형, 2-4글자)", "surface": "표면적 의미 (50자)", "hidden": "5-7문장 숨겨진 의미 (300자 이상). 구체적 시기/상황 힌트."}
  ],

  "doList": ["${currentYear}년에 꼭 해야 할 것 1 (구체적 시기/방법)", "꼭 해야 할 것 2", "꼭 해야 할 것 3"],
  "dontList": ["${currentYear}년에 피해야 할 것 1 (구체적 상황)", "피해야 할 것 2", "피해야 할 것 3"],

  "shortReading": "요약 (50자) - 못 보면 잠 못 잘 정도로 궁금하게. 구체적 디테일 포함.",
  "shareText": "공유용 (30자) - 구체적 디테일로 공유하고 싶게",

  "imageStyle": "사주 분위기에 맞는 애니메 스타일 키 (다음 중 하나 선택): shinkai(로맨틱/몽환/황금빛석양), kyoani(감성적/섬세/파스텔), ghibli(따뜻한/마법적/향수), mappa_dark(다크/그릿티/성숙), mappa_action(역동적/강렬한액션), ufotable(화려한이펙트/CGI블렌드), trigger(네온/대담한기하학), sciencesaru(실험적/컬러워시), shojo(우아/스파클/로맨틱), webtoon(클린/디지털/에픽), cgi_gem(보석/반짝임/환상), minimalist(깔끔/여백/절제). 사주/운세는 주로 ghibli/shinkai/cgi_gem 추천, 강한 에너지 운세는 mappa_action/ufotable",

  "images": {
    "hero": "사주 유형의 본질적 에너지를 시각화한 신비로운 장면. 동양적 사주/운명의 이미지 (스타일 prefix 없이 장면만 영어 50단어)",
    "section1": "첫 번째 카테고리 테마의 신비로운 장면 (스타일 prefix 없이 장면만 영어 45단어)",
    "section2": "두 번째 카테고리 테마의 신비로운 장면 (스타일 prefix 없이 장면만 영어 45단어)",
    "section3": "세 번째 카테고리 테마의 신비로운 장면 (스타일 prefix 없이 장면만 영어 45단어)"
  },

  "luckyElements": {
    "color": "행운의 색",
    "number": "행운의 숫자",
    "direction": "행운의 방향",
    "time": "행운의 시간 (구체적 시간대)",
    "item": "행운의 아이템",
    "month": "${currentYear}년 행운의 달"
  }
}`;

            // 캐싱 미적용 (프롬프트 구조가 복잡하여 분리 어려움)
            const data = await callClaudeApi(null, fortunePrompt, 8000);
            console.log('🎯 Fortune API Response - jenny:', data.jenny); // 디버깅용

            // 프로필 기반 인물 설명 생성 (사주)
            const getFortunePersonDesc = () => {
                if (!userProfile || !userProfile.gender) return 'a person';
                const gender = userProfile.gender === 'female' ? 'young woman' : userProfile.gender === 'male' ? 'young man' : 'person';
                return gender;
            };
            const fortunePersonDesc = getFortunePersonDesc();

            // Claude가 선택한 이미지 스타일 (없으면 기본값)
            const imageStyle = data.imageStyle || 'shinkai';
            console.log(`🎨 Fortune Image Style: ${imageStyle}`);

            // 이미지 생성
            setAnalysisPhase(5);
            setProgress('🌌 오늘의 사주가 그려지고 있어요...');

            // 사주 heroImage 프롬프트 (프로필 있으면 인물 중심) - section1과 별도
            // fortunePersonDesc는 프로필 정보 유지, 색상은 Claude가 자유롭게 결정
            const fortuneHeroPrompt = userProfile?.gender
                ? `${fortunePersonDesc} gazing at the stars and cosmic energy, surrounded by zodiac symbols and mystical light. Fortune-telling atmosphere, cinematic composition`
                : data.images.hero;
            const heroImage = await generateSingleImage(fortuneHeroPrompt, imageStyle, '', 'fortune');
            await new Promise(r => setTimeout(r, 400));

            // 섹션별 이미지 생성 (section1/2/3 구조)
            const section1Category = data.sections?.section1?.category || '첫 번째 운';
            setProgress(`${data.sections?.section1?.icon || '✨'} ${section1Category} 이미지 생성 중...`);
            const section1Image = await generateSingleImage(data.images.section1, imageStyle, '', 'fortune');
            await new Promise(r => setTimeout(r, 500));

            const section2Category = data.sections?.section2?.category || '두 번째 운';
            setProgress(`${data.sections?.section2?.icon || '💫'} ${section2Category} 이미지 생성 중...`);
            const section2Image = await generateSingleImage(data.images.section2, imageStyle, '', 'fortune');
            await new Promise(r => setTimeout(r, 500));

            const section3Category = data.sections?.section3?.category || '세 번째 운';
            setProgress(`${data.sections?.section3?.icon || '🌟'} ${section3Category} 이미지 생성 중...`);
            const section3Image = await generateSingleImage(data.images.section3, imageStyle, '', 'fortune');

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
        // 티어 정보
        isPremium,
        modelConfig,
        // 함수
        generateDreamReading,
        generateTarotReading,
        generateFortuneReading,
        // 상태 리셋
        clearError: () => setError(''),
        clearProgress: () => setProgress('')
    };
};
