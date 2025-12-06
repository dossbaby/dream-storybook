import { useState, useEffect, memo } from 'react';

// 로딩 중 표시할 재미있는 메시지들
const LOADING_MESSAGES = {
    dream: [
        '꿈의 조각을 모으는 중...',
        '무의식의 문을 여는 중...',
        '별빛으로 해석하는 중...',
        '숨겨진 의미를 찾는 중...',
        '운명의 실타래를 푸는 중...'
    ],
    tarot: [
        '카드를 섞는 중...',
        '운명의 배치를 읽는 중...',
        '별자리와 연결하는 중...',
        '숨겨진 메시지를 해독 중...',
        '과거와 미래를 잇는 중...'
    ],
    fortune: [
        '오늘의 기운을 읽는 중...',
        '행운의 시간을 계산 중...',
        '별의 움직임을 추적 중...',
        '운명의 흐름을 분석 중...',
        '특별한 순간을 찾는 중...'
    ]
};

// 로딩 팁 메시지
const LOADING_TIPS = [
    '💡 알고 계셨나요? 같은 꿈이라도 감정에 따라 의미가 달라요',
    '🌟 Tip: 꿈을 꾼 직후 기록하면 더 정확한 해몽이 가능해요',
    '🔮 Tip: 반복되는 꿈은 특별한 메시지를 담고 있어요',
    '✨ Tip: 타로는 질문이 구체적일수록 정확해요',
    '🌙 Tip: 새벽에 꾸는 꿈이 예지력이 높다고 해요'
];

const LoadingOverlay = memo(({ isVisible, phase, progress, mode = 'dream' }) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);
    const [particles, setParticles] = useState([]);

    // 메시지 순환
    useEffect(() => {
        if (!isVisible) return;

        const messages = LOADING_MESSAGES[mode] || LOADING_MESSAGES.dream;
        const interval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % messages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [isVisible, mode]);

    // 팁 순환
    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isVisible]);

    // 파티클 생성
    useEffect(() => {
        if (!isVisible) return;

        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 3 + Math.random() * 2,
            size: 2 + Math.random() * 4
        }));
        setParticles(newParticles);
    }, [isVisible]);

    if (!isVisible) return null;

    const messages = LOADING_MESSAGES[mode] || LOADING_MESSAGES.dream;
    const currentMessage = messages[messageIndex];

    const getPhaseIcon = () => {
        const icons = ['🔮', '📖', '🎨', '🃏', '✨', '🌟', '💫'];
        return icons[Math.min(phase, icons.length - 1)] || '🔮';
    };

    const getModeColor = () => {
        switch (mode) {
            case 'tarot': return 'rgba(155, 89, 182, 0.8)';
            case 'fortune': return 'rgba(26, 188, 156, 0.8)';
            default: return 'rgba(108, 92, 231, 0.8)';
        }
    };

    return (
        <div className="loading-overlay-enhanced">
            {/* 배경 파티클 */}
            <div className="loading-particles">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="loading-particle"
                        style={{
                            left: `${p.left}%`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            '--particle-color': getModeColor()
                        }}
                    />
                ))}
            </div>

            {/* 메인 로딩 애니메이션 */}
            <div className="analysis-animation enhanced">
                <div className="analysis-circle" style={{ '--mode-color': getModeColor() }}>
                    {/* 회전하는 링들 */}
                    <div className={`analysis-ring ${phase >= 1 ? 'active' : ''}`}></div>
                    <div className={`analysis-ring ring-2 ${phase >= 2 ? 'active' : ''}`}></div>
                    <div className={`analysis-ring ring-3 ${phase >= 3 ? 'active' : ''}`}></div>

                    {/* 추가 장식 링 */}
                    <div className="analysis-ring ring-outer"></div>
                    <div className="analysis-ring ring-pulse"></div>

                    {/* 코어 아이콘 */}
                    <div className="analysis-core">
                        <span className="core-icon">{getPhaseIcon()}</span>
                    </div>
                </div>

                {/* 메인 진행 메시지 */}
                <div className="analysis-text">{progress}</div>

                {/* 서브 메시지 (순환) */}
                <div className="analysis-sub-message">
                    <span key={messageIndex} className="fade-message">{currentMessage}</span>
                </div>

                {/* 진행 단계 표시 */}
                <div className="analysis-phases enhanced">
                    {[1, 2, 3, 4, 5, 6, 7].map(p => (
                        <div
                            key={p}
                            className={`phase-dot ${phase >= p ? 'active' : ''} ${phase === p ? 'current' : ''}`}
                            style={{ '--phase-delay': `${p * 0.1}s` }}
                        />
                    ))}
                </div>

                {/* 프로그레스 바 */}
                <div className="loading-progress-bar">
                    <div
                        className="loading-progress-fill"
                        style={{
                            width: `${Math.min((phase / 7) * 100, 100)}%`,
                            background: `linear-gradient(90deg, ${getModeColor()}, transparent)`
                        }}
                    />
                </div>
            </div>

            {/* 하단 팁 */}
            <div className="loading-tip">
                <span key={tipIndex} className="tip-text fade-message">{LOADING_TIPS[tipIndex]}</span>
            </div>
        </div>
    );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export default LoadingOverlay;
