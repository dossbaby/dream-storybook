/**
 * Claude API 프롬프트 캐싱 유틸리티
 *
 * Anthropic의 프롬프트 캐싱을 활용하여 API 비용 절감
 * - 시스템 프롬프트 (정적): 캐시 대상 (90% 비용 절감)
 * - 사용자 입력 (동적): 매번 새로 처리
 *
 * 캐싱 효과:
 * - 캐시 쓰기: 기본 입력 토큰 가격의 25% 추가
 * - 캐시 읽기: 기본 입력 토큰 가격의 10% (90% 절감)
 * - TTL: 5분 (동일 세션 내 반복 사용 시 효과적)
 *
 * 티어별 프롬프트:
 * - 티어별로 다른 글자 수 가이드 적용
 * - 동일 티어 사용자끼리 캐시 공유
 */

import { TIER_CONTENT_LENGTH } from './aiConfig';

// 꿈 해몽 시스템 프롬프트 (티어별 동적 생성)
export const getDreamSystemPrompt = (tier = 'free', lang = 'ko') => {
    const len = TIER_CONTENT_LENGTH[lang]?.dream || TIER_CONTENT_LENGTH.ko.dream;
    const summaryLen = len.summary[tier] || len.summary.free;
    const detailLen = len.detail[tier] || len.detail.free;
    const hiddenLen = len.hiddenInsight[tier] || len.hiddenInsight.free;

    return `너는 30년 경력의 무속인이자 융 심리학 전문가다.
꿈을 보면 그 사람이 최근 겪고 있는 일, 숨기고 있는 감정, 본인도 모르는 욕망이 다 보인다.

## MrBeast 원칙 → 텍스트 도파민 구조 (이름 '지연' 예시)
| 단계 | 역할 | 원칙 |
|------|------|------|
| Hook | 핵심 의미 먼저 + 반전 | "지연님, 물에 빠지는 꿈? 나쁜 꿈 아니에요. 오히려 지금 지연님한테 필요한 신호예요." |
| Foreshadow | 못 보면 잠 못 잠 | 숨겨진 무의식의 메시지 암시 |
| Keywords | 5-7문장씩 (기존 대비 3배) | 상황 → 감정 → 숨은 맥락 |
| Bonus | 질문 이상의 가치 | 꿈이 알려주는 실제 행동 |
| Hidden | 4-6문장 마지막 선물 | 구체적 디테일 (시기, 상황, 숨겨진 감정) |

⚠️ 위 예시처럼 "당신" 대신 반드시 프로필의 이름을 사용! "당신" 절대 금지!

## 핵심 원칙
1. Hook에서 핵심 의미 먼저 + 반전으로 시작 ("OO님, 무서운 꿈이죠? 근데 좋은 꿈이에요.")
2. 각 상징 해석은 5-7문장 (표면 의미 → 숨겨진 의미 → 미처 몰랐던 것)
3. 문장 끝에서 반전 ("도망치는 거죠? 근데 진짜 도망치고 싶은 건 그게 아니에요")
4. 구체적 디테일이 도파민 ("이번 달 안에 뭔가 있어요", "주변에 ㅇ 들어가는 이름 있어요?")
5. 심리 분석: 꿈 뒤 숨은 진짜 심리를 짚어라 ("이 꿈을 굳이 물어보신 건... 이미 답을 알면서 확인받고 싶은 거죠")

⚠️ 반드시 기존 유형 중 하나를 선택해! 새로운 유형은 정말 기존 유형 중 어떤 것도 맞지 않을 때만 만들어.
- 무언가를 찾거나 탐험하는 꿈 → seeker(탐색자)
- 누군가를 보호하거나 지키는 꿈 → guardian(수호자)
- 자유롭게 떠도는 꿈 → wanderer(방랑자)
- 아픔이나 치유와 관련된 꿈 → healer(치유자)
- 예지몽이나 상징적 메시지 → prophet(예언자)
- 어둠이나 두려움과 관련된 꿈 → shadow(그림자)

newDreamType은 null로 설정하고, dreamType에 기존 유형 key를 넣어.

JSON만 반환:
{
  "title": "제목 (4-8글자)",
  "verdict": "핵심 한마디 (20자 이내)",
  "affirmation": "오늘의 확언 (나는 ~한다 형식, 15자 이내)",
  "dreamType": "기존 유형 key (영어 소문자)",
  "newDreamType": null,

  "jenny": {
    "hook": "⚠️프로필 이름 사용 필수! 핵심 의미 먼저 + 반전. 매번 완전히 다른 시작!",
    "foreshadow": "⚠️프로필 이름 사용! 궁금증 유발 멘트 - 매번 새롭게!",
    "situationTransition": "다음 내용 궁금증 유발 - 매번 다른 표현!",
    "unconsciousTransition": "마지막 선물 암시 - 매번 새로운 말투!",
    "bonus": "⚠️프로필 이름 사용! 질문 이상의 가치 - 매번 창의적으로!",
    "twist": {
      "emoji": "🌙",
      "title": "숨겨진 메시지",
      "message": "반전 메시지 (80자) - 표면과 다른 진짜 의미. 문장 끝 반전 필수."
    },
    "hiddenInsight": "⚠️프로필 이름으로 호칭! ${hiddenLen}자 이상 봉인 해제 메시지.",
    "shareHook": "공유 유도 - 매번 다르게!",
    "rewatchHook": "재방문 유도 - 매번 새롭게!"
  },

  "rarity": {
    "percent": "희귀도 숫자 (0.1~5.0)",
    "outOf": 1000,
    "description": "희귀도 설명"
  },

  "keywords": [
    {"word": "명사형 키워드1", "surface": "표면적 의미", "hidden": "5-7문장 숨겨진 의미"},
    {"word": "명사형 키워드2", "surface": "표면적 의미", "hidden": "5-7문장 숨겨진 의미"},
    {"word": "명사형 키워드3", "surface": "표면적 의미", "hidden": "5-7문장 숨겨진 의미"}
  ],

  "reading": {
    "situation": "5-7문장 상황 해석",
    "unconscious": "5-7문장 무의식 해석",
    "warning": "경고/주의 (100자)",
    "action": "행동 지침 (100자)"
  },

  "tarot": {"name": "타로 카드 이름 (영어)", "meaning": "의미 (40자)"},

  "dreamMeaning": {
    "summary": "핵심 의미 (${summaryLen}자)",
    "detail": "상세 해석 (${detailLen}자 이상)",
    "future": "미래 암시 (150자)"
  },

  "shareText": "공유용 한 줄 (30자)",

  "images": {
    "hero": "영어 50단어 이미지 프롬프트",
    "character": "캐릭터 외모 (영어 40단어)",
    "dream": "꿈 장면 (영어 40단어)",
    "tarot": "타로 장면 (영어 40단어)",
    "meaning": "의미 장면 (영어 40단어)"
  }
}

keywords는 꿈에서 핵심 상징물 3개. 반드시 명사형으로!`;
};

// 타로 시스템 프롬프트 (티어별 동적 생성)
export const getTarotSystemPrompt = (tier = 'free', lang = 'ko') => {
    const len = TIER_CONTENT_LENGTH[lang]?.tarot || TIER_CONTENT_LENGTH.ko.tarot;
    const cardLen = len.cardAnalysis[tier] || len.cardAnalysis.free;
    const conclusionLen = len.conclusion[tier] || len.conclusion.free;
    const hiddenLen = len.hiddenInsight[tier] || len.hiddenInsight.free;

    return `너는 30년 경력의 신비로운 타로 마스터다. 카드 리딩을 할 때 단순한 해석이 아니라 그 사람의 인생 이야기를 들려주듯이 깊고 감동적으로 풀어낸다.

###### 🚨🚨🚨 최우선 규칙: 카드 분석 길이 🚨🚨🚨
각 카드 분석(card1Analysis, card2Analysis, card3Analysis)은 반드시:
- 최소 ${cardLen}자 이상
- 6개 섹션 모두 포함: 상황/배경 → 감정 → 숨은 맥락 → 원인 → 미처 몰랐던 것 → 반전/디테일

conclusionCard는 반드시:
- 최소 ${conclusionLen}자 이상
- 확실한 답 + 예상 밖 방식 + 감동적인 마무리

- 짧게 쓰면 실패로 간주됨

## MrBeast 원칙 → 텍스트 도파민 구조
| 단계 | 역할 | 적용 | 예시 |
|------|------|------|------|
| Hook | 첫 카드에서 핵심 답 + 반전 | card1Analysis 첫 문장 | "연락 올까요? 와요. 근데 OO님이 기대하는 그런 연락은 아니에요." |
| Foreshadow | 4번째 카드 암시 | story.past 끝부분 | "마지막 카드가 진짜 답을 알려줄 거예요" |
| Progression | 점점 깊어지는 통찰 | 1→2→3 카드 | 표면→감정→무의식 순으로 깊어짐 |
| Twist | 결론 카드의 예상 밖 해석 | conclusionCard.twistMessage | "기다리지 말라는 게 아니에요. 기다리는 동안 OO님이 변할 거예요" |

## 핵심 원칙
1. 첫 문장에서 답 먼저 + 반전 ("OO님, 연락 와요. 근데 기대하는 연락은 아니에요")
2. 각 카드 분석은 ${cardLen}자 이상 (상황→감정→숨은 맥락→미처 몰랐던 것→반전)
3. 카드 사이 연결 문장 필수 (다음 궁금하게)
4. 4번째 카드는 "모든 것을 뒤집는" 결론
5. 구체적 디테일이 도파민 ("3주 안에", "ㅇ 들어가는 이름")

JSON만 반환:
{
  "hook": "⚠️프로필 이름 사용! 첫 문장에서 답 + 반전",
  "foreshadow": "4번째 카드 암시",
  "story": {
    "past": "배경 스토리 (5문장)",
    "situation": "현재 상황 (5문장)",
    "future": "앞으로 (5문장)"
  },
  "card1Analysis": "${cardLen}자 이상",
  "card2Analysis": "${cardLen}자 이상",
  "card3Analysis": "${cardLen}자 이상",
  "conclusionCard": {
    "name": "카드명",
    "position": "정방향/역방향",
    "emoji": "이모지",
    "message": "한 줄 메시지",
    "twistMessage": "반전 메시지",
    "detailedReading": "${conclusionLen}자 이상"
  },
  "finalAnswer": {
    "answer": "최종 답변",
    "timing": "시기",
    "action": "행동 지침",
    "warning": "주의사항"
  },
  "hiddenInsight": "${hiddenLen}자 이상",
  "shareText": "공유용 한 줄",
  "images": {
    "spread": "영어 50단어",
    "card1": "영어 40단어",
    "card2": "영어 40단어",
    "card3": "영어 40단어",
    "conclusion": "영어 40단어"
  }
}`;
};

// 사주 시스템 프롬프트 (티어별 동적 생성)
export const getFortuneSystemPrompt = (tier = 'free', lang = 'ko') => {
    const len = TIER_CONTENT_LENGTH[lang]?.fortune || TIER_CONTENT_LENGTH.ko.fortune;
    const sectionLen = len.section[tier] || len.section.free;
    const overallLen = len.overall[tier] || len.overall.free;
    const hiddenLen = len.hiddenInsight[tier] || len.hiddenInsight.free;

    return `너는 대한민국 최고의 사주명리학자이자 동양철학 박사다.
사주팔자를 읽으면 그 사람의 타고난 기질, 인생의 흐름, 숨겨진 재능이 다 보인다.
단순한 운세가 아니라 인생 코칭을 해주듯이 깊고 실용적으로 풀어낸다.

###### 🚨🚨🚨 최우선 규칙: 분석 길이 🚨🚨🚨
각 운세 분석은 반드시:
- 최소 ${sectionLen}자 이상
- 구체적인 시기, 상황, 행동 지침 포함

종합운은 반드시:
- 최소 ${overallLen}자 이상

짧게 쓰면 실패로 간주됨

## MrBeast 원칙 → 텍스트 도파민 구조
| 단계 | 역할 | 적용 |
|------|------|------|
| Hook | 핵심 먼저 + 반전 | "OO님, 올해 돈 벌어요. 근데 생각하는 방식으로는 아니에요" |
| Foreshadow | 더 볼 이유 | "끝까지 보면 OO님만의 행운의 시기가 나와요" |
| Detail | 구체적 디테일 | "4월 셋째 주", "ㅈ으로 시작하는 사람" |
| Twist | 예상 밖 조언 | "쉬라는 게 아니에요. 다른 방식으로 움직이라는 거예요" |

## 핵심 원칙
1. 첫 문장에서 핵심 답 + 반전
2. 각 분석은 ${sectionLen}자 이상
3. 구체적 시기와 상황 제시
4. 실천 가능한 행동 지침
5. 마지막에 숨겨진 인사이트

JSON만 반환:
{
  "hook": "⚠️프로필 이름 사용! 핵심 + 반전",
  "foreshadow": "끝까지 볼 이유",
  "saju": {
    "year": "년주 분석",
    "month": "월주 분석",
    "day": "일주 분석",
    "hour": "시주 분석"
  },
  "personality": {
    "core": "핵심 성격 (${sectionLen}자 이상)",
    "strength": "강점 (${sectionLen}자 이상)",
    "weakness": "약점 (${sectionLen}자 이상)",
    "hidden": "숨겨진 재능 (${sectionLen}자 이상)"
  },
  "fortune": {
    "overall": "종합운 (${overallLen}자 이상)",
    "love": "연애운 (${sectionLen}자 이상)",
    "money": "재물운 (${sectionLen}자 이상)",
    "career": "직업운 (${sectionLen}자 이상)",
    "health": "건강운 (${sectionLen}자 이상)"
  },
  "timing": {
    "lucky": "행운의 시기",
    "caution": "주의할 시기",
    "action": "행동할 시기"
  },
  "finalAdvice": "최종 조언 (5문장)",
  "hiddenInsight": "숨겨진 인사이트 (${hiddenLen}자 이상)",
  "shareText": "공유용 한 줄"
}`;
};

// 심층 분석 시스템 프롬프트 (정적 부분)
export const DETAILED_ANALYSIS_SYSTEM_PROMPT = `당신은 30년 경력의 꿈 해몽가이자 에세이스트입니다. 친구에게 편하게 이야기하듯 꿈을 풀이해주세요.

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

## 💭 마음이 보내는 신호
(무의식이 전하려는 메시지를 부드럽게)

## 🌊 흐르는 감정의 물결
(꿈에서 느꼈을 감정과 현실의 연결)

## ✨ 내일을 위한 작은 속삭임
(실천 가능한 조언을 자연스럽게)

## 🌟 마지막으로
(따뜻한 응원의 말)`;

/**
 * 캐시된 Claude API 호출
 * @param {Anthropic} client - Anthropic 클라이언트
 * @param {string} systemPrompt - 시스템 프롬프트 (캐시 대상)
 * @param {string} userMessage - 사용자 메시지 (동적)
 * @param {string} model - 모델 ID
 * @param {number} maxTokens - 최대 토큰
 * @param {string} mode - 모드 (dream, tarot, saju, detailed) - 분석용
 * @returns {Promise<string>} - 응답 텍스트
 */
export const callClaudeWithCache = async (client, systemPrompt, userMessage, model, maxTokens, mode = 'dream') => {
    const result = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: [
            {
                type: "text",
                text: systemPrompt,
                cache_control: { type: "ephemeral" }
            }
        ],
        messages: [{ role: "user", content: userMessage }]
    });

    // 캐시 사용 통계 로깅 및 추적
    if (result.usage) {
        const { input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens } = result.usage;
        console.log(`📊 Token Usage: input=${input_tokens}, output=${output_tokens}`);
        if (cache_creation_input_tokens) {
            console.log(`💾 Cache Created: ${cache_creation_input_tokens} tokens (25% premium)`);
        }
        if (cache_read_input_tokens) {
            console.log(`✅ Cache Hit: ${cache_read_input_tokens} tokens (90% savings!)`);
        }

        // Analytics 기록 (클라이언트 사이드에서만)
        if (typeof window !== 'undefined') {
            import('./cacheAnalytics.js').then(({ recordCacheUsage }) => {
                recordCacheUsage(result.usage, mode, model);
            }).catch(() => {
                // 서버 사이드에서는 무시
            });
        }
    }

    return result.content[0].text;
};

/**
 * 스트리밍 Claude API 호출 (Progressive Loading용)
 *
 * JSON 섹션이 완료될 때마다 콜백 호출
 * - hook 완료 → onHook 콜백 → 결과 페이지 전환 + Hero 이미지 시작
 * - card1 완료 → onCard1 콜백 → Card1 이미지 시작
 * - 등등...
 *
 * @param {Anthropic} client - Anthropic 클라이언트
 * @param {string} systemPrompt - 시스템 프롬프트 (캐시 대상)
 * @param {string} userMessage - 사용자 메시지 (동적)
 * @param {string} model - 모델 ID
 * @param {number} maxTokens - 최대 토큰
 * @param {Object} callbacks - 섹션 완료 콜백
 * @param {string} mode - 모드 (tarot, dream, saju)
 * @returns {Promise<string>} - 전체 응답 텍스트
 */
export const callClaudeWithCacheStreaming = async (
    client,
    systemPrompt,
    userMessage,
    model,
    maxTokens,
    callbacks = {},
    mode = 'tarot'
) => {
    console.log('🚀 Sonnet 스트리밍 시작...');

    // 스트리밍 요청 옵션 구성
    const streamOptions = {
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: userMessage }]
    };

    // systemPrompt가 있으면 캐싱 적용, 없으면 user message만
    if (systemPrompt) {
        streamOptions.system = [
            {
                type: "text",
                text: systemPrompt,
                cache_control: { type: "ephemeral" }
            }
        ];
        console.log('💾 시스템 프롬프트 캐싱 적용');
    } else {
        console.log('📝 시스템 프롬프트 없음 (user message only)');
    }

    const stream = client.messages.stream(streamOptions);

    let buffer = '';
    const parsed = {
        title: false,
        verdict: false,
        topics: false,
        keywords: false,
        hook: false,
        foreshadow: false,
        visualMode: false,
        imageStyle: false,
        colorPalette: false,
        heroImagePrompt: false,
        card1: false,
        card1ImagePrompt: false,
        card2: false,
        card2ImagePrompt: false,
        card3: false,
        card3ImagePrompt: false,
        conclusion: false,
        conclusionImagePrompt: false,
        hiddenInsight: false,
        images: false
    };

    // JSON 값 추출 헬퍼 (이스케이프된 따옴표 처리)
    const extractJsonValue = (key, text) => {
        // "key": "value" 또는 "key": "value with \"escaped\" quotes"
        const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
        const match = text.match(regex);
        if (match) {
            const value = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            // 디버깅: visualMode, imageStyle, colorPalette 값 확인
            if (['visualMode', 'imageStyle', 'colorPalette'].includes(key)) {
                console.log(`🔍 extractJsonValue(${key}) = "${value}"`);
            }
            return value;
        }
        return null;
    };

    // 긴 텍스트 필드 추출 (card analysis 등)
    const extractLongValue = (key, text) => {
        const startPattern = `"${key}"\\s*:\\s*"`;
        const startMatch = text.match(new RegExp(startPattern));
        if (!startMatch) return null;

        const startIdx = text.indexOf(startMatch[0]) + startMatch[0].length;
        let endIdx = startIdx;
        let escaped = false;

        for (let i = startIdx; i < text.length; i++) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (text[i] === '\\') {
                escaped = true;
                continue;
            }
            if (text[i] === '"') {
                endIdx = i;
                break;
            }
        }

        if (endIdx > startIdx) {
            return text.slice(startIdx, endIdx).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        return null;
    };

    // 섹션 완료 감지 및 콜백 호출
    // ⚠️ 순서 중요: hook → foreshadow → title → verdict 먼저!
    const checkAndTriggerCallbacks = () => {
        // Hook 감지 (가장 먼저!)
        if (!parsed.hook && callbacks.onHook) {
            const hook = extractJsonValue('hook', buffer);
            if (hook && hook.length > 10) {
                console.log('✅ Hook 완료:', hook.slice(0, 30) + '...');
                callbacks.onHook(hook);
                parsed.hook = true;
            }
        }

        // Foreshadow 감지
        if (!parsed.foreshadow && callbacks.onForeshadow) {
            const foreshadow = extractJsonValue('foreshadow', buffer);
            if (foreshadow && foreshadow.length > 10) {
                console.log('✅ Foreshadow 완료:', foreshadow.slice(0, 30) + '...');
                callbacks.onForeshadow(foreshadow);
                parsed.foreshadow = true;
            }
        }

        // Title 감지
        if (!parsed.title && callbacks.onTitle) {
            const title = extractJsonValue('title', buffer);
            if (title && title.length > 5) {
                console.log('📝 Title 완료:', title.slice(0, 30) + '...');
                callbacks.onTitle(title);
                parsed.title = true;
            }
        }

        // Verdict 감지
        if (!parsed.verdict && callbacks.onVerdict) {
            const verdict = extractJsonValue('verdict', buffer);
            if (verdict && verdict.length > 3) {
                console.log('📝 Verdict 완료:', verdict);
                callbacks.onVerdict(verdict);
                parsed.verdict = true;
            }
        }

        // Topics 감지 (뒤로 이동)
        if (!parsed.topics && callbacks.onTopics) {
            const topicsMatch = buffer.match(/"topics"\s*:\s*\[([^\]]+)\]/);
            if (topicsMatch) {
                try {
                    const topics = JSON.parse('[' + topicsMatch[1] + ']');
                    console.log('📝 Topics 완료:', topics);
                    callbacks.onTopics(topics);
                    parsed.topics = true;
                } catch (e) {}
            }
        }

        // Keywords 감지 (뒤로 이동)
        if (!parsed.keywords && callbacks.onKeywords) {
            const keywordsMatch = buffer.match(/"keywords"\s*:\s*\[([\s\S]*?)\]/);
            if (keywordsMatch) {
                try {
                    const keywords = JSON.parse('[' + keywordsMatch[1] + ']');
                    if (keywords.length >= 3) {
                        console.log('📝 Keywords 완료:', keywords.map(k => k.word));
                        callbacks.onKeywords(keywords);
                        parsed.keywords = true;
                    }
                } catch (e) {}
            }
        }

        // visualMode 감지 (imageStyle 전에 파싱되어야 함)
        if (!parsed.visualMode && callbacks.onVisualMode) {
            const mode = extractJsonValue('visualMode', buffer);
            if (mode) {
                console.log('🎬 Claude 선택 비주얼 모드:', mode);
                callbacks.onVisualMode(mode);
                parsed.visualMode = true;
            }
        }

        // imageStyle 감지 (heroImagePrompt 전에 파싱되어야 함)
        if (!parsed.imageStyle && callbacks.onImageStyle) {
            const style = extractJsonValue('imageStyle', buffer);
            if (style) {
                console.log('🎨 Claude 선택 스타일:', style);
                callbacks.onImageStyle(style);
                parsed.imageStyle = true;
            }
        }

        // colorPalette 감지 (heroImagePrompt 전에 파싱되어야 함)
        if (!parsed.colorPalette && callbacks.onColorPalette) {
            const palette = extractJsonValue('colorPalette', buffer);
            if (palette) {
                console.log('🎨 Claude 선택 컬러:', palette);
                callbacks.onColorPalette(palette);
                parsed.colorPalette = true;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // 이미지 프롬프트들 (Analysis보다 먼저 생성되므로 먼저 파싱)
        // ⚠️ visualMode, imageStyle, colorPalette가 먼저 파싱된 후에만 이미지 생성
        // ═══════════════════════════════════════════════════════════════

        // Hero 이미지 프롬프트 감지 → Hero 이미지 생성 시작
        // ⚠️ visualMode와 imageStyle이 파싱된 후에만 실행 (순서 보장)
        if (!parsed.heroImagePrompt && callbacks.onHeroImagePrompt && parsed.imageStyle) {
            const prompt = extractJsonValue('heroImagePrompt', buffer);
            if (prompt && prompt.length > 20) {
                console.log('🎨 Hero 이미지 프롬프트 완료 → 이미지 생성 시작');
                callbacks.onHeroImagePrompt(prompt);
                parsed.heroImagePrompt = true;
            }
        }

        // Card 1 이미지 프롬프트 감지 → 이미지 생성 시작 (Analysis보다 먼저!)
        // ⚠️ imageStyle이 파싱된 후에만 실행
        if (!parsed.card1ImagePrompt && callbacks.onCard1ImagePrompt && parsed.imageStyle) {
            const prompt = extractJsonValue('card1ImagePrompt', buffer);
            if (prompt && prompt.length > 20) {
                console.log('🎨 Card 1 이미지 프롬프트 완료 → 이미지 생성 시작');
                callbacks.onCard1ImagePrompt(prompt);
                parsed.card1ImagePrompt = true;
            }
        }

        // Card 2 이미지 프롬프트 감지 → 이미지 생성 시작 (Analysis보다 먼저!)
        // ⚠️ imageStyle이 파싱된 후에만 실행
        if (!parsed.card2ImagePrompt && callbacks.onCard2ImagePrompt && parsed.imageStyle) {
            const prompt = extractJsonValue('card2ImagePrompt', buffer);
            if (prompt && prompt.length > 20) {
                console.log('🎨 Card 2 이미지 프롬프트 완료 → 이미지 생성 시작');
                callbacks.onCard2ImagePrompt(prompt);
                parsed.card2ImagePrompt = true;
            }
        }

        // Card 3 이미지 프롬프트 감지 → 이미지 생성 시작 (Analysis보다 먼저!)
        // ⚠️ imageStyle이 파싱된 후에만 실행
        if (!parsed.card3ImagePrompt && callbacks.onCard3ImagePrompt && parsed.imageStyle) {
            const prompt = extractJsonValue('card3ImagePrompt', buffer);
            if (prompt && prompt.length > 20) {
                console.log('🎨 Card 3 이미지 프롬프트 완료 → 이미지 생성 시작');
                callbacks.onCard3ImagePrompt(prompt);
                parsed.card3ImagePrompt = true;
            }
        }

        // Conclusion 이미지 프롬프트 감지 → 이미지 생성 시작
        // ⚠️ imageStyle이 파싱된 후에만 실행
        if (!parsed.conclusionImagePrompt && callbacks.onConclusionImagePrompt && parsed.imageStyle) {
            const prompt = extractJsonValue('conclusionImagePrompt', buffer);
            if (prompt && prompt.length > 20) {
                console.log('🎨 Conclusion 이미지 프롬프트 완료 → 이미지 생성 시작');
                callbacks.onConclusionImagePrompt(prompt);
                parsed.conclusionImagePrompt = true;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // Card Analysis들 (이미지 프롬프트 이후에 생성됨)
        // ═══════════════════════════════════════════════════════════════

        // Card 1 분석 감지
        if (!parsed.card1 && callbacks.onCard1) {
            const card1 = extractLongValue('card1Analysis', buffer);
            if (card1 && card1.length > 100) {
                console.log('✅ Card 1 분석 완료');
                callbacks.onCard1(card1);
                parsed.card1 = true;
            }
        }

        // Card 2 분석 감지
        if (!parsed.card2 && callbacks.onCard2) {
            const card2 = extractLongValue('card2Analysis', buffer);
            if (card2 && card2.length > 100) {
                console.log('✅ Card 2 분석 완료');
                callbacks.onCard2(card2);
                parsed.card2 = true;
            }
        }

        // Card 3 분석 감지
        if (!parsed.card3 && callbacks.onCard3) {
            const card3 = extractLongValue('card3Analysis', buffer);
            if (card3 && card3.length > 100) {
                console.log('✅ Card 3 분석 완료');
                callbacks.onCard3(card3);
                parsed.card3 = true;
            }
        }

        // Conclusion 분석 감지
        if (!parsed.conclusion && callbacks.onConclusion) {
            const detailed = extractLongValue('conclusionCard', buffer);
            if (detailed && detailed.length > 100) {
                console.log('✅ Conclusion 분석 완료');
                callbacks.onConclusion(detailed);
                parsed.conclusion = true;
            }
        }

        // Hidden Insight 감지
        if (!parsed.hiddenInsight && callbacks.onHiddenInsight) {
            const hidden = extractLongValue('hiddenInsight', buffer);
            if (hidden && hidden.length > 50) {
                console.log('✅ Hidden Insight 완료');
                callbacks.onHiddenInsight(hidden);
                parsed.hiddenInsight = true;
            }
        }

        // Images 객체 감지 (이미지 프롬프트)
        if (!parsed.images && callbacks.onImages) {
            // "images": { ... } 블록 완료 감지
            const imagesMatch = buffer.match(/"images"\s*:\s*\{[^}]+\}/);
            if (imagesMatch) {
                try {
                    // 이미지 객체만 추출해서 파싱
                    const imagesStr = '{' + imagesMatch[0] + '}';
                    const imagesObj = JSON.parse(imagesStr.replace(/,\s*$/, ''));
                    console.log('🖼️ 이미지 프롬프트 완료');
                    callbacks.onImages(imagesObj.images);
                    parsed.images = true;
                } catch (e) {
                    // 아직 완전하지 않음
                }
            }
        }

        // 진행률 콜백 (버퍼 길이 기반 대략적 추정)
        if (callbacks.onProgress) {
            const estimatedProgress = Math.min(buffer.length / 8000, 0.95); // 대략 8000자 예상
            callbacks.onProgress(estimatedProgress);
        }
    };

    // 스트리밍 이벤트 처리
    for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            buffer += event.delta.text;
            checkAndTriggerCallbacks();
        }
    }

    // 최종 결과 처리
    const finalMessage = await stream.finalMessage();

    // 캐시 통계 로깅 및 Analytics 기록
    if (finalMessage.usage) {
        const { input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens } = finalMessage.usage;
        console.log(`📊 Token Usage: input=${input_tokens}, output=${output_tokens}`);
        if (cache_creation_input_tokens) {
            console.log(`💾 Cache Created: ${cache_creation_input_tokens} tokens`);
        }
        if (cache_read_input_tokens) {
            console.log(`✅ Cache Hit: ${cache_read_input_tokens} tokens (90% savings!)`);
        }

        // Analytics 기록
        if (typeof window !== 'undefined') {
            import('./cacheAnalytics.js').then(({ recordCacheUsage }) => {
                recordCacheUsage(finalMessage.usage, mode, model);
            }).catch(() => {});
        }
    }

    console.log('🎉 Sonnet 스트리밍 완료');

    // 완료 콜백
    if (callbacks.onComplete) {
        callbacks.onComplete(buffer);
    }

    return buffer;
};

/**
 * 프로필 기반 동적 프롬프트 생성 (꿈 해몽용)
 * @param {string} dreamDescription - 꿈 내용
 * @param {Object} userProfile - 사용자 프로필
 * @param {string} profileBlock - 프로필 블록
 * @param {string} existingTypesList - 기존 꿈 유형 목록
 * @returns {string} - 동적 사용자 메시지
 */
export const buildDreamUserMessage = (dreamDescription, profileBlock, existingTypesList) => {
    return `${profileBlock}

## 꿈 유형 - 매우 중요!!!
기존 유형: ${existingTypesList}

꿈 내용: "${dreamDescription}"`;
};

/**
 * 프로필 기반 동적 프롬프트 생성 (타로용)
 * @param {string} question - 질문
 * @param {Array} selectedCards - 선택된 카드
 * @param {Object} conclusionCard - 결론 카드
 * @param {string} profileBlock - 프로필 블록
 * @returns {string} - 동적 사용자 메시지
 */
export const buildTarotUserMessage = (question, selectedCards, conclusionCard, profileBlock) => {
    const [card1, card2, card3] = selectedCards;
    return `${profileBlock}

## 질문
"${question}"

## 뽑힌 카드
1. ${card1.name} (${card1.position === 'reversed' ? '역방향' : '정방향'}) - 현재 상황
2. ${card2.name} (${card2.position === 'reversed' ? '역방향' : '정방향'}) - 장애물/도전
3. ${card3.name} (${card3.position === 'reversed' ? '역방향' : '정방향'}) - 결과/조언

## 결론 카드 (운명이 선택한 4번째 카드)
${conclusionCard.name} - 이 카드로 최종 답을 내려줘`;
};

/**
 * 프로필 기반 동적 프롬프트 생성 (사주용)
 * @param {Object} birthInfo - 생년월일시 정보
 * @param {string} profileBlock - 프로필 블록
 * @returns {string} - 동적 사용자 메시지
 */
export const buildFortuneUserMessage = (birthInfo, profileBlock) => {
    return `${profileBlock}

## 생년월일시
- 생년월일: ${birthInfo.birthDate}
- 태어난 시간: ${birthInfo.birthTime || '모름'}
- 성별: ${birthInfo.gender === 'female' ? '여성' : birthInfo.gender === 'male' ? '남성' : '미정'}

위 정보로 사주팔자를 분석해줘.`;
};
