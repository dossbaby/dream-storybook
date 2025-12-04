const ShareModal = ({ isOpen, onClose, shareTarget, dreamTypes, onCopyText }) => {
    if (!isOpen || !shareTarget) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="share-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h3>📤 공유하기</h3>
                <div className="share-preview">
                    <div className="share-card-preview">
                        <div className="share-card-bg">
                            {shareTarget.dreamImage && <img src={shareTarget.dreamImage} alt="" />}
                        </div>
                        <div className="share-card-content">
                            <span className="share-card-type">{dreamTypes[shareTarget.dreamType]?.emoji}</span>
                            <h4>{shareTarget.title}</h4>
                            <p>"{shareTarget.verdict}"</p>
                        </div>
                    </div>
                </div>
                <div className="share-actions">
                    <button className="share-btn copy" onClick={onCopyText}>📋 텍스트 복사</button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
