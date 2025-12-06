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
    setSavedDreamField,
    user,
    generateTarotReadingHook
}) => {
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

    // 타로 리딩 생성
    const generateTarotReading = async () => {
        if (tarot.selectedCards.length !== 3 || !tarot.question.trim()) return;
        setTarotField('phase', 'revealing'); // 로딩 애니메이션 표시
        setCurrentCard(0);

        // 저장 상태 초기화 - 저장 전 상태로 설정
        if (user) {
            setSavedDreamField('id', null);
            setSavedDreamField('isPublic', true); // 기본값 공개로 변경 (pSEO)
        }

        const resultData = await generateTarotReadingHook(tarot.question, tarot.selectedCards);
        if (resultData) {
            setTarotField('result', resultData);
            setView('tarot-result');  // 바로 TarotResultView로 이동 (모달 없이 full reading)
            // 저장은 useReading.js에서 자동으로 처리됨
        }
    };

    return {
        triggerCardReveal,
        startTarotSelection,
        toggleTarotCard,
        generateTarotReading
    };
};
