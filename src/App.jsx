import { useState, useEffect, useRef } from 'react';
import './App.css';

// 상수 및 훅 import
import { TABS, DREAM_CATEGORIES, BADGES, dreamSymbols } from './utils/constants';
import { getCards, formatTime } from './utils/cardHelpers';
import { getCalendarDays, getDreamsForDate, getAdjacentMonth } from './utils/calendarHelpers';
import { useFirebaseSave } from './hooks/useFirebaseSave';
import { useSwipe } from './hooks/useSwipe';
import { usePoints } from './hooks/usePoints';
import { useBadges } from './hooks/useBadges';
import { useComments } from './hooks/useComments';
import { usePresence } from './hooks/usePresence';
import { useReading } from './hooks/useReading';
import { useFeed } from './hooks/useFeed';
import { useAiReport } from './hooks/useAiReport';
import { useDreamActions } from './hooks/useDreamActions';
import { useTarotActions } from './hooks/useTarotActions';
import { useUserActions } from './hooks/useUserActions';
import { useLiveUpdates } from './hooks/useLiveUpdates';
import { useAuth } from './hooks/useAuth';
import { useDreamManagement } from './hooks/useDreamManagement';
import { useReadingActions } from './hooks/useReadingActions';
import { useViewActions } from './hooks/useViewActions';
import { useUsageLimit } from './hooks/useUsageLimit';
import NicknameModal from './components/modals/NicknameModal';
import PremiumModal from './components/modals/PremiumModal';
import ProfileSettingsModal from './components/modals/ProfileSettingsModal';
import ShareModal from './components/modals/ShareModal';
import ReportModal from './components/modals/ReportModal';
import PointsModal from './components/modals/PointsModal';
import DetailedReadingModal from './components/modals/DetailedReadingModal';
import ToastNotifications from './components/common/ToastNotifications';
import StoryCard from './components/common/StoryCard';
import NavBar from './components/layout/NavBar';
import LeftSidebar from './components/layout/LeftSidebar';
import RightSidebar from './components/layout/RightSidebar';
import DreamInput from './components/dream/DreamInput';
import TarotInput from './components/tarot/TarotInput';
import TarotResultView from './components/tarot/TarotResultView';
import FortuneInput from './components/fortune/FortuneInput';
import FortuneResultView from './components/fortune/FortuneResultView';
import ResultView from './components/result/ResultView';
import DreamDetailView from './components/detail/DreamDetailView';
import MyPage from './components/my/MyPage';
import FeedView from './components/feed/FeedView';
import FloatingActionButton from './components/common/FloatingActionButton';

function App() {
    // 로딩 상태 (그룹화)
    const [loading, setLoading] = useState({
        auth: true,
        generating: false,
        report: false,
        detailedReading: false,
        showKeywordHints: false
    });
    const setLoadingState = (key, value) => setLoading(prev => ({ ...prev, [key]: value }));

    // 네비게이션 상태 통합
    const [navigation, setNavigation] = useState({ view: 'feed', activeTab: 'today' });
    const setView = (v) => setNavigation(prev => ({ ...prev, view: v }));
    const setActiveTab = (t) => setNavigation(prev => ({ ...prev, activeTab: t }));
    const view = navigation.view;
    const activeTab = navigation.activeTab;

    const [dreamDescription, setDreamDescription] = useState('');
    const [result, setResult] = useState(null);
    const [detectedKeywords, setDetectedKeywords] = useState([]);
    const [currentCard, setCurrentCard] = useState(0);
    const [selectedDream, setSelectedDream] = useState(null);

    // 그룹화된 상태들
    const [toasts, setToasts] = useState({ live: null, newType: null, badge: null, tarotReveal: null, dopamine: null });
    const setToast = (key, value) => setToasts(prev => ({ ...prev, [key]: value }));
    const setDopaminePopup = (value) => setToast('dopamine', value);
    const [modals, setModals] = useState({ nickname: false, profile: false, share: false, report: false, points: false, premium: false, shareTarget: null, premiumTrigger: 'general' });
    const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
    const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));
    const selectedDreamDate = '';
    const [calendar, setCalendar] = useState({ view: false, month: new Date() });
    const setCalendarField = (key, value) => setCalendar(prev => ({ ...prev, [key]: value }));
    const [cardReveal, setCardReveal] = useState({ mode: false, particles: [] });
    const setCardRevealField = (key, value) => setCardReveal(prev => ({ ...prev, [key]: value }));
    const [filters, setFilters] = useState({ type: null, keyword: null });
    const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    const [detailedReading, setDetailedReading] = useState({ show: false, content: null });
    const setDetailedReadingField = (key, value) => setDetailedReading(prev => ({ ...prev, [key]: value }));
    const [savedDream, setSavedDream] = useState({ id: null, isPublic: false });
    const setSavedDreamField = (key, value) => setSavedDream(prev => ({ ...prev, [key]: value }));

    // 모드별 상태
    const [mode, setMode] = useState('tarot');
    const [tarot, setTarot] = useState({
        question: '', selectedCards: [], deck: [], result: null, phase: 'question',
        readings: [], finalCard: null, images: [], revealingIndex: -1
    });
    const setTarotField = (key, value) => setTarot(prev => ({ ...prev, [key]: value }));
    const resetTarot = () => setTarot(prev => ({
        ...prev, question: '', selectedCards: [], result: null, phase: 'question', finalCard: null, images: []
    }));
    const [fortune, setFortune] = useState({ type: 'today', result: null, birthdate: '' });
    const setFortuneField = (key, value) => setFortune(prev => ({ ...prev, [key]: value }));
    const resetFortune = () => setFortune(prev => ({ ...prev, result: null }));

    // 맞춤 질문 상태
    const [customQuestions, setCustomQuestions] = useState({
        dream: { preset: null, custom: '' },
        fortune: { preset: null, custom: '' }
    });
    const setDreamQuestion = (preset, custom) => setCustomQuestions(prev => ({ ...prev, dream: { preset, custom } }));
    const setFortuneQuestion = (preset, custom) => setCustomQuestions(prev => ({ ...prev, fortune: { preset, custom } }));
    const handleOpenPremiumModal = (trigger = 'general') => setModals(prev => ({ ...prev, premium: true, premiumTrigger: trigger }));
    const cardRef = useRef(null);

    // 커스텀 훅들
    const { userBadges, checkAndAwardBadges } = useBadges(setToast);
    const {
        dreams, hotDreams, tarotReadings: feedTarotReadings, fortuneReadings, popularKeywords,
        typeCounts, todayStats, onlineCount, loading: feedLoading, loadDreams, loadDreamsRef, loadTarotsRef, loadFortunesRef, loadMyDreamsRef
    } = useFeed(null, [], activeTab, filters, mode);
    const {
        user, userNickname, setUserNickname, userProfile, setUserProfile,
        tier, isPremium, isUltra, subscription,
        myDreams, setMyDreams, myTarots, setMyTarots, myFortunes, setMyFortunes, myStats, dreamTypes, loadMyDreams, loadMyTarots, loadMyFortunes, handleNewDreamType
    } = useAuth({ setLoadingState, checkAndAwardBadges, loadMyDreamsRef });
    const { userPoints, freeUsesLeft, addPoints } = usePoints(user);
    const { usage, canUse, incrementUsage, getRemainingUses, getResetTimeFormatted, getUsageSummary, grantShareBonus, hasReceivedShareBonus } = useUsageLimit(user, isPremium);
    const openPremiumModal = (trigger = 'general') => setModals(prev => ({ ...prev, premium: true, premiumTrigger: trigger }));
    const {
        comments, newComment, setNewComment, commentEdit, setCommentEditField, startEditComment,
        saveEditComment, cancelEditComment, deleteComment, interpretations, newInterpretation,
        setNewInterpretation, loadInterpretations, addInterpretation, markHelpful, deleteInterpretation
    } = useComments(user, selectedDream, userNickname);
    const { viewingCount, recentViewers, similarDreamers, floatingHearts } = usePresence(selectedDream, user, userNickname, setSelectedDream);
    const { saveDream: saveFirebaseDream, saveTarot: saveFirebaseTarot, saveFortune: saveFirebaseFortune } = useFirebaseSave(user, userNickname, {
        onDreamSaved: () => { loadDreamsRef.current?.(); user && loadMyDreamsRef.current?.(user.uid); },
        onTarotSaved: () => { loadTarotsRef.current?.(); user && loadMyTarots(user.uid); },
        onFortuneSaved: () => { loadFortunesRef.current?.(); user && loadMyFortunes(user.uid); }
    });
    const { loading: readingLoading, error, progress, analysisPhase, modelConfig, generateDreamReading, generateTarotReading: generateTarotReadingHook, generateFortuneReading: generateFortuneReadingHook } = useReading({
        user, userProfile, tier, dreamTypes, onSaveDream: saveFirebaseDream, onSaveTarot: saveFirebaseTarot,
        onSaveFortune: saveFirebaseFortune, onNewDreamType: handleNewDreamType, setToast, setDopaminePopup, setSavedDreamField
    });
    const { aiReport, setAiReport, generateAiReport } = useAiReport(myDreams, dreamTypes, openModal, closeModal);
    const { filterBySymbol, toggleLike, openDreamDetail, generateDetailedReading } = useDreamActions({
        user, dreams, selectedDream, setSelectedDream,
        setDetailedReadingField, setLoadingState, setCurrentCard, setView, loadInterpretations,
        setFilter, setMode
    });

    const { triggerCardReveal, startTarotSelection, toggleTarotCard, generateTarotReading } = useTarotActions({
        tarot, setTarotField, setCardReveal, setCardRevealField, setCurrentCard, setView, setSavedDreamField, user, generateTarotReadingHook
    });
    const setShareTarget = (target) => setModals(prev => ({ ...prev, shareTarget: target }));
    const { handleGoogleLogin, handleLogout, openShareModal, copyShareText, saveNickname, saveProfile } = useUserActions({
        user, setUserNickname, setUserProfile, shareTarget: modals.shareTarget, setShareTarget, dreamTypes, openModal, closeModal
    });
    const { toggleSavedDreamVisibility, deleteDream, toggleDreamVisibility, updateVisibility } = useDreamManagement({
        user, result, savedDream, setSavedDreamField, selectedDream, setSelectedDream, setMyDreams, setMyTarots, setMyFortunes, setView, setToast, loadDreams, loadMyDreams
    });
    const { generateReading, generateFortuneReading } = useReadingActions({
        user, dreamDescription, selectedDreamDate, setCurrentCard, setResult, setView, setSavedDreamField,
        setFortuneField, fortune, generateDreamReading, generateFortuneReadingHook, triggerCardReveal
    });
    const {
        resetResults, handleOpenDreamDetail, handleOpenTarotResult, handleOpenFortuneResult, handleResultBack,
        handleRestart, handleTarotBack, handleDetailBack, handleTarotResultBack, handleTarotResultRestart,
        handleFortuneResultBack, handleFortuneResultRestart
    } = useViewActions({
        setView, setResult, setSelectedDream, setCurrentCard, setTarotField, setFortuneField, setDreamDescription, setSavedDreamField, resetTarot, resetFortune
    });
    useLiveUpdates(user, feedLoading, setToast);

    // 헬퍼 함수들
    const keywordHints = ['물', '하늘', '집', '학교', '쫓기다', '날다'];
    useEffect(() => {
        if (!dreamDescription.trim()) { setDetectedKeywords([]); return; }
        const detected = Object.entries(dreamSymbols).filter(([k]) => dreamDescription.includes(k)).map(([k, d]) => ({ keyword: k, ...d }));
        setDetectedKeywords(detected.slice(0, 4));
    }, [dreamDescription]);
    const prevMonth = () => setCalendarField('month', getAdjacentMonth(calendar.month, -1));
    const nextMonth = () => setCalendarField('month', getAdjacentMonth(calendar.month, 1));
    const cards = getCards(result, tarot.result, fortune.result, selectedDream);
    const nextCard = () => { if (currentCard < cards.length - 1) setCurrentCard(currentCard + 1); };
    const prevCard = () => { if (currentCard > 0) setCurrentCard(currentCard - 1); };
    const { touchStart, touchEnd, onTouchStart, onTouchMove, onTouchEnd } = useSwipe(nextCard, prevCard);
    const addKeywordHint = (keyword) => { if (!dreamDescription.includes(keyword)) setDreamDescription(prev => prev + (prev ? ' ' : '') + keyword); };
    const currentDreamData = result || selectedDream;
    const dreamTypeInfo = currentDreamData?.dreamType ? dreamTypes[currentDreamData.dreamType] : null;

    if (loading.auth) return <div className="app loading-screen"><div className="loading-text">夢</div></div>;

    const renderCard = (card, i) => (
        <StoryCard key={i} card={card} index={i} dreamTypeInfo={dreamTypeInfo} onDetailedReading={() => generateDetailedReading(result || selectedDream)} isPremium={isPremium} onOpenPremium={openPremiumModal} />
    );

    return (
        <div className="app">
            {/* 네비게이션 */}
            <NavBar
                mode={mode}
                user={user}
                userPoints={userPoints}
                onlineCount={onlineCount}
                isPremium={isPremium}
                usageSummary={getUsageSummary()}
                onOpenPremium={() => openPremiumModal('general')}
                onModeChange={(newMode) => {
                    setMode(newMode);
                    // 모드 변경 시 이전 결과 초기화
                    if (newMode === 'tarot') {
                        setTarotField('phase', 'question');
                        setResult(null);
                        setFortuneField('result', null);
                    } else if (newMode === 'dream') {
                        resetTarot();
                        setFortuneField('result', null);
                    } else if (newMode === 'fortune') {
                        setResult(null);
                        resetTarot();
                    }
                    setSavedDream({ id: null, isPublic: false });
                }}
                onViewChange={setView}
                onOpenPoints={() => openModal('points')}
                onLogin={handleGoogleLogin}
                onResetResults={resetResults}
            />

            {/* 토스트 알림들 */}
            <ToastNotifications toasts={toasts} dopaminePopup={toasts.dopamine} />

            {/* 메인 3단 레이아웃 */}
            <div className="main-layout">
                {/* 왼쪽 사이드바 - 실시간 정보 */}
                <LeftSidebar
                    mode={mode}
                    onlineCount={onlineCount}
                    todayStats={todayStats}
                    dreamTypes={dreamTypes}
                    hotDreams={hotDreams}
                    hotTarots={feedTarotReadings.slice(0, 3)}
                    hotFortunes={fortuneReadings.slice(0, 3)}
                    typeFilter={filters.type}
                    typeCounts={typeCounts}
                    popularKeywords={popularKeywords}
                    categories={DREAM_CATEGORIES}
                    onOpenDreamDetail={openDreamDetail}
                    onOpenTarotResult={handleOpenTarotResult}
                    onOpenFortuneResult={handleOpenFortuneResult}
                    onTypeFilterChange={(val) => setFilter('type', val)}
                    onFilterBySymbol={filterBySymbol}
                />

                {/* 중앙 - 메인 콘텐츠 */}
                <main className="center-main">
                    {/* 공통 뒤로가기 버튼 - feed 외의 뷰에서만 표시 */}
                    {view !== 'feed' && (
                        <button
                            className="global-back-btn"
                            onClick={() => {
                                if (view === 'create') {
                                    if (mode === 'tarot') handleTarotBack();
                                    else setView('feed');
                                } else if (view === 'result') {
                                    handleResultBack();
                                } else if (view === 'detail') {
                                    handleDetailBack();
                                } else if (view === 'mypage') {
                                    setView('feed');
                                } else {
                                    setView('feed');
                                }
                            }}
                        >
                            ←
                        </button>
                    )}

                    {/* 피드 뷰 - 모드별로 다른 콘텐츠 */}
                    {view === 'feed' && (
                        <FeedView
                            mode={mode}
                            dreams={dreams}
                            tarotReadings={feedTarotReadings}
                            fortuneReadings={fortuneReadings}
                            dreamTypes={dreamTypes}
                            popularKeywords={popularKeywords}
                            symbolFilter={filters.keyword}
                            onCreateClick={() => setView('create')}
                            onOpenDreamDetail={handleOpenDreamDetail}
                            onOpenTarotResult={handleOpenTarotResult}
                            onOpenFortuneResult={handleOpenFortuneResult}
                            onKeywordFilter={(kw) => setFilter('keyword', kw)}
                            onClearSymbolFilter={() => setFilter('keyword', null)}
                            onModeChange={(newMode) => {
                                setMode(newMode);
                                if (newMode === 'tarot') {
                                    setTarotField('phase', 'question');
                                    setResult(null);
                                    setFortuneField('result', null);
                                } else if (newMode === 'dream') {
                                    resetTarot();
                                    setFortuneField('result', null);
                                } else if (newMode === 'fortune') {
                                    setResult(null);
                                    resetTarot();
                                }
                                setSavedDream({ id: null, isPublic: false });
                            }}
                            user={user}
                            onLoginRequired={handleGoogleLogin}
                        />
                    )}

                    {/* 꿈 생성 뷰 */}
                    {view === 'create' && !result && mode === 'dream' && (
                        <DreamInput
                            dreamDescription={dreamDescription}
                            setDreamDescription={setDreamDescription}
                            detectedKeywords={detectedKeywords}
                            showKeywordHints={loading.showKeywordHints}
                            setShowKeywordHints={(v) => setLoadingState('showKeywordHints', v)}
                            keywordHints={keywordHints}
                            dreamSymbols={dreamSymbols}
                            loading={readingLoading}
                            analysisPhase={analysisPhase}
                            progress={progress}
                            error={error}
                            onBack={() => setView('feed')}
                            onGenerate={generateReading}
                            onAddKeywordHint={addKeywordHint}
                            onFilterBySymbol={filterBySymbol}
                            tier={tier}
                            selectedQuestion={customQuestions.dream.preset}
                            customQuestion={customQuestions.dream.custom}
                            onSelectPreset={(preset) => setDreamQuestion(preset, '')}
                            onCustomQuestionChange={(text) => setDreamQuestion(null, text)}
                            onOpenPremium={() => handleOpenPremiumModal('custom_question')}
                        />
                    )}

                    {/* 타로 생성 뷰 */}
                    {view === 'create' && !tarot.result && mode === 'tarot' && (
                        <TarotInput
                            tarotPhase={tarot.phase}
                            tarotQuestion={tarot.question}
                            setTarotQuestion={(q) => setTarotField('question', q)}
                            tarotDeck={tarot.deck}
                            tarotSelectedCards={tarot.selectedCards}
                            loading={readingLoading}
                            analysisPhase={analysisPhase}
                            progress={progress}
                            error={error}
                            onBack={handleTarotBack}
                            onStartSelection={startTarotSelection}
                            onToggleCard={toggleTarotCard}
                            onGenerateReading={generateTarotReading}
                        />
                    )}

                    {/* 운세 생성 뷰 */}
                    {view === 'create' && !fortune.result && mode === 'fortune' && (
                        <FortuneInput
                            fortuneType={fortune.type}
                            setFortuneType={(t) => setFortuneField('type', t)}
                            fortuneBirthdate={fortune.birthdate}
                            setFortuneBirthdate={(b) => setFortuneField('birthdate', b)}
                            loading={readingLoading}
                            analysisPhase={analysisPhase}
                            progress={progress}
                            error={error}
                            onBack={() => setView('feed')}
                            onGenerate={generateFortuneReading}
                            tier={tier}
                            selectedQuestion={customQuestions.fortune.preset}
                            customQuestion={customQuestions.fortune.custom}
                            onSelectPreset={(preset) => setFortuneQuestion(preset, '')}
                            onCustomQuestionChange={(text) => setFortuneQuestion(null, text)}
                            onOpenPremium={() => handleOpenPremiumModal('custom_question')}
                        />
                    )}

                    {/* 결과 뷰 - 모든 모드 통합 (꿈/타로/운세) */}
                    {(view === 'result' || (view === 'create' && (result || tarot.result || fortune.result))) && (result || tarot.result || fortune.result) && (
                        <ResultView
                            mode={mode}
                            result={result}
                            tarotResult={tarot.result}
                            fortuneResult={fortune.result}
                            cards={cards}
                            currentCard={currentCard}
                            setCurrentCard={setCurrentCard}
                            cardRevealMode={cardReveal.mode}
                            revealParticles={cardReveal.particles}
                            user={user}
                            savedDreamId={savedDream.id}
                            savedDreamPublic={savedDream.isPublic}
                            progress={progress}
                            cardRef={cardRef}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            onBack={handleResultBack}
                            onRestart={handleRestart}
                            onPrevCard={prevCard}
                            onNextCard={nextCard}
                            onToggleVisibility={toggleSavedDreamVisibility}
                            onGenerateDetailedReading={generateDetailedReading}
                            onShare={openShareModal}
                            onLogin={handleGoogleLogin}
                            renderCard={renderCard}
                            isPremium={isPremium}
                            onOpenPremium={openPremiumModal}
                        />
                    )}

                    {/* 상세 뷰 */}
                    {view === 'detail' && selectedDream && (
                        <DreamDetailView
                            selectedDream={selectedDream}
                            user={user}
                            cards={cards}
                            currentCard={currentCard}
                            setCurrentCard={setCurrentCard}
                            dreamTypes={dreamTypes}
                            viewingCount={viewingCount}
                            recentViewers={recentViewers}
                            similarDreamers={similarDreamers}
                            floatingHearts={floatingHearts}
                            interpretations={interpretations}
                            comments={comments}
                            newInterpretation={newInterpretation}
                            setNewInterpretation={setNewInterpretation}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            commentEdit={commentEdit}
                            setCommentEditField={setCommentEditField}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            onBack={handleDetailBack}
                            onPrevCard={prevCard}
                            onNextCard={nextCard}
                            onToggleLike={toggleLike}
                            onShare={openShareModal}
                            onGenerateDetailedReading={generateDetailedReading}
                            onAddInterpretation={addInterpretation}
                            onDeleteInterpretation={deleteInterpretation}
                            onMarkHelpful={markHelpful}
                            onStartEditComment={startEditComment}
                            onSaveEditComment={saveEditComment}
                            onCancelEditComment={cancelEditComment}
                            onDeleteComment={deleteComment}
                            renderCard={renderCard}
                            formatTime={formatTime}
                            isPremium={isPremium}
                            onOpenPremium={openPremiumModal}
                        />
                    )}

                    {/* 타로 결과 뷰 - 4장 카드 시스템 */}
                    {view === 'tarot-result' && tarot.result && (
                        <TarotResultView
                            tarotResult={tarot.result}
                            onBack={handleTarotResultBack}
                            onRestart={handleTarotResultRestart}
                            whispers={[]}
                            onAddWhisper={(text) => console.log('타로 속삭임:', text)}
                            viewerCount={Math.floor(Math.random() * 5) + 1}
                            similarCount={Math.floor(Math.random() * 10) + 2}
                            isPremium={isPremium}
                            onOpenPremium={openPremiumModal}
                        />
                    )}

                    {/* 운세 결과 뷰 */}
                    {view === 'fortune-result' && fortune.result && (
                        <FortuneResultView
                            fortuneResult={fortune.result}
                            onBack={handleFortuneResultBack}
                            onRestart={handleFortuneResultRestart}
                            onRevealSecret={() => setFortuneField('result', {...fortune.result, showFullReading: true})}
                            whispers={[]}
                            onAddWhisper={(text) => console.log('운세 속삭임:', text)}
                            viewerCount={Math.floor(Math.random() * 5) + 1}
                            similarCount={Math.floor(Math.random() * 10) + 2}
                            isPremium={isPremium}
                            onOpenPremium={openPremiumModal}
                        />
                    )}

                    {/* 포인트 모달 */}
                    <PointsModal
                        isOpen={modals.points}
                        onClose={() => closeModal('points')}
                        userPoints={userPoints}
                        freeUsesLeft={freeUsesLeft}
                        onAddPoints={addPoints}
                        onLogin={handleGoogleLogin}
                        isLoggedIn={!!user}
                    />

                    {/* 마이페이지 */}
                    {view === 'my' && user && (
                        <MyPage
                            user={user}
                            userNickname={userNickname}
                            userProfile={userProfile}
                            userBadges={userBadges}
                            BADGES={BADGES}
                            myStats={myStats}
                            myDreams={myDreams}
                            myTarots={myTarots}
                            myFortunes={myFortunes}
                            dreamTypes={dreamTypes}
                            calendar={calendar}
                            onBack={() => setView('feed')}
                            onOpenNicknameModal={() => openModal('nickname')}
                            onOpenProfileModal={() => openModal('profile')}
                            onLogout={handleLogout}
                            onGenerateAiReport={generateAiReport}
                            onSetCalendarView={(val) => setCalendarField('view', val)}
                            onPrevMonth={prevMonth}
                            onNextMonth={nextMonth}
                            getCalendarDays={getCalendarDays}
                            getDreamsForDate={getDreamsForDate}
                            onOpenDreamDetail={openDreamDetail}
                            onOpenTarotDetail={(tarot) => { setTarot(prev => ({ ...prev, result: { ...tarot, showFullReading: true } })); setView('tarot-result'); }}
                            onOpenFortuneDetail={(fortune) => { setFortune(prev => ({ ...prev, result: { ...fortune, showFullReading: true } })); setView('fortune-result'); }}
                            onToggleDreamVisibility={toggleDreamVisibility}
                            onUpdateVisibility={updateVisibility}
                            onDeleteDream={deleteDream}
                            formatTime={formatTime}
                            isPremium={isPremium}
                            tier={tier}
                            onOpenPremium={handleOpenPremiumModal}
                        />
                    )}

                    {/* AI 리포트 모달 */}
                    <ReportModal
                        isOpen={modals.report}
                        onClose={() => { closeModal('report'); setAiReport(null); }}
                        loading={loading.report}
                        report={aiReport}
                    />

                    {/* 공유 모달 */}
                    <ShareModal
                        isOpen={modals.share}
                        onClose={() => closeModal('share')}
                        shareTarget={modals.shareTarget}
                        dreamTypes={dreamTypes}
                        onCopyText={copyShareText}
                        showToast={setToast}
                        isPremium={isPremium}
                        hasReceivedShareBonus={hasReceivedShareBonus}
                        onShareComplete={async (type) => {
                            // 공유 타입에 따라 보너스 부여
                            const contentType = modals.shareTarget?.type || 'dream';
                            const bonusGranted = await grantShareBonus(contentType);
                            if (bonusGranted) {
                                setToast({ message: '🎁 공유 보너스! 무료 리딩 +1 획득', type: 'success' });
                            }
                        }}
                    />

                    {/* 닉네임 모달 */}
                    <NicknameModal
                        isOpen={modals.nickname}
                        onClose={() => closeModal('nickname')}
                        onSave={saveNickname}
                        initialValue={userNickname}
                    />

                    {/* 프로필 설정 모달 */}
                    <ProfileSettingsModal
                        isOpen={modals.profile}
                        onClose={() => closeModal('profile')}
                        currentProfile={userProfile}
                        currentNickname={userNickname}
                        onSave={saveProfile}
                    />

                    {/* 상세 풀이 모달 */}
                    <DetailedReadingModal
                        isOpen={detailedReading.show}
                        onClose={() => setDetailedReading({ show: false, content: null })}
                        loading={loading.detailedReading}
                        content={detailedReading.content}
                        dreamTypes={dreamTypes}
                    />

                    {/* 프리미엄 모달 */}
                    <PremiumModal
                        isOpen={modals.premium}
                        onClose={() => closeModal('premium')}
                        onSubscribe={({ tier, cycle }) => {
                            closeModal('premium');
                            // TODO: 결제 페이지로 이동 또는 결제 플로우 시작
                            console.log('구독 시작:', tier, cycle);
                        }}
                        currentTier={tier}
                        trigger={modals.premiumTrigger}
                    />
                </main>

                {/* 오른쪽 사이드바 - 피드 */}
                <RightSidebar
                    mode={mode}
                    tabs={TABS}
                    activeTab={activeTab}
                    loading={feedLoading}
                    dreams={dreams}
                    tarotReadings={feedTarotReadings}
                    fortuneReadings={fortuneReadings}
                    dreamTypes={dreamTypes}
                    onTabChange={setActiveTab}
                    onOpenDreamDetail={openDreamDetail}
                    onOpenTarotResult={handleOpenTarotResult}
                    onOpenFortuneResult={handleOpenFortuneResult}
                    onCreateClick={() => setView('create')}
                />
            </div>

            {/* Floating Action Button */}
            <FloatingActionButton
                mode={mode}
                onModeChange={(newMode) => {
                    setMode(newMode);
                    setView('create');
                    // 모든 결과 초기화
                    resetTarot();
                    setResult(null);
                    resetFortune();
                    setSavedDream({ id: null, isPublic: false });
                }}
                onCreateClick={() => {
                    setView('create');
                    // 현재 모드의 결과 초기화
                    if (mode === 'tarot') {
                        resetTarot();
                    } else if (mode === 'dream') {
                        setResult(null);
                    } else if (mode === 'fortune') {
                        resetFortune();
                    }
                }}
            />
        </div>
    );
}

export default App;
