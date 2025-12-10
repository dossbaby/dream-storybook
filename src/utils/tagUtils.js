/**
 * Tag Utility Functions
 * 키워드 → 태그 정규화 및 태그 관련 유틸리티
 */

/**
 * 키워드를 정규화된 태그로 변환
 * - 공백 제거
 * - 소문자 변환 (한글은 그대로)
 * - 특수문자 제거
 * @param {string} keyword - 원본 키워드
 * @returns {string} 정규화된 태그
 */
export const normalizeTag = (keyword) => {
    if (!keyword || typeof keyword !== 'string') return '';
    return keyword
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, '') // 유니코드 문자와 숫자만 유지
        .slice(0, 20); // 최대 20자
};

/**
 * 태그를 URL-safe 슬러그로 변환
 * @param {string} tag - 태그
 * @returns {string} URL-safe 슬러그
 */
export const tagToSlug = (tag) => {
    if (!tag) return '';
    return encodeURIComponent(normalizeTag(tag));
};

/**
 * URL 슬러그를 태그로 변환
 * @param {string} slug - URL 슬러그
 * @returns {string} 태그
 */
export const slugToTag = (slug) => {
    if (!slug) return '';
    return decodeURIComponent(slug);
};

/**
 * 키워드 배열에서 태그 배열 추출
 * @param {Array<{word: string}>} keywords - 키워드 객체 배열
 * @returns {string[]} 정규화된 태그 배열
 */
export const extractTags = (keywords) => {
    if (!Array.isArray(keywords)) return [];
    return [...new Set(
        keywords
            .map(k => k?.word || k)
            .filter(Boolean)
            .map(normalizeTag)
            .filter(t => t.length >= 1)
    )];
};

/**
 * 콘텐츠가 특정 태그를 포함하는지 확인
 * @param {Array<{word: string}>} keywords - 콘텐츠의 키워드
 * @param {string} tag - 검색할 태그
 * @returns {boolean}
 */
export const hasTag = (keywords, tag) => {
    if (!Array.isArray(keywords) || !tag) return false;
    const normalizedTag = normalizeTag(tag);
    return keywords.some(k => normalizeTag(k?.word || k) === normalizedTag);
};

/**
 * 여러 콘텐츠에서 인기 태그 추출
 * @param {Array<Object>} contents - 콘텐츠 배열 (keywords 필드 포함)
 * @param {number} limit - 반환할 태그 수
 * @returns {Array<{tag: string, count: number}>} 인기 태그 배열
 */
export const getPopularTags = (contents, limit = 10) => {
    const tagCounts = {};

    contents.forEach(content => {
        const tags = extractTags(content.keywords);
        tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
};

/**
 * 콘텐츠 타입 라벨
 */
export const CONTENT_TYPES = {
    dream: { label: '꿈', emoji: '🌙' },
    tarot: { label: '타로', emoji: '🔮' },
    saju: { label: '사주', emoji: '☀️' }
};

/**
 * 태그 페이지 URL 생성
 * @param {string} tag - 태그
 * @returns {string} URL 경로
 */
export const getTagUrl = (tag) => `/tag/${tagToSlug(tag)}`;
