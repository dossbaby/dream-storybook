import { useState } from 'react';

const NavBar = ({
    mode,
    user,
    userPoints,
    onlineCount,
    onModeChange,
    onViewChange,
    onOpenPoints,
    onLogin,
    onResetResults
}) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleBrandClick = () => {
        onResetResults();
        onViewChange('feed');
    };

    const handleModeSelect = (newMode) => {
        onModeChange(newMode);
        onViewChange('feed');
        setShowMobileMenu(false);
    };

    const modes = [
        { id: 'tarot', emoji: '🃏', label: '타로', desc: '운명의 카드', color: '#9b59b6' },
        { id: 'dream', emoji: '🌙', label: '꿈', desc: '꿈 해몽', color: '#6c5ce7' },
        { id: 'fortune', emoji: '🔮', label: '운세', desc: '오늘의 기운', color: '#e84393' },
    ];

    const currentMode = modes.find(m => m.id === mode) || modes[0];

    return (
        <nav className="nav-bar community-nav">
            {/* 로고 & 브랜드 */}
            <div className="nav-brand" onClick={handleBrandClick}>
                <span className="brand-logo">✨</span>
                <span className="brand-name">드림북</span>
                {onlineCount > 0 && (
                    <div className="online-badge">
                        <span className="online-dot"></span>
                        <span className="online-count">{onlineCount}</span>
                    </div>
                )}
            </div>

            {/* 모드 탭 - 메인 네비게이션 */}
            <div className="nav-mode-tabs">
                {modes.map(m => (
                    <button
                        key={m.id}
                        className={`mode-tab ${mode === m.id ? 'active' : ''}`}
                        onClick={() => handleModeSelect(m.id)}
                        data-mode={m.id}
                    >
                        <span className="mode-emoji">{m.emoji}</span>
                        <span className="mode-label">{m.label}</span>
                    </button>
                ))}
            </div>

            {/* 액션 버튼들 */}
            <div className="nav-actions">
                {user && (
                    <button className="nav-points-btn" onClick={onOpenPoints}>
                        <span className="points-gem">💎</span>
                        <span className="points-value">{userPoints}</span>
                    </button>
                )}

                <button
                    className="nav-create-btn"
                    onClick={() => onViewChange('create')}
                    style={{ '--btn-color': currentMode.color }}
                >
                    <span className="create-icon">+</span>
                    <span className="create-text">{currentMode.desc}</span>
                </button>

                {user ? (
                    <div className="nav-user" onClick={() => onViewChange('my')}>
                        <img
                            src={user.photoURL || '/default-avatar.png'}
                            alt=""
                            className="user-avatar-img"
                        />
                    </div>
                ) : (
                    <button className="nav-login-btn" onClick={onLogin}>
                        로그인
                    </button>
                )}

                {/* 모바일 메뉴 버튼 */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    ☰
                </button>
            </div>

            {/* 모바일 드롭다운 메뉴 */}
            {showMobileMenu && (
                <div className="mobile-menu">
                    {modes.map(m => (
                        <button
                            key={m.id}
                            className={`mobile-mode-btn ${mode === m.id ? 'active' : ''}`}
                            onClick={() => handleModeSelect(m.id)}
                        >
                            <span>{m.emoji}</span>
                            <span>{m.label}</span>
                            <span className="mobile-mode-desc">{m.desc}</span>
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default NavBar;
