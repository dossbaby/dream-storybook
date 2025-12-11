import { useState, useCallback } from 'react';

// 분석 애니메이션 훅 - 모든 모드에서 공통으로 사용
// Note: 도파민 메시지는 useDopamineMessages.js에서 Haiku/Sonnet으로 생성
export const useAnalysisAnimation = () => {
    const [analysisPhase, setAnalysisPhase] = useState(0);
    const [progress, setProgress] = useState('');
    const [dopaminePopup, setDopaminePopup] = useState(null);

    // 애니메이션 시퀀스 실행
    const runAnimationSequence = useCallback(async (messages) => {
        for (let i = 0; i < messages.length; i++) {
            setAnalysisPhase(i + 1);
            setProgress(messages[i]);
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
