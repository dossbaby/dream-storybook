import { useEffect } from 'react';
import './BottomNav.css';

// 모드 설정 - 데스크탑 NavBar와 동일
const MODES = [
    { id: 'tarot', emoji: '🔮', label: '타로' },
    { id: 'dream', emoji: '🌙', label: '꿈' },
    { id: 'fortune', emoji: '☀️', label: '사주' },
];

const BottomNav = ({
    currentMode,
    currentView,
    onModeChange,
    onViewChange,
    onHomeClick,
    onOpenExplore
}) => {
    // localStorage에서 마지막 모드 불러오기
    useEffect(() => {
        const savedMode = localStorage.getItem('jeomai_last_mode');
        if (savedMode && ['tarot', 'dream', 'fortune'].includes(savedMode)) {
            if (savedMode !== currentMode && onModeChange) {
                onModeChange(savedMode);
            }
        }
    }, []);

    // 모드 변경 시 localStorage에 저장
    useEffect(() => {
        if (currentMode) {
            localStorage.setItem('jeomai_last_mode', currentMode);
        }
    }, [currentMode]);

    // 현재 모드의 이모지 가져오기
    const getModeEmoji = (mode) => {
        const found = MODES.find(m => m.id === mode);
        return found ? found.emoji : '✨';
    };

    const navItems = [
        { id: 'home', icon: getModeEmoji(currentMode), label: '커뮤니티', action: 'home' },
        { id: 'explore', icon: '🔥', label: '인기 리딩', action: 'explore' },
        { id: 'create', icon: getModeEmoji(currentMode), label: '시작', action: 'create', isCenter: true },
        { id: 'feed', icon: '💜', label: '내 리딩', action: 'feed' },
        { id: 'mypage', icon: '👤', label: '프로필', action: 'mypage' },
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
                    className={`bottom-nav-item ${isActive(item) ? 'active' : ''} ${item.isCenter ? 'center-btn' : ''} ${item.isCenter ? `mode-${currentMode}` : ''}`}
                    onClick={() => handleNavClick(item)}
                >
                    {item.isCenter ? (
                        <>
                            <span className="bottom-nav-icon center-icon">
                                <span className="start-emoji">{item.icon}</span>
                            </span>
                            <span className="bottom-nav-label">{item.label}</span>
                        </>
                    ) : (
                        <>
                            <span className="bottom-nav-icon">{item.icon}</span>
                            <span className="bottom-nav-label">{item.label}</span>
                        </>
                    )}
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
