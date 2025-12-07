/**
 * 알림/리마인더 시스템 훅
 *
 * 기능:
 * - 브라우저 알림 권한 관리
 * - 로컬 리마인더 스케줄링 (아침 사주 알림 등)
 * - 알림 설정 localStorage 저장
 */

import { useState, useEffect, useCallback } from 'react';

// localStorage 키
const NOTIFICATION_SETTINGS_KEY = 'jeom_notification_settings';
const NOTIFICATION_HISTORY_KEY = 'jeom_notification_history';

// 기본 알림 설정
const DEFAULT_SETTINGS = {
    enabled: false,
    morningReminder: true,  // 아침 사주 알림
    morningTime: '08:00',   // 아침 알림 시간
    eveningReminder: false, // 저녁 꿈 해몽 알림
    eveningTime: '22:00',   // 저녁 알림 시간
    newFeatures: true,      // 새 기능/이벤트 알림
};

// 알림 메시지 템플릿
const NOTIFICATION_TEMPLATES = {
    morning: [
        { title: '☀️ 오늘의 사주', body: '오늘 하루는 어떤 기운이 감싸고 있을까요? 사주로 확인해보세요!' },
        { title: '🌅 좋은 아침이에요!', body: '타로 카드가 오늘의 메시지를 전해드릴게요.' },
        { title: '✨ 새로운 하루', body: '오늘의 사주를 확인하고 하루를 시작해보세요!' },
    ],
    evening: [
        { title: '🌙 간밤의 꿈', body: '특별한 꿈을 꾸셨나요? AI가 해석해드릴게요.' },
        { title: '💫 꿈 해몽', body: '오늘 밤 꾼 꿈의 의미가 궁금하시다면?' },
        { title: '🌟 꿈 일기', body: '꿈을 기록하고 숨은 의미를 찾아보세요.' },
    ],
    welcome: [
        { title: '🎉 점AI에 오신 것을 환영해요!', body: '무료 리딩 3회가 지급되었어요. 지금 바로 시작해보세요!' },
    ],
};

/**
 * 알림 시스템 커스텀 훅
 */
export const useNotifications = () => {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    const [permission, setPermission] = useState('default');
    const [isSupported, setIsSupported] = useState(false);
    const [scheduledTimers, setScheduledTimers] = useState({});

    // 브라우저 지원 확인
    useEffect(() => {
        const supported = 'Notification' in window && 'serviceWorker' in navigator;
        setIsSupported(supported);
        if (supported) {
            setPermission(Notification.permission);
        }
    }, []);

    // 설정 저장
    useEffect(() => {
        try {
            localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('알림 설정 저장 실패:', e);
        }
    }, [settings]);

    // 리마인더 스케줄링
    useEffect(() => {
        if (!settings.enabled || permission !== 'granted') return;

        // 기존 타이머 정리
        Object.values(scheduledTimers).forEach(timer => clearTimeout(timer));

        const newTimers = {};

        if (settings.morningReminder) {
            const timer = scheduleDaily(settings.morningTime, () => {
                showRandomNotification('morning');
            });
            if (timer) newTimers.morning = timer;
        }

        if (settings.eveningReminder) {
            const timer = scheduleDaily(settings.eveningTime, () => {
                showRandomNotification('evening');
            });
            if (timer) newTimers.evening = timer;
        }

        setScheduledTimers(newTimers);

        return () => {
            Object.values(newTimers).forEach(timer => clearTimeout(timer));
        };
    }, [settings.enabled, settings.morningReminder, settings.eveningReminder,
        settings.morningTime, settings.eveningTime, permission]);

    /**
     * 매일 특정 시간에 실행되는 타이머 설정
     */
    const scheduleDaily = (timeStr, callback) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const now = new Date();
        const scheduled = new Date();
        scheduled.setHours(hours, minutes, 0, 0);

        // 이미 지났으면 내일로
        if (scheduled <= now) {
            scheduled.setDate(scheduled.getDate() + 1);
        }

        const delay = scheduled - now;

        // 24시간 이상은 무시 (페이지 새로고침으로 재설정됨)
        if (delay > 24 * 60 * 60 * 1000) return null;

        console.log(`📅 알림 예약: ${scheduled.toLocaleString()}`);

        return setTimeout(() => {
            callback();
            // 다음 날 재예약
            scheduleDaily(timeStr, callback);
        }, delay);
    };

    /**
     * 랜덤 알림 표시
     */
    const showRandomNotification = useCallback((type) => {
        const templates = NOTIFICATION_TEMPLATES[type];
        if (!templates || templates.length === 0) return;

        const template = templates[Math.floor(Math.random() * templates.length)];
        showNotification(template.title, {
            body: template.body,
            tag: `jeom-${type}`,
            data: { type, url: '/' }
        });
    }, []);

    /**
     * 알림 권한 요청
     */
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            console.warn('이 브라우저는 알림을 지원하지 않습니다.');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // 권한 획득시 설정 활성화
                setSettings(prev => ({ ...prev, enabled: true }));

                // 환영 알림
                setTimeout(() => {
                    showNotification('🔔 알림이 설정되었어요!', {
                        body: '아침마다 오늘의 사주를 알려드릴게요.',
                        tag: 'jeom-welcome'
                    });
                }, 1000);

                return true;
            }
            return false;
        } catch (e) {
            console.error('알림 권한 요청 실패:', e);
            return false;
        }
    }, [isSupported]);

    /**
     * 알림 표시
     */
    const showNotification = useCallback((title, options = {}) => {
        if (permission !== 'granted') {
            console.warn('알림 권한이 없습니다.');
            return null;
        }

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            requireInteraction: false,
            silent: false,
        };

        try {
            const notification = new Notification(title, { ...defaultOptions, ...options });

            notification.onclick = () => {
                window.focus();
                if (options.data?.url) {
                    window.location.href = options.data.url;
                }
                notification.close();
            };

            // 히스토리 저장
            saveToHistory({ title, ...options, timestamp: Date.now() });

            return notification;
        } catch (e) {
            console.error('알림 표시 실패:', e);
            return null;
        }
    }, [permission]);

    /**
     * 알림 히스토리 저장
     */
    const saveToHistory = (entry) => {
        try {
            const history = JSON.parse(localStorage.getItem(NOTIFICATION_HISTORY_KEY) || '[]');
            history.unshift(entry);
            if (history.length > 50) history.pop();
            localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.warn('알림 히스토리 저장 실패:', e);
        }
    };

    /**
     * 설정 업데이트
     */
    const updateSettings = useCallback((updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    }, []);

    /**
     * 알림 끄기
     */
    const disableNotifications = useCallback(() => {
        setSettings(prev => ({ ...prev, enabled: false }));
    }, []);

    /**
     * 테스트 알림 보내기
     */
    const sendTestNotification = useCallback(() => {
        showNotification('🔔 테스트 알림', {
            body: '알림이 정상적으로 작동하고 있어요!',
            tag: 'jeom-test'
        });
    }, [showNotification]);

    /**
     * 다음 알림 시간 계산
     */
    const getNextNotificationTime = useCallback(() => {
        if (!settings.enabled) return null;

        const now = new Date();
        const times = [];

        if (settings.morningReminder) {
            const [h, m] = settings.morningTime.split(':').map(Number);
            const morning = new Date();
            morning.setHours(h, m, 0, 0);
            if (morning <= now) morning.setDate(morning.getDate() + 1);
            times.push({ type: 'morning', time: morning });
        }

        if (settings.eveningReminder) {
            const [h, m] = settings.eveningTime.split(':').map(Number);
            const evening = new Date();
            evening.setHours(h, m, 0, 0);
            if (evening <= now) evening.setDate(evening.getDate() + 1);
            times.push({ type: 'evening', time: evening });
        }

        if (times.length === 0) return null;

        times.sort((a, b) => a.time - b.time);
        return times[0];
    }, [settings]);

    return {
        // 상태
        settings,
        permission,
        isSupported,
        isEnabled: settings.enabled && permission === 'granted',

        // 액션
        requestPermission,
        updateSettings,
        disableNotifications,
        showNotification,
        sendTestNotification,

        // 유틸
        getNextNotificationTime,
    };
};

export default useNotifications;
