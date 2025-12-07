import { useState, useEffect } from 'react';

const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        emoji: '🔮',
        title: '점AI에 오신 것을 환영해요!',
        description: 'AI가 풀어주는 타로, 꿈해몽, 사주팔자',
        subtext: '매일 새로운 인사이트를 발견하세요',
        buttonText: '시작할게요',
        visual: 'crystal'
    },
    {
        id: 'features',
        emoji: null,
        title: '무엇을 해볼까요?',
        description: '원하는 기능을 선택해보세요',
        buttonText: '다음',
        visual: 'features',
        features: [
            { id: 'tarot', emoji: '🃏', name: '타로', desc: '운명의 카드를 뽑아보세요' },
            { id: 'dream', emoji: '🌙', name: '꿈해몽', desc: '꿈의 의미를 해석해요' },
            { id: 'saju', emoji: '✨', name: '사주', desc: '오늘의 운세를 확인해요' }
        ]
    },
    {
        id: 'howto',
        emoji: '💡',
        title: '이렇게 사용해요',
        description: null,
        buttonText: '다음',
        visual: 'howto',
        steps: [
            { num: '1', text: '질문이나 꿈을 입력해요', icon: '✏️' },
            { num: '2', text: 'AI가 분석을 시작해요', icon: '🤖' },
            { num: '3', text: '상세한 해석을 받아요', icon: '📖' },
            { num: '4', text: '저장하고 공유해요', icon: '💾' }
        ]
    },
    {
        id: 'profile',
        emoji: '👤',
        title: '프로필을 설정하면',
        description: '더 정확한 맞춤 리딩을 받을 수 있어요',
        buttonText: '나중에 할게요',
        altButton: '프로필 설정하기',
        visual: 'profile',
        benefits: [
            { icon: '🎯', text: '이름으로 호칭해드려요' },
            { icon: '⭐', text: '별자리 기반 분석' },
            { icon: '🧠', text: 'MBTI 맞춤 조언' }
        ]
    },
    {
        id: 'gift',
        emoji: '🎁',
        title: '환영 선물!',
        description: '지금 바로 무료 리딩 3회를 사용해보세요',
        subtext: '매주 새로운 리딩이 충전돼요',
        buttonText: '첫 리딩 받으러 가기',
        highlight: true,
        visual: 'gift'
    }
];

const OnboardingModal = ({ isOpen, onClose, onComplete, onOpenProfile, onNavigate }) => {
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [touchStart, setTouchStart] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setIsAnimating(false);
            setSelectedFeature(null);
        }
    }, [isOpen]);

    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleSkip();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    const currentStep = ONBOARDING_STEPS[step];
    const isLastStep = step === ONBOARDING_STEPS.length - 1;

    const handleNext = () => {
        if (isAnimating) return;

        if (isLastStep) {
            // 선택한 기능으로 이동
            onComplete?.();
            if (selectedFeature && onNavigate) {
                onNavigate(selectedFeature);
            }
            onClose();
        } else {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(prev => prev + 1);
                setIsAnimating(false);
            }, 250);
        }
    };

    const handleAltAction = () => {
        if (currentStep.id === 'profile' && onOpenProfile) {
            onComplete?.();
            onClose();
            setTimeout(() => onOpenProfile(), 300);
        }
    };

    const handleSkip = () => {
        onComplete?.();
        onClose();
    };

    const handleFeatureSelect = (featureId) => {
        setSelectedFeature(featureId);
    };

    // 스와이프 제스처
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && step < ONBOARDING_STEPS.length - 1) {
                // 왼쪽 스와이프 - 다음
                handleNext();
            } else if (diff < 0 && step > 0) {
                // 오른쪽 스와이프 - 이전
                setIsAnimating(true);
                setTimeout(() => {
                    setStep(prev => prev - 1);
                    setIsAnimating(false);
                }, 250);
            }
        }
        setTouchStart(null);
    };

    // 비주얼 렌더링
    const renderVisual = () => {
        switch (currentStep.visual) {
            case 'crystal':
                return (
                    <div className="onboarding-visual crystal-visual">
                        <div className="crystal-orb-simple">
                            <span className="crystal-emoji">🔮</span>
                        </div>
                    </div>
                );

            case 'features':
                return (
                    <div className="onboarding-visual features-visual">
                        <div className="feature-cards">
                            {currentStep.features.map((f) => (
                                <button
                                    key={f.id}
                                    className={`feature-card ${selectedFeature === f.id ? 'selected' : ''}`}
                                    onClick={() => handleFeatureSelect(f.id)}
                                >
                                    <span className="feature-emoji">{f.emoji}</span>
                                    <span className="feature-name">{f.name}</span>
                                    <span className="feature-desc">{f.desc}</span>
                                    {selectedFeature === f.id && (
                                        <span className="feature-check">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'howto':
                return (
                    <div className="onboarding-visual howto-visual">
                        <div className="howto-steps">
                            {currentStep.steps.map((s, i) => (
                                <div key={i} className="howto-step">
                                    <div className="howto-icon">{s.icon}</div>
                                    <div className="howto-text">{s.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="onboarding-visual profile-visual">
                        <div className="profile-benefits">
                            {currentStep.benefits.map((b, i) => (
                                <div key={i} className="profile-benefit">
                                    <span className="benefit-icon">{b.icon}</span>
                                    <span className="benefit-text">{b.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'gift':
                return (
                    <div className="onboarding-visual gift-visual">
                        <div className="gift-box-simple">
                            <span className="gift-emoji">🎁</span>
                            <div className="gift-count">
                                <span className="count-num">3</span>
                                <span className="count-label">무료 리딩</span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return currentStep.emoji ? (
                    <div className="onboarding-visual emoji-visual">
                        <div className="onboarding-emoji">{currentStep.emoji}</div>
                    </div>
                ) : null;
        }
    };

    return (
        <div className="modal-overlay onboarding-overlay" onClick={handleSkip}>
            <div
                className={`modal-content onboarding-modal ${isAnimating ? 'animating' : ''} ${currentStep.highlight ? 'highlight' : ''}`}
                onClick={e => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* 스킵 버튼 */}
                {!isLastStep && (
                    <button className="onboarding-skip" onClick={handleSkip}>
                        건너뛰기
                    </button>
                )}

                {/* 프로그레스 인디케이터 */}
                <div className="onboarding-progress">
                    {ONBOARDING_STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`progress-dot ${idx === step ? 'active' : ''} ${idx < step ? 'completed' : ''}`}
                            onClick={() => {
                                if (idx < step) {
                                    setStep(idx);
                                }
                            }}
                        />
                    ))}
                </div>

                {/* 메인 콘텐츠 */}
                <div className={`onboarding-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
                    {/* 비주얼 */}
                    {renderVisual()}

                    {/* 텍스트 */}
                    <h2 className="onboarding-title">{currentStep.title}</h2>
                    {currentStep.description && (
                        <p className="onboarding-description">
                            {currentStep.description.split('\n').map((line, i) => (
                                <span key={i}>{line}<br/></span>
                            ))}
                        </p>
                    )}
                    {currentStep.subtext && (
                        <p className="onboarding-subtext">{currentStep.subtext}</p>
                    )}
                </div>

                {/* 액션 버튼들 */}
                <div className="onboarding-actions">
                    {currentStep.altButton && (
                        <button
                            className="onboarding-button alt-btn"
                            onClick={handleAltAction}
                        >
                            {currentStep.altButton}
                        </button>
                    )}
                    <button
                        className={`onboarding-button ${currentStep.highlight ? 'highlight-btn' : ''} ${currentStep.altButton ? 'secondary' : ''}`}
                        onClick={handleNext}
                    >
                        {currentStep.buttonText}
                    </button>
                </div>

                {/* 하단 힌트 */}
                {isLastStep && (
                    <p className="onboarding-hint">
                        로그인하면 히스토리도 저장돼요!
                    </p>
                )}

                {/* 스와이프 힌트 */}
                {!isLastStep && step === 0 && (
                    <p className="onboarding-swipe-hint">
                        ← 스와이프하여 넘기기 →
                    </p>
                )}
            </div>
        </div>
    );
};

export default OnboardingModal;
