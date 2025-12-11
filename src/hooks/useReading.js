import { useState, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { runAnalysisAnimation, getApiKeys, getDreamMessages, getFortuneMessages } from '../utils/analysisHelpers';
import { useImageGeneration } from './useImageGeneration';
import { getModelConfig, AI_MODELS, getContentLength } from '../utils/aiConfig';
import {
    DETAILED_ANALYSIS_SYSTEM_PROMPT,
    callClaudeWithCache,
    callClaudeWithCacheStreaming
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
- 이름은 자연스럽게 1-2번 사용, MBTI/별자리는 정말 관련 있을 때만 딱 1번
- ⚠️ 나이 직접 언급 절대 금지! "38살", "38세", "38년을 살면서", "30대 후반", "그 나이에", "나이대" 등 모든 형태 금지! 나이는 분석 참고용만!

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
    "hiddenInsight": "⚠️프로필 이름으로 호칭! \${dreamHiddenLen}자 이상 봉인 해제 메시지. ⭐시작 문구 다양화 필수! '원래 안 말할라 그랬는데' 금지! 대신: '아 근데 이건 진짜..', '어 잠깐, 이거 봐봐요', '마지막으로 하나만 더', '아 그리고 이건 좀 신기한데', '근데 솔직히 이게 진짜야', '아 맞다 이것도..', '어? 이거 진짜 신기하네' 등 자연스럽게 랜덤! 구조: 1)신선한 도입 2-3문장 2)⭐MBTI/별자리 기반 반전! 이 사람의 성향이 왜 이런 꿈을 꿨는지 연결 3-4문장 3)꿈이 진짜 말하는 것 4-5문장 4)구체적 예언/행동 가이드 2-3문장. 문장 끝 반전 필수!",
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

  "visualMode": "🎬 반드시 꿈 분위기에 맞게 선택! 몽환적/판타지/감성적 꿈 → 'anime'. 생생한/현실적/악몽 → 'real'. ⚠️매번 꿈에 맞게 신중히 결정! 같은 스타일만 쓰지 말 것!",
  "imageStyle": "🎨 visualMode에 맞춰 반드시 다양하게 선택! anime일 때: shinkai(감성)/ghibli(따뜻)/kyoani(청춘)/mappa(역동)/mappa_dark(어두운)/shojo(로맨스)/clamp(신비)/wit(드라마틱)/ilya(몽환)/minimalist(깔끔). real일 때: korean_soft(부드러운)/korean_dramatic(강렬)/japanese_clean(깔끔)/cinematic(영화적)/aesthetic_mood(감성). ⚠️꿈 분위기에 맞춰 매번 다른 스타일 선택!",
  "colorPalette": "🎨 이 꿈만의 고유한 2색 그라디언트를 영어로 작성. '무서운 꿈=빨강' 같은 공식 금지! 형식: 'color1 and color2'",

  "images": {
    "hero": "🎬 너는 영화 감독. 이 꿈의 핵심 감정을 오프닝 씬으로 자유롭게 연출. 영어 2문장. 🎯인물: 항상 20대 초중반. 🎯완전 자유: 인물 구성/구도/분위기 모두 네가 결정. 꿈의 감정(두려움/희망/혼란/그리움)을 시각적으로.",
    "character": "캐릭터 외모 (영어 40단어). 20대 초중반 젊은 캐릭터.",
    "dream": "🎬 이 꿈의 핵심 장면. 영어 2문장. 🎯완전 자유: 꿈 속 상황을 어떻게 시각화할지 네가 결정. hero와 다른 앵글/분위기로.",
    "tarot": "🎬 선택된 타로 카드와 꿈의 연결. 영어 2문장. 🎯완전 자유: 카드 상징을 창의적으로 녹여서.",
    "meaning": "🎬 이 꿈이 전하는 메시지의 시각화. 영어 2문장. 🎯완전 자유: 해석의 핵심을 임팩트 있게."
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

            // Claude가 선택한 이미지 스타일과 색상 팔레트 (없으면 기본값)
            const imageStyle = data.imageStyle || 'shinkai';
            const colorPalette = data.colorPalette || '';
            console.log(`🎨 Dream Image Style: ${imageStyle}, Colors: ${colorPalette || 'default'}`);

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
            // visualMode: 꿈 해몽은 기본적으로 anime 모드 (추후 Claude가 선택하도록 확장 가능)
            const visualMode = data.visualMode || 'anime';
            console.log(`🎬 Dream Visual Mode: ${visualMode}`);

            const heroImage = await generateSingleImage(dreamHeroPrompt, imageStyle, characterDesc, 'dream', colorPalette, visualMode);
            await new Promise(r => setTimeout(r, 500));

            setProgress('🎨 당신의 꿈이 그림으로 피어나고 있어요...');
            const dreamImage = await generateSingleImage(data.images.dream, imageStyle, characterDesc, 'dream', colorPalette, visualMode);
            await new Promise(r => setTimeout(r, 500));

            setProgress('🃏 우주의 카드가 펼쳐지고 있어요...');
            const tarotImage = await generateSingleImage(data.images.tarot, imageStyle, characterDesc, 'dream', colorPalette, visualMode);
            await new Promise(r => setTimeout(r, 500));

            setProgress('✨ 꿈 속 비밀이 드러나고 있어요...');
            const meaningImage = await generateSingleImage(data.images.meaning, imageStyle, characterDesc, 'dream', colorPalette, visualMode);

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

            // 티어별 글자 수 설정
            const tarotCardLen = getContentLength('tarot', 'cardAnalysis', tier);
            const tarotConclusionLen = getContentLength('tarot', 'conclusion', tier);
            const tarotHiddenLen = getContentLength('tarot', 'hiddenInsight', tier);

            // 현재 날짜/시간 컨텍스트 생성
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            const currentDay = now.getDate();
            const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
            const dateContext = `📅 오늘 날짜: ${currentYear}년 ${currentMonth}월 ${currentDay}일 (${dayOfWeek}요일)
- 이 질문은 오늘 이 시점에서 물어본 것입니다
- 시기를 언급할 때 반드시 오늘 날짜 기준으로 과거/현재/미래를 구분하세요
- 예: 오늘이 12월이면 "8월"은 과거이므로 "그때는 ~했을 거예요" / "내년 2월"은 미래이므로 "~할 거예요"
- 올해가 거의 끝나가는 시점이면 "올해" 관련 질문에 대해 남은 기간을 고려하세요`;

            // MrBeast + Jenny Hoyos 텍스트 도파민 기반 프롬프트 (dopamine-prompt-guide.md 완전 반영)
            const tarotPrompt = `너는 30년 경력의 신비로운 타로 마스터다. 카드 리딩을 할 때 단순한 해석이 아니라 그 사람의 인생 이야기를 들려주듯이 깊고 감동적으로 풀어낸다.
${profileBlock}

${dateContext}

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
- MBTI/별자리는 정말 관련 있을 때만 딱 1번 (예: "사자자리 특유의 자존심이...")
- ⚠️ 나이 직접 언급 절대 금지! "38살", "38세", "38년을 살면서", "30대 후반", "그 나이에", "나이대" 등 모든 형태 금지! 나이는 분석 참고용만!

## MrBeast 원칙 → 텍스트 도파민 구조
| 단계 | 역할 | MrBeast 원칙 |
|------|------|--------------|
| Hook | 클릭 + 시청 동시 | First 5 seconds - 답 먼저 + 반전 |
| Foreshadow | 못 보면 잠 못 잠 | Curiosity spike - 내용으로만 궁금증 |
| Cards/Main | 질문에 답함 | Match expectations - But-Therefore 구조 |
| Bonus | 질문 이상의 가치 | EXCEED expectations - "이건 안 물어보셨는데..." |
| Hidden | 마지막 선물 | Payoff at the end - MBTI/별자리 특징 활용한 추가 인사이트, 구체적 디테일 (이름힌트, 시기, 상황) |

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
- ⚠️ visualMode/imageStyle 항상 같은 값 금지! 질문 분위기에 따라 반드시 다르게 선택!

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

## JSON 형식으로만 반환 (⚠️순서 중요! 반드시 위에서부터 차례로 생성):
{
  "hook": "⚠️질문자가 '뭐야 이거?' 하고 멈출 수밖에 없는 첫 마디. 답 먼저 + 반전 구조. 군더더기 없이. ❌금지: 희귀도/카드조합/숫자 절대 금지! 🚨매번 완전히 다른 시작 필수!",
  "foreshadow": "⚠️Hook에서 던진 의외성을 안 보면 잠 못 잘 정도로 궁금하게. '뭔데?' '어떻게?' '왜?'를 자극. ❌금지: 카드 순서 언급 절대 금지!",
  "title": "질문에 대한 한줄 답변 (15-30자). 피드에서 질문과 함께 보여질 공감형 답변. 예: 질문 '그 사람 마음?' → 답변 '마음은 있어요, 근데 타이밍이...' / 질문 '이직해도 될까?' → 답변 '지금은 아닌데, 3개월 뒤엔 달라요' / 질문 '시험 붙을까요?' → 답변 '붙어요, 근데 방식이 중요해요' 형식으로 직접적 답변 + 궁금증 유발",
  "verdict": "답변 뒤에 붙는 감성 한마디 (25-45자). 공감/위로/응원 느낌의 두 문장. 예: '지금 느끼는 불안함, 당연해요. 근데 그게 답을 찾고 있다는 증거예요.'",

  "topics": ["질문에 가장 맞는 주제 딱 1개만 선택 (사랑/관계/돈/성장/건강/선택/일반 중)"],
  "keywords": [
    {"word": "질문 '${question}'에서 추출한 주제 키워드 (명사형, 2-4글자)", "surface": "표면 의미", "hidden": "숨은 의미"},
    {"word": "질문에서 추출한 핵심 키워드1 (명사형, 2-4글자)", "surface": "표면 의미", "hidden": "숨은 의미"},
    {"word": "질문에서 추출한 핵심 키워드2 (명사형, 2-4글자)", "surface": "표면 의미", "hidden": "숨은 의미"}
  ],

  "visualMode": "🎬 질문 분위기에 맞게 자유롭게 선택! 예시(공식 아님): 감성적→anime, 현실적→real. 하지만 네가 판단해서 더 어울리는 걸 선택해도 됨. ⚠️매번 다르게!",
  "imageStyle": "🎨 visualMode에 맞춰 자유롭게 선택! 예시(공식 아님): anime→shinkai/ghibli/mappa 등, real→korean_soft/cinematic 등. 하지만 질문에 더 어울리면 다른 조합도 가능. ⚠️매번 다르게!",
  "colorPalette": "이 질문만의 2색 조합. 영어, 형식: 'color1 and color2'",

  "heroImagePrompt": "🎬 영화 감독으로서 오프닝 씬 연출. 영어 2문장. 🎯나이: 20대 초중반. ⚠️인물 구성은 질문에 맞게 네가 자유롭게 결정! 예시(공식 아님): 연애→둘, 성장→혼자, 선택→갈림길. 하지만 연애 질문이어도 혼자 있는 장면이 더 어울리면 그렇게 해도 됨. 질문의 핵심 감정을 시각화!",
  "opening": "도입부 (200자 이상) - hook을 자연스럽게 녹여서 시작. 질문 뒤 숨은 심리 짚기. 🚨매번 완전히 다른 도입! ⭐핵심 인사이트 1-2개는 **bold** 처리!",

  "card1ImagePrompt": "🎬 Scene 1: 🃏${card1.nameKo}의 상징을 창의적으로 표현! 영어 2문장. 예시(공식 아님): The Star→별빛, The Tower→붕괴. 하지만 카드 상징을 네 방식대로 재해석해도 됨. ⚠️Hero와 다른 구도로! 인물 수/구성도 자유롭게.",
  "card1Analysis": "🚨반드시 \${tarotCardLen}자 이상! 구조: 1)현재 상황 4-5문장 2)질문자 감정 3-4문장 3)숨겨진 맥락 4-5문장 4)원인 분석 3-4문장 5)미처 몰랐던 것 3-4문장 6)반전 2-3문장. ⭐핵심 2-3개 **bold**!",

  "card2ImagePrompt": "🎬 Scene 2: 🃏${card2.nameKo}의 상징을 창의적으로 표현! 영어 2문장. ⚠️Scene 1과 다른 시각적 접근 필수! 예시(공식 아님): 다른 인물, 다른 시점, 상징적 장면 등. 네가 가장 어울린다고 생각하는 방식으로 자유롭게.",
  "card2Analysis": "🚨반드시 \${tarotCardLen}자 이상! But 구조. 1)첫 카드 연결 3-4문장 2)'근데' 예상과 다른 요소 4-5문장 3)숨겨진 면 4-5문장 4)모르던 정보 3-4문장 5)의미 2-3문장 6)반전 2-3문장. ⭐핵심 2-3개 **bold**!",

  "card3ImagePrompt": "🎬 Scene 3: 🃏${card3.nameKo}의 상징을 창의적으로 표현! 영어 2문장. ⚠️앞 장면들과 완전히 다른 비주얼! 인물/구도/분위기 모두 네가 자유롭게 결정. 미래의 가능성을 네 방식대로 시각화.",
  "card3Analysis": "🚨반드시 \${tarotCardLen}자 이상! Therefore 구조. 1)흐름 방향 3-4문장 2)미래 일어날 일 4-5문장 3)변화 조짐 4-5문장 4)시기 힌트 3-4문장 5)결과 예측 2-3문장 6)행동 가이드 2-3문장. ⭐핵심 2-3개 **bold**!",

  "conclusionImagePrompt": "🎬 Final Scene: 🃏${conclusionCard.nameKo}의 상징이 클라이맥스! 영어 2문장. ⚠️이 리딩의 가장 임팩트 있는 장면을 네가 자유롭게 연출! 카드 상징을 네 방식대로 재해석해서 가장 '와' 할 비주얼로.",
  "conclusionCard": "🚨반드시 \${tarotConclusionLen}자 이상! 가장 길고 감동적! 1)확실한 답 5-6문장 2)예상 밖 방식 8-10문장 3)마무리 5-6문장. ⭐결론 3-4개 **bold**!",

  "hiddenInsight": "🚨반드시 \${tarotHiddenLen}자 이상! 결론 카드가 말해주는 숨겨진 메시지. 질문자도 몰랐던 진짜 답. ⭐시작 문구 다양화 필수! '원래 안 말할라 그랬는데' 금지! 대신: '아 근데 이건 진짜..', '어 잠깐, 이거 봐봐요', '마지막으로 하나만 더', '아 그리고 이건 좀 신기한데', '근데 솔직히 이게 진짜야', '아 맞다 이것도..', '어? 이거 진짜 신기하네' 등 자연스럽게 랜덤! 구조: 1)신선한 도입 2-3문장 2)⭐MBTI/별자리 기반 반전! 이 사람의 성향이 왜 이 결과를 만들었는지 연결 3-4문장 3)타로가 진짜 말하는 것 4-5문장 4)구체적 행동/시기 가이드 2-3문장. 문장 끝 반전 필수!",
  "synthesis": "🚨종합 메시지 (500자 이상) - 4장의 카드가 함께 말하는 것. 확정 답 + Twist + 핵심 조언 + 구체적 타이밍. ⭐최종 결론 2-3개 **bold**!",
  "shareText": "공유용 한 줄 (30자) - 핵심 메시지"
}`;

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

            let visualMode = 'anime';  // 'anime' 또는 'real'
            let imageStyle = 'shinkai';
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
                if (cardNum === 2 && analysis) {
                    partialResult.card2Image = image;
                    partialResult.presentImage = image;
                    partialResult.cardReady.card2 = true;
                } else if (cardNum === 3 && analysis) {
                    partialResult.card3Image = image;
                    partialResult.futureImage = image;
                    partialResult.cardReady.card3 = true;
                } else if (cardNum === 4) {
                    partialResult.conclusionImage = image;
                    partialResult.cardReady.conclusion = true;
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
                // visualMode 감지 → anime 또는 real
                onVisualMode: (mode) => {
                    console.log(`🎬 비주얼 모드 설정 ${elapsed()}:`, mode);
                    visualMode = mode;
                },
                // imageStyle 감지 → 이미지 생성 전에 스타일 설정
                onImageStyle: (style) => {
                    console.log(`🎨 스타일 설정 ${elapsed()}:`, style);
                    imageStyle = style;
                    setAnalysisPhase(2); // Phase 2: 스타일/컬러 파싱
                },
                // colorPalette 감지 → 이미지 생성 전에 색상 설정
                onColorPalette: (palette) => {
                    console.log(`🎨 컬러 설정 ${elapsed()}:`, palette);
                    colorPalette = palette;
                },
                // Hero 이미지 프롬프트 → Hero 이미지 생성 시작 (Claude가 질문 기반으로 생성)
                onHeroImagePrompt: (prompt) => {
                    console.log(`🎨 Hero 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    console.log(`🎨 [DEBUG] Hero 이미지 파라미터: style=${imageStyle}, mode=${visualMode}, colors=${colorPalette}`);
                    setAnalysisPhase(3); // Phase 3: Hero 이미지 생성
                    setProgress('🌌 당신의 세계가 펼쳐지고 있어요...');
                    heroPromise = generateSingleImage(prompt, imageStyle, '', 'tarot', colorPalette, visualMode)
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
                    card1Promise = generateSingleImage(prompt, imageStyle, '', 'tarot', colorPalette, visualMode)
                        .then(img => {
                            card1Image = img;
                            console.log(`✅ Card1 이미지 완료 ${elapsed()}`);
                            setAnalysisPhase(5); // Phase 5: 이미지 완료
                            checkAndTransition();
                            return img;
                        });
                },
                // Card2 분석 완료 → 저장만
                onCard2: (card2Analysis) => {
                    console.log(`🃏 Card2 분석 완료 ${elapsed()}`);
                    partialResult.storyReading.card2Analysis = card2Analysis;
                },
                // Card2 이미지 프롬프트 → 이미지 생성 시작
                onCard2ImagePrompt: (prompt) => {
                    console.log(`🎨 Card2 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    setProgress('🃏 두 번째 카드가 나타나고 있어요...');
                    card2Promise = generateSingleImage(prompt, imageStyle, '', 'tarot', colorPalette, visualMode)
                        .then(img => {
                            card2Image = img;
                            console.log(`✅ Card2 이미지 완료 ${elapsed()}`);
                            updateCardReady(2, img, partialResult.storyReading.card2Analysis);
                            return img;
                        });
                },
                // Card3 분석 완료 → 저장만
                onCard3: (card3Analysis) => {
                    console.log(`🃏 Card3 분석 완료 ${elapsed()}`);
                    partialResult.storyReading.card3Analysis = card3Analysis;
                },
                // Card3 이미지 프롬프트 → 이미지 생성 시작
                onCard3ImagePrompt: (prompt) => {
                    console.log(`🎨 Card3 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    setProgress('✨ 세 번째 카드가 빛나고 있어요...');
                    card3Promise = generateSingleImage(prompt, imageStyle, '', 'tarot', colorPalette, visualMode)
                        .then(img => {
                            card3Image = img;
                            console.log(`✅ Card3 이미지 완료 ${elapsed()}`);
                            updateCardReady(3, img, partialResult.storyReading.card3Analysis);
                            return img;
                        });
                },
                // Conclusion 분석 완료 → 저장만
                onConclusion: (conclusionAnalysis) => {
                    console.log(`🎁 Conclusion 분석 완료 ${elapsed()}`);
                    partialResult.storyReading.conclusionCard = conclusionAnalysis;
                },
                // Conclusion 이미지 프롬프트 → 이미지 생성 시작
                onConclusionImagePrompt: (prompt) => {
                    console.log(`🎨 Conclusion 이미지 생성 시작 ${elapsed()}:`, prompt.slice(0, 50) + '...');
                    setProgress('🎁 운명의 선물이 도착하고 있어요...');
                    conclusionPromise = generateSingleImage(prompt, imageStyle, '', 'tarot', colorPalette, visualMode)
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
                null,  // systemPrompt (타로는 userMessage에 포함)
                tarotPrompt,
                modelConfig.textModel,
                10000,
                streamCallbacks,
                'tarot'
            );

            // JSON 파싱
            let cleanText = responseText
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            const data = JSON.parse(cleanText);

            // Claude가 선택한 이미지 스타일로 업데이트 (남은 이미지에 적용)
            if (data.imageStyle) {
                imageStyle = data.imageStyle;
                console.log(`🎨 Claude 선택 스타일: ${imageStyle}`);
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
                // 스트리밍 완료 플래그 + 모든 카드 준비 완료
                isStreaming: false,
                cardReady: { card1: true, card2: true, card3: true, conclusion: true }
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
- 이름은 자연스럽게 1-2번 사용, MBTI/별자리는 정말 관련 있을 때만 딱 1번
- ⚠️ 나이 직접 언급 절대 금지! "38살", "38세", "38년을 살면서", "30대 후반", "그 나이에", "나이대" 등 모든 형태 금지! 나이는 분석 참고용만!

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
    "hiddenInsight": "🚨반드시 \${fortuneHiddenLen}자 이상 작성! ⭐시작 문구 다양화 필수! '원래 안 말할라 그랬는데' 금지! 대신: '아 근데 이건 진짜..', '어 잠깐, 이거 봐봐요', '마지막으로 하나만 더', '아 그리고 이건 좀 신기한데', '근데 솔직히 이게 진짜야', '아 맞다 이것도..', '어? 이거 진짜 신기하네' 등 자연스럽게 랜덤! 구조: 1)신선한 도입 2-3문장 2)⭐MBTI/별자리 기반 반전! 이 사람의 사주 특성이 왜 이런 성향을 만들었는지 연결 3-4문장 3)핵심 정보 4-5문장(이름힌트/시기/상황) 4)행동 가이드 2-3문장. 문장 끝 반전 필수!",
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

  "visualMode": "🎬 반드시 운세 분위기에 맞게 선택! 신비로운/동양적/감성적 → 'anime'. 현실적/세련된/비즈니스 → 'real'. ⚠️매번 운세에 맞게 신중히 결정! 같은 스타일만 쓰지 말 것!",
  "imageStyle": "🎨 visualMode에 맞춰 반드시 다양하게 선택! anime일 때: shinkai(감성)/ghibli(따뜻)/kyoani(청춘)/mappa(역동)/mappa_dark(어두운)/shojo(로맨스)/clamp(신비)/wit(드라마틱)/ilya(몽환)/minimalist(깔끔). real일 때: korean_soft(부드러운)/korean_dramatic(강렬)/japanese_clean(깔끔)/cinematic(영화적)/aesthetic_mood(감성). ⚠️운세 분위기에 맞춰 매번 다른 스타일 선택!",
  "colorPalette": "🎨 이 운세만의 고유한 2색 그라디언트를 영어로 작성. '금전운=금색' 같은 단순 공식 금지! 형식: 'color1 and color2'",

  "images": {
    "hero": "🎬 너는 영화 감독. 이 사주/운세의 본질적 에너지를 오프닝 씬으로 자유롭게 연출. 영어 2문장. 🎯인물: 항상 20대 초중반. 🎯완전 자유: 인물 구성/구도/분위기 모두 네가 결정. 동양적 사주/운명의 느낌을 창의적으로.",
    "section1": "🎬 첫 번째 운세 섹션의 핵심 장면. 영어 2문장. 🎯완전 자유: 이 섹션의 테마를 어떻게 시각화할지 네가 결정. hero와 다른 앵글/분위기로.",
    "section2": "🎬 두 번째 운세 섹션의 핵심 장면. 영어 2문장. 🎯완전 자유: 앞 장면과 다른 시각적 접근. section1과 연결되면서도 변화가 느껴지게.",
    "section3": "🎬 세 번째 운세 섹션의 핵심 장면. 영어 2문장. 🎯완전 자유: 이 리딩의 마무리 장면. 가장 임팩트 있게."
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

            // Claude가 선택한 이미지 스타일과 색상 팔레트 (없으면 기본값)
            const imageStyle = data.imageStyle || 'shinkai';
            const colorPalette = data.colorPalette || '';
            // visualMode: 운세는 기본적으로 anime 모드 (추후 Claude가 선택하도록 확장 가능)
            const visualMode = data.visualMode || 'anime';
            console.log(`🎨 Fortune Image Style: ${imageStyle}, Colors: ${colorPalette || 'default'}, Mode: ${visualMode}`);

            // 이미지 생성
            setAnalysisPhase(5);
            setProgress('🌌 오늘의 사주가 그려지고 있어요...');

            // 사주 heroImage - Claude 생성 프롬프트 그대로 사용 (스타일 일관성 유지)
            // 성별 정보는 프롬프트 뒤에 추가하여 스타일 prefix가 우선 적용되도록 함
            const fortuneHeroBasePrompt = data.images.hero || 'gazing at the stars and cosmic energy, surrounded by zodiac symbols and mystical light. Fortune-telling atmosphere, cinematic composition';
            const fortuneHeroPrompt = userProfile?.gender
                ? `${fortuneHeroBasePrompt}. The person is ${fortunePersonDesc}.`
                : fortuneHeroBasePrompt;
            const heroImage = await generateSingleImage(fortuneHeroPrompt, imageStyle, '', 'fortune', colorPalette, visualMode);
            await new Promise(r => setTimeout(r, 400));

            // 섹션별 이미지 생성 (section1/2/3 구조)
            const section1Category = data.sections?.section1?.category || '첫 번째 운';
            setProgress(`${data.sections?.section1?.icon || '✨'} ${section1Category} 이미지 생성 중...`);
            const section1Image = await generateSingleImage(data.images.section1, imageStyle, '', 'fortune', colorPalette, visualMode);
            await new Promise(r => setTimeout(r, 500));

            const section2Category = data.sections?.section2?.category || '두 번째 운';
            setProgress(`${data.sections?.section2?.icon || '💫'} ${section2Category} 이미지 생성 중...`);
            const section2Image = await generateSingleImage(data.images.section2, imageStyle, '', 'fortune', colorPalette, visualMode);
            await new Promise(r => setTimeout(r, 500));

            const section3Category = data.sections?.section3?.category || '세 번째 운';
            setProgress(`${data.sections?.section3?.icon || '🌟'} ${section3Category} 이미지 생성 중...`);
            const section3Image = await generateSingleImage(data.images.section3, imageStyle, '', 'fortune', colorPalette, visualMode);

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
