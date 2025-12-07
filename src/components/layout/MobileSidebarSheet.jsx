import { useState, useEffect } from 'react';

/**
 * 모바일 바텀시트 래퍼 컴포넌트
 * 사이드바 콘텐츠를 모바일에서 바텀시트로 표시
 */
const MobileSidebarSheet = ({
    isOpen,
    onClose,
    title,
    icon,
    children
}) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 250);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div
            className={`mobile-sheet-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleBackdropClick}
        >
            <div className={`mobile-sheet ${isClosing ? 'closing' : ''}`}>
                {/* 드래그 핸들 */}
                <div className="sheet-handle" onClick={handleClose}>
                    <div className="handle-bar"></div>
                </div>

                {/* 헤더 */}
                <div className="sheet-header">
                    <div className="sheet-title">
                        {icon && <span className="sheet-icon">{icon}</span>}
                        <span>{title}</span>
                    </div>
                    <button className="sheet-close" onClick={handleClose}>
                        ✕
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="sheet-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MobileSidebarSheet;
