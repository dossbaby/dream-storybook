import { useState, useEffect, memo, useRef } from 'react';
import './AnalysisOverlay.css';

/**
 * AnalysisOverlay - 전체 화면 분석 오버레이
 *
 * VN Intro 스타일과 통일:
 * - 상단: 도파민 메시지 (리디바탕, 금색/보라 번갈아가며)
 * - 중앙: Pulsing circle + 단계별 이모지 (glacial blue/purple)
 * - 하단: 실시간 진행률 + 단계 circle + 안내 텍스트
 */

// 단계별 이모지와 색상 (analysisPhase 1-8에 매핑) - 더 신비로운 메시지
// 1: 시작, 2-5: 분석, 6: API완료, 7: 이미지생성, 8: 완료
const PHASE_CONFIG = [
    { emoji: '🌙', colors: ['#9b59b6', '#6c5ce7'], label: '운명의 실이 엮이고 있어요' },           // analysisPhase 1-2
    { emoji: '🔮', colors: ['#667eea', '#764ba2'], label: '카드가 당신의 이야기를 읽고 있어요' },  // analysisPhase 3-5
    { emoji: '✨', colors: ['#00d9ff', '#9b59b6'], label: '우주가 답을 속삭이고 있어요' },         // analysisPhase 6
    { emoji: '🎨', colors: ['#a29bfe', '#6c5ce7'], label: '당신의 운명이 그림으로 피어나요' },     // analysisPhase 7
    { emoji: '💫', colors: ['#ffd700', '#9b59b6'], label: '별들이 마지막 축복을 내려요' },         // analysisPhase 8
];

// analysisPhase(1-8)를 circle stage(0-4)로 매핑
const mapPhaseToStage = (analysisPhase) => {
    if (analysisPhase <= 2) return 0;  // 질문 읽기
    if (analysisPhase <= 5) return 1;  // 카드 해석
    if (analysisPhase === 6) return 2; // 통찰 정리
    if (analysisPhase === 7) return 3; // 이미지 생성
    return 4; // 완료
};

const AnalysisOverlay = memo(({
    isVisible,
    mode = 'tarot', // 'dream' | 'tarot' | 'fortune'
    currentMessage = '',
    isComplete = false,
    phase = 1, // 1: Hook, 2: 순환, 3: 완료
    analysisPhase = 1, // 실제 분석 단계 (1-8)
    smoothProgress = 0, // 부드러운 진행률 (0-100)
    isProgressComplete = false, // 진행 완료 여부
    onBrowseWhileWaiting // "분석이 끝나면 알림받기" 콜백
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [stars, setStars] = useState([]);
    const [textColorIndex, setTextColorIndex] = useState(0); // 0: gold, 1: purple 번갈아
    const prevMessageRef = useRef('');

    // analysisPhase를 기반으로 currentStage 계산
    const currentStage = mapPhaseToStage(analysisPhase);

    // 별 생성 (카드 선택 화면과 유사)
    useEffect(() => {
        if (!isVisible) return;

        const newStars = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 4,
            duration: 2 + Math.random() * 3,
            size: 1 + Math.random() * 3
        }));
        setStars(newStars);
    }, [isVisible]);

    // 단계는 analysisPhase prop에 의해 자동 계산됨 (mapPhaseToStage)
    // 자동 진행 로직 제거 - 실제 분석 단계와 연동

    // 타이프라이터 효과
    useEffect(() => {
        if (!currentMessage || currentMessage === prevMessageRef.current) return;

        // 새 메시지 시작 - 페이드 아웃 후 타이핑
        setIsFading(true);
        // 메시지 바뀔 때마다 색상 번갈아
        setTextColorIndex(prev => (prev + 1) % 2);

        const fadeTimeout = setTimeout(() => {
            prevMessageRef.current = currentMessage;
            setDisplayText('');
            setIsFading(false);
            setIsTyping(true);

            let charIndex = 0;
            const typeInterval = setInterval(() => {
                if (charIndex < currentMessage.length) {
                    setDisplayText(currentMessage.slice(0, charIndex + 1));
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    setIsTyping(false);
                }
            }, 45); // 45ms per character

            return () => clearInterval(typeInterval);
        }, 250); // 페이드 아웃 시간

        return () => clearTimeout(fadeTimeout);
    }, [currentMessage]);

    // 완료 상태 처리
    useEffect(() => {
        if (isComplete) {
            setDisplayText('거의 다 됐어요... 결과를 정리하고 있어요');
            setIsTyping(false);
        }
    }, [isComplete]);

    if (!isVisible) return null;

    const currentConfig = PHASE_CONFIG[currentStage];
    const [primaryColor, secondaryColor] = currentConfig.colors;

    return (
        <div
            className="analysis-overlay"
            style={{
                '--primary-color': primaryColor,
                '--secondary-color': secondaryColor
            }}
        >
            {/* 배경 별 효과 */}
            <div className="analysis-stars">
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="analysis-star"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            animationDelay: `${star.delay}s`,
                            animationDuration: `${star.duration}s`,
                            width: `${star.size}px`,
                            height: `${star.size}px`
                        }}
                    />
                ))}
            </div>

            {/* 플로팅 버블 효과 */}
            <div className="analysis-bubbles">
                <div className="bubble bubble-1" />
                <div className="bubble bubble-2" />
                <div className="bubble bubble-3" />
                <div className="bubble bubble-4" />
                <div className="bubble bubble-5" />
            </div>

            {/* 상단 도파민 메시지 - VN Intro 스타일 */}
            <div className="analysis-top-message">
                {/* 상단 장식 - VN 스타일 */}
                <div className="vn-ornament-analysis">~ ✦ ~</div>

                <div className={`dopamine-text ${isFading ? 'fading' : ''} ${textColorIndex === 0 ? 'gold-text' : 'purple-text'}`}>
                    <span className="message-content">{displayText}</span>
                    {isTyping && <span className="typing-cursor">|</span>}
                </div>

                {/* 하단 장식 - VN 스타일 */}
                <div className="vn-ornament-analysis bottom">~ ✦ ~</div>
            </div>

            {/* 중앙 Pulsing Circle - Glacial Blue/Purple */}
            <div className="analysis-center">
                <div className="pulsing-orb">
                    <div className="orb-ring ring-1" />
                    <div className="orb-ring ring-2" />
                    <div className="orb-ring ring-3" />
                    <div className="orb-core">
                        <span className="orb-emoji" key={currentStage}>{currentConfig.emoji}</span>
                    </div>
                </div>
            </div>

            {/* 단계 Circle들 */}
            <div className="analysis-stages">
                {PHASE_CONFIG.map((config, i) => (
                    <div
                        key={i}
                        className={`stage-dot ${i === currentStage ? 'active' : ''} ${i < currentStage ? 'completed' : ''}`}
                    />
                ))}
            </div>

            {/* 하단 안내 텍스트 - 실시간 진행률 표시 */}
            <div className="analysis-bottom-hint">
                <span className="hint-label">
                    {isProgressComplete ? '✨ 분석 완료' : currentConfig.label}
                </span>
                {/* 진행률 % 표시 - 100% 완료 시 숨김 */}
                {!isProgressComplete && smoothProgress < 100 && (
                    <span className="hint-progress">
                        {smoothProgress}%
                    </span>
                )}
            </div>

            {/* 소요 시간 안내 서브타이틀 */}
            {!isProgressComplete && (
                <div className="analysis-subtitle">
                    AI가 정밀하게 해석 중이에요 · 최대 3분 소요
                </div>
            )}

            {/* 분석이 끝나면 알림받기 버튼 */}
            {onBrowseWhileWaiting && !isComplete && (
                <button className="browse-while-waiting-btn" onClick={onBrowseWhileWaiting}>
                    <span className="btn-icon">🔔</span>
                    <span className="btn-text">분석이 끝나면 알림받기</span>
                </button>
            )}
        </div>
    );
});

AnalysisOverlay.displayName = 'AnalysisOverlay';

export default AnalysisOverlay;
