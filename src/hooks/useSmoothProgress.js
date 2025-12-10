import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 부드러운 진행률 훅
 *
 * 단계별 예상 시간을 기반으로 0-100%까지 부드럽게 진행
 * 실제 단계가 변경되면 해당 단계의 시작점으로 즉시 이동 후 부드럽게 진행
 */
export const useSmoothProgress = () => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const animationRef = useRef(null);
    const startTimeRef = useRef(null);
    const currentStageRef = useRef(0);

    // 단계별 진행률 범위와 예상 소요 시간 (초)
    // 총 8단계: 1-5 애니메이션, 6 API, 7 이미지, 8 완료
    const STAGE_CONFIG = {
        0: { start: 0, end: 0, duration: 0 },
        1: { start: 0, end: 8, duration: 2 },      // 애니메이션 1
        2: { start: 8, end: 16, duration: 2 },     // 애니메이션 2
        3: { start: 16, end: 24, duration: 2 },    // 애니메이션 3
        4: { start: 24, end: 32, duration: 2 },    // 애니메이션 4
        5: { start: 32, end: 40, duration: 2 },    // 애니메이션 5
        6: { start: 40, end: 75, duration: 120 },  // API 호출 (2분 예상, 40-75%)
        7: { start: 75, end: 98, duration: 60 },   // 이미지 생성 (1분 예상, 75-98%)
        8: { start: 98, end: 100, duration: 1 },   // 완료
    };

    // 진행률 애니메이션 시작
    const animateProgress = useCallback((stage) => {
        const config = STAGE_CONFIG[stage];
        if (!config) return;

        // 이전 애니메이션 취소
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const startProgress = config.start;
        const endProgress = config.end;
        const duration = config.duration * 1000; // ms로 변환
        startTimeRef.current = Date.now();
        currentStageRef.current = stage;

        // 시작점으로 즉시 이동
        setProgress(startProgress);

        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const rawProgress = elapsed / duration;

            // easeOutQuad for smooth deceleration
            const eased = 1 - Math.pow(1 - Math.min(rawProgress, 1), 2);
            const currentProgress = startProgress + (endProgress - startProgress) * eased;

            setProgress(Math.min(currentProgress, endProgress));

            // 아직 끝나지 않았고 현재 단계가 변경되지 않았으면 계속
            if (rawProgress < 1 && currentStageRef.current === stage) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, []);

    // 단계 업데이트 함수 (외부에서 호출)
    const updateStage = useCallback((stage) => {
        if (stage === 8) {
            // 완료 단계
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            setProgress(100);
            setIsComplete(true);
        } else {
            setIsComplete(false);
            animateProgress(stage);
        }
    }, [animateProgress]);

    // 이미지 생성 진행률 (7단계에서 세부 진행률)
    const updateImageProgress = useCallback((current, total) => {
        if (currentStageRef.current !== 7) return;

        const config = STAGE_CONFIG[7];
        const imageProgress = total > 0 ? current / total : 0;
        const newProgress = config.start + (config.end - config.start) * imageProgress;

        setProgress(newProgress);
    }, []);

    // 리셋
    const reset = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setProgress(0);
        setIsComplete(false);
        currentStageRef.current = 0;
        startTimeRef.current = null;
    }, []);

    // 정리
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return {
        progress: Math.round(progress),
        isComplete,
        updateStage,
        updateImageProgress,
        reset
    };
};
