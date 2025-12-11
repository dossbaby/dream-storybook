import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 부드러운 진행률 훅 - 타로 오버레이용 (Hero+Card1 전환까지 ~30초)
 *
 * Phase 1: Claude 스트리밍 시작 (0-15%, ~5초)
 * Phase 2: Keywords/Style 파싱 (15-30%, ~5초)
 * Phase 3: Hero 이미지 생성 중 (30-55%, ~8초)
 * Phase 4: Card1 분석 + 이미지 (55-85%, ~10초)
 * Phase 5: 전환 준비 (85-98%, ~7초)
 * Complete: 100%
 */
export const useSmoothProgress = () => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const animationRef = useRef(null);
    const startTimeRef = useRef(null);
    const currentStageRef = useRef(0);

    // 5단계 진행률 (오버레이용 - Hero+Card1 전환까지)
    const STAGE_CONFIG = {
        0: { start: 0, end: 0, duration: 0 },
        1: { start: 0, end: 15, duration: 5 },      // Claude 시작
        2: { start: 15, end: 30, duration: 5 },     // Keywords/Style
        3: { start: 30, end: 55, duration: 8 },     // Hero 이미지 생성
        4: { start: 55, end: 85, duration: 10 },    // Card1 분석+이미지
        5: { start: 85, end: 98, duration: 7 },     // 전환 준비
    };

    // 진행률 애니메이션
    const animateProgress = useCallback((stage) => {
        const config = STAGE_CONFIG[stage];
        if (!config) return;

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const startProgress = config.start;
        const endProgress = config.end;
        const duration = config.duration * 1000;
        startTimeRef.current = Date.now();
        currentStageRef.current = stage;

        setProgress(startProgress);

        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const rawProgress = elapsed / duration;

            // easeOutQuad
            const eased = 1 - Math.pow(1 - Math.min(rawProgress, 1), 2);
            const currentProgress = startProgress + (endProgress - startProgress) * eased;

            setProgress(Math.min(currentProgress, endProgress));

            if (rawProgress < 1 && currentStageRef.current === stage) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, []);

    // 단계 업데이트
    const updateStage = useCallback((stage) => {
        // 완료 시
        if (stage >= 100) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            setProgress(100);
            setIsComplete(true);
            return;
        }

        // 1-5 단계
        if (stage >= 1 && stage <= 5) {
            setIsComplete(false);
            animateProgress(stage);
        }
    }, [animateProgress]);

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
        reset
    };
};
