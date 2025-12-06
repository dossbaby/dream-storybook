import { useState } from 'react';
import './VisibilitySelector.css';

/**
 * 통합 공개 설정 컴포넌트
 * 꿈, 타로, 사주 모두 동일한 UI로 공개 설정
 */
const VisibilitySelector = ({ value, onChange, showAnonymous = true }) => {
    const [isAnonymous, setIsAnonymous] = useState(false);

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
                    <p>🌐 피드와 태그 페이지에 노출되고, 검색엔진에서도 찾을 수 있어요.</p>
                )}
            </div>
        </div>
    );
};

export default VisibilitySelector;
