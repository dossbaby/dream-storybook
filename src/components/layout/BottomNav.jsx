import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = ({ onModeChange, currentMode }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'home', icon: '🏠', label: '홈', path: '/' },
        { id: 'tarot', icon: '🃏', label: '타로', mode: 'tarot' },
        { id: 'dream', icon: '🌙', label: '꿈해몽', mode: 'dream' },
        { id: 'fortune', icon: '✨', label: '사주', mode: 'fortune' },
        { id: 'mypage', icon: '👤', label: '마이', path: '/mypage' },
    ];

    const handleNavClick = (item) => {
        if (item.path) {
            navigate(item.path);
        } else if (item.mode && onModeChange) {
            // 홈으로 이동 후 모드 변경
            if (location.pathname !== '/') {
                navigate('/');
            }
            onModeChange(item.mode);
        }
    };

    const isActive = (item) => {
        if (item.path) {
            return location.pathname === item.path;
        }
        if (item.mode) {
            return location.pathname === '/' && currentMode === item.mode;
        }
        return false;
    };

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`bottom-nav-item ${isActive(item) ? 'active' : ''}`}
                    onClick={() => handleNavClick(item)}
                >
                    <span className="bottom-nav-icon">{item.icon}</span>
                    <span className="bottom-nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
