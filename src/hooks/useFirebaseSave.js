import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImage } from './useImageGeneration';

// Firebase 저장 훅 - 모든 모드에서 공통으로 사용
// onSuccess 콜백으로 저장 후 피드 갱신 등 처리 가능
export const useFirebaseSave = (user, userNickname, callbacks = {}) => {
    const { onDreamSaved, onTarotSaved, onFortuneSaved } = callbacks;

    // 꿈 저장
    const saveDream = async (dreamData, isPublic, selectedDreamDate = '') => {
        if (!user || !dreamData) return null;
        try {
            const [dreamImageBase64, tarotImageBase64, meaningImageBase64] = await Promise.all([
                compressImage(dreamData.dreamImage, 800, 0.85),
                compressImage(dreamData.tarotImage, 700, 0.8),
                compressImage(dreamData.meaningImage, 700, 0.8)
            ]);

            const displayName = userNickname || user.displayName || '익명';
            const dreamDate = selectedDreamDate ? new Date(selectedDreamDate) : new Date();
            const dreamDateStr = dreamDate.toISOString().split('T')[0];
            const dreamDateDisplay = `${dreamDate.getMonth() + 1}월 ${dreamDate.getDate()}일`;

            const docRef = await addDoc(collection(db, 'dreams'), {
                userId: user.uid, userName: displayName, userPhoto: user.photoURL,
                originalDream: dreamData.originalDream, title: dreamData.title, verdict: dreamData.verdict,
                dreamType: dreamData.dreamType, rarity: dreamData.rarity, keywords: dreamData.keywords,
                reading: dreamData.reading, tarot: dreamData.tarot, dreamMeaning: dreamData.dreamMeaning,
                shareText: dreamData.shareText,
                dreamImage: dreamImageBase64,
                tarotImage: tarotImageBase64,
                meaningImage: meaningImageBase64,
                detailedAnalysis: dreamData.detailedAnalysis || null,
                isPublic, likes: [], likeCount: 0, commentCount: 0,
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

    // 타로 저장
    const saveTarot = async (tarotData, isPublic) => {
        if (!user || !tarotData) return null;
        try {
            const [pastImageBase64, presentImageBase64, futureImageBase64] = await Promise.all([
                compressImage(tarotData.pastImage, 800, 0.85),
                compressImage(tarotData.presentImage, 700, 0.8),
                compressImage(tarotData.futureImage, 700, 0.8)
            ]);

            const displayName = userNickname || user.displayName || '익명';

            const docRef = await addDoc(collection(db, 'tarots'), {
                userId: user.uid, userName: displayName, userPhoto: user.photoURL,
                question: tarotData.question, title: tarotData.title, verdict: tarotData.verdict,
                rarity: tarotData.rarity, keywords: tarotData.keywords,
                reading: tarotData.reading, cardMeaning: tarotData.cardMeaning,
                cards: tarotData.cards, shareText: tarotData.shareText,
                luckyElements: tarotData.luckyElements,
                pastImage: pastImageBase64,
                presentImage: presentImageBase64,
                futureImage: futureImageBase64,
                isPublic, likes: [], likeCount: 0, commentCount: 0,
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

    // 운세 저장
    const saveFortune = async (fortuneData, isPublic) => {
        if (!user || !fortuneData) return null;
        try {
            const [morningImageBase64, afternoonImageBase64, eveningImageBase64] = await Promise.all([
                compressImage(fortuneData.morningImage, 800, 0.85),
                compressImage(fortuneData.afternoonImage, 700, 0.8),
                compressImage(fortuneData.eveningImage, 700, 0.8)
            ]);

            const displayName = userNickname || user.displayName || '익명';

            const docRef = await addDoc(collection(db, 'fortunes'), {
                userId: user.uid, userName: displayName, userPhoto: user.photoURL,
                fortuneType: fortuneData.fortuneType, typeName: fortuneData.typeName,
                title: fortuneData.title, verdict: fortuneData.verdict,
                rarity: fortuneData.rarity, score: fortuneData.score, keywords: fortuneData.keywords,
                reading: fortuneData.reading, fortuneMeaning: fortuneData.fortuneMeaning,
                shareText: fortuneData.shareText, luckyElements: fortuneData.luckyElements,
                morningImage: morningImageBase64,
                afternoonImage: afternoonImageBase64,
                eveningImage: eveningImageBase64,
                isPublic, likes: [], likeCount: 0, commentCount: 0,
                createdAt: Timestamp.now(),
                type: 'fortune'
            });

            // 저장 성공 콜백 호출
            if (onFortuneSaved) onFortuneSaved(docRef.id);
            return docRef.id;
        } catch (err) {
            console.error('운세 저장 실패:', err);
            return null;
        }
    };

    return { saveDream, saveTarot, saveFortune };
};
