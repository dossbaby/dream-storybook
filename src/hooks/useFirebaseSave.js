import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImage } from './useImageGeneration';

// Firebase 저장 훅 - 모든 모드에서 공통으로 사용
// onSuccess 콜백으로 저장 후 피드 갱신 등 처리 가능
export const useFirebaseSave = (user, userNickname, callbacks = {}) => {
    const { onDreamSaved, onTarotSaved, onSajuSaved } = callbacks;

    /**
     * visibility 옵션 처리
     * @param {Object|boolean} visibilityOption - { visibility: 'private'|'unlisted'|'public', isAnonymous: boolean } 또는 boolean (레거시)
     * @returns {{ visibility: string, isPublic: boolean, isAnonymous: boolean }}
     */
    const parseVisibility = (visibilityOption) => {
        // 레거시 boolean 지원 (기존 isPublic 파라미터)
        if (typeof visibilityOption === 'boolean') {
            return {
                visibility: visibilityOption ? 'public' : 'private',
                isPublic: visibilityOption,
                isAnonymous: false
            };
        }

        // 새로운 visibility 객체
        const { visibility = 'private', isAnonymous = false } = visibilityOption || {};
        return {
            visibility,
            isPublic: visibility === 'public', // 피드, 검색에 노출 여부
            isAnonymous: visibility === 'public' ? isAnonymous : false
        };
    };

    // 꿈 저장
    const saveDream = async (dreamData, visibilityOption, selectedDreamDate = '') => {
        if (!user || !dreamData) return null;
        try {
            const { visibility, isPublic, isAnonymous } = parseVisibility(visibilityOption);

            const [dreamImageBase64, tarotImageBase64, meaningImageBase64] = await Promise.all([
                compressImage(dreamData.dreamImage, 800, 0.85),
                compressImage(dreamData.tarotImage, 700, 0.8),
                compressImage(dreamData.meaningImage, 700, 0.8)
            ]);

            const displayName = isAnonymous ? '익명의 꿈꾸는 자' : (userNickname || user.displayName || '익명');
            const dreamDate = selectedDreamDate ? new Date(selectedDreamDate) : new Date();
            const dreamDateStr = dreamDate.toISOString().split('T')[0];
            const dreamDateDisplay = `${dreamDate.getMonth() + 1}월 ${dreamDate.getDate()}일`;

            const docRef = await addDoc(collection(db, 'dreams'), {
                userId: user.uid,
                userName: displayName,
                userPhoto: isAnonymous ? null : user.photoURL,
                originalDream: dreamData.originalDream, title: dreamData.title, verdict: dreamData.verdict,
                dreamType: dreamData.dreamType, rarity: dreamData.rarity, keywords: dreamData.keywords,
                reading: dreamData.reading, tarot: dreamData.tarot, dreamMeaning: dreamData.dreamMeaning,
                shareText: dreamData.shareText,
                dreamImage: dreamImageBase64,
                tarotImage: tarotImageBase64,
                meaningImage: meaningImageBase64,
                detailedAnalysis: dreamData.detailedAnalysis || null,
                // visibility 시스템
                visibility, // 'private' | 'unlisted' | 'public'
                isPublic, // 피드 노출 여부 (레거시 호환)
                isAnonymous, // 익명 공개 여부
                likes: [], likeCount: 0, commentCount: 0,
                createdAt: Timestamp.now(),
                dreamDate: dreamDateStr,
                dreamDateDisplay: dreamDateDisplay
            });

            // 저장 성공 콜백 호출
            if (onDreamSaved) onDreamSaved(docRef.id);
            return docRef.id;
        } catch (err) {
            console.error('꿈 저장 실패:', err);
            return null;
        }
    };

    // 타로 저장 (4장 카드 시스템)
    const saveTarot = async (tarotData, visibilityOption) => {
        if (!user || !tarotData) return null;
        try {
            const { visibility, isPublic, isAnonymous } = parseVisibility(visibilityOption);

            // 4장 이미지 모두 압축 (결론 카드 포함)
            const [card1ImageBase64, card2ImageBase64, card3ImageBase64, conclusionImageBase64] = await Promise.all([
                compressImage(tarotData.card1Image || tarotData.pastImage, 800, 0.85),
                compressImage(tarotData.card2Image || tarotData.presentImage, 700, 0.8),
                compressImage(tarotData.card3Image || tarotData.futureImage, 700, 0.8),
                tarotData.conclusionImage ? compressImage(tarotData.conclusionImage, 700, 0.8) : Promise.resolve(null)
            ]);

            const displayName = isAnonymous ? '익명의 타로 리더' : (userNickname || user.displayName || '익명');

            const docRef = await addDoc(collection(db, 'tarots'), {
                userId: user.uid,
                userName: displayName,
                userPhoto: isAnonymous ? null : user.photoURL,
                question: tarotData.question, title: tarotData.title, verdict: tarotData.verdict,
                affirmation: tarotData.affirmation || null,
                topic: tarotData.topic || '미래',
                rarity: tarotData.rarity || null, keywords: tarotData.keywords || [],
                reading: tarotData.reading || null, cardMeaning: tarotData.cardMeaning || null,
                storyReading: tarotData.storyReading || null,
                jenny: tarotData.jenny || null,
                cards: tarotData.cards, shareText: tarotData.shareText,
                luckyElements: tarotData.luckyElements || null,
                // 4장 카드 이미지
                card1Image: card1ImageBase64,
                card2Image: card2ImageBase64,
                card3Image: card3ImageBase64,
                conclusionImage: conclusionImageBase64,
                // 호환성을 위한 기존 필드
                pastImage: card1ImageBase64,
                presentImage: card2ImageBase64,
                futureImage: card3ImageBase64,
                // visibility 시스템
                visibility,
                isPublic,
                isAnonymous,
                likes: [], likeCount: 0, commentCount: 0,
                createdAt: Timestamp.now(),
                type: 'tarot'
            });

            // 저장 성공 콜백 호출
            if (onTarotSaved) onTarotSaved(docRef.id);
            return docRef.id;
        } catch (err) {
            console.error('타로 저장 실패:', err);
            return null;
        }
    };

    // 사주 저장
    const saveSaju = async (sajuData, visibilityOption) => {
        if (!user || !sajuData) return null;
        try {
            const { visibility, isPublic, isAnonymous } = parseVisibility(visibilityOption);

            const [section1ImageBase64, section2ImageBase64, section3ImageBase64] = await Promise.all([
                compressImage(sajuData.section1Image, 800, 0.85),
                compressImage(sajuData.section2Image, 700, 0.8),
                compressImage(sajuData.section3Image, 700, 0.8)
            ]);

            const displayName = isAnonymous ? '익명의 운명 탐구자' : (userNickname || user.displayName || '익명');

            const docRef = await addDoc(collection(db, 'sajus'), {
                userId: user.uid,
                userName: displayName,
                userPhoto: isAnonymous ? null : user.photoURL,
                title: sajuData.title, verdict: sajuData.verdict,
                rarity: sajuData.rarity, keywords: sajuData.keywords,
                sajuInfo: sajuData.sajuInfo, sections: sajuData.sections,
                synthesisAnalysis: sajuData.synthesisAnalysis,
                shareText: sajuData.shareText, jenny: sajuData.jenny,
                doList: sajuData.doList, dontList: sajuData.dontList,
                section1Image: section1ImageBase64,
                section2Image: section2ImageBase64,
                section3Image: section3ImageBase64,
                // visibility 시스템
                visibility,
                isPublic,
                isAnonymous,
                likes: [], likeCount: 0, commentCount: 0,
                createdAt: Timestamp.now(),
                type: 'saju'
            });

            // 저장 성공 콜백 호출
            if (onSajuSaved) onSajuSaved(docRef.id);
            return docRef.id;
        } catch (err) {
            console.error('사주 저장 실패:', err);
            return null;
        }
    };

    return { saveDream, saveTarot, saveSaju };
};
