const PointsModal = ({ isOpen, onClose, userPoints, freeUsesLeft, onAddPoints, onLogin, isLoggedIn }) => {
    if (!isOpen) return null;

    const handlePurchase = (amount, reason) => {
        onAddPoints(amount, reason);
        onClose();
    };

    const handleLoginClick = () => {
        onClose();
        onLogin();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="points-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2 className="points-modal-title">💎 포인트 충전소</h2>

                <div className="points-current">
                    <span className="points-label">현재 포인트</span>
                    <span className="points-amount">{userPoints} P</span>
                </div>

                <div className="points-free-uses">
                    <span className="free-label">무료 이용권</span>
                    <span className="free-count">{freeUsesLeft}회 남음</span>
                </div>

                <div className="points-earn-section">
                    <h3>포인트 적립 방법</h3>
                    <div className="earn-methods">
                        <div className="earn-item">
                            <span className="earn-icon">❤️</span>
                            <span className="earn-desc">다른 사람 꿈에 좋아요</span>
                            <span className="earn-points">+5P</span>
                        </div>
                        <div className="earn-item">
                            <span className="earn-icon">💬</span>
                            <span className="earn-desc">속삭임 남기기</span>
                            <span className="earn-points">+10P</span>
                        </div>
                        <div className="earn-item">
                            <span className="earn-icon">📅</span>
                            <span className="earn-desc">매일 로그인</span>
                            <span className="earn-points">+20P</span>
                        </div>
                        <div className="earn-item special">
                            <span className="earn-icon">🎁</span>
                            <span className="earn-desc">월간 복지 포인트</span>
                            <span className="earn-points">+100P</span>
                        </div>
                    </div>
                </div>

                <div className="points-purchase-section">
                    <h3>포인트 구매</h3>
                    <div className="purchase-options">
                        <button className="purchase-btn" onClick={() => handlePurchase(500, '포인트 구매')}>
                            <span className="purchase-amount">500P</span>
                            <span className="purchase-price">₩1,000</span>
                        </button>
                        <button className="purchase-btn popular" onClick={() => handlePurchase(1200, '포인트 구매')}>
                            <span className="purchase-badge">인기</span>
                            <span className="purchase-amount">1,200P</span>
                            <span className="purchase-price">₩2,000</span>
                        </button>
                        <button className="purchase-btn" onClick={() => handlePurchase(3000, '포인트 구매')}>
                            <span className="purchase-amount">3,000P</span>
                            <span className="purchase-price">₩4,500</span>
                        </button>
                    </div>
                </div>

                {!isLoggedIn && (
                    <div className="points-login-prompt">
                        <p>로그인하면 더 많은 혜택을 받을 수 있어요!</p>
                        <button className="login-prompt-btn" onClick={handleLoginClick}>
                            구글로 로그인
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PointsModal;
