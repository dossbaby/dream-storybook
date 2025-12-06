import { useState, memo } from 'react';

const ShareModal = memo(({ isOpen, onClose, shareTarget, dreamTypes, onCopyText, showToast }) => {
    const [isCopying, setIsCopying] = useState(false);

    if (!isOpen || !shareTarget) return null;

    // 공유할 URL 생성
    const getShareUrl = () => {
        const baseUrl = window.location.origin;
        const type = shareTarget.type || 'dream';
        const id = shareTarget.id || shareTarget.firestoreId;
        return id ? `${baseUrl}/${type}/${id}` : baseUrl;
    };

    // 공유 텍스트 생성
    const getShareText = () => {
        const emoji = dreamTypes?.[shareTarget.dreamType]?.emoji || '🌙';
        const title = shareTarget.title || '꿈 해몽';
        const verdict = shareTarget.verdict || '';

        return `${emoji} ${title}\n\n"${verdict}"\n\n꿈 스토리북에서 확인하기`;
    };

    // 텍스트 복사
    const handleCopyText = async () => {
        setIsCopying(true);
        try {
            const text = getShareText();
            await navigator.clipboard.writeText(text);
            showToast?.('텍스트가 복사되었어요! 📋', 'success');
            onCopyText?.();
        } catch (err) {
            // 폴백: execCommand 사용
            const textArea = document.createElement('textarea');
            textArea.value = getShareText();
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast?.('텍스트가 복사되었어요! 📋', 'success');
        } finally {
            setIsCopying(false);
        }
    };

    // 링크 복사
    const handleCopyLink = async () => {
        try {
            const url = getShareUrl();
            await navigator.clipboard.writeText(url);
            showToast?.('링크가 복사되었어요! 🔗', 'success');
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = getShareUrl();
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast?.('링크가 복사되었어요! 🔗', 'success');
        }
    };

    // Web Share API (모바일/지원 브라우저)
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTarget.title || '꿈 스토리북',
                    text: getShareText(),
                    url: getShareUrl()
                });
                showToast?.('공유 완료! ✨', 'success');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showToast?.('공유에 실패했어요 😢', 'error');
                }
            }
        }
    };

    // 카카오톡 공유
    const handleKakaoShare = () => {
        if (window.Kakao?.Share) {
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: shareTarget.title || '꿈 해몽 결과',
                    description: shareTarget.verdict || '나의 꿈을 해몽했어요!',
                    imageUrl: shareTarget.dreamImage || `${window.location.origin}/og-image.png`,
                    link: {
                        mobileWebUrl: getShareUrl(),
                        webUrl: getShareUrl()
                    }
                },
                buttons: [
                    {
                        title: '자세히 보기',
                        link: {
                            mobileWebUrl: getShareUrl(),
                            webUrl: getShareUrl()
                        }
                    }
                ]
            });
        } else {
            // 카카오 SDK가 없으면 링크 복사로 대체
            handleCopyLink();
            showToast?.('카카오톡 공유는 준비 중이에요. 링크가 복사되었습니다!', 'info');
        }
    };

    // 트위터 공유
    const handleTwitterShare = () => {
        const text = encodeURIComponent(getShareText());
        const url = encodeURIComponent(getShareUrl());
        window.open(
            `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            '_blank',
            'width=600,height=400'
        );
    };

    // 페이스북 공유
    const handleFacebookShare = () => {
        const url = encodeURIComponent(getShareUrl());
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            '_blank',
            'width=600,height=400'
        );
    };

    const canNativeShare = typeof navigator !== 'undefined' && navigator.share;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="share-modal enhanced" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="share-header">
                    <span className="share-icon">✨</span>
                    <h3>공유하기</h3>
                </div>

                {/* 프리뷰 카드 */}
                <div className="share-preview">
                    <div className="share-card-preview">
                        <div className="share-card-bg">
                            {shareTarget.dreamImage && <img src={shareTarget.dreamImage} alt="" />}
                            <div className="share-card-gradient"></div>
                        </div>
                        <div className="share-card-content">
                            <span className="share-card-type">
                                {dreamTypes?.[shareTarget.dreamType]?.emoji || '🌙'}
                            </span>
                            <h4>{shareTarget.title || '꿈 해몽'}</h4>
                            <p>"{shareTarget.verdict || '운명의 메시지'}"</p>
                        </div>
                    </div>
                </div>

                {/* 공유 버튼들 */}
                <div className="share-buttons-grid">
                    {/* 네이티브 공유 (모바일) */}
                    {canNativeShare && (
                        <button
                            className="share-btn native"
                            onClick={handleNativeShare}
                        >
                            <span className="btn-icon">📲</span>
                            <span className="btn-label">공유</span>
                        </button>
                    )}

                    {/* 카카오톡 */}
                    <button
                        className="share-btn kakao"
                        onClick={handleKakaoShare}
                    >
                        <span className="btn-icon">💬</span>
                        <span className="btn-label">카카오톡</span>
                    </button>

                    {/* 트위터 */}
                    <button
                        className="share-btn twitter"
                        onClick={handleTwitterShare}
                    >
                        <span className="btn-icon">🐦</span>
                        <span className="btn-label">트위터</span>
                    </button>

                    {/* 페이스북 */}
                    <button
                        className="share-btn facebook"
                        onClick={handleFacebookShare}
                    >
                        <span className="btn-icon">📘</span>
                        <span className="btn-label">페이스북</span>
                    </button>

                    {/* 링크 복사 */}
                    <button
                        className="share-btn link"
                        onClick={handleCopyLink}
                    >
                        <span className="btn-icon">🔗</span>
                        <span className="btn-label">링크 복사</span>
                    </button>

                    {/* 텍스트 복사 */}
                    <button
                        className="share-btn copy"
                        onClick={handleCopyText}
                        disabled={isCopying}
                    >
                        <span className="btn-icon">{isCopying ? '⏳' : '📋'}</span>
                        <span className="btn-label">텍스트 복사</span>
                    </button>
                </div>

                <p className="share-tip">친구에게 나의 꿈 해몽을 공유해보세요!</p>
            </div>
        </div>
    );
});

ShareModal.displayName = 'ShareModal';

export default ShareModal;
