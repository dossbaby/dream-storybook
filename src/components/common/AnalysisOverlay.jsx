import { useState, useEffect, memo, useRef } from 'react';
import './AnalysisOverlay.css';

/**
 * AnalysisOverlay - 전체 화면 분석 오버레이
 *
 * VN Intro 스타일과 통일:
 * - 상단: 도파민 메시지 (리디바탕, 금색/보라 번갈아가며)
 * - 중앙: Pulsing circle + 단계별 이모지 (glacial blue/purple)
 * - 하단: 단계 circle + 안내 텍스트
 */

// 단계별 이모지와 색상
const PHASE_CONFIG = [
    { emoji: '🌙', colors: ['#9b59b6', '#6c5ce7'], label: '질문을 읽고 있어요' },
    { emoji: '🔮', colors: ['#667eea', '#764ba2'], label: '카드를 해석하고 있어요' },
    { emoji: '✨', colors: ['#00d9ff', '#9b59b6'], label: '통찰을 찾고 있어요' },
    { emoji: '🌌', colors: ['#a29bfe', '#6c5ce7'], label: '메시지를 정리하고 있어요' },
    { emoji: '💫', colors: ['#ffd700', '#9b59b6'], label: '결과를 준비하고 있어요' },
];

const AnalysisOverlay = memo(({
    isVisible,
    mode = 'tarot', // 'dream' | 'tarot' | 'fortune'
    currentMessage = '',
    isComplete = false,
    phase = 1 // 1: Hook, 2: 순환, 3: 완료
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [stars, setStars] = useState([]);
    const [textColorIndex, setTextColorIndex] = useState(0); // 0: gold, 1: purple 번갈아
    const [currentStage, setCurrentStage] = useState(0); // 0-4 단계
    const prevMessageRef = useRef('');

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

    // 단계 자동 진행 (8초마다)
    useEffect(() => {
        if (!isVisible || isComplete) return;

        const stageInterval = setInterval(() => {
            setCurrentStage(prev => (prev + 1) % PHASE_CONFIG.length);
        }, 8000);

        return () => clearInterval(stageInterval);
    }, [isVisible, isComplete]);

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
            setCurrentStage(PHASE_CONFIG.length - 1);
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

            {/* 하단 안내 텍스트 - VN 스타일 opacity */}
            <div className="analysis-bottom-hint">
                <span>{isComplete ? '결과를 준비하고 있어요...' : currentConfig.label}</span>
            </div>
        </div>
    );
});

AnalysisOverlay.displayName = 'AnalysisOverlay';

export default AnalysisOverlay;
