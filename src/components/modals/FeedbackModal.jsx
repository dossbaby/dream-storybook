import { useState, useCallback } from 'react';
import { doc, setDoc, getDoc, Timestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';

const FEEDBACK_TYPES = [
    { id: 'bug', emoji: '🐛', label: '버그 신고', placeholder: '어떤 문제가 발생했나요? 상황을 자세히 알려주세요.' },
    { id: 'suggestion', emoji: '💡', label: '기능 제안', placeholder: '어떤 기능이 있으면 좋을까요? 아이디어를 알려주세요.' },
    { id: 'praise', emoji: '💖', label: '칭찬하기', placeholder: '점AI의 어떤 점이 좋았나요?' },
    { id: 'other', emoji: '💬', label: '기타 의견', placeholder: '자유롭게 의견을 남겨주세요.' }
];

const COOLDOWN_DAYS = 7; // 일주일 쿨다운

const FeedbackModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [feedbackType, setFeedbackType] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [cooldownInfo, setCooldownInfo] = useState(null);

    // 쿨다운 체크
    const checkCooldown = useCallback(async () => {
        if (!user) return false;
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const lastFeedbackAt = userDoc.data().lastFeedbackAt?.toDate();
                if (lastFeedbackAt) {
                    const daysSince = (Date.now() - lastFeedbackAt.getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSince < COOLDOWN_DAYS) {
                        const daysRemaining = Math.ceil(COOLDOWN_DAYS - daysSince);
                        setCooldownInfo({ daysRemaining, lastFeedbackAt });
                        return true;
                    }
                }
            }
        } catch (e) {
            console.error('Cooldown check error:', e);
        }
        return false;
    }, [user]);

    // 피드백 제출
    const handleSubmit = async () => {
        if (!user) {
            setError('로그인이 필요합니다.');
            return;
        }
        if (!feedbackType) {
            setError('피드백 유형을 선택해주세요.');
            return;
        }
        if (content.trim().length < 10) {
            setError('최소 10자 이상 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 쿨다운 체크
            const isOnCooldown = await checkCooldown();
            if (isOnCooldown) {
                setError(`피드백은 ${COOLDOWN_DAYS}일에 1회만 가능합니다.`);
                setLoading(false);
                return;
            }

            // 피드백 저장
            const feedbackId = `${user.uid}_${Date.now()}`;
            await setDoc(doc(db, 'feedbacks', feedbackId), {
                userId: user.uid,
                userName: user.displayName || '익명',
                userEmail: user.email || '',
                type: feedbackType,
                content: content.trim(),
                createdAt: Timestamp.now(),
                status: 'new',
                metadata: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language
                }
            });

            // 사용자 마지막 피드백 시간 업데이트 + 보너스 리딩 부여
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                lastFeedbackAt: Timestamp.now(),
                bonusReadings: increment(1) // +1 무료 리딩
            });

            setSubmitted(true);
            onSuccess?.();
        } catch (e) {
            console.error('Feedback submit error:', e);
            setError('피드백 전송에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFeedbackType(null);
        setContent('');
        setError('');
        setSubmitted(false);
        setCooldownInfo(null);
        onClose();
    };

    if (!isOpen) return null;

    const selectedType = FEEDBACK_TYPES.find(t => t.id === feedbackType);

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="feedback-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose}>✕</button>

                {submitted ? (
                    <div className="feedback-success">
                        <div className="success-icon">🎉</div>
                        <h3>감사합니다!</h3>
                        <p>소중한 의견이 전달되었어요.</p>
                        <div className="bonus-badge">
                            <span className="bonus-emoji">🎁</span>
                            <span className="bonus-text">무료 리딩 +1 획득!</span>
                        </div>
                        <p className="success-note">다음 피드백은 {COOLDOWN_DAYS}일 후에 보내실 수 있어요.</p>
                        <button className="feedback-close-btn" onClick={handleClose}>
                            확인
                        </button>
                    </div>
                ) : cooldownInfo ? (
                    <div className="feedback-cooldown">
                        <div className="cooldown-icon">⏰</div>
                        <h3>조금만 기다려주세요</h3>
                        <p>피드백은 주 1회 보내실 수 있어요.</p>
                        <div className="cooldown-badge">
                            <span className="cooldown-days">{cooldownInfo.daysRemaining}일</span>
                            <span className="cooldown-label">후 가능</span>
                        </div>
                        <button className="feedback-close-btn" onClick={handleClose}>
                            확인
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="feedback-header">
                            <h3>💬 의견을 들려주세요</h3>
                            <p>점AI를 더 좋게 만드는 데 도움이 되어요!</p>
                            <div className="feedback-reward">
                                <span className="reward-emoji">🎁</span>
                                <span className="reward-text">피드백 전송 시 무료 리딩 +1</span>
                            </div>
                        </div>

                        <div className="feedback-types">
                            {FEEDBACK_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    className={`feedback-type-btn ${feedbackType === type.id ? 'active' : ''}`}
                                    onClick={() => setFeedbackType(type.id)}
                                >
                                    <span className="type-emoji">{type.emoji}</span>
                                    <span className="type-label">{type.label}</span>
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="feedback-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={selectedType?.placeholder || '내용을 입력해주세요...'}
                            maxLength={1000}
                            disabled={loading}
                            inputMode="text"
                            enterKeyHint="done"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />

                        <div className="feedback-footer">
                            <span className="char-count">{content.length}/1000</span>
                            {error && <span className="feedback-error">{error}</span>}
                        </div>

                        <button
                            className="feedback-submit-btn"
                            onClick={handleSubmit}
                            disabled={loading || !feedbackType || content.trim().length < 10}
                        >
                            {loading ? '전송 중...' : '피드백 보내기'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
