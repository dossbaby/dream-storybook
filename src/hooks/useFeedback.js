import { useCallback } from 'react';
import { doc, updateDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 리딩 결과에 대한 피드백(별점) 관리 훅
 *
 * Firebase 저장 구조:
 * - dreams/tarots/sajus 컬렉션에 rating 필드 추가
 * - rating: { average: number, count: number, ratings: [{ userId, rating, createdAt }] }
 */
export const useFeedback = (user) => {
    /**
     * 별점 평가 저장
     * @param {string} collection - 컬렉션명 ('dreams', 'tarots', 'sajus')
     * @param {string} docId - 문서 ID
     * @param {number} rating - 별점 (1-5)
     */
    const submitRating = useCallback(async (collectionName, docId, rating) => {
        if (!user) {
            console.warn('로그인이 필요합니다');
            return false;
        }

        if (rating < 1 || rating > 5) {
            console.warn('별점은 1-5 사이여야 합니다');
            return false;
        }

        try {
            const docRef = doc(db, collectionName, docId);

            // 기존 rating 정보 업데이트
            // 주의: 정확한 평균 계산을 위해 서버에서 처리하는 것이 이상적이나,
            // 클라이언트에서 간단히 처리
            await updateDoc(docRef, {
                'rating.count': increment(1),
                'rating.total': increment(rating),
                'rating.ratings': arrayUnion({
                    oderId: user.uid,
                    userName: user.displayName || '익명',
                    rating: rating,
                    createdAt: Timestamp.now()
                }),
                // 최신 평균 업데이트 (정확도를 위해 Cloud Function 권장)
                'rating.lastRating': rating,
                'rating.lastRatedAt': Timestamp.now()
            });

            console.log(`✅ Rating saved: ${rating} stars for ${collectionName}/${docId}`);
            return true;
        } catch (error) {
            console.error('Failed to save rating:', error);
            return false;
        }
    }, [user]);

    /**
     * 꿈 해몽 별점 저장
     */
    const rateDream = useCallback((dreamId, rating) => {
        return submitRating('dreams', dreamId, rating);
    }, [submitRating]);

    /**
     * 타로 리딩 별점 저장
     */
    const rateTarot = useCallback((tarotId, rating) => {
        return submitRating('tarots', tarotId, rating);
    }, [submitRating]);

    /**
     * 사주 리딩 별점 저장
     */
    const rateFortune = useCallback((fortuneId, rating) => {
        return submitRating('sajus', fortuneId, rating);
    }, [submitRating]);

    /**
     * 사용자가 이미 평가했는지 확인
     * @param {Object} ratingData - 문서의 rating 필드 데이터
     */
    const hasUserRated = useCallback((ratingData) => {
        if (!user || !ratingData?.ratings) return false;
        return ratingData.ratings.some(r => r.oderId === user.uid);
    }, [user]);

    /**
     * 사용자의 평가 점수 가져오기
     * @param {Object} ratingData - 문서의 rating 필드 데이터
     */
    const getUserRating = useCallback((ratingData) => {
        if (!user || !ratingData?.ratings) return 0;
        const userRating = ratingData.ratings.find(r => r.oderId === user.uid);
        return userRating?.rating || 0;
    }, [user]);

    /**
     * 평균 별점 계산
     * @param {Object} ratingData - 문서의 rating 필드 데이터
     */
    const getAverageRating = (ratingData) => {
        if (!ratingData?.count || !ratingData?.total) return 0;
        return Math.round((ratingData.total / ratingData.count) * 10) / 10;
    };

    return {
        submitRating,
        rateDream,
        rateTarot,
        rateFortune,
        hasUserRated,
        getUserRating,
        getAverageRating
    };
};
