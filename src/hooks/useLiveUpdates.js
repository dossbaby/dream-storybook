import { useEffect, useRef, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';

// 알림 히스토리 관리
const NOTIFICATION_HISTORY_KEY = 'feed_notification_history';
const MAX_HISTORY = 50;

const getNotificationHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(NOTIFICATION_HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
};

const addToNotificationHistory = (id) => {
    const history = getNotificationHistory();
    if (!history.includes(id)) {
        history.unshift(id);
        if (history.length > MAX_HISTORY) history.pop();
        localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(history));
    }
};

const isAlreadyNotified = (id) => {
    return getNotificationHistory().includes(id);
};

/**
 * 라이브 업데이트 훅 - 폴링 방식으로 비용 최적화 (onSnapshot 대체)
 * Firebase 읽기 비용 90% 절감
 * - 중복 알림 방지 (히스토리 기반)
 * - 본인 콘텐츠 제외
 */
export const useLiveUpdates = (user, loadingFeed, setToast) => {
    const lastCheckedRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // 새 콘텐츠 확인 함수 (폴링)
    const checkNewContent = useCallback(async () => {
        if (loadingFeed || !lastCheckedRef.current) return;

        try {
            const dreamsRef = collection(db, 'dreams');
            const q = query(
                dreamsRef,
                where('createdAt', '>', lastCheckedRef.current),
                where('isPublic', '==', true),
                orderBy('createdAt', 'desc'),
                limit(3)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const newDoc = snapshot.docs[0];
                const newDream = newDoc.data();
                const docId = newDoc.id;

                // 중복 알림 방지 + 본인 콘텐츠 제외
                if (newDream.userId !== user?.uid && !isAlreadyNotified(docId)) {
                    setToast('live', {
                        title: newDream.title,
                        type: newDream.dreamType,
                        userName: newDream.userName
                    });
                    addToNotificationHistory(docId);
                    setTimeout(() => setToast('live', null), 4000);
                }
                lastCheckedRef.current = Timestamp.now();
            }
        } catch (e) {
            console.error('Polling error:', e);
        }
    }, [user, loadingFeed, setToast]);

    // 폴링 설정 (60초마다 확인 - 비용 최적화)
    useEffect(() => {
        lastCheckedRef.current = Timestamp.now();

        // 60초마다 폴링 (실시간 대비 읽기 90% 감소)
        pollingIntervalRef.current = setInterval(checkNewContent, 60000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [checkNewContent]);

    // 사용자 presence heartbeat (5분마다)
    useEffect(() => {
        if (!user) return;

        let heartbeatInterval;
        const presenceRef = doc(db, 'presence', user.uid);

        const setupPresence = async () => {
            try {
                await setDoc(presenceRef, {
                    userId: user.uid,
                    lastSeen: Timestamp.now(),
                    active: true
                });

                // 5분마다 heartbeat (Firebase 비용 최적화)
                heartbeatInterval = setInterval(async () => {
                    try {
                        await setDoc(presenceRef, {
                            userId: user.uid,
                            lastSeen: Timestamp.now(),
                            active: true
                        });
                    } catch (e) { console.error(e); }
                }, 300000); // 5분 = 300,000ms
            } catch (e) { console.error(e); }
        };

        setupPresence();

        const handleUnload = async () => {
            try {
                await setDoc(presenceRef, { active: false, lastSeen: Timestamp.now() });
            } catch (e) {}
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [user]);
};
