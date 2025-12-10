import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 뷰 전환 및 결과 관련 액션 훅
 */
export const useViewActions = ({
    setView,
    setResult,
    setSelectedDream,
    setCurrentCard,
    setTarotField,
    setFortuneField,
    setDreamDescription,
    setSavedDreamField,
    resetTarot,
    resetFortune
}) => {
    // 조회수 증가 (중복 방지를 위해 sessionStorage 사용)
    const incrementViewCount = async (collectionName, itemId) => {
        if (!itemId) return;

        // 세션당 한 번만 카운트 (같은 문서 중복 방지)
        const viewedKey = `viewed_${collectionName}_${itemId}`;
        if (sessionStorage.getItem(viewedKey)) return;

        try {
            await setDoc(doc(db, collectionName, itemId), {
                viewCount: increment(1)
            }, { merge: true });
            sessionStorage.setItem(viewedKey, 'true');
        } catch (err) {
            console.error('View count error:', err);
        }
    };
    // 결과 리셋
    const resetResults = () => {
        setResult(null);
        setSelectedDream(null);
        setTarotField('result', null);
        setFortuneField('result', null);
    };

    // 꿈 상세 열기
    const handleOpenDreamDetail = (dream) => {
        setSelectedDream(dream);
        setView('detail');
        setCurrentCard(0);
        // 조회수 증가
        incrementViewCount('dreams', dream?.id);
    };

    // 타로 결과 열기 (hero image 중복 방지를 위해 깨끗한 상태로 설정)
    const handleOpenTarotResult = (t) => {
        // 기존 결과 초기화 후 새 결과 설정 (중복 방지)
        setTarotField('result', null);
        setTimeout(() => {
            setTarotField('result', t);
            setView('tarot-result');
            setCurrentCard(0);
        }, 0);
        // 조회수 증가
        incrementViewCount('tarots', t?.id);
    };

    // 운세 결과 열기
    const handleOpenFortuneResult = (f) => {
        setFortuneField('result', f);
        setView('fortune-result');
        setCurrentCard(0);
        // 조회수 증가
        incrementViewCount('sajus', f?.id);
    };

    // 결과 뷰에서 뒤로가기
    const handleResultBack = () => {
        setView('create');
        setResult(null);
        resetTarot();
        resetFortune();
    };

    // 다시 시작
    const handleRestart = () => {
        setResult(null);
        resetTarot();
        resetFortune();
        setDreamDescription('');
        setSavedDreamField('id', null);
        setSavedDreamField('isPublic', false);
        setView('create'); // 입력 창으로 이동
    };

    // 타로 입력 뒤로가기
    const handleTarotBack = () => {
        setView('feed');
        setTarotField('phase', 'question');
        setTarotField('selectedCards', []);
    };

    // 타로 선택 취소 (selecting → question으로만 돌아감)
    const handleTarotCancel = () => {
        setTarotField('phase', 'question');
        setTarotField('selectedCards', []);
    };

    // 상세 뷰 뒤로가기
    const handleDetailBack = () => {
        setView('feed');
        setSelectedDream(null);
    };

    // 타로 결과 뒤로가기 → 내 타로 피드로 이동
    const handleTarotResultBack = () => {
        setView('my', { myCategory: 'tarot' });
        resetTarot();
    };

    // 타로 결과 다시시작
    const handleTarotResultRestart = () => {
        resetTarot();
        setView('create');
    };

    // 운세 결과 뒤로가기
    const handleFortuneResultBack = () => {
        setView('feed');
        resetFortune();
    };

    // 운세 결과 다시시작
    const handleFortuneResultRestart = () => {
        resetFortune();
        setView('create');
    };

    return {
        resetResults,
        handleOpenDreamDetail,
        handleOpenTarotResult,
        handleOpenFortuneResult,
        handleResultBack,
        handleRestart,
        handleTarotBack,
        handleTarotCancel,
        handleDetailBack,
        handleTarotResultBack,
        handleTarotResultRestart,
        handleFortuneResultBack,
        handleFortuneResultRestart
    };
};
