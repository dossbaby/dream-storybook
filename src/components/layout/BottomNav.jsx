import './BottomNav.css';

const BottomNav = ({
    currentMode,
    currentView,
    onModeChange,
    onViewChange,
    onHomeClick,
    onOpenExplore
}) => {
    const navItems = [
        { id: 'home', icon: '🏠', label: '홈', action: 'home' },
        { id: 'explore', icon: '🔥', label: '탐색', action: 'explore' },
        { id: 'create', icon: '✨', label: '시작', action: 'create', isCenter: true },
        { id: 'feed', icon: '📰', label: '피드', action: 'feed' },
        { id: 'mypage', icon: '👤', label: '마이', action: 'mypage' },
    ];

    const handleNavClick = (item) => {
        if (item.action === 'home') {
            if (onHomeClick) onHomeClick();
        } else if (item.action === 'explore') {
            if (onOpenExplore) onOpenExplore();
        } else if (item.action === 'create') {
            if (onViewChange) onViewChange('create');
        } else if (item.action === 'feed') {
            if (onViewChange) onViewChange('feed');
        } else if (item.action === 'mypage') {
            if (onViewChange) onViewChange('my');
        } else if (item.mode && onModeChange) {
            onModeChange(item.mode);
        }
    };

    const isActive = (item) => {
        if (item.action === 'home') {
            return currentView === 'feed' && !document.querySelector('.mobile-sheet-overlay');
        }
        if (item.action === 'create') {
            return currentView === 'create';
        }
        if (item.action === 'feed') {
            return currentView === 'feed';
        }
        if (item.action === 'mypage') {
            return currentView === 'my';
        }
        return false;
    };

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`bottom-nav-item ${isActive(item) ? 'active' : ''} ${item.isCenter ? 'center-btn' : ''}`}
                    onClick={() => handleNavClick(item)}
                >
                    <span className={`bottom-nav-icon ${item.isCenter ? 'center-icon' : ''}`}>
                        {item.icon}
                    </span>
                    <span className="bottom-nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
