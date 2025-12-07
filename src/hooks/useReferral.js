import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 레퍼럴 시스템 훅
 * - 초대 코드 생성 및 공유
 * - 초대 코드로 가입 시 보상 지급
 * - 초대 현황 조회
 */
export const useReferral = (user) => {
    const [referralCode, setReferralCode] = useState(null);
    const [referralStats, setReferralStats] = useState({ invitedCount: 0, earnedReadings: 0 });
    const [loading, setLoading] = useState(false);

    // 초대 코드 생성 (6자리 영숫자)
    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동하기 쉬운 문자 제외 (0,O,1,I)
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // 사용자의 초대 코드 조회 또는 생성
    const getOrCreateReferralCode = useCallback(async () => {
        if (!user) return null;
        setLoading(true);

        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists() && userDoc.data().referralCode) {
                const code = userDoc.data().referralCode;
                setReferralCode(code);
                setLoading(false);
                return code;
            }

            // 새 초대 코드 생성
            let newCode = generateCode();
            let attempts = 0;

            // 중복 체크 (최대 5번 시도)
            while (attempts < 5) {
                const codeQuery = query(collection(db, 'users'), where('referralCode', '==', newCode));
                const existing = await getDocs(codeQuery);

                if (existing.empty) break;

                newCode = generateCode();
                attempts++;
            }

            // 코드 저장
            await updateDoc(userRef, {
                referralCode: newCode,
                referralStats: { invitedCount: 0, earnedReadings: 0 }
            });

            setReferralCode(newCode);
            setLoading(false);
            return newCode;
        } catch (error) {
            console.error('레퍼럴 코드 생성 실패:', error);
            setLoading(false);
            return null;
        }
    }, [user]);

    // 초대 코드로 가입 처리 (신규 가입자가 호출)
    const applyReferralCode = useCallback(async (code) => {
        if (!user || !code) return { success: false, message: '유효하지 않은 요청입니다.' };

        try {
            // 이미 초대 코드를 사용한 적 있는지 체크
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists() && userDoc.data().appliedReferralCode) {
                return { success: false, message: '이미 초대 코드를 사용하셨습니다.' };
            }

            // 초대 코드 찾기
            const codeQuery = query(collection(db, 'users'), where('referralCode', '==', code.toUpperCase()));
            const inviterDocs = await getDocs(codeQuery);

            if (inviterDocs.empty) {
                return { success: false, message: '존재하지 않는 초대 코드입니다.' };
            }

            const inviterDoc = inviterDocs.docs[0];
            const inviterId = inviterDoc.id;

            // 자기 자신 초대 방지
            if (inviterId === user.uid) {
                return { success: false, message: '자신의 초대 코드는 사용할 수 없습니다.' };
            }

            // 초대자에게 보상 지급 (+2 무료 리딩)
            const inviterRef = doc(db, 'users', inviterId);
            await updateDoc(inviterRef, {
                bonusReadings: increment(2),
                'referralStats.invitedCount': increment(1),
                'referralStats.earnedReadings': increment(2)
            });

            // 신규 가입자에게 보상 지급 (+1 무료 리딩)
            await updateDoc(userRef, {
                bonusReadings: increment(1),
                appliedReferralCode: code.toUpperCase(),
                referredBy: inviterId,
                referredAt: Timestamp.now()
            });

            return {
                success: true,
                message: '초대 코드가 적용되었습니다! 무료 리딩 1회가 지급되었어요.',
                bonus: 1
            };
        } catch (error) {
            console.error('초대 코드 적용 실패:', error);
            return { success: false, message: '오류가 발생했습니다. 다시 시도해주세요.' };
        }
    }, [user]);

    // 초대 현황 조회
    const loadReferralStats = useCallback(async () => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setReferralCode(data.referralCode || null);
                setReferralStats(data.referralStats || { invitedCount: 0, earnedReadings: 0 });
            }
        } catch (error) {
            console.error('레퍼럴 통계 조회 실패:', error);
        }
    }, [user]);

    // 공유 링크 생성
    const getShareLink = useCallback(() => {
        if (!referralCode) return null;
        return `${window.location.origin}?ref=${referralCode}`;
    }, [referralCode]);

    // 공유 텍스트 생성
    const getShareText = useCallback(() => {
        return `점AI에서 무료로 타로, 꿈해몽, 사주를 볼 수 있어요! 🔮\n내 초대 코드로 가입하면 무료 리딩 1회를 받을 수 있어요.\n\n초대 코드: ${referralCode}`;
    }, [referralCode]);

    // 초기 로드
    useEffect(() => {
        if (user) {
            loadReferralStats();
        }
    }, [user, loadReferralStats]);

    return {
        referralCode,
        referralStats,
        loading,
        getOrCreateReferralCode,
        applyReferralCode,
        getShareLink,
        getShareText,
        loadReferralStats
    };
};

export default useReferral;
