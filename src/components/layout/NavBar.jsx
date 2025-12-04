const NavBar = ({
    mode,
    user,
    userPoints,
    onModeChange,
    onViewChange,
    onOpenPoints,
    onLogin,
    onResetResults
}) => {
    const handleBrandClick = () => {
        onResetResults();
        onViewChange('feed');
    };

    const handleModeSelect = (newMode) => {
        onModeChange(newMode);
        onViewChange('feed');
    };

    return (
        <nav className="nav-bar">
            <div className="nav-brand" onClick={handleBrandClick}>
                ✨ <span className="nav-brand-text">
                    {mode === 'tarot' ? '타로' : mode === 'fortune' ? '운세' : '꿈 해몽'}
                </span>
            </div>
            <div className="nav-mode-toggle">
                <button
                    className={`mode-btn ${mode === 'tarot' ? 'active' : ''}`}
                    onClick={() => handleModeSelect('tarot')}
                >
                    🃏 타로
                </button>
                <button
                    className={`mode-btn ${mode === 'fortune' ? 'active' : ''}`}
                    onClick={() => handleModeSelect('fortune')}
                >
                    🔮 운세
                </button>
                <button
                    className={`mode-btn ${mode === 'dream' ? 'active' : ''}`}
                    onClick={() => handleModeSelect('dream')}
                >
                    🌙 꿈
                </button>
            </div>
            <div className="nav-actions">
                {user && (
                    <div className="nav-points" onClick={onOpenPoints}>
                        <span className="points-icon">💎</span>
                        <span className="points-value">{userPoints}</span>
                    </div>
                )}
                <button className="nav-btn-create" onClick={() => onViewChange('create')}>
                    + {mode === 'tarot' ? '타로 보기' : mode === 'fortune' ? '운세 보기' : '꿈 해몽'}
                </button>
                {user ? (
                    <img
                        src={user.photoURL || '/default-avatar.png'}
                        alt=""
                        className="user-avatar"
                        onClick={() => onViewChange('my')}
                    />
                ) : (
                    <button className="login-btn" onClick={onLogin}>로그인</button>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
