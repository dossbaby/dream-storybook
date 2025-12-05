import { collection, getDocs, query, orderBy, limit, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 꿈 관련 액션 훅 (좋아요, 심볼 필터링, 상세 보기 등)
 */
export const useDreamActions = ({
    user,
    dreams,
    selectedDream,
    setSelectedDream,
    setDetailedReadingField,
    setLoadingState,
    setCurrentCard,
    setView,
    loadInterpretations,
    setFilter,
    setMode
}) => {
    // 상징 클릭 시 피드에서 필터링
    const filterBySymbol = (symbol) => {
        // 꿈 모드로 전환하고 피드 뷰로 이동
        setMode?.('dream');
        setView('feed');
        // 키워드 필터 설정
        setFilter?.('keyword', symbol);
    };

    // 좋아요 토글
    const toggleLike = async (dreamId) => {
        if (!user) { alert('로그인이 필요해요'); return; }
        const dreamRef = doc(db, 'dreams', dreamId);
        const dream = selectedDream || dreams.find(d => d.id === dreamId);
        if (!dream) return;

        const alreadyLiked = dream.likes?.includes(user.uid);
        try {
            if (alreadyLiked) {
                await updateDoc(dreamRef, {
                    likes: arrayRemove(user.uid),
                    likeCount: Math.max((dream.likeCount || 1) - 1, 0)
                });
            } else {
                await updateDoc(dreamRef, {
                    likes: arrayUnion(user.uid),
                    likeCount: (dream.likeCount || 0) + 1
                });
            }
        } catch (err) { console.error(err); }
    };

    // 꿈 상세 보기
    const openDreamDetail = (dream) => {
        setSelectedDream(dream);
        setCurrentCard(0);
        setView('detail');
        loadInterpretations(dream.id);
    };

    // 상세 풀이 보기 (이미 생성된 분석만 표시, API 재호출 없음)
    // 꿈 모드: detailedAnalysis, 타로 모드: storyReading 사용
    const generateDetailedReading = (data, mode = 'dream') => {
        if (!data) return;

        // 타로 모드 - storyReading 사용
        if (mode === 'tarot' || data.storyReading) {
            const storyReading = data.storyReading || {};

            if (storyReading.card1Analysis || storyReading.synthesis) {
                // storyReading이 있으면 상세 분석으로 변환
                const cards = data.cards || [];
                const card1 = cards[0];
                const card2 = cards[1];
                const card3 = cards[2];
                const card4 = cards[3];

                // 카드 정보 포맷팅 (이름 + 이모지)
                const formatCardTitle = (card, defaultName) => {
                    if (!card) return defaultName;
                    const name = card.name_ko || card.nameKo || card.name || defaultName;
                    const emoji = card.emoji || '';
                    return `${emoji} ${name}`;
                };

                // 길이를 2배로 늘리기 위해 추가 설명 포함
                const tarotDetailedAnalysis = `🔮 타로 카드 상세 해석

✨ 첫 번째 카드: ${formatCardTitle(card1, '첫 번째 카드')}

${storyReading.card1Analysis || ''}

이 카드는 당신의 질문에 대한 현재 상황과 에너지를 나타냅니다. 카드가 전달하는 메시지에 집중해보세요.

🌙 두 번째 카드: ${formatCardTitle(card2, '두 번째 카드')}

${storyReading.card2Analysis || ''}

두 번째 카드는 당신이 직면한 도전이나 기회를 보여줍니다. 이 에너지가 어떻게 작용하는지 느껴보세요.

⭐ 세 번째 카드: ${formatCardTitle(card3, '세 번째 카드')}

${storyReading.card3Analysis || ''}

세 번째 카드는 앞으로의 방향성과 잠재적 결과를 암시합니다. 이 카드의 조언을 마음에 새겨두세요.

💫 결론 카드: ${formatCardTitle(card4, '결론 카드')}

${storyReading.conclusionCard || ''}

결론 카드는 전체 리딩을 아우르는 핵심 메시지입니다. 모든 카드의 에너지가 이 카드로 수렴합니다.

─────────────────────

🌟 종합 해석

${storyReading.synthesis || ''}

네 장의 카드가 함께 전달하는 메시지를 종합적으로 이해해보세요. 각 카드는 서로 연결되어 더 깊은 통찰을 제공합니다.

💡 실천 조언

${storyReading.actionAdvice || ''}

이 조언을 일상에서 실천해보세요. 작은 행동 하나가 큰 변화의 시작이 될 수 있습니다.`;

                setDetailedReadingField('content', {
                    ...data,
                    detailedAnalysis: tarotDetailedAnalysis
                });
                setDetailedReadingField('show', true);
                setLoadingState('detailedReading', false);
                return;
            }
        }

        // 꿈 모드 - 이미 상세 분석이 있으면 바로 표시
        if (data.detailedAnalysis) {
            setDetailedReadingField('content', data);
            setDetailedReadingField('show', true);
            setLoadingState('detailedReading', false);
            return;
        }

        // 상세 분석이 없으면 기존 reading 데이터로 간략한 분석 표시 (API 호출 없음)
        // reading이 객체인 경우 문자열로 변환
        const readingText = typeof data.reading === 'object' && data.reading !== null
            ? Object.entries(data.reading).map(([key, val]) => `${key}: ${val}`).join('\n')
            : (data.reading || '꿈의 의미를 분석한 내용입니다.');

        // keywords의 surface/hidden 사용
        const keywordsText = data.keywords?.map(k =>
            `**${k.word}** - ${k.surface || k.hidden || ''}`
        ).join('\n\n') || '';

        const fallbackAnalysis = `## 🌙 꿈의 메시지

${readingText}

## 🔮 핵심 키워드

${keywordsText}

## 💫 꿈의 결론

${data.dreamMeaning?.summary || ''} ${data.dreamMeaning?.detail || ''}

## ✨ 타로 해석

${data.tarot?.name ? `**${data.tarot.name}** - ${data.tarot.meaning}` : ''}`;

        setDetailedReadingField('content', {
            ...data,
            detailedAnalysis: fallbackAnalysis
        });
        setDetailedReadingField('show', true);
        setLoadingState('detailedReading', false);
    };

    return {
        filterBySymbol,
        toggleLike,
        openDreamDetail,
        generateDetailedReading
    };
};
