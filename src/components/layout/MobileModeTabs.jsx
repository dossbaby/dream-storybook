import './MobileModeTabs.css';

// 모드 설정 - NavBar와 동일
const MODES = [
    { id: 'tarot', emoji: '🔮', label: '타로' },
    { id: 'dream', emoji: '🌙', label: '꿈' },
    { id: 'fortune', emoji: '☀️', label: '사주' },
];

const MobileModeTabs = ({ currentMode, onModeChange }) => {
    return (
        <div className="mobile-mode-tabs-container">
            <div className="mobile-mode-tabs">
                {MODES.map(m => (
                    <button
                        key={m.id}
                        className={`mobile-mode-tab ${currentMode === m.id ? 'active' : ''}`}
                        data-mode={m.id}
                        onClick={() => onModeChange(m.id)}
                    >
                        <span className="mobile-mode-emoji">{m.emoji}</span>
                        <span className="mobile-mode-label">{m.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MobileModeTabs;
