import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * blob: URL을 base64 data URL로 변환
 * @param {string} blobUrl - blob: URL
 * @returns {Promise<string|null>} base64 data URL
 */
const blobUrlToBase64 = async (blobUrl) => {
    if (!blobUrl) return null;

    // 이미 data: URL이면 그대로 반환
    if (blobUrl.startsWith('data:')) {
        return blobUrl;
    }

    // blob: URL이 아니면 null 반환
    if (!blobUrl.startsWith('blob:')) {
        console.warn('Unknown URL format:', blobUrl.substring(0, 50));
        return null;
    }

    try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Blob to base64 conversion failed:', error);
        return null;
    }
};

/**
 * 이미지를 Firebase Storage에 업로드하고 URL 반환
 * @param {string} imageUrl - blob: URL 또는 data: URL
 * @param {string} folder - Storage 폴더명 (dreams, tarots, sajus)
 * @param {string} userId - 사용자 ID
 * @param {string} imageName - 이미지 파일명
 * @returns {Promise<string|null>} 다운로드 URL
 */
const uploadImageToStorage = async (imageUrl, folder, userId, imageName) => {
    if (!imageUrl) return null;

    try {
        // blob: URL을 base64로 변환
        const base64Image = await blobUrlToBase64(imageUrl);
        if (!base64Image) {
            console.error('Failed to convert image to base64');
            return null;
        }

        const timestamp = Date.now();
        const path = `${folder}/${userId}/${timestamp}_${imageName}.jpg`;
        const storageRef = ref(storage, path);

        // base64 문자열 업로드
        await uploadString(storageRef, base64Image, 'data_url');

        // 다운로드 URL 반환
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        return null;
    }
};

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

            // Firebase Storage에 이미지 업로드 (원본 품질 유지)
            const [dreamImageUrl, tarotImageUrl, meaningImageUrl] = await Promise.all([
                uploadImageToStorage(dreamData.dreamImage, 'dreams', user.uid, 'dream'),
                uploadImageToStorage(dreamData.tarotImage, 'dreams', user.uid, 'tarot'),
                uploadImageToStorage(dreamData.meaningImage, 'dreams', user.uid, 'meaning')
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
                dreamImage: dreamImageUrl,
                tarotImage: tarotImageUrl,
                meaningImage: meaningImageUrl,
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

    // 타로 저장 (4장 카드 시스템 + heroImage)
    const saveTarot = async (tarotData, visibilityOption) => {
        if (!user || !tarotData) return null;
        try {
            const { visibility, isPublic, isAnonymous } = parseVisibility(visibilityOption);

            // Firebase Storage에 이미지 업로드 (원본 품질 유지) - heroImage 추가
            const [heroImageUrl, card1ImageUrl, card2ImageUrl, card3ImageUrl, conclusionImageUrl] = await Promise.all([
                uploadImageToStorage(tarotData.heroImage, 'tarots', user.uid, 'hero'),
                uploadImageToStorage(tarotData.card1Image || tarotData.pastImage, 'tarots', user.uid, 'card1'),
                uploadImageToStorage(tarotData.card2Image || tarotData.presentImage, 'tarots', user.uid, 'card2'),
                uploadImageToStorage(tarotData.card3Image || tarotData.futureImage, 'tarots', user.uid, 'card3'),
                tarotData.conclusionImage ? uploadImageToStorage(tarotData.conclusionImage, 'tarots', user.uid, 'conclusion') : Promise.resolve(null)
            ]);

            const displayName = isAnonymous ? '익명의 타로 리더' : (userNickname || user.displayName || '익명');

            const docRef = await addDoc(collection(db, 'tarots'), {
                userId: user.uid,
                userName: displayName,
                userPhoto: isAnonymous ? null : user.photoURL,
                question: tarotData.question, title: tarotData.title, verdict: tarotData.verdict,
                affirmation: tarotData.affirmation || null,
                topics: tarotData.topics || (tarotData.topic ? [tarotData.topic] : ['운세']),
                rarity: tarotData.rarity || null, keywords: tarotData.keywords || [],
                reading: tarotData.reading || null, cardMeaning: tarotData.cardMeaning || null,
                storyReading: tarotData.storyReading || null,
                jenny: tarotData.jenny || null,
                // flat 구조 분석 텍스트 저장
                opening: tarotData.opening || tarotData.storyReading?.opening || null,
                card1Analysis: tarotData.card1Analysis || tarotData.storyReading?.card1Analysis || null,
                card2Analysis: tarotData.card2Analysis || tarotData.storyReading?.card2Analysis || null,
                card3Analysis: tarotData.card3Analysis || tarotData.storyReading?.card3Analysis || null,
                conclusionCard: tarotData.conclusionCard || tarotData.storyReading?.conclusionCard || null,
                synthesis: tarotData.synthesis || tarotData.storyReading?.synthesis || null,
                // hook, foreshadow, hiddenInsight (flat 구조)
                hook: tarotData.hook || tarotData.jenny?.hook || null,
                foreshadow: tarotData.foreshadow || tarotData.jenny?.foreshadow || null,
                hiddenInsight: tarotData.hiddenInsight || tarotData.jenny?.hiddenInsight || null,
                cards: tarotData.cards, shareText: tarotData.shareText || tarotData.jenny?.shareText || null,
                luckyElements: tarotData.luckyElements || null,
                // Hero 이미지 + 4장 카드 이미지 (Storage URL)
                heroImage: heroImageUrl,
                card1Image: card1ImageUrl,
                card2Image: card2ImageUrl,
                card3Image: card3ImageUrl,
                conclusionImage: conclusionImageUrl,
                // 호환성을 위한 기존 필드
                pastImage: card1ImageUrl,
                presentImage: card2ImageUrl,
                futureImage: card3ImageUrl,
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

            // Firebase Storage에 이미지 업로드 (원본 품질 유지)
            const [section1ImageUrl, section2ImageUrl, section3ImageUrl] = await Promise.all([
                uploadImageToStorage(sajuData.section1Image, 'sajus', user.uid, 'section1'),
                uploadImageToStorage(sajuData.section2Image, 'sajus', user.uid, 'section2'),
                uploadImageToStorage(sajuData.section3Image, 'sajus', user.uid, 'section3')
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
                section1Image: section1ImageUrl,
                section2Image: section2ImageUrl,
                section3Image: section3ImageUrl,
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
