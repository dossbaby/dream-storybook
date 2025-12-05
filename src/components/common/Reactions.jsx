import { useState } from 'react';

const REACTION_EMOJIS = [
    { id: 'wow', emoji: '😮', label: '놀라워' },
    { id: 'empathy', emoji: '🥺', label: '공감' },
    { id: 'fire', emoji: '🔥', label: '대박' },
    { id: 'curious', emoji: '🤔', label: '신기해' },
    { id: 'accurate', emoji: '✨', label: '정확해' },
];

const Reactions = ({
    reactions = {},  // { wow: 5, empathy: 3, ... }
    userReactions = [],  // ['wow', 'fire']
    onReact,
    compact = false
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleReact = (reactionId) => {
        onReact?.(reactionId);
        setShowPicker(false);
    };

    // 카운트가 있는 리액션만 표시
    const activeReactions = REACTION_EMOJIS.filter(r => reactions[r.id] > 0);

    if (compact) {
        // 컴팩트 모드 - 카드 내 간단 표시
        return (
            <div className="reactions-compact">
                {activeReactions.slice(0, 3).map(reaction => (
                    <span key={reaction.id} className="reaction-mini">
                        {reaction.emoji}
                    </span>
                ))}
                {Object.values(reactions).reduce((a, b) => a + b, 0) > 0 && (
                    <span className="reaction-total">
                        {Object.values(reactions).reduce((a, b) => a + b, 0)}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="reactions-container">
            {/* 활성화된 리액션 버튼들 */}
            {activeReactions.map(reaction => (
                <button
                    key={reaction.id}
                    className={`reaction-btn ${userReactions.includes(reaction.id) ? 'active' : ''}`}
                    onClick={() => handleReact(reaction.id)}
                    title={reaction.label}
                >
                    <span className="emoji">{reaction.emoji}</span>
                    <span className="count">{reactions[reaction.id]}</span>
                </button>
            ))}

            {/* 리액션 추가 버튼 */}
            <div className="reaction-add-wrapper">
                <button
                    className="reaction-add-btn"
                    onClick={() => setShowPicker(!showPicker)}
                >
                    +
                </button>

                {/* 리액션 피커 */}
                {showPicker && (
                    <div className="reaction-picker">
                        {REACTION_EMOJIS.map(reaction => (
                            <button
                                key={reaction.id}
                                className={`reaction-picker-btn ${userReactions.includes(reaction.id) ? 'selected' : ''}`}
                                onClick={() => handleReact(reaction.id)}
                                title={reaction.label}
                            >
                                {reaction.emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reactions;
export { REACTION_EMOJIS };
