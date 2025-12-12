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

    // 이미지 생성 - Gemini 3 Pro Image Preview (고품질)
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
        imageSize: '1K'  // 유효값: '1K', '2K', '4K'
    },
    // 소셜 공유용 이미지 (스토리/릴스)
    share: {
        aspectRatio: '9:16',
        imageSize: '1K'
    },
    // 내보내기용 이미지 (인스타 피드)
    export: {
        aspectRatio: '1:1',
        imageSize: '1K'
    }
};

/**
 * 동적 애니메 스타일 시스템 v2
 * Claude가 스튜디오 + 캐릭터 조합 선택 → Gemini에 전달
 *
 * 구조: [Quality Prefix] + [Studio Style] + [Character Aesthetic] + [Mystic/Cinematic Suffix]
 * 조합 예시: ghibli + reze = 지브리 느낌의 레제 미학
 */

// ═══════════════════════════════════════════════════════════════
// Visual Director 가이드 (Gemini 프롬프트에 자연스럽게 녹여서 사용)
// Gemini 공식 가이드: "descriptive paragraphs > keyword lists"
// ═══════════════════════════════════════════════════════════════

// 캐릭터 미학 가이드 (Claude에게 전달 - 프롬프트 작성 시 참고)
const CHARACTER_AESTHETIC_GUIDE = `⚠️ CRITICAL: This MUST be ANIME/ILLUSTRATION style - NEVER photorealistic, NEVER real human photos, NEVER 3D render. Always 2D Japanese anime art style with clear linework. ⭐ TOP PRIORITY - BEAUTY IS NON-NEGOTIABLE: Female characters MUST be extremely pretty, beautiful, cute, adorable with gorgeous big sparkly eyes, lovely delicate features like K-pop idol visuals. Male characters MUST be very handsome, attractive, good-looking with sharp features. Late teens to early 20s (17-24 years old), graceful slim proportions, chic urban vibe. Avoid childish/chibi proportions. ⚠️ Every character must be visually stunning and attractive - no exceptions!`;

// 신비로운 분위기 가이드
const MYSTIC_GUIDE = `The scene should be infused with mystical tarot energy - ethereal glows, subtle cosmic particles, and hints of sacred geometry that evoke destiny and fortune-telling without overwhelming the composition.`;

// 시네마틱 렌더링 가이드
const CINEMATIC_GUIDE = `Render with cinematic quality: volumetric lighting with god rays, thoughtful depth of field, bokeh backgrounds, rim lighting that defines the subject, and dramatic composition worthy of an official anime key visual.`;

// ═══════════════════════════════════════════════════════════════
// 스튜디오 스타일 (렌더링/분위기) - 11개 + random
// ═══════════════════════════════════════════════════════════════
export const STUDIO_STYLES = {
    // 로맨틱/몽환적 계열
    shinkai: `Makoto Shinkai style (Your Name, Weathering With You). Golden hour lighting, hyper-detailed backgrounds with lens flare, dreamy twilight atmosphere, emotional expressive eyes with light reflections, flowing hair with wind movement`,

    kyoani: `Kyoto Animation style (Violet Evergarden). Subsurface scattering on skin, delicate porcelain features, elegant emotional portrayal, intricate costume details, soft diffused lighting, character-focused composition`,

    ghibli: `Studio Ghibli style (Spirited Away, Howl's Moving Castle). Hand-painted watercolor aesthetic, warm human emotions, whimsical fantasy elements, nature spirits, soft atmospheric haze, painterly texture`,

    // MAPPA 계열
    mappa: `MAPPA studio style (Jujutsu Kaisen). Bold saturated colors, expressive action energy, fluid motion blur, modern anime aesthetic, sharp detailed linework, intense eyes, high contrast dramatic shadows`,

    mappa_dark: `MAPPA dark style (Chainsaw Man). Edgy aesthetic, bold chiaroscuro shadows on face, visceral raw emotion, mature dramatic lighting, character silhouette prominent, blood moon atmosphere, noir color palette, gritty texture`,

    // 클래식/우아한 계열
    shojo: `Classic shojo anime style. Breathtaking intricate details, sparkles and flower petals floating, elegant flowing hair with highlights, romantic pastel atmosphere, detailed lace and fabric, soft bloom effect, dreamy color palette`,

    clamp: `CLAMP style (Cardcaptor Sakura, xxxHolic). Elongated elegant proportions, flowing fabric and hair with movement, graceful ethereal poses, magical girl aesthetic, sophisticated dark beauty, art nouveau influences, dramatic cape/cloth flow, stained glass colors`,

    // 역동적/스포츠 계열
    takehiko: `Takehiko Inoue style (Slam Dunk, Vagabond). Dynamic human anatomy with muscle definition, powerful emotional moments, realistic yet stylized features, athletic movement captured, raw intensity in eyes, traditional ink wash texture, dramatic action lines, hand-drawn organic feel`,

    wit: `WIT Studio style (Attack on Titan, Spy x Family). Clean ultra-sharp linework, dynamic action poses with motion energy, expressive character acting, cinematic widescreen composition, high contrast lighting with ambient occlusion`,

    // 현대 일러스트 계열
    ilya: `Ilya Kuvshinov style. Modern digital illustration, soft skin rendering with subsurface scattering, highly detailed eyes with multiple light reflections, contemporary fashion details, Instagram-popular aesthetic, painterly color blending, portrait focus, soft gradient backgrounds`,

    // 미니멀/아트 계열
    minimalist: `Minimalist artistic anime. Clean elegant character design, strategic negative space, subtle nuanced expressions, character as focal point, simple but impactful composition, limited color palette with accent colors, zen aesthetic, floating elements`,

    // 🎲 히든 카드: 위 스타일 중 랜덤 선택
    random: '_RANDOM_STUDIO_'
};

// 스튜디오 랜덤 선택용 리스트 (random 제외)
export const STUDIO_LIST = ['shinkai', 'kyoani', 'ghibli', 'mappa', 'mappa_dark', 'shojo', 'clamp', 'takehiko', 'wit', 'ilya', 'minimalist'];

// ═══════════════════════════════════════════════════════════════
// 캐릭터 미학 (외모/분위기 특징) - 23개 + random + none
// 복장은 자유, 얼굴/분위기 특징만 참고
// ═══════════════════════════════════════════════════════════════
export const CHARACTER_AESTHETICS = {
    // ─── 체인소맨 ───
    reze: `Character with Reze-inspired aesthetic: short dark hair with soft bangs, beautiful alluring eyes with mysterious depth, charming youthful face, soft feminine features with subtle dangerous edge. Romantic yet melancholic atmosphere, urban night aesthetic with soft neon glow, bittersweet emotional tone`,

    makima: `Character with Makima-inspired aesthetic: long reddish-brown hair with bangs, hypnotic ringed eyes with absolute confidence, serene yet unsettling smile, elegant mature beauty with overwhelming presence. Mysterious controlling atmosphere, cold yet captivating aura, dominant yet ethereal mood`,

    power: `Character with Power-inspired aesthetic: long pink-blonde wild hair with small horns, sharp red eyes full of mischief, confident smirk, chaotic cute energy with fang tooth. Chaotic playful atmosphere, bold vivid colors, energetic rebellious mood`,

    himeno: `Character with Himeno-inspired aesthetic: short black hair covering one eye (eyepatch), playful yet sorrowful remaining eye, mature cool beauty with cigarette aesthetic, experienced melancholic charm. Urban night bar atmosphere, bittersweet mentor aesthetic, tragic cool beauty`,

    // ─── 장송의 프리렌 ───
    frieren: `Character with Frieren-inspired aesthetic: long silver-white hair, pointed elf ears, serene timeless eyes with gentle melancholy, youthful yet ancient presence. Peaceful nostalgic atmosphere, soft magical glow, bittersweet immortal solitude`,

    // ─── 약사의 혼잣말 ───
    maomao: `Character with Maomao-inspired aesthetic: dark hair in traditional style, sharp intelligent eyes with curiosity, petite features with subtle freckles, analytical calm expression. Classical Chinese palace aesthetic, mysterious medicinal atmosphere, intellectual detective mood`,

    // ─── 스파이패밀리 ───
    yor: `Character with Yor-inspired aesthetic: long black hair with elegant style, beautiful red eyes, gentle smile hiding lethal grace, stunning mature beauty. Elegant yet dangerous duality, refined assassin aesthetic, sophisticated deadly charm`,

    anya: `Character with Anya-inspired aesthetic: pink hair with small horn-like tufts, large green curious eyes, adorable innocent expressions, small childlike features with mischievous charm. Playful cute atmosphere, telepathic sparkle effects, wholesome comedic energy`,

    // ─── 최애의 아이 ───
    ai: `Character with Ai Hoshino-inspired aesthetic: long gradient purple-pink hair, star-shaped pupils in mesmerizing eyes, radiant idol smile with hidden depth, captivating stage presence. Dazzling starlight atmosphere, idol stage aesthetic, brilliant yet tragic star mood`,

    ruby: `Character with Ruby-inspired aesthetic: blonde twin-tails with ribbons, star-shaped ruby red pupils, bright energetic idol smile, petite cute frame with fierce determination. Sparkling idol stage lights, vengeful star aesthetic, bright surface hiding dark resolve`,

    // ─── 주술회전 ───
    gojo: `Character with Gojo-inspired aesthetic: white spiky hair, striking blue Six Eyes (or blindfolded mystery), confident playful smirk, tall handsome features with overwhelming power aura. Dynamic powerful atmosphere, infinity space aesthetic, invincible charismatic presence`,

    maki: `Character with Maki-inspired aesthetic: short dark hair with athletic build, sharp determined eyes (or glasses), strong beautiful features with warrior spirit, scarred tough beauty. Powerful athletic aesthetic, cursed tool mastery, fierce independent strength`,

    itadori: `Character with Itadori-inspired aesthetic: spiky pink-salmon hair, warm brown eyes with pure heart, athletic youthful face with bright smile, muscular but friendly build. Dynamic action aesthetic, cursed energy effects, genuine heroic spirit`,

    // ─── 귀멸의 칼날 ───
    nezuko: `Character with Nezuko-inspired aesthetic: long black hair with orange tips, pink demon eyes with bamboo muzzle or without, cute yet fierce expression, small frame with hidden power. Beautiful demon aesthetic, protective sibling love atmosphere, innocent yet powerful mood`,

    mitsuri: `Character with Mitsuri-inspired aesthetic: long gradient pink-green braided hair, bright green eyes full of love, voluptuous feminine figure, bashful yet powerful expressions. Love breathing pink energy, romantic warrior aesthetic, powerful femininity with pure heart`,

    rengoku: `Character with Rengoku-inspired aesthetic: flame-colored gradient hair swept back, intense golden-red eyes burning with passion, broad bright smile with unwavering spirit, strong heroic build. Blazing flame breathing effects, heroic pillar aesthetic, burning determination and warmth`,

    // ─── Re:제로 ───
    rem: `Character with Rem-inspired aesthetic: short blue hair covering one eye, gentle devoted blue eyes, sweet caring smile, maid-like grace with hidden strength. Soft romantic atmosphere, devotional love aesthetic, gentle protective mood`,

    emilia: `Character with Emilia-inspired aesthetic: long silver-white hair with delicate braids, beautiful purple eyes with gentle innocence, half-elf pointed ears, ethereal angelic beauty with kind expression. Pure white snow aesthetic, magical ice crystal atmosphere, gentle warmth within cold beauty`,

    // ─── 진격의 거인 ───
    mikasa: `Character with Mikasa-inspired aesthetic: short black hair with red scarf, intense dark eyes with unwavering loyalty, beautiful stoic face with deadly grace, athletic toned figure. Military precision aesthetic, protective warrior aura, devoted strength and elegance`,

    levi: `Character with Levi-inspired aesthetic: short black undercut hair, narrow sharp grey eyes with intimidating gaze, small but perfectly proportioned features, clean precise military bearing. Spinning blade mastery, humanity's strongest aesthetic, cold efficiency and hidden care`,

    // ─── 기타 인기 캐릭터 ───
    violet: `Character with Violet Evergarden-inspired aesthetic: golden blonde hair with ribbon, beautiful blue doll-like eyes, elegant military bearing, prosthetic metal hands with grace. European classical beauty, letter-writing emotional atmosphere, learning to understand love`,

    asuna: `Character with Asuna-inspired aesthetic: long chestnut-orange hair flowing elegantly, warm amber-brown eyes with determination, beautiful refined features, graceful yet fierce warrior princess. Virtual fantasy aesthetic, flash of light rapier mastery, elegant strength and devotion`,

    '2b': `Character with 2B-inspired aesthetic: silver-white bob hair, black blindfold over eyes (or beautiful blue eyes), gothic maid-inspired outfit aesthetic, perfect cold beauty with hidden emotions. Post-apocalyptic elegance, mechanical angel aesthetic, melancholic android existence`,

    // 🎲 히든 카드: 위 캐릭터 중 랜덤 선택
    random: '_RANDOM_CHARACTER_'
};

// 캐릭터 랜덤 선택용 리스트 (random, none 제외)
export const CHARACTER_LIST = ['reze', 'makima', 'power', 'himeno', 'frieren', 'maomao', 'yor', 'anya', 'ai', 'ruby', 'gojo', 'maki', 'itadori', 'nezuko', 'mitsuri', 'rengoku', 'rem', 'emilia', 'mikasa', 'levi', 'violet', 'asuna', '2b'];

// ═══════════════════════════════════════════════════════════════
// 하위 호환용 ANIME_STYLES (기존 코드 지원)
// 스튜디오만 사용하는 레거시 코드용
// ═══════════════════════════════════════════════════════════════
export const ANIME_STYLES = Object.fromEntries(
    Object.entries(STUDIO_STYLES)
        .filter(([key]) => key !== 'random')
        .map(([key, value]) => [
            key,
            `${CHARACTER_AESTHETIC_GUIDE} ${value} ${MYSTIC_GUIDE} ${CINEMATIC_GUIDE}`
        ])
);

// fallback 추가
ANIME_STYLES._default = `${CHARACTER_AESTHETIC_GUIDE} Premium anime character with expressive eyes, beautiful flowing hair, captivating features balancing cute and cool, charismatic presence. ${MYSTIC_GUIDE} ${CINEMATIC_GUIDE}`;

// ═══════════════════════════════════════════════════════════════
// 스타일 조합 헬퍼 함수
// ═══════════════════════════════════════════════════════════════

/**
 * 스튜디오 + 캐릭터 스타일 조합 (Gemini descriptive paragraph 스타일)
 * @param {string} studioKey - 스튜디오 키 (shinkai, ghibli, random 등)
 * @param {string} characterKey - 캐릭터 키 (reze, frieren, random 등) - 필수!
 * @returns {string} 조합된 프롬프트 (descriptive paragraph)
 */
export const combineStyles = (studioKey, characterKey = 'random') => {
    // 랜덤 처리
    let actualStudio = studioKey;
    let actualCharacter = characterKey;

    if (studioKey === 'random') {
        actualStudio = STUDIO_LIST[Math.floor(Math.random() * STUDIO_LIST.length)];
        console.log(`🎲 Random Studio: ${actualStudio}`);
    }

    if (characterKey === 'random') {
        actualCharacter = CHARACTER_LIST[Math.floor(Math.random() * CHARACTER_LIST.length)];
        console.log(`🎲 Random Character: ${actualCharacter}`);
    }

    // 스튜디오 스타일 가져오기
    const studioStyle = STUDIO_STYLES[actualStudio] || STUDIO_STYLES.shinkai;

    // 캐릭터 미학 가져오기 (none이면 생략)
    const characterRef = actualCharacter && actualCharacter !== 'none'
        ? CHARACTER_AESTHETICS[actualCharacter]
        : '';

    // Gemini 공식 가이드: descriptive paragraph로 조합
    // Visual Director 관점에서 자연스럽게 연결
    let combined = `${CHARACTER_AESTHETIC_GUIDE} ${studioStyle}`;
    if (characterRef) {
        combined += ` Drawing inspiration from ${characterRef}`;
    }
    combined += ` ${MYSTIC_GUIDE} ${CINEMATIC_GUIDE}`;

    return combined;
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

