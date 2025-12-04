import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const usePoints = (user) => {
    const [userPoints, setUserPoints] = useState(0);
    const [freeUsesLeft, setFreeUsesLeft] = useState(1); // 비로그인: 1회, 로그인: 3회
    const [pointHistory, setPointHistory] = useState([]);

    // 로그인 시 무료 횟수 및 포인트 로드
    useEffect(() => {
        if (user) {
            setFreeUsesLeft(3); // 로그인 시 3회
            const loadUserPoints = async () => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserPoints(data.points || 0);
                        setPointHistory(data.pointHistory || []);
                    }
                } catch (err) {
                    console.error('포인트 로드 실패:', err);
                }
            };
            loadUserPoints();
        } else {
            setFreeUsesLeft(1); // 비로그인 시 1회
            setUserPoints(0);
            setPointHistory([]);
        }
    }, [user]);

    // 포인트 적립 함수
    const addPoints = async (amount, reason) => {
        if (!user) return;
        const newPoints = userPoints + amount;
        const newHistory = [...pointHistory, { amount, reason, date: new Date() }];

        setUserPoints(newPoints);
        setPointHistory(newHistory);

        // Firebase에 저장
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                points: newPoints,
                pointHistory: newHistory
            });
        } catch (err) {
            console.error('포인트 저장 실패:', err);
        }
    };

    // 무료 횟수 사용
    const useFreeUse = () => {
        if (freeUsesLeft > 0) {
            setFreeUsesLeft(prev => prev - 1);
            return true;
        }
        return false;
    };

    return {
        userPoints,
        freeUsesLeft,
        pointHistory,
        addPoints,
        useFreeUse,
        setFreeUsesLeft
    };
};
