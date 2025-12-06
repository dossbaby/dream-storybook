import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TIER_LIMITS } from '../utils/aiConfig';

/**
 * 사용량 제한 훅
 * 티어별 주간 사용량 추적 및 제한 관리
 * - 무료: 주 3회 (월요일 기준 리셋)
 * - 프리미엄/울트라: 무제한
 */
export const useUsageLimit = (user, isPremium = false) => {
    const [usage, setUsage] = useState({
        dream: { used: 0, limit: 3 },
        tarot: { used: 0, limit: 3 },
        saju: { used: 0, limit: 3 }
    });
    const [loading, setLoading] = useState(true);
    const [lastReset, setLastReset] = useState(null);

    // 주간 키 (YYYY-WXX 형식, 월요일 기준)
    const getWeekKey = () => {
        const now = new Date();
        // 월요일 기준으로 주 계산
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);

        // ISO 주차 계산
        const startOfYear = new Date(monday.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(((monday - startOfYear) / 86400000 + 1) / 7);

        return `${monday.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    };

    // 티어별 제한 가져오기
    const getLimits = useCallback(() => {
        const tier = isPremium ? 'premium' : 'free';
        return TIER_LIMITS[tier];
    }, [isPremium]);

    // 사용량 데이터 로드
    const loadUsage = useCallback(async () => {
        const weekKey = getWeekKey();
        const limits = getLimits();

        if (!user) {
            // 비로그인: 로컬스토리지 사용
            const stored = localStorage.getItem(`usage_${weekKey}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                setUsage({
                    dream: { used: parsed.dream || 0, limit: limits.dream.weekly },
                    tarot: { used: parsed.tarot || 0, limit: limits.tarot.weekly },
                    saju: { used: parsed.saju || 0, limit: limits.saju.weekly }
                });
            } else {
                setUsage({
                    dream: { used: 0, limit: limits.dream.weekly },
                    tarot: { used: 0, limit: limits.tarot.weekly },
                    saju: { used: 0, limit: limits.saju.weekly }
                });
            }
            setLoading(false);
            return;
        }

        try {
            const usageRef = doc(db, 'users', user.uid, 'usage', weekKey);
            const usageDoc = await getDoc(usageRef);

            if (usageDoc.exists()) {
                const data = usageDoc.data();
                setUsage({
                    dream: { used: data.dream || 0, limit: limits.dream.weekly },
                    tarot: { used: data.tarot || 0, limit: limits.tarot.weekly },
                    saju: { used: data.saju || 0, limit: limits.saju.weekly }
                });
                setLastReset(data.lastReset?.toDate?.() || null);
            } else {
                // 새 주간, 리셋
                setUsage({
                    dream: { used: 0, limit: limits.dream.weekly },
                    tarot: { used: 0, limit: limits.tarot.weekly },
                    saju: { used: 0, limit: limits.saju.weekly }
                });
            }
        } catch (e) {
            console.error('Failed to load usage:', e);
        } finally {
            setLoading(false);
        }
    }, [user, getLimits]);

    // 초기 로드 및 프리미엄 상태 변경 시 리로드
    useEffect(() => {
        loadUsage();
    }, [loadUsage]);

    // 사용량 증가
    const incrementUsage = useCallback(async (type) => {
        const weekKey = getWeekKey();

        // 상태 업데이트
        setUsage(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                used: prev[type].used + 1
            }
        }));

        if (!user) {
            // 비로그인: 로컬스토리지 저장
            const stored = localStorage.getItem(`usage_${weekKey}`);
            const current = stored ? JSON.parse(stored) : {};
            current[type] = (current[type] || 0) + 1;
            localStorage.setItem(`usage_${weekKey}`, JSON.stringify(current));
            return;
        }

        try {
            const usageRef = doc(db, 'users', user.uid, 'usage', weekKey);
            const usageDoc = await getDoc(usageRef);

            if (usageDoc.exists()) {
                await updateDoc(usageRef, {
                    [type]: (usageDoc.data()[type] || 0) + 1,
                    updatedAt: new Date()
                });
            } else {
                await setDoc(usageRef, {
                    dream: type === 'dream' ? 1 : 0,
                    tarot: type === 'tarot' ? 1 : 0,
                    saju: type === 'saju' ? 1 : 0,
                    weekKey: weekKey,
                    lastReset: new Date(),
                    createdAt: new Date()
                });
            }
        } catch (e) {
            console.error('Failed to update usage:', e);
        }
    }, [user]);

    // 사용 가능 여부 확인
    const canUse = useCallback((type) => {
        if (isPremium) return true; // 프리미엄은 무제한
        return usage[type].used < usage[type].limit;
    }, [usage, isPremium]);

    // 남은 횟수
    const getRemainingUses = useCallback((type) => {
        if (isPremium) return Infinity;
        return Math.max(0, usage[type].limit - usage[type].used);
    }, [usage, isPremium]);

    // 다음 리셋(월요일)까지 남은 시간 (ms)
    const getTimeUntilReset = useCallback(() => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0: 일, 1: 월, ..., 6: 토
        // 다음 월요일까지 일수 계산 (월요일=1이면 7일 후)
        const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : (8 - dayOfWeek);
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        nextMonday.setHours(0, 0, 0, 0);
        return nextMonday - now;
    }, []);

    // 리셋까지 남은 시간 포맷
    const getResetTimeFormatted = useCallback(() => {
        const ms = getTimeUntilReset();
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days}일 ${hours}시간 후 리셋`;
        }
        return `${hours}시간 후 리셋`;
    }, [getTimeUntilReset]);

    // 전체 사용량 요약
    const getUsageSummary = useCallback(() => {
        return {
            dream: {
                ...usage.dream,
                canUse: canUse('dream'),
                remaining: getRemainingUses('dream')
            },
            tarot: {
                ...usage.tarot,
                canUse: canUse('tarot'),
                remaining: getRemainingUses('tarot')
            },
            saju: {
                ...usage.saju,
                canUse: canUse('saju'),
                remaining: getRemainingUses('saju')
            },
            resetIn: getResetTimeFormatted(),
            isPremium
        };
    }, [usage, canUse, getRemainingUses, getResetTimeFormatted, isPremium]);

    // 공유 보너스 부여 (주 1회만)
    const grantShareBonus = useCallback(async (type) => {
        const weekKey = getWeekKey();

        if (isPremium) return false; // 프리미엄은 보너스 불필요

        // 이미 이번 주에 보너스 받았는지 확인
        const bonusKey = `share_bonus_${weekKey}`;
        const alreadyGranted = localStorage.getItem(bonusKey);
        if (alreadyGranted) return false;

        // 보너스 부여: 해당 타입의 사용량 -1 (효과적으로 +1 제공)
        setUsage(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                used: Math.max(0, prev[type].used - 1)
            }
        }));

        // 보너스 기록
        localStorage.setItem(bonusKey, 'true');

        // Firestore에도 반영 (로그인 시)
        if (user) {
            try {
                const usageRef = doc(db, 'users', user.uid, 'usage', weekKey);
                const usageDoc = await getDoc(usageRef);
                if (usageDoc.exists()) {
                    const currentUsed = usageDoc.data()[type] || 0;
                    await updateDoc(usageRef, {
                        [type]: Math.max(0, currentUsed - 1),
                        shareBonusGranted: true,
                        shareBonusAt: new Date()
                    });
                }
            } catch (e) {
                console.error('Failed to grant share bonus:', e);
            }
        }

        return true; // 보너스 부여됨
    }, [user, isPremium]);

    // 이번 주 공유 보너스 받았는지 확인
    const hasReceivedShareBonus = useCallback(() => {
        const weekKey = getWeekKey();
        const bonusKey = `share_bonus_${weekKey}`;
        return !!localStorage.getItem(bonusKey);
    }, []);

    return {
        usage,
        loading,
        canUse,
        incrementUsage,
        getRemainingUses,
        getResetTimeFormatted,
        getUsageSummary,
        grantShareBonus,
        hasReceivedShareBonus,
        reload: loadUsage
    };
};
