import { useState } from 'react';
import { CUSTOM_QUESTION_CONFIG, getCustomQuestionAccess } from '../../utils/aiConfig';

/**
 * 맞춤 질문 선택 컴포넌트
 * - 무료: 사전 정의된 질문 선택만
 * - 프리미엄+: 자유 질문 입력 가능
 */
const CustomQuestionSelector = ({
    type = 'dream', // 'dream' | 'fortune'
    tier = 'free',
    selectedQuestion,
    customQuestion,
    onSelectPreset,
    onCustomChange,
    onOpenPremium,
    disabled = false
}) => {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const config = CUSTOM_QUESTION_CONFIG[type];
    const access = getCustomQuestionAccess(tier);

    if (!config) return null;

    const handlePresetClick = (preset) => {
        if (disabled) return;
        setShowCustomInput(false);
        onSelectPreset(preset);
    };

    const handleCustomClick = () => {
        if (disabled) return;
        if (!access.canUseCustom) {
            onOpenPremium?.();
            return;
        }
        setShowCustomInput(true);
        onSelectPreset(null); // 프리셋 선택 해제
    };

    return (
        <div className="custom-question-selector">
            <div className="question-header">
                <span className="question-title">질문 선택</span>
                <span className="question-subtitle">
                    {type === 'dream' ? '어떤 관점으로 꿈을 해석할까요?' : '어떤 운세가 궁금하세요?'}
                </span>
            </div>

            {/* 사전 정의 질문 버튼들 */}
            <div className="preset-questions">
                {config.presetQuestions.map((preset) => (
                    <button
                        key={preset.id}
                        className={`preset-btn ${selectedQuestion?.id === preset.id ? 'selected' : ''}`}
                        onClick={() => handlePresetClick(preset)}
                        disabled={disabled}
                    >
                        <span className="preset-emoji">{preset.emoji}</span>
                        <span className="preset-label">{preset.label}</span>
                    </button>
                ))}

                {/* 자유 질문 버튼 */}
                <button
                    className={`preset-btn custom-btn ${showCustomInput ? 'selected' : ''} ${!access.canUseCustom ? 'locked' : ''}`}
                    onClick={handleCustomClick}
                    disabled={disabled}
                >
                    <span className="preset-emoji">{access.canUseCustom ? '✏️' : '👑'}</span>
                    <span className="preset-label">
                        {access.canUseCustom ? '직접 입력' : '자유 질문'}
                    </span>
                    {!access.canUseCustom && (
                        <span className="premium-lock">프리미엄</span>
                    )}
                </button>
            </div>

            {/* 선택된 질문 설명 */}
            {selectedQuestion && !showCustomInput && (
                <div className="selected-description">
                    <span className="desc-icon">💬</span>
                    <span className="desc-text">{selectedQuestion.description}</span>
                </div>
            )}

            {/* 자유 질문 입력 (프리미엄만) */}
            {showCustomInput && access.canUseCustom && (
                <div className="custom-input-wrapper">
                    <textarea
                        value={customQuestion || ''}
                        onChange={(e) => onCustomChange(e.target.value.slice(0, access.maxCustomLength))}
                        placeholder={config.customPlaceholder}
                        className="custom-question-input"
                        disabled={disabled}
                        rows={2}
                    />
                    <div className="custom-input-footer">
                        <span className="char-count">
                            {(customQuestion || '').length}/{access.maxCustomLength}자
                        </span>
                        <span className="premium-badge">👑 프리미엄</span>
                    </div>
                </div>
            )}

            {/* 프리미엄 유도 (무료 유저가 자유 질문 클릭 시) */}
            {showCustomInput && !access.canUseCustom && (
                <div className="premium-upsell-inline">
                    <div className="upsell-content">
                        <span className="upsell-icon">✨</span>
                        <div className="upsell-text">
                            <strong>나만의 질문으로 더 깊은 해석을 받아보세요</strong>
                            <p>프리미엄 회원은 자유롭게 질문을 입력할 수 있어요</p>
                        </div>
                        <button className="upsell-btn" onClick={onOpenPremium}>
                            👑 업그레이드
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomQuestionSelector;
