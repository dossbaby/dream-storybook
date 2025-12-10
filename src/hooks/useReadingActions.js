import { FORTUNE_TYPES } from '../utils/constants';

/**
 * 리딩 생성 관련 액션 훅 (꿈/운세 생성)
 */
export const useReadingActions = ({
    user,
    dreamDescription,
    selectedDreamDate,
    setCurrentCard,
    setResult,
    setView,
    setSavedDreamField,
    setFortuneField,
    fortune,
    generateDreamReading,
    generateFortuneReadingHook,
    triggerCardReveal,
    onLoginRequired
}) => {
    // 꿈 생성
    const generateReading = async () => {
        // 로그인 체크 - 비로그인 시 로그인 유도
        if (!user) {
            onLoginRequired?.();
            return;
        }
        setCurrentCard(0);
        const resultData = await generateDreamReading(dreamDescription, selectedDreamDate);
        if (resultData) {
            setResult(resultData);
            // 분석 완료 후 자동 이동하지 않음 - 사용자가 하단바에서 직접 클릭해서 이동
            if (user) {
                setSavedDreamField('id', null);
                setSavedDreamField('isPublic', true); // 기본값 공개로 변경 (pSEO)
            }
        }
    };

    // 운세 리딩 생성
    const generateFortuneReading = async () => {
        // 로그인 체크 - 비로그인 시 로그인 유도
        if (!user) {
            onLoginRequired?.();
            return;
        }
        setCurrentCard(0);
        const resultData = await generateFortuneReadingHook(fortune.type, FORTUNE_TYPES);
        if (resultData) {
            setFortuneField('result', resultData);
            // 분석 완료 후 자동 이동하지 않음 - 사용자가 하단바에서 직접 클릭해서 이동
            if (user) {
                setSavedDreamField('id', null);
                setSavedDreamField('isPublic', true); // 기본값 공개로 변경 (pSEO)
            }
        }
    };

    return {
        generateReading,
        generateFortuneReading
    };
};
