// 카드 데이터 생성 헬퍼 함수들

export const getDreamCards = (dreamData) => dreamData ? [
    { type: 'dream', label: '너의 꿈', image: dreamData.dreamImage, title: dreamData.title, verdict: dreamData.verdict, dreamType: dreamData.dreamType, rarity: dreamData.rarity },
    { type: 'tarot', label: '꿈과 접촉', image: dreamData.tarotImage, tarot: dreamData.tarot, keywords: dreamData.keywords },
    { type: 'meaning', label: '꿈의 의미', image: dreamData.meaningImage, dreamMeaning: dreamData.dreamMeaning, reading: dreamData.reading }
] : [];

export const getTarotCards = (tarotData) => tarotData ? [
    { type: 'tarot-past', label: '과거', image: tarotData.pastImage, card: tarotData.cards?.[0], title: tarotData.title, verdict: tarotData.verdict, rarity: tarotData.rarity, reading: tarotData.reading?.past },
    { type: 'tarot-present', label: '현재', image: tarotData.presentImage, card: tarotData.cards?.[1], keywords: tarotData.keywords, reading: tarotData.reading?.present },
    { type: 'tarot-future', label: '미래', image: tarotData.futureImage, card: tarotData.cards?.[2], cardMeaning: tarotData.cardMeaning, reading: tarotData.reading?.future, luckyElements: tarotData.luckyElements }
] : [];

export const getFortuneCards = (fortuneData) => fortuneData ? [
    { type: 'fortune-morning', label: '아침 운세', image: fortuneData.morningImage, title: fortuneData.title, verdict: fortuneData.verdict, score: fortuneData.score, rarity: fortuneData.rarity, reading: fortuneData.reading?.morning },
    { type: 'fortune-afternoon', label: '오후 운세', image: fortuneData.afternoonImage, keywords: fortuneData.keywords, reading: fortuneData.reading?.afternoon },
    { type: 'fortune-evening', label: '저녁 운세', image: fortuneData.eveningImage, fortuneMeaning: fortuneData.fortuneMeaning, reading: fortuneData.reading?.evening, luckyElements: fortuneData.luckyElements }
] : [];

// 현재 결과에 따라 카드 배열 결정
export const getCards = (result, tarotResult, fortuneResult, selectedDream) => {
    if (tarotResult) return getTarotCards(tarotResult);
    if (fortuneResult) return getFortuneCards(fortuneResult);
    if (result) return getDreamCards(result);
    if (selectedDream) return getDreamCards(selectedDream);
    return [];
};

// 시간 포맷팅
export const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Date.now() - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '방금';
    if (mins < 60) return `${mins}분 전`;
    if (mins < 1440) return `${Math.floor(mins / 60)}시간 전`;
    return `${Math.floor(mins / 1440)}일 전`;
};

// 공유 텍스트 생성
export const generateShareText = (target, dreamTypes = {}) => {
    if (!target) return '';

    if (target.type === 'tarot') {
        const cardEmojis = target.cards?.map(c => c.emoji).join(' ') || '';
        return `🃏 ${target.title}\n"${target.verdict}"\n\n${cardEmojis}\n\n행운의 색: ${target.luckyElements?.color || ''}\n행운의 숫자: ${target.luckyElements?.number || ''}\n\n#타로 #타로리딩 #운명`;
    }

    if (target.type === 'fortune') {
        return `🔮 ${target.title}\n"${target.verdict}"\n\n오늘의 운세 점수: ${target.score}점\n\n행운의 색: ${target.luckyElements?.color || ''}\n행운의 숫자: ${target.luckyElements?.number || ''}\n행운의 방향: ${target.luckyElements?.direction || ''}\n\n#오늘의운세 #데일리운세`;
    }

    // 꿈 (기본)
    return `🌙 ${target.title}\n"${target.verdict}"\n\n${dreamTypes[target.dreamType]?.emoji || ''} ${dreamTypes[target.dreamType]?.name || ''} 유형\n\n#꿈해몽 #꿈스토리북`;
};
