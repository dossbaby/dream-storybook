const ProfilePromptModal = ({ isOpen, onClose, onOpenProfile }) => {
    if (!isOpen) return null;

    const handleSetupClick = () => {
        onClose();
        onOpenProfile?.();
    };

    return (
        <div className="modal-overlay profile-prompt-overlay" onClick={onClose}>
            <div className="modal-content profile-prompt-modal" onClick={e => e.stopPropagation()}>
                <div className="prompt-icon">✨</div>
                <h3>맞춤 리딩을 받아보세요</h3>
                <p>
                    프로필을 설정하면 생년월일, 성별 등을 바탕으로
                    <br />더 정확하고 개인화된 리딩을 받을 수 있어요
                </p>
                <div className="prompt-benefits">
                    <div className="benefit-item">
                        <span className="benefit-icon">🎯</span>
                        <span>나에게 맞는 정확한 해석</span>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">🔮</span>
                        <span>사주 기반 상세 분석</span>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">💫</span>
                        <span>별자리 운세 확인</span>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="later-btn" onClick={onClose}>나중에</button>
                    <button className="setup-btn" onClick={handleSetupClick}>프로필 설정하기</button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePromptModal;
