import { useState } from 'react';
import './VisibilitySelector.css';

/**
 * 통합 공개 설정 컴포넌트
 * 꿈, 타로, 사주 모두 동일한 UI로 공개 설정
 */
const VisibilitySelector = ({ value, onChange, showAnonymous = true, shareUrl = null }) => {
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const options = [
        {
            value: 'private',
            icon: '🔒',
            label: '나만 보기',
            description: '내 마이페이지에서만 확인'
        },
        {
            value: 'unlisted',
            icon: '🔗',
            label: '링크로 공유',
            description: '링크 아는 사람만 볼 수 있음'
        },
        {
            value: 'public',
            icon: '🌐',
            label: '커뮤니티에 공개',
            description: '모든 사람이 볼 수 있음'
        }
    ];

    const handleChange = (newValue) => {
        onChange({
            visibility: newValue,
            isAnonymous: newValue === 'public' ? isAnonymous : false
        });
    };

    const handleAnonymousChange = (e) => {
        const newAnonymous = e.target.checked;
        setIsAnonymous(newAnonymous);
        onChange({
            visibility: value,
            isAnonymous: newAnonymous
        });
    };

    const handleCopyLink = async () => {
        const url = shareUrl || window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    return (
        <div className="visibility-selector">
            <div className="visibility-options">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className={`visibility-option ${value === option.value ? 'active' : ''}`}
                        onClick={() => handleChange(option.value)}
                    >
                        <span className="option-icon">{option.icon}</span>
                        <div className="option-content">
                            <span className="option-label">{option.label}</span>
                            <span className="option-description">{option.description}</span>
                        </div>
                        {value === option.value && (
                            <span className="option-check">✓</span>
                        )}
                    </button>
                ))}
            </div>

            {/* 링크 공유 버튼 - unlisted 선택 시에만 표시 */}
            {value === 'unlisted' && (
                <div className="link-share-toggle">
                    <span className="link-share-label">
                        <span className="link-share-icon">🔗</span>
                        링크를 복사해서 공유하세요
                    </span>
                    <button
                        type="button"
                        className="link-share-btn"
                        onClick={handleCopyLink}
                    >
                        {linkCopied ? '✓ 복사됨!' : '링크 복사'}
                    </button>
                </div>
            )}

            {/* 익명 공개 옵션 - public 선택 시에만 표시 */}
            {value === 'public' && showAnonymous && (
                <label className="anonymous-option">
                    <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={handleAnonymousChange}
                    />
                    <span className="anonymous-label">
                        <span className="anonymous-icon">🎭</span>
                        익명으로 공개
                        <span className="anonymous-hint">작성자가 "익명의 꿈꾸는 자"로 표시됩니다</span>
                    </span>
                </label>
            )}

            {/* 공개 설정 안내 */}
            <div className="visibility-info">
                {value === 'private' && (
                    <p>🔒 이 콘텐츠는 나만 볼 수 있어요. 마이페이지에서 확인하세요.</p>
                )}
                {value === 'unlisted' && (
                    <p>🔗 링크를 공유하면 다른 사람도 볼 수 있어요. 검색에는 노출되지 않아요.</p>
                )}
                {value === 'public' && (
                    <p>🎭 <strong>닉네임으로 표시</strong>되어 익명이 보장돼요. 다른 사람들과 공유하고 반응도 받아보세요!</p>
                )}
            </div>
        </div>
    );
};

export default VisibilitySelector;
