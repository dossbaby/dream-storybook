import { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BADGES } from '../utils/constants';

export const useBadges = (setToast) => {
    const [userBadges, setUserBadges] = useState([]);

    const checkAndAwardBadges = async (userId, dreamsList) => {
        if (!userId || dreamsList.length === 0) return;
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const existingBadges = userDoc.exists() ? (userDoc.data().badges || []) : [];
            const newBadges = [];

            // 첫 꿈
            if (!existingBadges.includes('first_dream') && dreamsList.length >= 1) {
                newBadges.push('first_dream');
            }
            // 10개 이상
            if (!existingBadges.includes('dream_collector') && dreamsList.length >= 10) {
                newBadges.push('dream_collector');
            }
            // 좋아요 10개
            const totalLikes = dreamsList.reduce((sum, d) => sum + (d.likeCount || 0), 0);
            if (!existingBadges.includes('popular_dreamer') && totalLikes >= 10) {
                newBadges.push('popular_dreamer');
            }
            // 5가지 유형
            const uniqueTypes = new Set(dreamsList.map(d => d.dreamType)).size;
            if (!existingBadges.includes('type_master') && uniqueTypes >= 5) {
                newBadges.push('type_master');
            }
            // 7일 연속
            if (!existingBadges.includes('dream_week')) {
                const dates = dreamsList.map(d => d.dreamDate).filter(Boolean).sort().reverse();
                let streak = 1;
                for (let i = 1; i < dates.length && streak < 7; i++) {
                    const curr = new Date(dates[i - 1]);
                    const prev = new Date(dates[i]);
                    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
                    if (diff === 1) streak++;
                    else if (diff > 1) break;
                }
                if (streak >= 7) newBadges.push('dream_week');
            }

            if (newBadges.length > 0) {
                await setDoc(doc(db, 'users', userId), {
                    badges: [...existingBadges, ...newBadges]
                }, { merge: true });
                setUserBadges([...existingBadges, ...newBadges]);
                // 뱃지 획득 알림
                if (setToast) {
                    setToast('badge', BADGES[newBadges[0]]);
                    setTimeout(() => setToast('badge', null), 4000);
                }
            } else {
                setUserBadges(existingBadges);
            }
        } catch (e) { console.error(e); }
    };

    return {
        userBadges,
        setUserBadges,
        checkAndAwardBadges
    };
};
