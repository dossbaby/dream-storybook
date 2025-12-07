import { useState, useEffect, useRef, useCallback } from 'react';
import {
    collection, doc, query, getDocs, setDoc, deleteDoc, getDoc,
    orderBy, limit, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 시청자/좋아요 추적 훅 (폴링 기반 - Firebase 비용 최적화)
 * @param {Object} selectedDream - 선택된 꿈 객체
 * @param {Object} user - 현재 사용자
 * @param {string} userNickname - 사용자 닉네임
 * @param {Function} setSelectedDream - 선택된 꿈 setter
 */
export const usePresence = (selectedDream, user, userNickname, setSelectedDream) => {
    const [viewingCount, setViewingCount] = useState(0);
    const [recentViewers, setRecentViewers] = useState([]);
    const [similarDreamers, setSimilarDreamers] = useState(0);
    const [floatingHearts, setFloatingHearts] = useState([]);
    const viewerDocRef = useRef(null);
    const lastLikeCountRef = useRef(0);

    // viewers 폴링 함수
    const loadViewers = useCallback(async (dreamId) => {
        if (!dreamId) return;
        try {
            const viewersQuery = query(collection(db, 'dreams', dreamId, 'viewers'));
            const snapshot = await getDocs(viewersQuery);
            const now = Date.now();
            const activeViewers = snapshot.docs.filter(docSnap => {
                const data = docSnap.data();
                const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
                return (now - lastSeen.getTime()) < 360000; // 6분 이내
            });
            setViewingCount(activeViewers.length);
            setRecentViewers(activeViewers.map(d => d.data().userName).slice(0, 10));
        } catch (e) {
            console.error('Load viewers error:', e);
        }
    }, []);

    // 좋아요 폴링 함수
    const loadLikes = useCallback(async (dreamId) => {
        if (!dreamId) return;
        try {
            const dreamRef = doc(db, 'dreams', dreamId);
            const docSnap = await getDoc(dreamRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const newLikeCount = data.likeCount || 0;
                // 좋아요 증가 시 하트 애니메이션
                if (newLikeCount > lastLikeCountRef.current && lastLikeCountRef.current > 0) {
                    const newHeart = { id: Date.now(), x: Math.random() * 60 + 20 };
                    setFloatingHearts(prev => [...prev, newHeart]);
                    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id)), 2000);
                }
                lastLikeCountRef.current = newLikeCount;
                setSelectedDream(prev => prev ? { ...prev, likeCount: newLikeCount, likes: data.likes } : null);
            }
        } catch (e) {
            console.error('Load likes error:', e);
        }
    }, [setSelectedDream]);

    // 상세보기 시청자 추적 (폴링 기반)
    useEffect(() => {
        if (!selectedDream) {
            setViewingCount(0);
            setRecentViewers([]);
            setSimilarDreamers(0);
            lastLikeCountRef.current = 0;
            return;
        }

        // 초기 좋아요 수 설정
        lastLikeCountRef.current = selectedDream.likeCount || 0;

        // 현재 사용자를 viewers에 등록
        const registerViewer = async () => {
            if (!user) return;
            try {
                viewerDocRef.current = doc(db, 'dreams', selectedDream.id, 'viewers', user.uid);
                await setDoc(viewerDocRef.current, {
                    oderId: user.uid,
                    userName: userNickname || user.displayName || '익명',
                    lastSeen: Timestamp.now()
                });
            } catch (e) { console.error('Viewer register error:', e); }
        };

        // 초기 로드
        registerViewer();
        loadViewers(selectedDream.id);

        // 주기적 heartbeat (5분마다)
        const heartbeatInterval = setInterval(async () => {
            if (viewerDocRef.current && user) {
                try {
                    await setDoc(viewerDocRef.current, {
                        oderId: user.uid,
                        userName: userNickname || user.displayName || '익명',
                        lastSeen: Timestamp.now()
                    });
                } catch (e) { console.error('Heartbeat error:', e); }
            }
        }, 300000); // 5분

        // viewers 폴링 (60초마다)
        const viewersPolling = setInterval(() => {
            loadViewers(selectedDream.id);
        }, 60000);

        // 좋아요 폴링 (30초마다)
        const likesPolling = setInterval(() => {
            loadLikes(selectedDream.id);
        }, 30000);

        // 비슷한 유형 꿈꾸는 사람 수 (한번만 로드)
        const loadSimilarDreamers = async () => {
            try {
                const q = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(100));
                const snapshot = await getDocs(q);
                const similarCount = snapshot.docs.map(d => d.data()).filter(d => d.isPublic && d.dreamType === selectedDream.dreamType).length;
                setSimilarDreamers(similarCount);
            } catch (e) {
                setSimilarDreamers(0);
            }
        };
        loadSimilarDreamers();

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(viewersPolling);
            clearInterval(likesPolling);
            // 퇴장 시 viewer 문서 삭제
            if (viewerDocRef.current) {
                deleteDoc(viewerDocRef.current).catch(() => {});
            }
        };
    }, [selectedDream?.id, user, userNickname, loadViewers, loadLikes]);

    return {
        viewingCount,
        recentViewers,
        similarDreamers,
        floatingHearts
    };
};
