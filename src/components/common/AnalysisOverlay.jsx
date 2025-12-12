import { useState, useEffect, memo, useRef, useCallback } from 'react';
import './AnalysisOverlay.css';

/**
 * AnalysisOverlay - VN Intro 스타일 오버레이
 *
 * 플로우: 인트로 → hook → foreshadow → title → verdict → "리딩을 펼쳐볼까요?" → 결과 보기
 * 각 텍스트는 타이핑 효과로 표시됨
 */

// 랜덤 인트로 메시지
const INTRO_MESSAGES = [
    "카드를 한 번 살펴볼까요?",
    "별들이 당신의 질문을 듣고 있어요...",
    "운명의 카드가 섞이고 있어요...",
    "우주가 당신을 위해 준비 중이에요...",
    "카드들이 깨어나고 있어요...",
    "당신의 이야기가 시작될 준비를 하고 있어요...",
    "운명의 실타래가 풀리기 시작해요...",
    "잠시만요, 카드가 속삭이고 있어요...",
    "마음을 열어볼까요?",
    "당신의 질문이 카드에 닿고 있어요..."
];

// 쉬어가는 단계 context (10가지 variation)
const BREATHE_CONTEXTS = [
    "최종 결과를 확인하기 전에,",
    "마지막 카드를 펼치기 전에,",
    "운명의 답을 보기 전에,",
    "리딩을 완성하기 전에,",
    "당신의 이야기가 완성되기 전에,",
    "카드가 답을 전하기 전에,",
    "타로의 메시지를 확인하기 전에,",
    "우주의 답을 듣기 전에,",
    "마지막 페이지를 넘기기 전에,",
    "결과를 마주하기 전에,"
];

// 쉬어가는 단계 본문 (10가지)
const BREATHE_BODIES = [
    "잠시 눈을 감고 마지막 카드에 에너지를 모아볼게요...",
    "우주의 기운을 모아 마지막 답을 준비할게요...",
    "카드들이 하나로 모여 이야기를 완성하고 있어요...",
    "별들의 속삭임을 마지막 카드에 담아볼게요...",
    "깊이 숨을 쉬고 운명의 조각을 맞춰볼게요...",
    "모든 기운이 하나로 모이고 있어요...",
    "카드가 전할 메시지를 준비하고 있어요...",
    "우주가 특별한 답을 만들고 있어요...",
    "타로의 에너지가 하나로 엮이고 있어요...",
    "마지막 카드의 목소리에 귀 기울여 볼까요..."
];

// context + body 조합 생성
const getRandomBreatheMessage = () => {
    const context = BREATHE_CONTEXTS[Math.floor(Math.random() * BREATHE_CONTEXTS.length)];
    const body = BREATHE_BODIES[Math.floor(Math.random() * BREATHE_BODIES.length)];
    return `${context} ${body}`;
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 단계 정의
const PHASES = {
    INTRO: 0,      // 인트로 메시지
    HOOK: 1,       // hook
    FORESHADOW: 2, // foreshadow
    TITLE: 3,      // title
    VERDICT: 4,    // verdict
    BREATHE: 5,    // 쉬어가는 단계 (에너지 모으기)
    FINAL: 6,      // "그럼 이제 리딩을 펼쳐볼까요?"
    READY: 7       // 결과 보기 버튼
};

// 타이핑 속도 (ms per character)
const TYPING_SPEED = {
    INTRO: 60,
    HOOK: 50,
    FORESHADOW: 45,
    TITLE: 55,
    VERDICT: 55,
    BREATHE: 55,
    FINAL: 50
};

const AnalysisOverlay = memo(({
    isVisible,
    mode = 'tarot',
    streamingData = {},
    isImagesReady = false,
    onTransitionComplete
}) => {
    // 현재 단계
    const [phase, setPhase] = useState(PHASES.INTRO);
    // 전체 텍스트 (타이핑할 목표)
    const [fullText, setFullText] = useState('');
    // 현재까지 타이핑된 텍스트
    const [typedText, setTypedText] = useState('');
    // 텍스트 타입 (gold/purple)
    const [textType, setTextType] = useState('gold');
    // 타이핑 완료 여부
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    // 전환 중인지
    const [isTransitioning, setIsTransitioning] = useState(false);
    // 포탈 전환 중인지
    const [isPortalTransition, setIsPortalTransition] = useState(false);
    // 페이드 아웃 중인지
    const [isFadingOut, setIsFadingOut] = useState(false);
    // 장식 visible
    const [ornamentVisible, setOrnamentVisible] = useState(false);
    // 대기 메시지 인덱스 (0: 첫번째, 1: 두번째)
    const [waitingMsgIndex, setWaitingMsgIndex] = useState(0);

    // Refs
    const introMsgRef = useRef('');
    const waitingTimerRef = useRef(null);
    const transitionTriggeredRef = useRef(false);
    const typingTimerRef = useRef(null);

    // 인트로 메시지 설정 및 타이핑 시작
    useEffect(() => {
        if (isVisible && !introMsgRef.current) {
            introMsgRef.current = getRandomItem(INTRO_MESSAGES);
            setFullText(introMsgRef.current);
            setTextType('gold');
            setTypedText('');
            setIsTypingComplete(false);
            // 장식 먼저 fade in
            setTimeout(() => setOrnamentVisible(true), 100);
        }
    }, [isVisible]);

    // 타이핑 효과
    useEffect(() => {
        if (!fullText || typedText.length >= fullText.length) {
            if (fullText && typedText.length >= fullText.length) {
                setIsTypingComplete(true);
            }
            return;
        }

        // 현재 phase에 맞는 타이핑 속도
        const getTypingSpeed = () => {
            switch (phase) {
                case PHASES.INTRO: return TYPING_SPEED.INTRO;
                case PHASES.HOOK: return TYPING_SPEED.HOOK;
                case PHASES.FORESHADOW: return TYPING_SPEED.FORESHADOW;
                case PHASES.TITLE: return TYPING_SPEED.TITLE;
                case PHASES.VERDICT: return TYPING_SPEED.VERDICT;
                case PHASES.BREATHE: return TYPING_SPEED.BREATHE;
                case PHASES.FINAL: return TYPING_SPEED.FINAL;
                default: return 50;
            }
        };

        typingTimerRef.current = setTimeout(() => {
            setTypedText(fullText.slice(0, typedText.length + 1));
        }, getTypingSpeed());

        return () => {
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
        };
    }, [fullText, typedText, phase]);

    // 탭/클릭 핸들러 - 다음 단계로 이동
    const handleTap = useCallback((e) => {
        // 버튼 클릭은 제외
        if (e.target.closest('.result-button')) return;
        // 전환 중이면 무시
        if (isTransitioning) return;

        // 타이핑 중이면 즉시 완료
        if (!isTypingComplete && fullText) {
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
            setTypedText(fullText);
            setIsTypingComplete(true);
            return;
        }

        const goToNextPhase = (nextPhase, text, type = 'gold') => {
            setIsTransitioning(true);
            setOrnamentVisible(false);

            setTimeout(() => {
                setPhase(nextPhase);
                setFullText(text);
                setTypedText('');
                setTextType(type);
                setIsTypingComplete(false);
                setOrnamentVisible(true);
                setIsTransitioning(false);
            }, 400);
        };

        // 텍스트 suffix 추가 (hook/foreshadow에 ... 추가)
        const addSuffix = (text) => {
            if (!text) return text;
            
            // 이미 마침표나 ...나 !로 끝나면 추가 안함
            if (text.endsWith('...') || text.endsWith('.') || text.endsWith('!')) return text;
            return text + '...';
        };

        switch (phase) {
            case PHASES.INTRO:
                // hook이 있으면 hook으로, 없으면 대기
                if (streamingData.hook) {
                    goToNextPhase(PHASES.HOOK, addSuffix(streamingData.hook), 'gold');
                }
                break;

            case PHASES.HOOK:
                // foreshadow가 있으면 foreshadow로
                if (streamingData.foreshadow) {
                    goToNextPhase(PHASES.FORESHADOW, addSuffix(streamingData.foreshadow), 'purple');
                }
                break;

            case PHASES.FORESHADOW:
                // title이 있으면 title로 (AI가 이미 ./! 붙임)
                if (streamingData.title) {
                    goToNextPhase(PHASES.TITLE, streamingData.title, 'gold');
                }
                break;

            case PHASES.TITLE:
                // verdict가 있으면 verdict로
                if (streamingData.verdict) {
                    goToNextPhase(PHASES.VERDICT, streamingData.verdict, 'gold');
                }
                break;

            case PHASES.VERDICT:
                // 쉬어가는 단계로 (랜덤 context + body 조합)
                goToNextPhase(PHASES.BREATHE, getRandomBreatheMessage(), 'purple');
                break;

            case PHASES.BREATHE:
                // 마지막 메시지로
                goToNextPhase(PHASES.FINAL, '그럼 이제 리딩을 펼쳐볼까요?', 'gold');
                break;

            case PHASES.FINAL:
                // 이미지가 준비되었으면 결과 버튼 표시
                if (isImagesReady) {
                    setPhase(PHASES.READY);
                }
                break;

            default:
                break;
        }
    }, [phase, streamingData, isImagesReady, isTransitioning, isTypingComplete, fullText]);

    // 결과 보기 버튼 클릭
    const handleResultClick = useCallback(() => {
        if (transitionTriggeredRef.current) return;
        transitionTriggeredRef.current = true;

        // 포탈 전환 효과
        setIsPortalTransition(true);

        setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
                onTransitionComplete?.();
            }, 800);
        }, 600);
    }, [onTransitionComplete]);

    // 대기 메시지 순환 (FINAL phase에서 이미지 준비 안됐을 때)
    useEffect(() => {
        if (phase === PHASES.FINAL && isTypingComplete && !isImagesReady) {
            // 3초 후 두번째 메시지로
            waitingTimerRef.current = setTimeout(() => {
                setWaitingMsgIndex(1);
            }, 3000);
        }
        return () => {
            if (waitingTimerRef.current) {
                clearTimeout(waitingTimerRef.current);
            }
        };
    }, [phase, isTypingComplete, isImagesReady]);

    // 리셋
    useEffect(() => {
        if (isVisible) return;

        setPhase(PHASES.INTRO);
        setFullText('');
        setTypedText('');
        setTextType('gold');
        setIsTypingComplete(false);
        setIsTransitioning(false);
        setIsPortalTransition(false);
        setIsFadingOut(false);
        setOrnamentVisible(false);
        setWaitingMsgIndex(0);
        introMsgRef.current = '';
        transitionTriggeredRef.current = false;
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }
        if (waitingTimerRef.current) {
            clearTimeout(waitingTimerRef.current);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    // 다음 단계로 넘어갈 수 있는지 체크
    const canProceed = () => {
        if (!isTypingComplete) return false; // 타이핑 완료 후에만 진행 가능

        switch (phase) {
            case PHASES.INTRO:
                return !!streamingData.hook;
            case PHASES.HOOK:
                return !!streamingData.foreshadow;
            case PHASES.FORESHADOW:
                return !!streamingData.title;
            case PHASES.TITLE:
                return !!streamingData.verdict;
            case PHASES.VERDICT:
                return true;
            case PHASES.BREATHE:
                return true;
            case PHASES.FINAL:
                return isImagesReady;
            default:
                return false;
        }
    };

    // FINAL phase에서는 탭 힌트 없이 바로 버튼 표시
    const showTapHint = canProceed() && phase < PHASES.FINAL && !isTransitioning;
    // FINAL phase에서 타이핑 완료 + 이미지 준비되면 바로 버튼 표시
    const showResultButton = phase === PHASES.READY || (phase === PHASES.FINAL && isTypingComplete && isImagesReady);
    const isTyping = !isTypingComplete && typedText.length < fullText.length;

    return (
        <div
            className={`vn-intro-overlay ${isFadingOut ? 'fading-out' : ''} ${isPortalTransition ? 'portal-transition' : ''}`}
            onClick={handleTap}
        >
            {/* 배경 글로우 효과 */}
            <div className="vn-bg-glow" />
            <div className="vn-bg-glow secondary" />

            {/* 포탈 전환 효과 */}
            {isPortalTransition && (
                <div className="portal-effect">
                    <div className="portal-ring portal-ring-1" />
                    <div className="portal-ring portal-ring-2" />
                    <div className="portal-ring portal-ring-3" />
                    <div className="portal-center" />
                </div>
            )}

            {/* 메인 컨텐츠 */}
            <div className="vn-intro-content">
                <div className={`vn-ornament top ${ornamentVisible ? 'visible' : ''}`}>~ ✧ ~</div>

                <div className={`vn-hook ${ornamentVisible ? '' : 'hidden'}`}>
                    <p className={`vn-typing-text ${textType === 'purple' ? 'purple' : ''}`}>
                        {typedText}
                        {isTyping && <span className="vn-cursor">|</span>}
                    </p>
                </div>

                <div className={`vn-ornament bottom ${ornamentVisible ? 'visible' : ''}`}>~ ✧ ~</div>
            </div>

            {/* 하단 영역 */}
            {showResultButton ? (
                <div className="result-text-container" onClick={handleResultClick}>
                    <div className="result-sparkles">
                        <span className="sparkle s1">✦</span>
                        <span className="sparkle s2">✧</span>
                        <span className="sparkle s3">✦</span>
                        <span className="sparkle s4">✧</span>
                        <span className="sparkle s5">✦</span>
                        <span className="sparkle s6">✧</span>
                    </div>
                    <p className="result-text">리딩 펼치기</p>
                </div>
            ) : showTapHint ? (
                <p className="vn-continue-hint">탭하여 계속...</p>
            ) : (phase === PHASES.FINAL && isTypingComplete && !isImagesReady) ? (
                <p className="vn-waiting-hint" key={waitingMsgIndex}>
                    {waitingMsgIndex === 0
                        ? '✦ 조금만 기다려주세요...'
                        : '✦ 마지막 분석을 하고 있어요...'}
                </p>
            ) : null}
        </div>
    );
});

AnalysisOverlay.displayName = 'AnalysisOverlay';

export default AnalysisOverlay;
