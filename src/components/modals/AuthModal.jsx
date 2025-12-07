import { useState } from 'react';
import { sendMagicLink } from '../../firebase';

const AuthModal = ({ isOpen, onClose, onGoogleLogin, onSuccess, trigger = 'action' }) => {
    // trigger: 'action' (타로/꿈/사주 보기) | 'login' (로그인 버튼)
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('choice'); // 'choice' | 'email' | 'sent'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // trigger에 따른 카피
    const copyOptions = {
        action: {
            intro: '소름돋는 정확함!',
            introSub: '준비 되셨을까요?',
            usp: [
                { icon: '⚡', text: '3초면 바로 시작' },
                { icon: '🎁', text: '매주 3회 무료' },
                { icon: '💾', text: '기록 자동 저장' },
            ],
            promise: '후회 안 하실 거예요 💞',
        },
        login: {
            intro: '역시 오셨네요',
            introSub: '기다리고 있었습니다.',
            usp: [
                { icon: '✨', text: '매주 무료 리딩 3회' },
                { icon: '💾', text: '내 리딩 기록 자동 저장' },
                { icon: '👁️', text: '점AI는 당신을 기억해요' },
            ],
            promise: '어디 한번 볼까요? 🌙',
        }
    };
    const copy = copyOptions[trigger] || copyOptions.action;

    if (!isOpen) return null;

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('올바른 이메일 주소를 입력해주세요');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await sendMagicLink(email);
            setStep('sent');
        } catch (err) {
            console.error('Magic link error:', err);
            if (err.code === 'auth/invalid-email') {
                setError('올바른 이메일 주소를 입력해주세요');
            } else {
                setError('이메일 전송에 실패했습니다. 다시 시도해주세요');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await onGoogleLogin();
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Google login error:', err);
            setError('로그인에 실패했습니다. 다시 시도해주세요');
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setStep('choice');
        setEmail('');
        setError('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    return (
        <div className="modal-overlay auth-modal-overlay" onClick={handleClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <button className="auth-close-btn" onClick={handleClose} aria-label="닫기">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>

                {/* 선택 화면 */}
                {step === 'choice' && (
                    <>
                        <div className="auth-header">
                            <span className="auth-emoji">🔮</span>
                            <h2>{copy.intro}</h2>
                            <p className="auth-intro-sub">{copy.introSub}</p>
                        </div>

                        <div className="auth-usp">
                            {copy.usp.map((item, i) => (
                                <div key={i} className="usp-item">
                                    <span className="usp-icon">{item.icon}</span>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="auth-actions">
                            <button
                                className="auth-btn-primary"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Google로 시작하기</span>
                            </button>

                            <button
                                className="auth-btn-secondary"
                                onClick={() => setStep('email')}
                                disabled={loading}
                            >
                                <span>✉️</span>
                                <span>이메일로 시작하기</span>
                            </button>
                        </div>

                        {error && <p className="auth-error">{error}</p>}

                        <p className="auth-promise">{copy.promise}</p>

                        <p className="auth-terms">
                            계속 진행하면 <a href="/terms" target="_blank">이용약관</a> 및{' '}
                            <a href="/privacy" target="_blank">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
                        </p>
                    </>
                )}

                {/* 이메일 입력 화면 */}
                {step === 'email' && (
                    <>
                        <button className="auth-back-btn" onClick={() => setStep('choice')}>
                            ← 뒤로
                        </button>

                        <div className="auth-header">
                            <span className="auth-emoji">✉️</span>
                            <h2>이메일로 시작하기</h2>
                            <p className="auth-subtitle">비밀번호 없이 이메일 링크로 시작해요</p>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">이메일 주소</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            {error && <p className="auth-error">{error}</p>}

                            <button
                                type="submit"
                                className="auth-btn-primary full"
                                disabled={loading || !email.trim()}
                            >
                                {loading ? (
                                    <span className="auth-spinner"></span>
                                ) : (
                                    '로그인 링크 보내기'
                                )}
                            </button>
                        </form>

                        <div className="auth-tip">
                            <span>💡</span>
                            <p>입력한 이메일로 링크가 전송돼요. 클릭하면 바로 시작!</p>
                        </div>
                    </>
                )}

                {/* 이메일 전송 완료 화면 */}
                {step === 'sent' && (
                    <>
                        <div className="auth-header">
                            <span className="auth-emoji sent">📬</span>
                            <h2>이메일을 확인하세요!</h2>
                            <p className="auth-email-sent">{email}</p>
                        </div>

                        <div className="auth-steps">
                            <div className="step-item">
                                <span className="step-num">1</span>
                                <span>이메일 받은편지함을 확인하세요</span>
                            </div>
                            <div className="step-item">
                                <span className="step-num">2</span>
                                <span>점AI에서 보낸 메일을 열어주세요</span>
                            </div>
                            <div className="step-item">
                                <span className="step-num">3</span>
                                <span>로그인 링크를 클릭하면 완료!</span>
                            </div>
                        </div>

                        <div className="auth-sent-tips">
                            <p>📌 메일이 안 보이면 스팸함을 확인해주세요</p>
                            <p>📌 링크는 24시간 동안 유효합니다</p>
                        </div>

                        <button
                            className="auth-btn-secondary"
                            onClick={() => setStep('email')}
                        >
                            다른 이메일로 다시 시도
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
