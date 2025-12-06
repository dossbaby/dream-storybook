/**
 * pSEO 통합 설정
 * 꿈, 타로, 운세를 하나의 시스템으로 관리
 */

// 콘텐츠 타입 정의
export const CONTENT_TYPES = {
    dream: {
        id: 'dream',
        name: '꿈해몽',
        nameEn: 'Dream',
        collection: 'dreams',
        urlPath: 'dream',
        icon: '🌙',
        color: '#9b59b6',
        gradientFrom: 'rgba(155, 89, 182, 0.3)',
        gradientTo: 'rgba(138, 43, 226, 0.3)',
        defaultImage: '/images/dream-default.jpg',
        seoKeywords: ['꿈해몽', '꿈풀이', '꿈의미', '꿈해석'],
    },
    tarot: {
        id: 'tarot',
        name: '타로',
        nameEn: 'Tarot',
        collection: 'tarots',
        urlPath: 'tarot',
        icon: '🃏',
        color: '#ffd700',
        gradientFrom: 'rgba(255, 215, 0, 0.3)',
        gradientTo: 'rgba(255, 140, 0, 0.3)',
        defaultImage: '/images/tarot-default.jpg',
        seoKeywords: ['타로카드', '타로점', '타로운세', '타로리딩'],
    },
    saju: {
        id: 'saju',
        name: '사주',
        nameEn: 'Saju',
        collection: 'sajus',
        urlPath: 'saju',
        icon: '✨',
        color: '#1abc9c',
        gradientFrom: 'rgba(26, 188, 156, 0.3)',
        gradientTo: 'rgba(46, 204, 113, 0.3)',
        defaultImage: '/images/saju-default.jpg',
        seoKeywords: ['사주팔자', '사주풀이', '만세력', '오늘의사주', '무료사주'],
    }
};

// 꿈 카테고리 (태그 시스템)
export const DREAM_CATEGORIES = {
    animal: { name: '동물 꿈', icon: '🐾', keywords: ['호랑이', '뱀', '개', '고양이', '용', '물고기', '새', '곰', '사자', '말'] },
    nature: { name: '자연 꿈', icon: '🌿', keywords: ['물', '불', '바다', '산', '하늘', '비', '눈', '태양', '달', '별'] },
    people: { name: '사람 꿈', icon: '👥', keywords: ['가족', '친구', '연인', '아이', '돌아가신분', '유명인', '낯선사람'] },
    action: { name: '행동 꿈', icon: '🏃', keywords: ['날다', '떨어지다', '쫓기다', '싸우다', '죽다', '울다', '웃다'] },
    object: { name: '사물 꿈', icon: '📦', keywords: ['돈', '차', '집', '음식', '옷', '보석', '열쇠', '거울'] },
    emotion: { name: '감정 꿈', icon: '💭', keywords: ['무서운꿈', '행복한꿈', '슬픈꿈', '악몽', '길몽'] },
    place: { name: '장소 꿈', icon: '🏠', keywords: ['학교', '회사', '병원', '화장실', '엘리베이터', '지하철'] },
};

// 타로 카테고리
export const TAROT_CATEGORIES = {
    love: { name: '연애 타로', icon: '💕', keywords: ['연애운', '사랑', '썸', '고백', '재회', '이별'] },
    career: { name: '직장 타로', icon: '💼', keywords: ['취업', '이직', '승진', '사업', '면접'] },
    money: { name: '금전 타로', icon: '💰', keywords: ['재물운', '돈', '투자', '복권', '재테크'] },
    general: { name: '오늘의 타로', icon: '🔮', keywords: ['오늘운세', '데일리타로', '하루운'] },
    decision: { name: '결정 타로', icon: '⚖️', keywords: ['선택', '고민', '결정', 'YES/NO'] },
};

// 사주 카테고리
export const SAJU_CATEGORIES = {
    love: { name: '연애운', icon: '💕', keywords: ['연애', '사랑', '인연', '결혼'] },
    money: { name: '재물운', icon: '💰', keywords: ['재물', '돈', '투자', '사업'] },
    career: { name: '직장운', icon: '💼', keywords: ['취업', '승진', '이직', '직장'] },
    health: { name: '건강운', icon: '💪', keywords: ['건강', '운동', '컨디션'] },
    general: { name: '종합운', icon: '🔮', keywords: ['종합', '전체', '올해'] },
};

// 콘텐츠에서 태그 추출
export const extractTags = (content, type) => {
    const tags = new Set();
    const text = JSON.stringify(content).toLowerCase();

    let categories;
    switch (type) {
        case 'dream':
            categories = DREAM_CATEGORIES;
            break;
        case 'tarot':
            categories = TAROT_CATEGORIES;
            break;
        case 'saju':
            categories = SAJU_CATEGORIES;
            break;
        default:
            return [];
    }

    Object.entries(categories).forEach(([categoryId, category]) => {
        category.keywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
                tags.add(categoryId);
            }
        });
    });

    return Array.from(tags);
};

// SEO 메타데이터 생성
export const generateSEOMeta = (content, type) => {
    const typeConfig = CONTENT_TYPES[type];
    if (!typeConfig) return null;

    const title = content.title || `${typeConfig.name} 결과`;
    const description = content.verdict || content.shareText || `${typeConfig.name} 상세 풀이`;

    // 키워드 조합
    const keywords = [
        ...typeConfig.seoKeywords,
        ...(content.keywords?.map(k => k.word || k) || []),
    ];

    return {
        title: `${title} | 점AI`,
        description: description.slice(0, 160),
        keywords: keywords.join(', '),
        ogType: 'article',
        ogImage: content.dreamImage || content.pastImage || content.morningImage || typeConfig.defaultImage,
        canonical: `/${typeConfig.urlPath}/${content.id}`,
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: description,
            image: content.dreamImage || typeConfig.defaultImage,
            author: {
                '@type': 'Person',
                name: content.userName || '점AI'
            },
            publisher: {
                '@type': 'Organization',
                name: '점AI',
                logo: {
                    '@type': 'ImageObject',
                    url: '/logo.png'
                }
            },
            datePublished: content.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `/${typeConfig.urlPath}/${content.id}`
            }
        }
    };
};

// 관련 콘텐츠 쿼리 생성
export const getRelatedQuery = (content, type, tags) => {
    // Firestore 쿼리를 위한 조건 생성
    return {
        collection: CONTENT_TYPES[type].collection,
        filters: {
            isPublic: true,
            // 같은 타입에서 비슷한 태그를 가진 콘텐츠
        },
        orderBy: 'createdAt',
        limit: 6,
        excludeId: content.id
    };
};

// URL 슬러그 생성 (한글 지원)
export const generateSlug = (title, id) => {
    // 한글은 그대로 유지, 특수문자만 제거
    const slug = title
        .replace(/[^\w\s가-힣]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 50);

    return `${slug}-${id.slice(-6)}`;
};

// 사이트맵 엔트리 생성
export const generateSitemapEntry = (content, type) => {
    const typeConfig = CONTENT_TYPES[type];
    return {
        loc: `/${typeConfig.urlPath}/${content.id}`,
        lastmod: content.updatedAt?.toDate?.()?.toISOString() || content.createdAt?.toDate?.()?.toISOString(),
        changefreq: 'weekly',
        priority: 0.7
    };
};
