import { useState, useEffect } from 'react';
import {
    collection, doc, query, getDocs, setDoc, deleteDoc,
    orderBy, limit, onSnapshot, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 실시간 시청자/좋아요 추적 훅
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

    // 상세보기 실시간 시청자 추적
    useEffect(() => {
        if (!selectedDream) {
            setViewingCount(0);
            setRecentViewers([]);
            setSimilarDreamers(0);
            return;
        }

        let viewerDocRef = null;
        let unsubscribeViewers = null;

        // 현재 사용자를 viewers에 등록
        const registerViewer = async () => {
            if (!user) return;
            try {
                viewerDocRef = doc(db, 'dreams', selectedDream.id, 'viewers', user.uid);
                await setDoc(viewerDocRef, {
                    oderId: user.uid,
                    userName: userNickname || user.displayName || '익명',
                    lastSeen: Timestamp.now()
                });
            } catch (e) { console.error('Viewer register error:', e); }
        };

        // 주기적 heartbeat (30초마다)
        const heartbeatInterval = setInterval(async () => {
            if (viewerDocRef && user) {
                try {
                    await setDoc(viewerDocRef, {
                        oderId: user.uid,
                        userName: userNickname || user.displayName || '익명',
                        lastSeen: Timestamp.now()
                    });
                } catch (e) { console.error('Heartbeat error:', e); }
            }
        }, 30000);

        // 실시간 viewers 구독
        const viewersQuery = query(collection(db, 'dreams', selectedDream.id, 'viewers'));
        unsubscribeViewers = onSnapshot(viewersQuery, (snapshot) => {
            const now = Date.now();
            const activeViewers = snapshot.docs.filter(docSnap => {
                const data = docSnap.data();
                const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
                return (now - lastSeen.getTime()) < 60000; // 60초 이내 활성 사용자
            });
            setViewingCount(activeViewers.length);
            setRecentViewers(activeViewers.map(d => d.data().userName).slice(0, 10));
        });

        registerViewer();

        // 비슷한 유형 꿈꾸는 사람 수
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
            if (unsubscribeViewers) unsubscribeViewers();
            // 퇴장 시 viewer 문서 삭제
            if (viewerDocRef) {
                deleteDoc(viewerDocRef).catch(() => {});
            }
        };
    }, [selectedDream, user, userNickname]);

    // 실시간 좋아요 구독
    useEffect(() => {
        if (!selectedDream) return;
        const dreamRef = doc(db, 'dreams', selectedDream.id);
        const unsubscribe = onSnapshot(dreamRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const newLikeCount = data.likeCount || 0;
                const oldLikeCount = selectedDream.likeCount || 0;
                if (newLikeCount > oldLikeCount) {
                    const newHeart = { id: Date.now(), x: Math.random() * 60 + 20 };
                    setFloatingHearts(prev => [...prev, newHeart]);
                    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id)), 2000);
                }
                setSelectedDream(prev => prev ? { ...prev, likeCount: newLikeCount, likes: data.likes } : null);
            }
        });
        return () => unsubscribe();
    }, [selectedDream?.id, setSelectedDream]);

    return {
        viewingCount,
        recentViewers,
        similarDreamers,
        floatingHearts
    };
};
