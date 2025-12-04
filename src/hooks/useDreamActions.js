import { collection, getDocs, query, orderBy, limit, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 꿈 관련 액션 훅 (좋아요, 상징 쇼츠, 상세 보기 등)
 */
export const useDreamActions = ({
    user,
    dreams,
    selectedDream,
    setSelectedDream,
    symbolShorts,
    setSymbolShortsField,
    setDetailedReadingField,
    setLoadingState,
    setCurrentCard,
    setView,
    loadInterpretations
}) => {
    // 상징 클릭 시 관련 꿈 쇼츠 뷰 열기
    const openSymbolShorts = async (symbol) => {
        setSymbolShortsField('view', symbol);
        setSymbolShortsField('currentIndex', 0);
        try {
            const q = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            const related = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(d => d.isPublic && d.keywords?.some(k => k.word === symbol || k.word.includes(symbol) || symbol.includes(k.word)));
            setSymbolShortsField('dreams', related.slice(0, 20));
        } catch (e) {
            console.error(e);
            setSymbolShortsField('dreams', []);
        }
    };

    // 쇼츠 네비게이션
    const nextShorts = () => {
        if (symbolShorts.currentIndex < symbolShorts.dreams.length - 1) {
            setSymbolShortsField('currentIndex', symbolShorts.currentIndex + 1);
        }
    };

    const prevShorts = () => {
        if (symbolShorts.currentIndex > 0) {
            setSymbolShortsField('currentIndex', symbolShorts.currentIndex - 1);
        }
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
    const generateDetailedReading = (dream) => {
        if (!dream) return;

        // 이미 상세 분석이 있으면 바로 표시
        if (dream.detailedAnalysis) {
            setDetailedReadingField('content', dream);
            setDetailedReadingField('show', true);
            setLoadingState('detailedReading', false);
            return;
        }

        // 상세 분석이 없으면 기존 reading 데이터로 간략한 분석 표시 (API 호출 없음)
        // reading이 객체인 경우 문자열로 변환
        const readingText = typeof dream.reading === 'object' && dream.reading !== null
            ? Object.entries(dream.reading).map(([key, val]) => `${key}: ${val}`).join('\n')
            : (dream.reading || '꿈의 의미를 분석한 내용입니다.');

        // keywords의 surface/hidden 사용
        const keywordsText = dream.keywords?.map(k =>
            `**${k.word}** - ${k.surface || k.hidden || ''}`
        ).join('\n\n') || '';

        const fallbackAnalysis = `## 🌙 꿈의 메시지

${readingText}

## 🔮 핵심 키워드

${keywordsText}

## 💫 꿈의 결론

${dream.dreamMeaning?.summary || ''} ${dream.dreamMeaning?.detail || ''}

## ✨ 타로 해석

${dream.tarot?.name ? `**${dream.tarot.name}** - ${dream.tarot.meaning}` : ''}`;

        setDetailedReadingField('content', {
            ...dream,
            detailedAnalysis: fallbackAnalysis
        });
        setDetailedReadingField('show', true);
        setLoadingState('detailedReading', false);
    };

    return {
        openSymbolShorts,
        nextShorts,
        prevShorts,
        toggleLike,
        openDreamDetail,
        generateDetailedReading
    };
};
