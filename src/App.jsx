import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import './App.css';

// 상수 및 훅 import
import { TABS, DREAM_CATEGORIES, BADGES, dreamSymbols } from './utils/constants';
import { getCards, formatTime } from './utils/cardHelpers';
import { getCalendarDays, getDreamsForDate, getAdjacentMonth } from './utils/calendarHelpers';
import { useFirebaseSave } from './hooks/useFirebaseSave';
import { useSwipe } from './hooks/useSwipe';
// usePoints 삭제됨 (포인트 시스템 제거)
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
import { completeMagicLinkSignIn, isMagicLinkCallback } from './firebase';
import { useDreamManagement } from './hooks/useDreamManagement';
import { useReadingActions } from './hooks/useReadingActions';
import { useViewActions } from './hooks/useViewActions';
import { useUsageLimit } from './hooks/useUsageLimit';
import { useFeedback } from './hooks/useFeedback';
import { useDopamineMessages } from './hooks/useDopamineMessages';

// 항상 필요한 컴포넌트 (정적 import)
import ToastNotifications from './components/common/ToastNotifications';
import NavBar from './components/layout/NavBar';
import BottomNav from './components/layout/BottomNav';

// Lazy loaded 컴포넌트 (코드 스플리팅)
const NicknameModal = lazy(() => import('./components/modals/NicknameModal'));
const PremiumModal = lazy(() => import('./components/modals/PremiumModal'));
const AuthModal = lazy(() => import('./components/modals/AuthModal'));
const ProfileSettingsModal = lazy(() => import('./components/modals/ProfileSettingsModal'));
const ShareModal = lazy(() => import('./components/modals/ShareModal'));
const ReportModal = lazy(() => import('./components/modals/ReportModal'));
// PointsModal 삭제됨 (포인트 시스템 제거)
const DetailedReadingModal = lazy(() => import('./components/modals/DetailedReadingModal'));
const FeedbackModal = lazy(() => import('./components/modals/FeedbackModal'));
const OnboardingModal = lazy(() => import('./components/modals/OnboardingModal'));
const ReferralModal = lazy(() => import('./components/modals/ReferralModal'));
const StoryCard = lazy(() => import('./components/common/StoryCard'));
const LeftSidebar = lazy(() => import('./components/layout/LeftSidebar'));
const RightSidebar = lazy(() => import('./components/layout/RightSidebar'));
const DreamInput = lazy(() => import('./components/dream/DreamInput'));
const TarotInput = lazy(() => import('./components/tarot/TarotInput'));
const TarotResultView = lazy(() => import('./components/tarot/TarotResultView'));
const FortuneInput = lazy(() => import('./components/fortune/FortuneInput'));
const FortuneResultView = lazy(() => import('./components/fortune/FortuneResultView'));
const ResultView = lazy(() => import('./components/result/ResultView'));
const DreamDetailView = lazy(() => import('./components/detail/DreamDetailView'));
const MyPage = lazy(() => import('./components/my/MyPage'));
const FeedView = lazy(() => import('./components/feed/FeedView'));
const FloatingActionButton = lazy(() => import('./components/common/FloatingActionButton'));
const InstallPrompt = lazy(() => import('./components/common/InstallPrompt'));
const MobileSidebarSheet = lazy(() => import('./components/layout/MobileSidebarSheet'));
const AnalysisOverlay = lazy(() => import('./components/common/AnalysisOverlay'));

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
    const [navigation, setNavigation] = useState({ view: 'feed', activeTab: 'today', myCategory: null });
    const setView = (v, options = {}) => setNavigation(prev => ({ ...prev, view: v, myCategory: options.myCategory || null }));
    const setActiveTab = (t) => setNavigation(prev => ({ ...prev, activeTab: t }));
    const view = navigation.view;
    const activeTab = navigation.activeTab;
    const myCategory = navigation.myCategory;

    const [dreamDescription, setDreamDescription] = useState('');
    const [result, setResult] = useState(null);
    const [detectedKeywords, setDetectedKeywords] = useState([]);
    const [currentCard, setCurrentCard] = useState(0);
    const [selectedDream, setSelectedDream] = useState(null);

    // 그룹화된 상태들
    const [toasts, setToasts] = useState({ live: null, newType: null, badge: null, tarotReveal: null, dopamine: null });
    const setToast = (key, value) => setToasts(prev => ({ ...prev, [key]: value }));
    const setDopaminePopup = (value) => setToast('dopamine', value);
    const [modals, setModals] = useState({ nickname: false, profile: false, share: false, report: false, points: false, premium: false, feedback: false, onboarding: false, referral: false, auth: false, shareTarget: null, premiumTrigger: 'general', authTrigger: 'action' });
    const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
    const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));
    const openAuthModal = (trigger = 'action') => setModals(prev => ({ ...prev, auth: true, authTrigger: trigger }));
    const openLoginModal = () => openAuthModal('login');
    const [mobileSheet, setMobileSheet] = useState({ explore: false });
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
        dreams, hotDreams, tarotReadings: feedTarotReadings, fortuneReadings, popularKeywords, tarotKeywords, tarotTopicCounts,
        typeCounts, todayStats, onlineCount, loading: feedLoading, loadDreams, loadDreamsRef, loadTarotsRef, loadFortunesRef, loadMyDreamsRef
    } = useFeed(null, [], activeTab, filters, mode);
    const {
        user, userNickname, setUserNickname, userProfile, setUserProfile,
        tier, setTier, isPremium, isUltra, subscription,
        myDreams, setMyDreams, myTarots, setMyTarots, myFortunes, setMyFortunes, myStats, dreamTypes, loadMyDreams, loadMyTarots, loadMyFortunes, handleNewDreamType
    } = useAuth({ setLoadingState, checkAndAwardBadges, loadMyDreamsRef });
    // 포인트 시스템 삭제됨
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
    const { rateDream, rateTarot, rateFortune } = useFeedback(user);
    const { filterBySymbol, toggleLike, openDreamDetail, generateDetailedReading } = useDreamActions({
        user, dreams, selectedDream, setSelectedDream,
        setDetailedReadingField, setLoadingState, setCurrentCard, setView, loadInterpretations,
        setFilter, setMode
    });

    // 도파민 메시지 시스템
    const dopamineHook = useDopamineMessages();

    // 유저 액션 (로그인 등) - 타로 액션보다 먼저 정의
    const setShareTarget = (target) => setModals(prev => ({ ...prev, shareTarget: target }));
    const { handleGoogleLogin, handleLogout, openShareModal, copyShareText, saveNickname, saveProfile } = useUserActions({
        user, setUserNickname, setUserProfile, shareTarget: modals.shareTarget, setShareTarget, dreamTypes, openModal, closeModal
    });

    const { triggerCardReveal, startTarotSelection, toggleTarotCard, generateTarotReading } = useTarotActions({
        tarot, setTarotField, setCardReveal, setCardRevealField, setCurrentCard, setView, setSavedDreamField, user, generateTarotReadingHook, dopamineHook, onLoginRequired: openAuthModal
    });
    const { toggleSavedDreamVisibility, deleteDream, deleteTarot, deleteFortune, toggleDreamVisibility, updateVisibility } = useDreamManagement({
        user, result, savedDream, setSavedDreamField, selectedDream, setSelectedDream, setMyDreams, setMyTarots, setMyFortunes, setView, setToast, loadDreams, loadMyDreams
    });
    const { generateReading, generateFortuneReading } = useReadingActions({
        user, dreamDescription, selectedDreamDate, setCurrentCard, setResult, setView, setSavedDreamField,
        setFortuneField, fortune, generateDreamReading, generateFortuneReadingHook, triggerCardReveal, onLoginRequired: openAuthModal
    });
    const {
        resetResults, handleOpenDreamDetail, handleOpenTarotResult, handleOpenFortuneResult, handleResultBack,
        handleRestart, handleTarotBack, handleTarotCancel, handleDetailBack, handleTarotResultBack, handleTarotResultRestart,
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

    // 첫 방문 온보딩 체크
    useEffect(() => {
        if (loading.auth) return;
        const hasSeenOnboarding = localStorage.getItem('jeom_onboarding_completed');
        if (!hasSeenOnboarding) {
            // 약간의 딜레이 후 온보딩 표시 (앱 로딩 완료 후)
            const timer = setTimeout(() => {
                openModal('onboarding');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading.auth]);

    // Magic Link 콜백 처리
    useEffect(() => {
        const handleMagicLinkCallback = async () => {
            if (isMagicLinkCallback()) {
                try {
                    const result = await completeMagicLinkSignIn();
                    if (result) {
                        setDopaminePopup({ type: 'login', message: '로그인 성공! 환영합니다' });
                        // URL에서 magic link 파라미터 제거
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                } catch (error) {
                    console.error('Magic link sign in error:', error);
                    setToast('dopamine', { type: 'error', message: '로그인에 실패했습니다. 다시 시도해주세요' });
                }
            }
        };
        handleMagicLinkCallback();
    }, []);

    // 온보딩 완료 핸들러
    const handleOnboardingComplete = () => {
        localStorage.setItem('jeom_onboarding_completed', 'true');
        // 보너스 리딩 지급은 로그인 후 처리 (비로그인 시 localStorage에 플래그)
        if (!user) {
            localStorage.setItem('jeom_pending_onboarding_bonus', 'true');
        }
        setDopaminePopup({ type: 'welcome', message: '환영합니다! 무료 리딩 3회가 지급되었어요' });
    };
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
                onlineCount={onlineCount}
                isPremium={isPremium}
                tier={tier}
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
                onLogin={openLoginModal}
                onLoginRequired={openAuthModal}
                onResetResults={resetResults}
            />

            {/* 토스트 알림들 */}
            <ToastNotifications toasts={toasts} dopaminePopup={toasts.dopamine} />

            {/* 메인 3단 레이아웃 - Suspense로 lazy 컴포넌트 감싸기 */}
            <Suspense fallback={<div className="loading-spinner">로딩중...</div>}>
            <div className={`main-layout ${mode === 'tarot' && view === 'create' && !tarot.result ? 'tarot-bg' : ''} ${view === 'tarot-result' || view === 'fortune-result' || view === 'detail' ? 'full-view' : ''}`}>
                {/* 왼쪽 사이드바 - 실시간 정보 */}
                <LeftSidebar
                    mode={mode}
                    onlineCount={onlineCount}
                    todayStats={todayStats}
                    dreamTypes={dreamTypes}
                    typeFilter={filters.type}
                    typeCounts={typeCounts}
                    popularKeywords={popularKeywords}
                    tarotKeywords={tarotKeywords}
                    tarotTopicCounts={tarotTopicCounts}
                    categories={DREAM_CATEGORIES}
                    onTypeFilterChange={(val) => setFilter('type', val)}
                    onFilterBySymbol={filterBySymbol}
                />

                {/* 중앙 - 메인 콘텐츠 */}
                <main className="center-main">
                    {/* 공통 뒤로가기 버튼 - feed 외의 뷰에서만 표시 (타로/꿈/사주 결과 페이지는 자체 버튼 사용) */}
                    {view !== 'feed' && view !== 'tarot-result' && view !== 'fortune-result' && view !== 'detail' && (
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
                            onCreateClick={() => {
                                setView('create');
                                // 현재 모드의 결과 초기화 (피드에서 본 결과 클리어)
                                if (mode === 'tarot') {
                                    resetTarot();
                                } else if (mode === 'dream') {
                                    setResult(null);
                                } else if (mode === 'fortune') {
                                    resetFortune();
                                }
                            }}
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
                            onLoginRequired={openAuthModal}
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
                        <>
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
                                onCancel={handleTarotCancel}
                                onStartSelection={startTarotSelection}
                                onToggleCard={toggleTarotCard}
                                onGenerateReading={generateTarotReading}
                            />
                            {/* 도파민 분석 오버레이 - 리딩 중일 때 표시 */}
                            {readingLoading && (
                                <AnalysisOverlay
                                    isVisible={true}
                                    mode="tarot"
                                    currentMessage={dopamineHook.currentMessage}
                                    isComplete={dopamineHook.isComplete}
                                />
                            )}
                        </>
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
                            onLogin={openAuthModal}
                            renderCard={renderCard}
                            isPremium={isPremium}
                            onOpenPremium={openPremiumModal}
                            onRate={async (docId, rating, readingMode) => {
                                if (readingMode === 'dream') await rateDream(docId, rating);
                                else if (readingMode === 'tarot') await rateTarot(docId, rating);
                                else if (readingMode === 'fortune') await rateFortune(docId, rating);
                            }}
                            onKeywordClick={(keyword) => {
                                // 키워드 클릭 시 피드로 이동 + 필터 적용 (현재 모드 유지)
                                setFilter('keyword', keyword);
                                setView('feed');
                            }}
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
                            onKeywordClick={(keyword) => {
                                // 키워드 클릭 시 피드로 이동 + 필터 적용
                                setMode('tarot');
                                setFilter('keyword', keyword);
                                setView('feed');
                            }}
                            onUpdateVisibility={(visibility) => {
                                if (tarot.result?.id) {
                                    updateVisibility('tarot', tarot.result.id, visibility);
                                    // 로컬 tarot.result도 즉시 업데이트
                                    setTarotField('result', { ...tarot.result, visibility, isPublic: visibility === 'public' });
                                }
                            }}
                            onOpenReferral={() => openModal('referral')}
                            onOpenFeedback={() => openModal('feedback')}
                            showToast={setToast}
                            // 엔게이지먼트 시스템
                            user={user}
                            userNickname={userNickname}
                            onLoginRequired={openAuthModal}
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
                            onKeywordClick={(keyword) => {
                                // 키워드 클릭 시 피드로 이동 + 필터 적용
                                setMode('fortune');
                                setFilter('keyword', keyword);
                                setView('feed');
                            }}
                        />
                    )}

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
                            onOpenFeedback={() => openModal('feedback')}
                            onOpenReferral={() => openModal('referral')}
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
                            onDeleteTarot={deleteTarot}
                            onDeleteFortune={deleteFortune}
                            formatTime={formatTime}
                            isPremium={isPremium}
                            tier={tier}
                            onOpenPremium={handleOpenPremiumModal}
                            onSetTier={setTier}
                            initialCategory={myCategory}
                            usageSummary={getUsageSummary()}
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

                    {/* 피드백 모달 */}
                    <FeedbackModal
                        isOpen={modals.feedback}
                        onClose={() => closeModal('feedback')}
                        user={user}
                        onSuccess={() => {
                            setToast('dopamine', { type: 'feedback', message: '피드백 감사합니다! 무료 리딩 +1 획득!' });
                        }}
                    />

                    {/* 온보딩 모달 */}
                    <OnboardingModal
                        isOpen={modals.onboarding}
                        onClose={() => closeModal('onboarding')}
                        onComplete={handleOnboardingComplete}
                    />

                    {/* 레퍼럴 모달 */}
                    <ReferralModal
                        isOpen={modals.referral}
                        onClose={() => closeModal('referral')}
                        user={user}
                        onSuccess={(result) => {
                            setDopaminePopup({ type: 'referral', message: result.message || `🎁 무료 리딩 +${result.bonus} 획득!` });
                        }}
                    />

                    {/* 인증 모달 */}
                    <AuthModal
                        isOpen={modals.auth}
                        onClose={() => closeModal('auth')}
                        onGoogleLogin={handleGoogleLogin}
                        onSuccess={() => {
                            setDopaminePopup({ type: 'login', message: '로그인 성공! 환영합니다' });
                        }}
                        trigger={modals.authTrigger}
                    />
                </main>

                {/* 오른쪽 사이드바 - 인기 피드 (EGR 기반) */}
                <RightSidebar
                    mode={mode}
                    loading={feedLoading}
                    dreams={dreams}
                    tarotReadings={feedTarotReadings}
                    fortuneReadings={fortuneReadings}
                    dreamTypes={dreamTypes}
                    onOpenDreamDetail={openDreamDetail}
                    onOpenTarotResult={handleOpenTarotResult}
                    onOpenFortuneResult={handleOpenFortuneResult}
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
            </Suspense>

            {/* Bottom Navigation - 모바일에서만 표시 */}
            <BottomNav
                currentMode={mode}
                currentView={view}
                onModeChange={(newMode) => {
                    setMode(newMode);
                    setView('create');
                    resetTarot();
                    setResult(null);
                    resetFortune();
                    setSavedDream({ id: null, isPublic: false });
                }}
                onViewChange={setView}
                onHomeClick={() => {
                    setView('feed');
                    resetTarot();
                    setResult(null);
                    resetFortune();
                    setSavedDream({ id: null, isPublic: false });
                }}
                onOpenExplore={() => setMobileSheet(prev => ({ ...prev, explore: true }))}
            />

            {/* 모바일 탐색 바텀시트 */}
            <Suspense fallback={null}>
                <MobileSidebarSheet
                    isOpen={mobileSheet.explore}
                    onClose={() => setMobileSheet(prev => ({ ...prev, explore: false }))}
                    title="탐색"
                    icon="🔥"
                >
                    <LeftSidebar
                        mode={mode}
                        onlineCount={onlineCount}
                        todayStats={todayStats}
                        dreamTypes={DREAM_CATEGORIES}
                        hotDreams={hotDreams}
                        hotTarots={feedTarotReadings.slice(0, 3)}
                        hotFortunes={fortuneReadings.slice(0, 3)}
                        typeFilter={filters.type}
                        typeCounts={typeCounts}
                        popularKeywords={popularKeywords}
                        categories={DREAM_CATEGORIES}
                        onOpenDreamDetail={(dream) => {
                            setMobileSheet(prev => ({ ...prev, explore: false }));
                            openDreamDetail(dream);
                        }}
                        onOpenTarotResult={(reading) => {
                            setMobileSheet(prev => ({ ...prev, explore: false }));
                            openTarotResult(reading);
                        }}
                        onOpenFortuneResult={(fortune) => {
                            setMobileSheet(prev => ({ ...prev, explore: false }));
                            openFortuneResult(fortune);
                        }}
                        onTypeFilterChange={(type) => setFilter('type', type)}
                        onFilterBySymbol={(keyword, targetMode = 'dream') => {
                            setMobileSheet(prev => ({ ...prev, explore: false }));
                            setMode(targetMode);
                            setFilter('keyword', keyword);
                            setView('feed');
                        }}
                    />
                </MobileSidebarSheet>
            </Suspense>

            {/* PWA 설치 프롬프트 */}
            <Suspense fallback={null}>
                <InstallPrompt />
            </Suspense>
        </div>
    );
}

export default App;
