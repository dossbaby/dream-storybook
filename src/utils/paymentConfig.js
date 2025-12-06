/**
 * Payment Configuration
 * 토스페이먼츠 / Stripe 결제 연동 설정
 */

// 결제 서비스 선택
export const PAYMENT_PROVIDER = 'toss'; // 'toss' | 'stripe'

// 가격 정보 (v4 - 3티어 시스템)
export const PRICING = {
    // 프리미엄 (Sonnet 4.5 + 기능 해금)
    premium: {
        monthly: {
            id: 'premium_monthly',
            name: '프리미엄 월간',
            price: 6900,
            currency: 'KRW',
            interval: 'month',
            trialDays: 7, // 첫 주 무료
            description: '숨겨진 메시지까지 모두 확인'
        },
        yearly: {
            id: 'premium_yearly',
            name: '프리미엄 연간',
            price: 55000,
            currency: 'KRW',
            interval: 'year',
            trialDays: 0,
            description: '연간 결제 (33% 절약)',
            monthlyEquivalent: 4583,
            savings: '33%'
        }
    },
    // 울트라 (Opus 4.5 + 소름돋는 통찰)
    ultra: {
        monthly: {
            id: 'ultra_monthly',
            name: '울트라 월간',
            price: 9900,
            currency: 'KRW',
            interval: 'month',
            trialDays: 7, // 첫 주 무료
            description: '소름돋는 통찰로 더 깊이 들여다보기'
        },
        yearly: {
            id: 'ultra_yearly',
            name: '울트라 연간',
            price: 79000,
            currency: 'KRW',
            interval: 'year',
            trialDays: 0,
            description: '연간 결제 (33% 절약)',
            monthlyEquivalent: 6583,
            savings: '33%'
        }
    },
    // 1회권
    oneTime: {
        premium: {
            id: 'premium_once',
            name: '프리미엄 1회',
            price: 1900,
            currency: 'KRW',
            interval: 'once',
            description: '이번 리딩만 전체 해금'
        },
        ultra: {
            id: 'ultra_once',
            name: '울트라 1회',
            price: 2900,
            currency: 'KRW',
            interval: 'once',
            description: '이번 리딩만 소름돋는 통찰'
        }
    }
};

// 토스페이먼츠 설정
export const TOSS_CONFIG = {
    clientKey: import.meta.env.VITE_TOSS_CLIENT_KEY || '',
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
    // 테스트 모드 (개발 환경)
    isTest: import.meta.env.MODE !== 'production'
};

// Stripe 설정 (대안)
export const STRIPE_CONFIG = {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    // 테스트 모드
    isTest: import.meta.env.MODE !== 'production'
};

/**
 * 구독 상태
 */
export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    PAST_DUE: 'past_due',
    TRIAL: 'trial',
    EXPIRED: 'expired'
};

/**
 * 결제 요청 생성 (토스페이먼츠)
 * @param {Object} params
 * @returns {Object} 결제 요청 객체
 */
export const createTossPaymentRequest = ({
    plan, // 'monthly' | 'yearly'
    userId,
    userEmail,
    userName
}) => {
    const pricing = PRICING[plan];
    const orderId = `${userId}_${pricing.id}_${Date.now()}`;

    return {
        amount: pricing.price,
        orderId,
        orderName: pricing.name,
        customerEmail: userEmail,
        customerName: userName,
        successUrl: `${TOSS_CONFIG.successUrl}?orderId=${orderId}&plan=${plan}`,
        failUrl: TOSS_CONFIG.failUrl
    };
};

/**
 * 구독 상태 확인
 * @param {Object} subscription - Firestore subscription 객체
 * @returns {boolean} 활성 상태 여부
 */
export const isSubscriptionActive = (subscription) => {
    if (!subscription) return false;

    const { status, expiresAt } = subscription;

    // 활성 상태
    if (status === SUBSCRIPTION_STATUS.ACTIVE) {
        // 만료일 확인
        if (expiresAt) {
            const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
            return expiry > new Date();
        }
        return true;
    }

    // 체험판
    if (status === SUBSCRIPTION_STATUS.TRIAL) {
        const trialEnd = subscription.trialEndsAt;
        if (trialEnd) {
            const end = trialEnd.toDate ? trialEnd.toDate() : new Date(trialEnd);
            return end > new Date();
        }
    }

    return false;
};

/**
 * 구독 만료일 계산
 * @param {string} plan - 'monthly' | 'yearly'
 * @param {Date} startDate - 시작일
 * @returns {Date} 만료일
 */
export const calculateExpiryDate = (plan, startDate = new Date()) => {
    const date = new Date(startDate);

    if (plan === 'monthly') {
        date.setMonth(date.getMonth() + 1);
    } else if (plan === 'yearly') {
        date.setFullYear(date.getFullYear() + 1);
    }

    return date;
};

/**
 * 체험판 만료일 계산
 * @param {number} trialDays - 체험 일수
 * @returns {Date} 체험판 만료일
 */
export const calculateTrialEndDate = (trialDays = 30) => {
    const date = new Date();
    date.setDate(date.getDate() + trialDays);
    return date;
};

/**
 * 남은 구독 일수 계산
 * @param {Date} expiryDate
 * @returns {number} 남은 일수
 */
export const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;
    const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
    const now = new Date();
    const diff = expiry - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * 구독 정보 포맷
 * @param {Object} subscription
 * @returns {Object} 포맷된 구독 정보
 */
export const formatSubscription = (subscription) => {
    if (!subscription) {
        return {
            isActive: false,
            tier: 'free',
            label: '무료',
            expiresIn: null
        };
    }

    const isActive = isSubscriptionActive(subscription);
    const remainingDays = subscription.expiresAt
        ? getRemainingDays(subscription.expiresAt)
        : null;

    return {
        isActive,
        tier: isActive ? 'premium' : 'free',
        label: isActive ? '프리미엄' : '무료',
        plan: subscription.plan,
        expiresAt: subscription.expiresAt,
        expiresIn: remainingDays !== null ? `${remainingDays}일 남음` : null,
        isTrial: subscription.status === SUBSCRIPTION_STATUS.TRIAL,
        autoRenew: subscription.autoRenew !== false
    };
};

export default {
    PAYMENT_PROVIDER,
    PRICING,
    TOSS_CONFIG,
    STRIPE_CONFIG,
    SUBSCRIPTION_STATUS,
    createTossPaymentRequest,
    isSubscriptionActive,
    calculateExpiryDate,
    calculateTrialEndDate,
    getRemainingDays,
    formatSubscription
};
