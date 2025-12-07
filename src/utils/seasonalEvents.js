/**
 * 시즌 이벤트 시스템
 *
 * 기능:
 * - 시즌별 테마/이벤트 관리
 * - 이벤트 기간 자동 감지
 * - 특별 보너스/프로모션
 * - 테마 스타일링 지원
 */

// 시즌 이벤트 정의
export const SEASONAL_EVENTS = {
    // 설날 (음력 1월 1일, 대략 1월 말 ~ 2월 초)
    lunarNewYear: {
        id: 'lunar-new-year',
        name: '설날 특별 이벤트',
        emoji: '🐉',
        theme: 'lunar',
        description: '새해 복 많이 받으세요! 특별 운세를 확인해보세요.',
        bonus: {
            type: 'extra_reading',
            amount: 2,
            message: '새해 기념 무료 리딩 +2회!'
        },
        getDates: (year) => {
            // 음력 설날은 매년 다름 - 대략적인 기간 설정
            const lunarDates = {
                2024: { start: '2024-02-09', end: '2024-02-12' },
                2025: { start: '2025-01-28', end: '2025-01-31' },
                2026: { start: '2026-02-16', end: '2026-02-19' },
            };
            return lunarDates[year] || null;
        },
        specialFeatures: ['zodiac_fortune', 'family_fortune'],
        colors: {
            primary: '#d32f2f',
            secondary: '#ffd700',
            background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
        }
    },

    // 발렌타인데이
    valentine: {
        id: 'valentine',
        name: '발렌타인 이벤트',
        emoji: '💕',
        theme: 'valentine',
        description: '사랑의 타로로 연애운을 확인해보세요!',
        bonus: {
            type: 'special_spread',
            spreadType: 'love',
            message: '연애 특별 스프레드 무료!'
        },
        getDates: () => ({
            start: `${new Date().getFullYear()}-02-12`,
            end: `${new Date().getFullYear()}-02-15`
        }),
        specialFeatures: ['love_tarot', 'compatibility'],
        colors: {
            primary: '#e91e63',
            secondary: '#ff4081',
            background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)'
        }
    },

    // 화이트데이
    whiteDay: {
        id: 'white-day',
        name: '화이트데이 이벤트',
        emoji: '🤍',
        theme: 'white',
        description: '달콤한 화이트데이! 인연을 점쳐보세요.',
        bonus: {
            type: 'extra_reading',
            amount: 1,
            message: '화이트데이 기념 무료 리딩 +1회!'
        },
        getDates: () => ({
            start: `${new Date().getFullYear()}-03-13`,
            end: `${new Date().getFullYear()}-03-15`
        }),
        specialFeatures: ['love_tarot'],
        colors: {
            primary: '#ffffff',
            secondary: '#e0e0e0',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
        }
    },

    // 크리스마스
    christmas: {
        id: 'christmas',
        name: '크리스마스 이벤트',
        emoji: '🎄',
        theme: 'christmas',
        description: '메리 크리스마스! 특별한 선물을 받아가세요.',
        bonus: {
            type: 'extra_reading',
            amount: 3,
            message: '크리스마스 선물! 무료 리딩 +3회!'
        },
        getDates: () => ({
            start: `${new Date().getFullYear()}-12-23`,
            end: `${new Date().getFullYear()}-12-26`
        }),
        specialFeatures: ['year_forecast'],
        colors: {
            primary: '#2e7d32',
            secondary: '#d32f2f',
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
        }
    },

    // 연말
    newYear: {
        id: 'new-year',
        name: '새해 맞이 이벤트',
        emoji: '🎆',
        theme: 'newyear',
        description: '새해를 맞이하여 신년 운세를 확인해보세요!',
        bonus: {
            type: 'special_feature',
            feature: 'year_forecast',
            message: '신년 운세 특별 무료!'
        },
        getDates: () => ({
            start: `${new Date().getFullYear()}-12-30`,
            end: `${new Date().getFullYear() + 1}-01-03`
        }),
        specialFeatures: ['year_forecast', 'monthly_forecast'],
        colors: {
            primary: '#7b1fa2',
            secondary: '#ffd700',
            background: 'linear-gradient(135deg, #7b1fa2 0%, #4a0072 100%)'
        }
    },

    // 추석 (음력 8월 15일)
    chuseok: {
        id: 'chuseok',
        name: '추석 특별 이벤트',
        emoji: '🌕',
        theme: 'chuseok',
        description: '풍요로운 한가위 되세요!',
        bonus: {
            type: 'extra_reading',
            amount: 2,
            message: '추석 기념 무료 리딩 +2회!'
        },
        getDates: (year) => {
            const chuseokDates = {
                2024: { start: '2024-09-16', end: '2024-09-18' },
                2025: { start: '2025-10-05', end: '2025-10-07' },
                2026: { start: '2026-09-24', end: '2026-09-26' },
            };
            return chuseokDates[year] || null;
        },
        specialFeatures: ['family_fortune'],
        colors: {
            primary: '#ff9800',
            secondary: '#ffd54f',
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
        }
    },

    // 할로윈
    halloween: {
        id: 'halloween',
        name: '할로윈 이벤트',
        emoji: '🎃',
        theme: 'halloween',
        description: '으스스한 할로윈! 미스터리 타로를 즐겨보세요.',
        bonus: {
            type: 'special_spread',
            spreadType: 'mystery',
            message: '할로윈 미스터리 스프레드 오픈!'
        },
        getDates: () => ({
            start: `${new Date().getFullYear()}-10-29`,
            end: `${new Date().getFullYear()}-11-01`
        }),
        specialFeatures: ['mystery_tarot'],
        colors: {
            primary: '#ff6f00',
            secondary: '#4a148c',
            background: 'linear-gradient(135deg, #ff6f00 0%, #e65100 100%)'
        }
    }
};

/**
 * 현재 진행 중인 이벤트 찾기
 * @returns {Object|null} 현재 이벤트 또는 null
 */
export const getCurrentEvent = () => {
    const now = new Date();
    const year = now.getFullYear();
    const today = now.toISOString().split('T')[0];

    for (const [key, event] of Object.entries(SEASONAL_EVENTS)) {
        const dates = typeof event.getDates === 'function'
            ? event.getDates(year)
            : event.getDates;

        if (dates && today >= dates.start && today <= dates.end) {
            return { ...event, key, dates };
        }
    }

    return null;
};

/**
 * 다가오는 이벤트 목록 가져오기
 * @param {number} limit - 반환할 이벤트 수
 * @returns {Array} 다가오는 이벤트 배열
 */
export const getUpcomingEvents = (limit = 3) => {
    const now = new Date();
    const year = now.getFullYear();
    const today = now.toISOString().split('T')[0];

    const upcoming = [];

    for (const [key, event] of Object.entries(SEASONAL_EVENTS)) {
        const dates = typeof event.getDates === 'function'
            ? event.getDates(year)
            : event.getDates;

        if (dates && dates.start > today) {
            const daysUntil = Math.ceil(
                (new Date(dates.start) - now) / (1000 * 60 * 60 * 24)
            );
            upcoming.push({ ...event, key, dates, daysUntil });
        }
    }

    return upcoming
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, limit);
};

/**
 * 이벤트 보너스 적용 가능 여부 확인
 * @param {string} userId - 사용자 ID
 * @param {string} eventId - 이벤트 ID
 * @returns {boolean}
 */
export const canClaimEventBonus = (userId, eventId) => {
    const claimedKey = `event_claimed_${eventId}_${userId}`;
    return !localStorage.getItem(claimedKey);
};

/**
 * 이벤트 보너스 클레임 기록
 * @param {string} userId - 사용자 ID
 * @param {string} eventId - 이벤트 ID
 */
export const markEventBonusClaimed = (userId, eventId) => {
    const claimedKey = `event_claimed_${eventId}_${userId}`;
    localStorage.setItem(claimedKey, new Date().toISOString());
};

/**
 * 이벤트 테마 CSS 변수 생성
 * @param {Object} event - 이벤트 객체
 * @returns {Object} CSS 변수 객체
 */
export const getEventThemeStyles = (event) => {
    if (!event?.colors) return {};

    return {
        '--event-primary': event.colors.primary,
        '--event-secondary': event.colors.secondary,
        '--event-background': event.colors.background,
    };
};

/**
 * 시즌 인사말 생성
 * @returns {string} 시즌에 맞는 인사말
 */
export const getSeasonalGreeting = () => {
    const event = getCurrentEvent();
    if (event) {
        return `${event.emoji} ${event.name}`;
    }

    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '🌸 따뜻한 봄날이에요';
    if (month >= 6 && month <= 8) return '☀️ 시원한 여름이에요';
    if (month >= 9 && month <= 11) return '🍂 선선한 가을이에요';
    return '❄️ 포근한 겨울이에요';
};

/**
 * 특별 기능 활성화 여부 확인
 * @param {string} featureId - 기능 ID
 * @returns {boolean}
 */
export const isSpecialFeatureActive = (featureId) => {
    const event = getCurrentEvent();
    if (!event?.specialFeatures) return false;
    return event.specialFeatures.includes(featureId);
};

export default {
    SEASONAL_EVENTS,
    getCurrentEvent,
    getUpcomingEvents,
    canClaimEventBonus,
    markEventBonusClaimed,
    getEventThemeStyles,
    getSeasonalGreeting,
    isSpecialFeatureActive,
};
