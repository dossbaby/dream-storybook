/**
 * i18n React Hook
 *
 * 컴포넌트에서 다국어 기능을 쉽게 사용하기 위한 훅
 */

import { useState, useEffect, useCallback } from 'react';
import {
    t,
    getLanguage,
    setLanguage,
    SUPPORTED_LANGUAGES,
    formatNumber,
    formatDate,
    formatRelativeTime
} from '../i18n';

/**
 * i18n 커스텀 훅
 * @returns {Object} i18n 유틸리티
 */
export const useI18n = () => {
    const [language, setLang] = useState(getLanguage);

    // 언어 변경 이벤트 리스너
    useEffect(() => {
        const handleLanguageChange = (event) => {
            setLang(event.detail);
        };

        window.addEventListener('languageChange', handleLanguageChange);
        return () => {
            window.removeEventListener('languageChange', handleLanguageChange);
        };
    }, []);

    /**
     * 언어 변경
     */
    const changeLanguage = useCallback((lang) => {
        if (setLanguage(lang)) {
            setLang(lang);
            return true;
        }
        return false;
    }, []);

    /**
     * 언어 토글 (한국어 <-> 영어)
     */
    const toggleLanguage = useCallback(() => {
        const newLang = language === 'ko' ? 'en' : 'ko';
        changeLanguage(newLang);
    }, [language, changeLanguage]);

    /**
     * 현재 언어가 한국어인지 확인
     */
    const isKorean = language === 'ko';

    /**
     * 현재 언어가 영어인지 확인
     */
    const isEnglish = language === 'en';

    return {
        // 번역 함수
        t,

        // 현재 언어
        language,
        isKorean,
        isEnglish,

        // 언어 변경
        changeLanguage,
        toggleLanguage,

        // 지원 언어 목록
        languages: SUPPORTED_LANGUAGES,

        // 포맷팅 유틸
        formatNumber,
        formatDate,
        formatRelativeTime
    };
};

export default useI18n;
