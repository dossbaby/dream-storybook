/**
 * Firebase 데이터 캐싱 유틸리티
 * 메모리 캐시로 중복 Firebase 호출 방지
 */

// 캐시 저장소
const cache = new Map();

// 기본 캐시 TTL (밀리초)
const DEFAULT_TTL = 60000; // 1분

/**
 * 캐시된 데이터 가져오기
 * @param {string} key - 캐시 키
 * @returns {any|null} 캐시된 데이터 또는 null
 */
export const getCached = (key) => {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }

    return item.data;
};

/**
 * 데이터 캐시하기
 * @param {string} key - 캐시 키
 * @param {any} data - 캐시할 데이터
 * @param {number} ttl - TTL (밀리초), 기본 1분
 */
export const setCache = (key, data, ttl = DEFAULT_TTL) => {
    cache.set(key, {
        data,
        expiry: Date.now() + ttl
    });
};

/**
 * 특정 캐시 무효화
 * @param {string} key - 캐시 키
 */
export const invalidateCache = (key) => {
    cache.delete(key);
};

/**
 * 패턴 매칭으로 캐시 무효화
 * @param {string} pattern - 키 패턴 (예: 'dreams')
 */
export const invalidateCacheByPattern = (pattern) => {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

/**
 * 전체 캐시 클리어
 */
export const clearCache = () => {
    cache.clear();
};

/**
 * 캐시 통계
 */
export const getCacheStats = () => ({
    size: cache.size,
    keys: Array.from(cache.keys())
});

// 캐시 키 상수
export const CACHE_KEYS = {
    DREAMS_FEED: 'dreams_feed',
    TAROTS_FEED: 'tarots_feed',
    SAJUS_FEED: 'sajus_feed',
    HOT_DREAMS: 'hot_dreams',
    LIVE_STORIES: 'live_stories',
    MY_DREAMS: 'my_dreams',
    MY_TAROTS: 'my_tarots',
    MY_SAJUS: 'my_sajus'
};

// 캐시 TTL 설정
export const CACHE_TTL = {
    FEED: 60000,       // 1분 - 피드 데이터
    HOT: 300000,       // 5분 - 핫 랭킹
    MY_DATA: 30000,    // 30초 - 내 데이터
    LIVE: 60000        // 1분 - 라이브 스토리
};
