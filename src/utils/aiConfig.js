/**
 * AI Model Configuration
 * Dream Storybook AI Tier System (v4 - 3티어 시스템)
 *
 * 무료: Sonnet 4.5 (고품질) + 제한
 * 프리미엄: Sonnet 4.5 + 모든 기능 해금
 * 울트라: Opus 4.5 (소름돋는 통찰) + 최고급 경험
 *
 * 차별화 포인트:
 * - 무료 → 프리미엄: 기능 해금 (Hidden Insight, 심층분석, 무제한)
 * - 프리미엄 → 울트라: AI 품질 업그레이드 (더 깊고 소름돋는 통찰)
 */

export const AI_MODELS = {
    // 텍스트 분석 모델 (3티어!)
    text: {
        free: 'claude-sonnet-4-5',       // 고품질
        premium: 'claude-sonnet-4-5',    // 고품질 (기능 해금)
        ultra: 'claude-opus-4-5'         // 소름돋는 통찰!
    },

    // 키워드 생성 (Sonnet 고정 - SEO 품질 보장)
    keywords: 'claude-sonnet-4-5',

    // 이미지 생성 (티어별 차등)
    image: {
        free: 'gemini-2.5-flash-image',           // 무료 - Gemini 2.5 Flash Image
        premium: 'gemini-3-pro-image-preview',    // 프리미엄 - Gemini 3 Pro Image (4K)
        ultra: 'gemini-3-pro-image-preview'       // 울트라 - Gemini 3 Pro Image (4K)
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
    webtoon: 'Webtoon adaptation style (Solo Leveling). Clean digital lines, epic scale, polished action spectacle',

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
    action: ['mappa_action', 'ufotable', 'webtoon'],    // 도전, 변화, 갈등
    mystical: ['ghibli', 'sciencesaru', 'cgi_gem'],     // 신비, 마법, 환상
    calm: ['kyoani', 'minimalist', 'ghibli']            // 평화, 치유, 안정
};

/**
 * 티어별 모델 설정 가져오기
 * @param {string} tier - 티어 ('free' | 'premium' | 'ultra')
 * @returns {Object} 모델 설정 객체
 */
export const getModelConfig = (tier = 'free') => {
    const isPremium = tier === 'premium' || tier === 'ultra';
    const isUltra = tier === 'ultra';

    return {
        // 텍스트 분석 모델 (3티어!)
        textModel: AI_MODELS.text[tier] || AI_MODELS.text.free,

        // 키워드 모델 (Sonnet 고정 - SEO 품질 보장)
        keywordModel: AI_MODELS.keywords,

        // 이미지 모델 (티어별)
        imageModel: AI_MODELS.image[tier] || AI_MODELS.image.free,

        // 프롬프트 스타일 (MrBeast 도파민)
        promptStyle: 'mrBeastDopamine',

        // 분석 깊이
        analysisDepth: isUltra ? 'ultra' : (isPremium ? 'deep' : 'basic'),
        maxTokens: isUltra ? 8000 : (isPremium ? 6000 : 4000),

        // 콘텐츠 접근 권한
        hasHiddenInsight: isPremium,      // 프리미엄+ Hidden Insight 해금
        hasDetailedAnalysis: isPremium,   // 프리미엄+ 심층 분석 해금
        hasUltraInsight: isUltra,         // 울트라만 소름돋는 통찰

        // 티어 정보
        tier,
        isPremium,
        isUltra
    };
};

/**
 * 티어별 사용 제한
 * - 무료: 주 3회 (하루 1회 → 주 3회로 변경: 리텐션 개선)
 * - 프리미엄/울트라: 무제한
 */
export const TIER_LIMITS = {
    free: {
        dream: { weekly: 3 },       // 주 3회
        tarot: { weekly: 3 },       // 주 3회
        saju: { weekly: 3 }         // 주 3회
    },
    premium: {
        dream: { weekly: Infinity },
        tarot: { weekly: Infinity },
        saju: { weekly: Infinity }
    },
    ultra: {
        dream: { weekly: Infinity },
        tarot: { weekly: Infinity },
        saju: { weekly: Infinity }
    }
};

/**
 * 티어별 히스토리 표시 제한
 * - 무료: 최근 3개만 (나머지 블러 + 프리미엄 유도)
 * - 프리미엄/울트라: 무제한
 */
export const HISTORY_LIMITS = {
    free: 3,
    premium: Infinity,
    ultra: Infinity
};

/**
 * 비용 분석 (참고용)
 * Free/Premium: Sonnet 4.5 (고품질)
 * Ultra: Opus 4.5 (소름돋는 통찰) - 약 9배 비용
 */
export const COST_ESTIMATES = {
    free: {
        sonnet: 0.008,
        geminiFlash: 0.002,
        total: 0.010  // ~14원
    },
    premium: {
        sonnet: 0.008,
        geminiPro: 0.005,  // Pro Preview
        total: 0.013  // ~18원 (이미지만 업그레이드)
    },
    ultra: {
        opus: 0.075,      // Opus는 Sonnet 대비 약 9배
        sonnetKeyword: 0.003,
        geminiPro: 0.005,  // Pro Preview 예상
        total: 0.083  // ~115원
    }
};

/**
 * 티어 비교 정보 (UI용) - 감성적 문구 사용
 */
export const TIER_COMPARISON = {
    free: {
        name: '무료',
        aiLabel: '정확한 해석',
        hasHiddenInsight: false,    // 블러 처리
        hasDetailedAnalysis: false, // 잠금
        imageQuality: 'HD',
        hasAds: false,              // 초반 광고 없음
        usageLimit: '주 3회',
        description: '기본적인 해석으로 시작하기'
    },
    premium: {
        name: '프리미엄',
        aiLabel: '깊이 있는 해석',
        hasHiddenInsight: true,     // 해금
        hasDetailedAnalysis: true,  // 해금
        imageQuality: 'HD',         // Gemini 3 Pro
        hasAds: false,
        usageLimit: '무제한',
        description: '숨겨진 메시지까지 모두 확인'
    },
    ultra: {
        name: '울트라',
        aiLabel: '소름돋는 통찰',
        hasHiddenInsight: true,     // 해금
        hasDetailedAnalysis: true,  // 해금
        hasUltraInsight: true,      // 울트라만의 깊은 통찰
        imageQuality: 'HD',         // Gemini 3 Pro
        hasAds: false,
        usageLimit: '무제한',
        description: '당신만 몰랐던 이야기를 들려드려요'
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
 * 티어별 맞춤 질문 권한
 */
export const getCustomQuestionAccess = (tier = 'free') => {
    const isPremium = tier === 'premium' || tier === 'ultra';
    return {
        canUsePreset: true,           // 모든 티어 사전 정의 질문 가능
        canUseCustom: isPremium,      // 프리미엄+ 자유 질문 가능
        maxCustomLength: isPremium ? 200 : 0  // 자유 질문 최대 글자수
    };
};

/**
 * 티어별 프롬프트 글자수 제한
 * Hook, Foreshadow는 동일 / Main Reading, 결과만 차등
 */
export const PROMPT_LIMITS = {
    free: {
        // Hook, Foreshadow: 제한 없음 (동일)
        // Card/Section Analysis: 절반
        cardAnalysis: { minChars: 650, minSentences: 8 },
        conclusionAnalysis: { minChars: 750, minSentences: 10 },
        synthesis: { minChars: 250 },
        hiddenInsight: { minChars: 500 }  // 블러 처리되지만 생성은 함
    },
    premium: {
        // 기능 해금 + 동일 품질
        cardAnalysis: { minChars: 1300, minSentences: 17 },
        conclusionAnalysis: { minChars: 1500, minSentences: 20 },
        synthesis: { minChars: 500 },
        hiddenInsight: { minChars: 1000 }
    },
    ultra: {
        // Opus의 소름돋는 통찰 - 더 길고 깊은 분석
        cardAnalysis: { minChars: 1800, minSentences: 22 },
        conclusionAnalysis: { minChars: 2000, minSentences: 25 },
        synthesis: { minChars: 700 },
        hiddenInsight: { minChars: 1500 },
        ultraInsight: { minChars: 800 }  // 울트라만의 추가 통찰
    }
};
