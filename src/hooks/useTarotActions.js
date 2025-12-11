import { useRef, useEffect } from 'react';
import { TAROT_DECK } from '../utils/constants';

/**
 * 타로 관련 액션 훅
 */
export const useTarotActions = ({
    tarot,
    setTarotField,
    setCardReveal,
    setCardRevealField,
    setCurrentCard,
    setView,
    currentView, // 현재 view 상태
    setSavedDreamField,
    user,
    generateTarotReadingHook,
    // 로그인 필요 시 콜백
    onLoginRequired
}) => {
    // currentView의 최신 값을 ref로 추적 (클로저 이슈 해결)
    const currentViewRef = useRef(currentView);
    useEffect(() => {
        currentViewRef.current = currentView;
    }, [currentView]);
    // 레어카드 효과 트리거
    const triggerCardReveal = () => {
        setCardRevealField('mode', true);
        const particles = [];
        const colors = ['#ffd700', '#ff3366', '#9b59b6', '#1abc9c', '#fff'];
        for (let i = 0; i < 30; i++) {
            particles.push({
                id: i,
                x: 50,
                y: 50,
                tx: (Math.random() - 0.5) * 400,
                ty: (Math.random() - 0.5) * 400,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.3
            });
        }
        setCardRevealField('particles', particles);
        setTimeout(() => {
            setCardReveal({ mode: false, particles: [] });
        }, 2000);
    };

    // 타로 카드 선택 시작
    const startTarotSelection = () => {
        const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
        setTarotField('deck', shuffled);
        setTarotField('selectedCards', []);
        setTarotField('phase', 'selecting');
    };

    // 타로 카드 토글 선택
    const toggleTarotCard = (card) => {
        const isSelected = tarot.selectedCards.find(c => c.id === card.id);
        if (isSelected) {
            setTarotField('selectedCards', tarot.selectedCards.filter(c => c.id !== card.id));
        } else if (tarot.selectedCards.length < 3) {
            setTarotField('selectedCards', [...tarot.selectedCards, card]);
        }
    };

    // 타로 리딩 생성 (스트리밍 + Progressive UI 지원)
    const generateTarotReading = async () => {
        if (tarot.selectedCards.length !== 3 || !tarot.question.trim()) return;

        // 로그인 체크 - 비로그인 시 로그인 유도
        if (!user) {
            onLoginRequired?.();
            return;
        }

        setTarotField('phase', 'revealing'); // 로딩 애니메이션 표시
        setCurrentCard(0);

        // 저장 상태 초기화 - 저장 전 상태로 설정
        if (user) {
            setSavedDreamField('id', null);
            setSavedDreamField('isPublic', true); // 기본값 공개로 변경 (pSEO)
        }

        // 스트리밍 콜백 설정 (Progressive UI)
        // ⚠️ 뷰 전환은 AnalysisOverlay의 onTransitionComplete에서 처리
        let resultReady = false;
        const streamingCallbacks = {
            // Hook + 이미지 준비되면 결과 데이터 저장 (뷰 전환은 안 함)
            onHookReady: (partialResult) => {
                if (!resultReady) {
                    console.log('🚀 Hook ready - 결과 데이터 준비 완료 (버튼 클릭 대기)');
                    setTarotField('result', partialResult);
                    resultReady = true;
                }
            },
            // 부분 업데이트 시 결과 갱신
            onPartialUpdate: (partialResult) => {
                setTarotField('result', partialResult);
            },
            // 이미지 프롬프트 준비되면 (Phase 5에서 병렬 생성에 활용)
            onImagesReady: (images) => {
                console.log('🖼️ Images ready for parallel generation:', Object.keys(images));
            }
        };

        const resultData = await generateTarotReadingHook(
            tarot.question,
            tarot.selectedCards,
            streamingCallbacks
        );

        if (resultData) {
            // 최종 결과로 업데이트 (이미지 포함)
            setTarotField('result', resultData);
            // ⚠️ 뷰 전환은 AnalysisOverlay 버튼 클릭 시 onTransitionComplete에서 처리
        }
    };

    return {
        triggerCardReveal,
        startTarotSelection,
        toggleTarotCard,
        generateTarotReading
    };
};
