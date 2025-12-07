/**
 * 다국어 지원 (i18n) 시스템
 *
 * 기능:
 * - 한국어/영어 지원
 * - 브라우저 언어 자동 감지
 * - 동적 언어 전환
 * - 번역 키 기반 시스템
 */

import ko from './locales/ko';
import en from './locales/en';

// 지원 언어 목록
export const SUPPORTED_LANGUAGES = {
    ko: { name: '한국어', nativeName: '한국어', flag: '🇰🇷' },
    en: { name: 'English', nativeName: 'English', flag: '🇺🇸' }
};

// 언어 팩
const LOCALES = { ko, en };

// localStorage 키
const LANGUAGE_KEY = 'jeom_language';

// 현재 언어
let currentLanguage = 'ko';

/**
 * 브라우저 언어 감지
 */
const detectBrowserLanguage = () => {
    if (typeof navigator === 'undefined') return 'ko';

    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.split('-')[0];

    return SUPPORTED_LANGUAGES[shortLang] ? shortLang : 'ko';
};

/**
 * 초기 언어 설정
 */
export const initLanguage = () => {
    // localStorage에서 저장된 언어 확인
    const savedLang = localStorage.getItem(LANGUAGE_KEY);

    if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
        currentLanguage = savedLang;
    } else {
        // 브라우저 언어 감지
        currentLanguage = detectBrowserLanguage();
    }

    // HTML lang 속성 업데이트
    if (typeof document !== 'undefined') {
        document.documentElement.lang = currentLanguage;
    }

    return currentLanguage;
};

/**
 * 현재 언어 가져오기
 */
export const getLanguage = () => currentLanguage;

/**
 * 언어 변경
 */
export const setLanguage = (lang) => {
    if (!SUPPORTED_LANGUAGES[lang]) {
        console.warn(`지원하지 않는 언어: ${lang}`);
        return false;
    }

    currentLanguage = lang;
    localStorage.setItem(LANGUAGE_KEY, lang);

    // HTML lang 속성 업데이트
    if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
    }

    // 언어 변경 이벤트 발생
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
    }

    return true;
};

/**
 * 번역 키로 텍스트 가져오기
 * @param {string} key - 점(.)으로 구분된 번역 키 (예: 'common.submit')
 * @param {Object} params - 치환 파라미터
 * @returns {string} 번역된 텍스트
 */
export const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = LOCALES[currentLanguage];

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            value = undefined;
            break;
        }
    }

    // 번역이 없으면 한국어 폴백, 그래도 없으면 키 반환
    if (value === undefined) {
        let fallback = LOCALES.ko;
        for (const k of keys) {
            if (fallback && typeof fallback === 'object') {
                fallback = fallback[k];
            } else {
                fallback = undefined;
                break;
            }
        }
        value = fallback !== undefined ? fallback : key;
    }

    // 파라미터 치환 (예: "안녕하세요, {name}님!")
    if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    }

    return value;
};

/**
 * 숫자 포맷팅 (로케일 기반)
 */
export const formatNumber = (num) => {
    return new Intl.NumberFormat(currentLanguage).format(num);
};

/**
 * 날짜 포맷팅 (로케일 기반)
 */
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Intl.DateTimeFormat(currentLanguage, { ...defaultOptions, ...options }).format(new Date(date));
};

/**
 * 상대 시간 포맷팅
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (currentLanguage === 'ko') {
        if (diffSecs < 60) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return formatDate(date);
    } else {
        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDate(date);
    }
};

// 초기화 실행
if (typeof window !== 'undefined') {
    initLanguage();
}

export default {
    SUPPORTED_LANGUAGES,
    initLanguage,
    getLanguage,
    setLanguage,
    t,
    formatNumber,
    formatDate,
    formatRelativeTime
};
