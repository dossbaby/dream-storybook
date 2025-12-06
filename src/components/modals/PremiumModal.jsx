import { useState } from 'react';
import { TIER_COMPARISON } from '../../utils/aiConfig';
import { PRICING } from '../../utils/paymentConfig';

/**
 * 구독 모달 (3티어 시스템)
 * 무료 → 프리미엄 → 울트라
 * 감성적 문구로 사용자 친화적
 */
const PremiumModal = ({
    isOpen,
    onClose,
    onSubscribe,
    currentTier = 'free', // 'free', 'premium', 'ultra'
    trigger = 'general' // 'usage_limit', 'hidden_insight', 'detailed_analysis', 'ultra_insight', 'general'
}) => {
    const [selectedPlan, setSelectedPlan] = useState('premium'); // 'premium' or 'ultra'
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

    if (!isOpen) return null;

    const triggerMessages = {
        usage_limit: {
            title: '이번 주 무료 횟수를 다 썼어요',
            subtitle: '구독하고 마음껏 확인해보세요',
            emoji: '⏰'
        },
        hidden_insight: {
            title: '숨겨진 메시지가 있어요',
            subtitle: '당신만 모르고 있던 이야기예요',
            emoji: '🔮'
        },
        detailed_analysis: {
            title: '더 깊은 해석이 있어요',
            subtitle: '표면 아래 숨은 의미를 확인해보세요',
            emoji: '📖'
        },
        ultra_insight: {
            title: '소름돋는 통찰이 기다려요',
            subtitle: '지금까지 본 적 없는 깊이로 들여다봐요',
            emoji: '✨'
        },
        general: {
            title: '더 깊이 들여다볼까요?',
            subtitle: '당신의 이야기가 더 많이 있어요',
            emoji: '🌙'
        }
    };

    const message = triggerMessages[trigger] || triggerMessages.general;

    // 감성적 문구로 구성된 기능 비교
    const features = [
        {
            name: '해석의 깊이',
            free: '기본 해석',
            premium: '숨겨진 의미까지',
            ultra: '소름돋는 통찰',
            icon: '🔮'
        },
        {
            name: '숨겨진 메시지',
            free: '블러 처리',
            premium: '전체 공개',
            ultra: '전체 공개 + α',
            icon: '👁️'
        },
        {
            name: '심층 분석',
            free: '잠김',
            premium: '열림',
            ultra: '더 깊이',
            icon: '📖'
        },
        {
            name: '사용 횟수',
            free: '주 3회',
            premium: '무제한',
            ultra: '무제한',
            icon: '♾️'
        },
        {
            name: '특별 통찰',
            free: '-',
            premium: '-',
            ultra: '당신만 몰랐던 것',
            icon: '✨',
            ultraOnly: true
        }
    ];

    const handleSubscribe = (tier, cycle) => {
        onSubscribe?.({ tier, cycle });
    };

    // 현재 프리미엄 사용자가 울트라 업그레이드 보기
    if (currentTier === 'premium') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="premium-modal ultra-upgrade" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>×</button>

                    <div className="premium-header">
                        <span className="premium-emoji">✨</span>
                        <h2>더 깊이 들여다볼까요?</h2>
                        <p>울트라로 소름돋는 통찰을 경험하세요</p>
                    </div>

                    <div className="ultra-benefits">
                        <div className="benefit-card">
                            <span className="benefit-icon">🔮</span>
                            <h3>소름돋는 통찰</h3>
                            <p>당신만 몰랐던 이야기를 들려드려요</p>
                        </div>
                        <div className="benefit-card">
                            <span className="benefit-icon">🧠</span>
                            <h3>더 깊은 해석</h3>
                            <p>표면 아래 숨은 의미까지</p>
                        </div>
                        <div className="benefit-card">
                            <span className="benefit-icon">✨</span>
                            <h3>특별한 경험</h3>
                            <p>매번 새로운 발견이 있어요</p>
                        </div>
                    </div>

                    <div className="upgrade-pricing">
                        <div className="price-option" onClick={() => setBillingCycle('monthly')}>
                            <input
                                type="radio"
                                checked={billingCycle === 'monthly'}
                                onChange={() => {}}
                            />
                            <div className="price-info">
                                <span className="price-label">월간</span>
                                <span className="price-amount">₩{PRICING.ultra.monthly.price.toLocaleString()}/월</span>
                            </div>
                        </div>
                        <div className="price-option best" onClick={() => setBillingCycle('yearly')}>
                            <input
                                type="radio"
                                checked={billingCycle === 'yearly'}
                                onChange={() => {}}
                            />
                            <div className="price-info">
                                <span className="price-label">연간 <span className="savings-badge">33% 절약</span></span>
                                <span className="price-amount">₩{PRICING.ultra.yearly.price.toLocaleString()}/년</span>
                                <span className="price-note">월 ₩{PRICING.ultra.yearly.monthlyEquivalent.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="subscribe-btn ultra"
                        onClick={() => handleSubscribe('ultra', billingCycle)}
                    >
                        울트라로 업그레이드
                    </button>
                    <button className="later-btn" onClick={onClose}>
                        나중에
                    </button>
                </div>
            </div>
        );
    }

    // 울트라 사용자 - 현재 상태 표시
    if (currentTier === 'ultra') {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="premium-modal premium-active ultra" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>×</button>
                    <div className="premium-header">
                        <span className="premium-crown">✨</span>
                        <h2>울트라 회원</h2>
                        <p className="premium-status-text">최고의 경험을 누리고 있어요!</p>
                    </div>
                    <div className="premium-benefits-active">
                        <div className="benefit-item active ultra">
                            <span className="benefit-icon">🔮</span>
                            <span>소름돋는 통찰</span>
                        </div>
                        <div className="benefit-item active">
                            <span className="benefit-icon">♾️</span>
                            <span>무제한 사용</span>
                        </div>
                        <div className="benefit-item active">
                            <span className="benefit-icon">👁️</span>
                            <span>모든 메시지 해금</span>
                        </div>
                        <div className="benefit-item active">
                            <span className="benefit-icon">✨</span>
                            <span>특별한 통찰</span>
                        </div>
                    </div>
                    <button className="premium-close-btn" onClick={onClose}>
                        확인
                    </button>
                </div>
            </div>
        );
    }

    // 무료 사용자 - 3티어 비교
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="premium-modal three-tier" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                {/* 헤더 */}
                <div className="premium-header">
                    <span className="premium-emoji">{message.emoji}</span>
                    <h2>{message.title}</h2>
                    <p>{message.subtitle}</p>
                </div>

                {/* 플랜 선택 탭 */}
                <div className="plan-tabs">
                    <button
                        className={`plan-tab ${selectedPlan === 'premium' ? 'active' : ''}`}
                        onClick={() => setSelectedPlan('premium')}
                    >
                        프리미엄
                    </button>
                    <button
                        className={`plan-tab ultra ${selectedPlan === 'ultra' ? 'active' : ''}`}
                        onClick={() => setSelectedPlan('ultra')}
                    >
                        울트라 ✨
                    </button>
                </div>

                {/* 선택된 플랜 상세 */}
                {selectedPlan === 'premium' ? (
                    <div className="plan-details premium">
                        <div className="plan-headline">
                            <h3>숨겨진 메시지까지 전부</h3>
                            <p>블러 처리된 내용을 모두 확인하세요</p>
                        </div>

                        <div className="plan-features">
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>숨겨진 메시지 전체 공개</span>
                            </div>
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>심층 분석 해금</span>
                            </div>
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>무제한 사용</span>
                            </div>
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>맞춤 질문 자유 입력</span>
                            </div>
                        </div>

                        <div className="plan-pricing">
                            <div
                                className={`price-option ${billingCycle === 'monthly' ? 'selected' : ''}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                <span className="price-label">월간</span>
                                <span className="price-amount">₩{PRICING.premium.monthly.price.toLocaleString()}</span>
                            </div>
                            <div
                                className={`price-option best ${billingCycle === 'yearly' ? 'selected' : ''}`}
                                onClick={() => setBillingCycle('yearly')}
                            >
                                <span className="savings-badge">33% 할인</span>
                                <span className="price-label">연간</span>
                                <span className="price-amount">₩{PRICING.premium.yearly.price.toLocaleString()}</span>
                                <span className="price-note">월 ₩{PRICING.premium.yearly.monthlyEquivalent.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            className="subscribe-btn"
                            onClick={() => handleSubscribe('premium', billingCycle)}
                        >
                            프리미엄 시작하기
                        </button>

                        <button
                            className="onetime-btn"
                            onClick={() => handleSubscribe('premium', 'once')}
                        >
                            이번만 ₩{PRICING.oneTime.premium.price.toLocaleString()}
                        </button>
                    </div>
                ) : (
                    <div className="plan-details ultra">
                        <div className="plan-headline">
                            <h3>소름돋는 통찰</h3>
                            <p>당신만 몰랐던 이야기를 들려드려요</p>
                        </div>

                        <div className="plan-features">
                            <div className="feature-item">
                                <span className="check">✓</span>
                                <span>프리미엄의 모든 기능</span>
                            </div>
                            <div className="feature-item ultra-feature">
                                <span className="check">✨</span>
                                <span>소름돋는 깊이의 해석</span>
                            </div>
                            <div className="feature-item ultra-feature">
                                <span className="check">✨</span>
                                <span>당신만 몰랐던 통찰</span>
                            </div>
                            <div className="feature-item ultra-feature">
                                <span className="check">✨</span>
                                <span>더 섬세한 맞춤 분석</span>
                            </div>
                        </div>

                        <div className="plan-pricing">
                            <div
                                className={`price-option ${billingCycle === 'monthly' ? 'selected' : ''}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                <span className="price-label">월간</span>
                                <span className="price-amount">₩{PRICING.ultra.monthly.price.toLocaleString()}</span>
                            </div>
                            <div
                                className={`price-option best ${billingCycle === 'yearly' ? 'selected' : ''}`}
                                onClick={() => setBillingCycle('yearly')}
                            >
                                <span className="savings-badge">33% 할인</span>
                                <span className="price-label">연간</span>
                                <span className="price-amount">₩{PRICING.ultra.yearly.price.toLocaleString()}</span>
                                <span className="price-note">월 ₩{PRICING.ultra.yearly.monthlyEquivalent.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            className="subscribe-btn ultra"
                            onClick={() => handleSubscribe('ultra', billingCycle)}
                        >
                            울트라 시작하기
                        </button>

                        <button
                            className="onetime-btn"
                            onClick={() => handleSubscribe('ultra', 'once')}
                        >
                            이번만 ₩{PRICING.oneTime.ultra.price.toLocaleString()}
                        </button>
                    </div>
                )}

                {/* 나중에 버튼 */}
                <button className="later-btn" onClick={onClose}>
                    나중에
                </button>

                {/* 신뢰 배지 */}
                <div className="premium-trust">
                    <span className="trust-item">🔒 안전한 결제</span>
                    <span className="trust-item">↩️ 언제든 취소</span>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;
