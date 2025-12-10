import { useState, useEffect } from 'react';
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
    onOpenExplore,
    // 분석 상태
    isAnalyzing = false,
    smoothProgress = 0, // 부드러운 진행률 (0-100)
    isProgressComplete = false, // 진행 완료 여부
    analysisMode = 'tarot', // 'tarot' | 'dream' | 'fortune'
    onAnalysisComplete // 분석 완료 시 콜백
}) => {
    const [showCompleteBadge, setShowCompleteBadge] = useState(false);
    const [prevAnalyzing, setPrevAnalyzing] = useState(false);

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

    // 분석 완료 감지
    useEffect(() => {
        if (prevAnalyzing && !isAnalyzing) {
            // 분석 완료됨 - 뱃지 표시
            setShowCompleteBadge(true);
            // 자동 숨김 없음 - 유저가 클릭할 때까지 유지
        }
        setPrevAnalyzing(isAnalyzing);
    }, [isAnalyzing, prevAnalyzing]);

    // 현재 모드의 이모지 가져오기
    const getModeEmoji = (mode) => {
        const found = MODES.find(m => m.id === mode);
        return found ? found.emoji : '✨';
    };

    const getAnalyzingIcon = () => {
        return getModeEmoji(analysisMode);
    };

    // 라벨에 % 표시
    const getCreateLabel = () => {
        if (isAnalyzing) {
            return `분석중 ${smoothProgress}%`;
        }
        if (showCompleteBadge) {
            return '분석 완료';
        }
        return '시작';
    };

    // 아이콘 결정 - 모드별 이모지
    const getCreateIcon = () => {
        if (isAnalyzing) return getAnalyzingIcon();
        if (showCompleteBadge) return getModeEmoji(analysisMode); // 완료 시 분석한 모드 이모지
        return getModeEmoji(currentMode); // 기본: 현재 선택된 모드 이모지
    };

    const navItems = [
        { id: 'home', icon: '🌀', label: '피드', action: 'home' },
        { id: 'explore', icon: '🔥', label: '인기', action: 'explore' },
        { id: 'create', icon: getCreateIcon(), label: getCreateLabel(), action: 'create', isCenter: true },
        { id: 'feed', icon: '📓', label: '리딩', action: 'feed' },
        { id: 'mypage', icon: '💜', label: '정보', action: 'mypage' },
    ];

    const handleNavClick = (item) => {
        if (item.action === 'home') {
            if (onHomeClick) onHomeClick();
        } else if (item.action === 'explore') {
            if (onOpenExplore) onOpenExplore();
        } else if (item.action === 'create') {
            // 분석 완료 뱃지가 표시 중이면 결과 페이지로 이동
            if (showCompleteBadge && onAnalysisComplete) {
                setShowCompleteBadge(false);
                onAnalysisComplete();
            } else {
                // 바로 create view로 이동
                if (onViewChange) onViewChange('create');
            }
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
                    className={`bottom-nav-item ${isActive(item) ? 'active' : ''} ${item.isCenter ? 'center-btn' : ''} ${item.isCenter && isAnalyzing ? 'analyzing' : ''} ${item.isCenter && showCompleteBadge ? 'complete' : ''} ${item.isCenter ? `mode-${currentMode}` : ''}`}
                    onClick={() => handleNavClick(item)}
                >
                    {/* 중앙 버튼 - 분석 진행 표시 */}
                    {item.isCenter ? (
                        <>
                            <span className={`bottom-nav-icon center-icon ${isAnalyzing ? 'analyzing-icon' : ''}`}>
                                <span className="start-emoji">{item.icon}</span>
                                {/* 분석 진행 링 */}
                                {isAnalyzing && (
                                    <svg className="progress-ring" viewBox="0 0 60 60">
                                        <defs>
                                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#ff0055" />
                                                <stop offset="25%" stopColor="#ff6432" />
                                                <stop offset="50%" stopColor="#ffd700" />
                                                <stop offset="75%" stopColor="#00d4ff" />
                                                <stop offset="100%" stopColor="#9b59b6" />
                                            </linearGradient>
                                        </defs>
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
                                            stroke="url(#progressGradient)"
                                            strokeDasharray={`${2 * Math.PI * 26}`}
                                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - smoothProgress / 100)}`}
                                        />
                                    </svg>
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
