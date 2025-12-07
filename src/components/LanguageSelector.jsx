/**
 * 언어 선택 컴포넌트
 *
 * 기능:
 * - 드롭다운 형태의 언어 선택
 * - 토글 형태의 간단한 전환
 * - 현재 언어 표시
 */

import React, { useState, useRef, useEffect } from 'react';
import useI18n from '../hooks/useI18n';

/**
 * 드롭다운 언어 선택기
 */
export const LanguageDropdown = ({ className = '' }) => {
    const { language, languages, changeLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = languages[language];

    return (
        <div className={`language-dropdown ${className}`} ref={dropdownRef}>
            <button
                className="language-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="lang-flag">{currentLang?.flag}</span>
                <span className="lang-name">{currentLang?.nativeName}</span>
                <span className={`lang-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <ul className="language-dropdown-menu" role="listbox">
                    {Object.entries(languages).map(([code, lang]) => (
                        <li key={code}>
                            <button
                                className={`language-option ${code === language ? 'active' : ''}`}
                                onClick={() => {
                                    changeLanguage(code);
                                    setIsOpen(false);
                                }}
                                role="option"
                                aria-selected={code === language}
                            >
                                <span className="lang-flag">{lang.flag}</span>
                                <span className="lang-name">{lang.nativeName}</span>
                                {code === language && <span className="lang-check">✓</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

/**
 * 토글 언어 전환기 (한/영)
 */
export const LanguageToggle = ({ className = '', showLabel = true }) => {
    const { language, toggleLanguage, isKorean } = useI18n();

    return (
        <button
            className={`language-toggle ${className}`}
            onClick={toggleLanguage}
            aria-label={`Switch to ${isKorean ? 'English' : '한국어'}`}
        >
            <span className={`lang-option ${isKorean ? 'active' : ''}`}>
                🇰🇷 {showLabel && '한'}
            </span>
            <span className="lang-separator">/</span>
            <span className={`lang-option ${!isKorean ? 'active' : ''}`}>
                🇺🇸 {showLabel && 'EN'}
            </span>
        </button>
    );
};

/**
 * 컴팩트 언어 버튼 (아이콘만)
 */
export const LanguageButton = ({ className = '' }) => {
    const { language, languages, toggleLanguage } = useI18n();
    const currentLang = languages[language];

    return (
        <button
            className={`language-button ${className}`}
            onClick={toggleLanguage}
            aria-label={`Current language: ${currentLang?.name}. Click to change.`}
            title={currentLang?.nativeName}
        >
            <span className="lang-flag">{currentLang?.flag}</span>
        </button>
    );
};

// 기본 export
export default LanguageDropdown;
