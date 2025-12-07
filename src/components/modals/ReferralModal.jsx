import { useState, useEffect } from 'react';
import { useReferral } from '../../hooks/useReferral';

const ReferralModal = ({ isOpen, onClose, user, onSuccess }) => {
    const {
        referralCode,
        referralStats,
        loading,
        getOrCreateReferralCode,
        applyReferralCode,
        getShareLink,
        getShareText
    } = useReferral(user);

    const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'redeem'
    const [inputCode, setInputCode] = useState('');
    const [applyLoading, setApplyLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && user && !referralCode) {
            getOrCreateReferralCode();
        }
    }, [isOpen, user, referralCode, getOrCreateReferralCode]);

    useEffect(() => {
        if (!isOpen) {
            setInputCode('');
            setMessage(null);
            setCopied(false);
        }
    }, [isOpen]);

    const handleCopyCode = async () => {
        if (!referralCode) return;
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('복사 실패:', e);
        }
    };

    const handleCopyLink = async () => {
        const link = getShareLink();
        if (!link) return;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('복사 실패:', e);
        }
    };

    const handleShare = async () => {
        const link = getShareLink();
        const text = getShareText();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: '점AI 초대',
                    text: text,
                    url: link
                });
            } catch (e) {
                if (e.name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const handleApplyCode = async () => {
        if (!inputCode.trim() || applyLoading) return;

        setApplyLoading(true);
        setMessage(null);

        const result = await applyReferralCode(inputCode.trim());

        setMessage({
            type: result.success ? 'success' : 'error',
            text: result.message
        });

        if (result.success) {
            onSuccess?.({ type: 'referral', bonus: result.bonus });
            setTimeout(() => onClose(), 2000);
        }

        setApplyLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="referral-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="referral-header">
                    <span className="referral-icon">🎁</span>
                    <h3>친구 초대</h3>
                    <p>친구를 초대하고 무료 리딩을 받으세요!</p>
                </div>

                {/* 탭 */}
                <div className="referral-tabs">
                    <button
                        className={`referral-tab ${activeTab === 'invite' ? 'active' : ''}`}
                        onClick={() => setActiveTab('invite')}
                    >
                        친구 초대하기
                    </button>
                    <button
                        className={`referral-tab ${activeTab === 'redeem' ? 'active' : ''}`}
                        onClick={() => setActiveTab('redeem')}
                    >
                        초대 코드 입력
                    </button>
                </div>

                {/* 초대하기 탭 */}
                {activeTab === 'invite' && (
                    <div className="referral-content">
                        {/* 보상 안내 */}
                        <div className="reward-info">
                            <div className="reward-item">
                                <span className="reward-emoji">👤</span>
                                <div className="reward-text">
                                    <strong>내가 받는 보상</strong>
                                    <span>친구 가입 시 무료 리딩 +2</span>
                                </div>
                            </div>
                            <div className="reward-item">
                                <span className="reward-emoji">👥</span>
                                <div className="reward-text">
                                    <strong>친구가 받는 보상</strong>
                                    <span>가입 시 무료 리딩 +1</span>
                                </div>
                            </div>
                        </div>

                        {/* 초대 코드 */}
                        <div className="referral-code-section">
                            <span className="code-label">내 초대 코드</span>
                            <div className="code-display">
                                {loading ? (
                                    <span className="code-loading">생성 중...</span>
                                ) : (
                                    <>
                                        <span className="code-value">{referralCode || '---'}</span>
                                        <button
                                            className="code-copy-btn"
                                            onClick={handleCopyCode}
                                            disabled={!referralCode}
                                        >
                                            {copied ? '✓ 복사됨' : '복사'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 공유 버튼 */}
                        <button
                            className="share-btn primary"
                            onClick={handleShare}
                            disabled={!referralCode || loading}
                        >
                            🔗 초대 링크 공유하기
                        </button>

                        {/* 초대 현황 */}
                        <div className="referral-stats">
                            <div className="stat-item">
                                <span className="stat-value">{referralStats.invitedCount}</span>
                                <span className="stat-label">초대한 친구</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-value">{referralStats.earnedReadings}</span>
                                <span className="stat-label">획득한 리딩</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 코드 입력 탭 */}
                {activeTab === 'redeem' && (
                    <div className="referral-content">
                        <div className="redeem-info">
                            <p>친구에게 받은 초대 코드를 입력하면<br/>무료 리딩 1회를 받을 수 있어요!</p>
                        </div>

                        <div className="code-input-section">
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                placeholder="초대 코드 6자리"
                                maxLength={6}
                                className="code-input"
                                disabled={applyLoading}
                            />
                            <button
                                className="apply-btn"
                                onClick={handleApplyCode}
                                disabled={inputCode.length !== 6 || applyLoading}
                            >
                                {applyLoading ? '확인 중...' : '적용하기'}
                            </button>
                        </div>

                        {message && (
                            <div className={`referral-message ${message.type}`}>
                                {message.type === 'success' ? '🎉' : '⚠️'} {message.text}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferralModal;
