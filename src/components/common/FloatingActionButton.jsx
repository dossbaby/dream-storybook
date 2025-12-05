import { useState } from 'react';

const FloatingActionButton = ({ mode, onModeChange, onCreateClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        {
            id: 'dream',
            emoji: '🌙',
            label: '꿈 해몽',
            color: '#6c5ce7',
            description: '꿈을 말해주면 해몽해줄게'
        },
        {
            id: 'tarot',
            emoji: '🃏',
            label: '타로',
            color: '#9b59b6',
            description: '카드가 운명을 속삭여요'
        },
        {
            id: 'fortune',
            emoji: '🔮',
            label: '운세',
            color: '#e84393',
            description: '오늘의 기운을 확인하세요'
        },
    ];

    const currentAction = actions.find(a => a.id === mode) || actions[1];

    const handleActionClick = (action) => {
        if (action.id === mode) {
            // 같은 모드면 바로 생성으로
            onCreateClick?.();
        } else {
            // 다른 모드면 모드 변경
            onModeChange?.(action.id);
        }
        setIsOpen(false);
    };

    return (
        <div className={`fab-container ${isOpen ? 'open' : ''}`}>
            {/* 배경 오버레이 */}
            {isOpen && (
                <div className="fab-overlay" onClick={() => setIsOpen(false)} />
            )}

            {/* 액션 버튼들 */}
            <div className="fab-actions">
                {actions.map((action, index) => (
                    <button
                        key={action.id}
                        className={`fab-action ${action.id === mode ? 'active' : ''}`}
                        style={{
                            '--action-color': action.color,
                            '--action-delay': `${index * 0.05}s`
                        }}
                        onClick={() => handleActionClick(action)}
                    >
                        <span className="fab-action-emoji">{action.emoji}</span>
                        <span className="fab-action-label">{action.label}</span>
                        {action.id === mode && (
                            <span className="fab-action-hint">+ 만들기</span>
                        )}
                    </button>
                ))}
            </div>

            {/* 메인 FAB 버튼 */}
            <button
                className="fab-main"
                onClick={() => setIsOpen(!isOpen)}
                style={{ '--fab-color': currentAction.color }}
            >
                <span className={`fab-icon ${isOpen ? 'rotate' : ''}`}>
                    {isOpen ? '✕' : '+'}
                </span>
            </button>

            {/* 툴팁 (닫혀있을 때) */}
            {!isOpen && (
                <div className="fab-tooltip">
                    {currentAction.emoji} {currentAction.description}
                </div>
            )}
        </div>
    );
};

export default FloatingActionButton;
