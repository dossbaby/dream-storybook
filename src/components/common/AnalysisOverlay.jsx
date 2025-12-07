import { useState, useEffect, memo, useRef } from 'react';
import './AnalysisOverlay.css';

/**
 * AnalysisOverlay - 전체 화면 분석 오버레이
 *
 * 도파민 메시지 시스템:
 * - 질문 기반 메시지가 타이프라이터 효과로 표시
 * - 페이드 인/아웃 전환
 * - 감정 구문 상단 표시
 * - 진행률 표시
 */
const AnalysisOverlay = memo(({
    isVisible,
    mode = 'tarot', // 'dream' | 'tarot' | 'fortune'
    emotionPhrase = '',
    currentMessage = '',
    messageIndex = 0,
    totalMessages = 0,
    isComplete = false,
    progress = 0
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [particles, setParticles] = useState([]);
    const prevMessageRef = useRef('');

    // 파티클 생성
    useEffect(() => {
        if (!isVisible) return;

        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 3,
            size: 2 + Math.random() * 4,
            opacity: 0.3 + Math.random() * 0.5
        }));
        setParticles(newParticles);
    }, [isVisible]);

    // 타이프라이터 효과
    useEffect(() => {
        if (!currentMessage || currentMessage === prevMessageRef.current) return;

        // 새 메시지 시작 - 페이드 아웃 후 타이핑
        setIsFading(true);

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
            }, 50); // 50ms per character

            return () => clearInterval(typeInterval);
        }, 300); // 페이드 아웃 시간

        return () => clearTimeout(fadeTimeout);
    }, [currentMessage]);

    // 완료 상태 처리
    useEffect(() => {
        if (isComplete) {
            setDisplayText('분석이 완료되었어요!');
            setIsTyping(false);
        }
    }, [isComplete]);

    if (!isVisible) return null;

    const getModeGradient = () => {
        switch (mode) {
            case 'tarot':
                return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
            case 'fortune':
                return 'linear-gradient(135deg, #1a1a2e 0%, #0d2137 50%, #1a4a5e 100%)';
            case 'dream':
            default:
                return 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a3e 100%)';
        }
    };

    const getModeAccent = () => {
        switch (mode) {
            case 'tarot': return '#9b59b6';
            case 'fortune': return '#1abc9c';
            case 'dream':
            default: return '#6c5ce7';
        }
    };

    const getModeEmoji = () => {
        switch (mode) {
            case 'tarot': return '🔮';
            case 'fortune': return '☯️';
            case 'dream':
            default: return '🌙';
        }
    };

    return (
        <div
            className="analysis-overlay"
            style={{ '--mode-gradient': getModeGradient(), '--mode-accent': getModeAccent() }}
        >
            {/* 배경 파티클 */}
            <div className="analysis-particles">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="analysis-particle"
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            opacity: p.opacity
                        }}
                    />
                ))}
            </div>

            {/* 중앙 컨텐츠 */}
            <div className="analysis-content">
                {/* 상단 감정 구문 */}
                {emotionPhrase && (
                    <div className="analysis-emotion">
                        <span className="emotion-emoji">{getModeEmoji()}</span>
                        <span className="emotion-text">{emotionPhrase}</span>
                    </div>
                )}

                {/* 메인 메시지 영역 */}
                <div className={`analysis-message-container ${isFading ? 'fading' : ''}`}>
                    <div className="analysis-message">
                        <span className="message-text">{displayText}</span>
                        {isTyping && <span className="typing-cursor">|</span>}
                    </div>
                </div>

                {/* 진행률 표시 */}
                <div className="analysis-progress-container">
                    <div className="analysis-progress-bar">
                        <div
                            className="analysis-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="analysis-progress-text">
                        {isComplete ? (
                            <span className="complete-text">분석 완료!</span>
                        ) : (
                            <span>{messageIndex + 1} / {totalMessages}</span>
                        )}
                    </div>
                </div>

                {/* 하단 안내 */}
                <div className="analysis-hint">
                    {isComplete ? (
                        <span>결과를 준비하고 있어요...</span>
                    ) : (
                        <span>당신의 질문을 깊이 분석하고 있어요</span>
                    )}
                </div>
            </div>

            {/* 장식 요소들 */}
            <div className="analysis-decoration top-left" />
            <div className="analysis-decoration top-right" />
            <div className="analysis-decoration bottom-left" />
            <div className="analysis-decoration bottom-right" />
        </div>
    );
});

AnalysisOverlay.displayName = 'AnalysisOverlay';

export default AnalysisOverlay;
