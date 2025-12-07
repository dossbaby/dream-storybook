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
    };

    // 타로 결과 열기
    const handleOpenTarotResult = (t) => {
        setTarotField('result', t);
        setView('tarot-result');
        setCurrentCard(0);
    };

    // 운세 결과 열기
    const handleOpenFortuneResult = (f) => {
        setFortuneField('result', f);
        setView('fortune-result');
        setCurrentCard(0);
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

    // 타로 결과 뒤로가기
    const handleTarotResultBack = () => {
        setView('feed');
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
