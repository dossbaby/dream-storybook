import { useState, useCallback } from 'react';

// 분석 애니메이션 훅 - 모든 모드에서 공통으로 사용
export const useAnalysisAnimation = () => {
    const [analysisPhase, setAnalysisPhase] = useState(0);
    const [progress, setProgress] = useState('');
    const [dopaminePopup, setDopaminePopup] = useState(null);

    // 도파민 자극 힌트 메시지
    const DOPAMINE_HINTS = [
        { emoji: '💕', text: '연애운이 감지되고 있어요...', category: 'love' },
        { emoji: '💰', text: '재물운의 기운이 느껴져요...', category: 'money' },
        { emoji: '💼', text: '직장운에 변화가 보여요...', category: 'career' },
        { emoji: '✨', text: '행운의 조짐이 나타나고 있어요...', category: 'luck' },
        { emoji: '🔮', text: '숨겨진 운명이 드러나려 해요...', category: 'destiny' },
        { emoji: '💫', text: '특별한 인연의 기운이...', category: 'relationship' },
        { emoji: '🌟', text: '성공의 기회가 엿보여요...', category: 'success' },
        { emoji: '💝', text: '누군가 당신을 생각하고 있어요...', category: 'romance' },
    ];

    // 애니메이션 시퀀스 실행
    const runAnimationSequence = useCallback(async (messages, showDopamineAt = [1, 3]) => {
        for (let i = 0; i < messages.length; i++) {
            setAnalysisPhase(i + 1);
            setProgress(messages[i]);

            // 도파민 팝업 표시
            if (showDopamineAt.includes(i)) {
                const randomHint = DOPAMINE_HINTS[Math.floor(Math.random() * DOPAMINE_HINTS.length)];
                setDopaminePopup(randomHint);
                setTimeout(() => setDopaminePopup(null), 1800);
            }

            await new Promise(r => setTimeout(r, 2000));
        }
    }, []);

    // 이미지 생성 진행 메시지 설정
    const setImageProgress = useCallback((phase, message) => {
        setAnalysisPhase(phase);
        setProgress(message);
    }, []);

    // 초기화
    const reset = useCallback(() => {
        setAnalysisPhase(0);
        setProgress('');
        setDopaminePopup(null);
    }, []);

    return {
        analysisPhase,
        progress,
        dopaminePopup,
        runAnimationSequence,
        setImageProgress,
        reset,
        setProgress,
        setAnalysisPhase
    };
};
