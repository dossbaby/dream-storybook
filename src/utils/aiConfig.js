/**
 * AI Model Configuration
 * Dream Storybook AI - 커뮤니티 우선 전략 (v5)
 *
 * 핵심 원칙: 모든 사용자에게 최고 품질 리딩 제공
 * - AI 품질 차별화 X (무료도 최고 품질)
 * - 편의성으로만 차별화 (동시 분석, 알림, 통계 등)
 *
 * 참고: docs/jeom-ai-content-strategy.md
 * "하지 말아야 할 것: 기능 차별화"
 * ❌ 무료: GPT-3.5 / 유료: GPT-4
 * ✅ 무료: 핵심 기능 전부 (리딩, 스레드 참여, 평가)
 */

export const AI_MODELS = {
    // 텍스트 분석 모델 - 모든 티어 동일 (Sonnet 4.5)
    text: {
        free: 'claude-sonnet-4-5',
        premium: 'claude-sonnet-4-5',
        ultra: 'claude-sonnet-4-5'
    },

    // 키워드 생성 (Sonnet 고정 - SEO 품질 보장)
    keywords: 'claude-sonnet-4-5',

    // 도파민 메시지 (Haiku - 가장 빠른 모델로 분석 중 메시지 선생성)
    dopamine: 'claude-haiku-4-5',

    // 이미지 생성 - 모든 티어 동일 (Gemini 3 Pro)
    image: {
        free: 'gemini-3-pro-image-preview',
        premium: 'gemini-3-pro-image-preview',
        ultra: 'gemini-3-pro-image-preview'
    }
};

/**
 * Gemini 3 Pro Image 설정
 * - 리딩 결과: 16:9 슬라이드 형식
 * - 소셜 공유: 9:16 세로 형식 (인스타 스토리, 릴스 등)
 * - 내보내기: 1:1 인스타 피드용
 */
export const IMAGE_CONFIG = {
    // 리딩 결과 이미지 (기본)
    reading: {
        aspectRatio: '16:9',
        imageSize: 'HD'
    },
    // 소셜 공유용 이미지 (스토리/릴스)
    share: {
        aspectRatio: '9:16',
        imageSize: 'HD'
    },
    // 내보내기용 이미지 (인스타 피드)
    export: {
        aspectRatio: '1:1',
        imageSize: 'HD'
    }
};

/**
 * 동적 애니메 스타일 시스템
 * Claude가 질문 분위기에 맞게 선택 → Gemini에 전달
 *
 * 사용: const stylePrefix = ANIME_STYLES[imageStyle] || ANIME_STYLES.shinkai;
 */
export const ANIME_STYLES = {
    // 로맨틱/몽환적 계열
    shinkai: 'Makoto Shinkai style (Your Name, Weathering With You). Golden hour lighting, hyper-detailed backgrounds, dreamy twilight, warm oranges and cool blues',
    kyoani: 'Kyoto Animation style (Violet Evergarden). Soft lighting, delicate detailed lines, over-saturated pastel colors, elegant and emotional',
    ghibli: 'Studio Ghibli style (Spirited Away). Magical realism, soft vivid tones, hand-painted aesthetic, childlike wonder',

    // 다크/액션 계열
    mappa_dark: 'MAPPA dark style (Chainsaw Man). Edgy gritty aesthetic, bold shadows, visceral intensity, mature themes',
    mappa_action: 'MAPPA action style (Jujutsu Kaisen). Dynamic fluid motion, intense vibrant colors, powerful fight choreography',
    ufotable: 'Ufotable style (Demon Slayer). CGI-2D seamless blend, layered particle effects, breathtaking vibrant combat',

    // 스타일리시/아트 계열
    trigger: 'Studio Trigger style (Cyberpunk Edgerunners, Promare). Vivid neon colors, bold geometric shapes, explosive kinetic energy',
    sciencesaru: 'Science Saru style (Dan Da Dan, Devilman Crybaby). Heavy color washes, flash animation fluidity, experimental bold',

    // 클래식/우아한 계열
    shojo: 'Classic shojo style (Apothecary Diaries). Breathtaking details, sparkles and flowers, elegant flowing aesthetic',
    persona5: 'Persona 5 style. Bold red-black-white contrast, stylish UI elements, sharp angular designs, rebellious punk aesthetic, striking silhouettes',

    // 특수 스타일
    cgi_gem: 'CGI crystalline style (Land of the Lustrous). Gemstone characters, glittering ethereal surfaces, prismatic beauty',
    minimalist: 'Minimalist artistic anime. Clean simple lines, strategic negative space, subtle muted color palette'
};

/**
 * 스타일 선택 가이드 (Claude 프롬프트용)
 */
export const STYLE_GUIDE = {
    romantic: ['shinkai', 'kyoani', 'shojo'],           // 연애, 감성, 그리움
    dark: ['mappa_dark', 'trigger'],                     // 공포, 불안, 악몽
    action: ['mappa_action', 'ufotable', 'persona5'],    // 도전, 변화, 갈등
    mystical: ['ghibli', 'sciencesaru', 'cgi_gem'],     // 신비, 마법, 환상
    calm: ['kyoani', 'minimalist', 'ghibli']            // 평화, 치유, 안정
};

/**
 * 티어별 프롬프트 글자 수 설정 (언어별)
 * - 프롬프트에서 Claude에게 글자 수 가이드로 전달
 * - 언어별로 다른 글자 수 적용 가능 (한글/영어/일본어 등)
 */
export const TIER_CONTENT_LENGTH = {
    ko: {
        tarot: {
            cardAnalysis: { free: 700, premium: 1300, ultra: 1400 },
            conclusion: { free: 800, premium: 1500, ultra: 1600 },
            hiddenInsight: { free: 1300, premium: 1300, ultra: 1400 }
        },
        dream: {
            summary: { free: 350, premium: 450, ultra: 500 },
            detail: { free: 700, premium: 1300, ultra: 1500 },
            hiddenInsight: { free: 1300, premium: 1300, ultra: 1400 }
        },
        fortune: {
            section: { free: 400, premium: 800, ultra: 900 },
            overall: { free: 800, premium: 1600, ultra: 1700 },
            hiddenInsight: { free: 1300, premium: 1300, ultra: 1400 }
        }
    }
    // en: { ... },  // 나중에 추가
    // ja: { ... },  // 나중에 추가
};

/**
 * 티어별 콘텐츠 길이 가져오기
 * @param {string} mode - 'tarot' | 'dream' | 'fortune'
 * @param {string} field - 필드명 (cardAnalysis, conclusion, summary 등)
 * @param {string} tier - 'free' | 'premium' | 'ultra'
 * @param {string} lang - 언어 코드 (기본: 'ko')
 * @returns {number} 글자 수
 */
export const getContentLength = (mode, field, tier = 'free', lang = 'ko') => {
    return TIER_CONTENT_LENGTH[lang]?.[mode]?.[field]?.[tier] || 700;
};

/**
 * 모델 설정 가져오기 (커뮤니티 우선 전략)
 * - 모든 사용자에게 동일한 최고 품질 AI 제공
 * - 티어는 편의성 차별화만 (동시 분석 수, 알림 등)
 *
 * @param {string} tier - 티어 ('free' | 'premium' | 'ultra') - 레거시 호환용
 * @returns {Object} 모델 설정 객체
 */
export const getModelConfig = (tier = 'free') => {
    return {
        // 텍스트 분석 모델 - 모든 티어 동일
        textModel: AI_MODELS.text.free,

        // 키워드 모델 (Sonnet 고정 - SEO 품질 보장)
        keywordModel: AI_MODELS.keywords,

        // 이미지 모델 - 모든 티어 동일 (Gemini 3 Pro)
        imageModel: AI_MODELS.image.free,

        // 프롬프트 스타일 (MrBeast 도파민)
        promptStyle: 'mrBeastDopamine',

        // 분석 깊이 - 모든 티어 최고 품질
        analysisDepth: 'deep',
        maxTokens: 6000,

        // 콘텐츠 접근 권한 - 모든 기능 해금
        hasHiddenInsight: true,
        hasDetailedAnalysis: true,
        hasUltraInsight: true,

        // 티어 정보 (레거시 호환)
        tier,
        isPremium: true,  // 모든 사용자 프리미엄 취급
        isUltra: true     // 모든 사용자 울트라 취급
    };
};

/**
 * 사용 제한 (커뮤니티 우선 전략)
 * - 모든 사용자 무제한 (단, 동시 분석 1개)
 * - 편의성 차별화: 프리미엄은 동시 분석 3개
 *
 * 참고: docs/jeom-ai-content-strategy.md
 * "무료: 리딩 무제한 (단, 동시 분석 1개)"
 */
export const TIER_LIMITS = {
    free: {
        dream: { weekly: Infinity },
        tarot: { weekly: Infinity },
        saju: { weekly: Infinity },
        concurrent: 1  // 동시 분석 1개
    },
    premium: {
        dream: { weekly: Infinity },
        tarot: { weekly: Infinity },
        saju: { weekly: Infinity },
        concurrent: 3  // 동시 분석 3개
    },
    ultra: {
        dream: { weekly: Infinity },
        tarot: { weekly: Infinity },
        saju: { weekly: Infinity },
        concurrent: 3  // 동시 분석 3개
    }
};

/**
 * 티어별 히스토리 표시 제한
 * - 커뮤니티 우선 전략: 모든 티어 무제한
 * - 프리미엄 차별화는 편의 기능으로 (AI 품질 X)
 */
export const HISTORY_LIMITS = {
    free: Infinity,
    premium: Infinity,
    ultra: Infinity
};

/**
 * 비용 분석 (참고용) - 커뮤니티 우선 전략
 * 모든 사용자: Sonnet 4.5 + Gemini 3 Pro
 */
export const COST_ESTIMATES = {
    perReading: {
        sonnet: 0.008,
        geminiPro: 0.005,
        total: 0.013  // ~18원/리딩
    }
};

/**
 * 서비스 정보 (UI용) - 커뮤니티 우선 전략
 * 모든 사용자에게 동일한 최고 품질 제공
 *
 * 편의성 차별화만 적용:
 * - 무료: 동시 분석 1개
 * - 프리미엄: 동시 분석 3개, 실시간 알림, 통계 분석
 */
export const TIER_COMPARISON = {
    free: {
        name: '무료',
        aiLabel: '최고 품질 AI 리딩',
        hasHiddenInsight: true,
        hasDetailedAnalysis: true,
        imageQuality: 'HD (Gemini 3 Pro)',
        hasAds: false,
        usageLimit: '무제한',
        concurrent: 1,
        description: '모든 기능 무료로 즐기세요'
    },
    premium: {
        name: '프리미엄',
        aiLabel: '최고 품질 AI 리딩',
        hasHiddenInsight: true,
        hasDetailedAnalysis: true,
        imageQuality: 'HD (Gemini 3 Pro)',
        hasAds: false,
        usageLimit: '무제한',
        concurrent: 3,
        features: ['동시 분석 3개', '실시간 알림', '통계 분석'],
        description: '더 편리하게 여러 리딩을 동시에'
    },
    ultra: {
        name: '울트라',
        aiLabel: '최고 품질 AI 리딩',
        hasHiddenInsight: true,
        hasDetailedAnalysis: true,
        imageQuality: 'HD (Gemini 3 Pro)',
        hasAds: false,
        usageLimit: '무제한',
        concurrent: 3,
        features: ['동시 분석 3개', '실시간 알림', '통계 분석', 'VIP 배지'],
        description: '커뮤니티 서포터'
    }
};

/**
 * 맞춤 질문 옵션 (티어별)
 * - 무료: 사전 정의된 질문 선택만 가능
 * - 프리미엄+: 자유 질문 입력 가능
 */
export const CUSTOM_QUESTION_CONFIG = {
    // 꿈 해석용 질문 옵션
    dream: {
        presetQuestions: [
            { id: 'general', emoji: '🌙', label: '전체적인 꿈 해석', description: '꿈의 의미를 종합적으로 해석해주세요' },
            { id: 'love', emoji: '💕', label: '연애/관계 관점', description: '이 꿈이 나의 연애나 인간관계에 대해 말하는 것이 있나요?' },
            { id: 'career', emoji: '💼', label: '직장/진로 관점', description: '이 꿈이 나의 커리어나 진로에 대해 암시하는 것이 있나요?' },
            { id: 'money', emoji: '💰', label: '재물/금전 관점', description: '이 꿈이 재물운이나 금전적 상황에 대해 말하는 것이 있나요?' },
            { id: 'health', emoji: '🏥', label: '건강/심리 관점', description: '이 꿈이 나의 건강이나 심리 상태에 대해 말하는 것이 있나요?' },
            { id: 'warning', emoji: '⚠️', label: '경고/주의 메시지', description: '이 꿈에서 내가 주의해야 할 경고 메시지가 있나요?' }
        ],
        customPlaceholder: '예: 이 꿈이 다음 달 취업 면접에 대해 말하는 것이 있을까요?'
    },
    // 사주용 질문 옵션
    fortune: {
        presetQuestions: [
            { id: 'today', emoji: '☯️', label: '오늘의 전체 운세', description: '오늘 하루 전반적인 운세를 알려주세요' },
            { id: 'love', emoji: '💕', label: '연애운', description: '오늘의 연애운과 이성 관계에 대해 알려주세요' },
            { id: 'career', emoji: '💼', label: '직장운', description: '오늘의 직장운과 업무 관련 운세를 알려주세요' },
            { id: 'money', emoji: '💰', label: '재물운', description: '오늘의 재물운과 금전적 운세를 알려주세요' },
            { id: 'health', emoji: '🏥', label: '건강운', description: '오늘의 건강운과 주의사항을 알려주세요' },
            { id: 'social', emoji: '🤝', label: '대인관계운', description: '오늘의 대인관계와 인연에 대해 알려주세요' }
        ],
        customPlaceholder: '예: 이번 달 안에 이직해도 될까요?'
    }
};

/**
 * 맞춤 질문 권한 (커뮤니티 우선 전략)
 * 모든 사용자에게 모든 기능 제공
 */
export const getCustomQuestionAccess = (tier = 'free') => {
    return {
        canUsePreset: true,
        canUseCustom: true,      // 모든 사용자 자유 질문 가능
        maxCustomLength: 200
    };
};

