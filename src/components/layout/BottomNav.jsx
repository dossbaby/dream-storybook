import { useState, useEffect } from 'react';
import './BottomNav.css';

const BottomNav = ({
    currentMode,
    currentView,
    onModeChange,
    onViewChange,
    onHomeClick,
    onOpenExplore,
    // 분석 상태
    isAnalyzing = false,
    analysisPhase = 0,
    analysisMode = 'tarot', // 'tarot' | 'dream' | 'fortune'
    onAnalysisComplete // 분석 완료 시 콜백
}) => {
    const [showCompleteBadge, setShowCompleteBadge] = useState(false);
    const [prevAnalyzing, setPrevAnalyzing] = useState(false);

    // 분석 완료 감지
    useEffect(() => {
        if (prevAnalyzing && !isAnalyzing) {
            // 분석 완료됨 - 뱃지 표시
            setShowCompleteBadge(true);
            // 5초 후 자동 숨김
            const timer = setTimeout(() => setShowCompleteBadge(false), 5000);
            return () => clearTimeout(timer);
        }
        setPrevAnalyzing(isAnalyzing);
    }, [isAnalyzing, prevAnalyzing]);

    // 분석 진행률 (0-100)
    const analysisProgress = Math.min(analysisPhase * 12.5, 100);

    const getAnalyzingIcon = () => {
        if (analysisMode === 'tarot') return '🃏';
        if (analysisMode === 'dream') return '🌙';
        if (analysisMode === 'fortune') return '✴️';
        return '✨';
    };

    const navItems = [
        { id: 'home', icon: '🏠', label: '홈', action: 'home' },
        { id: 'explore', icon: '🔥', label: '탐색', action: 'explore' },
        { id: 'create', icon: isAnalyzing ? getAnalyzingIcon() : '✨', label: isAnalyzing ? '분석중' : '시작', action: 'create', isCenter: true },
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
                    className={`bottom-nav-item ${isActive(item) ? 'active' : ''} ${item.isCenter ? 'center-btn' : ''} ${item.isCenter && isAnalyzing ? 'analyzing' : ''} ${item.isCenter && showCompleteBadge ? 'complete' : ''}`}
                    onClick={() => handleNavClick(item)}
                >
                    {/* 중앙 버튼 - 분석 진행 표시 */}
                    {item.isCenter ? (
                        <>
                            <span className={`bottom-nav-icon center-icon ${isAnalyzing ? 'analyzing-icon' : ''}`}>
                                {item.icon}
                                {/* 분석 진행 링 */}
                                {isAnalyzing && (
                                    <svg className="progress-ring" viewBox="0 0 60 60">
                                        <circle
                                            className="progress-ring-bg"
                                            cx="30"
                                            cy="30"
                                            r="26"
                                            fill="none"
                                            strokeWidth="4"
                                        />
                                        <circle
                                            className="progress-ring-fill"
                                            cx="30"
                                            cy="30"
                                            r="26"
                                            fill="none"
                                            strokeWidth="4"
                                            strokeDasharray={`${2 * Math.PI * 26}`}
                                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - analysisProgress / 100)}`}
                                        />
                                    </svg>
                                )}
                                {/* 완료 뱃지 */}
                                {showCompleteBadge && !isAnalyzing && (
                                    <span className="complete-badge">✓</span>
                                )}
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
