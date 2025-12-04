// 기본 꿈 유형 (AI가 새로운 유형을 추가할 수 있음)
export const DEFAULT_DREAM_TYPES = {
    seeker: { name: '탐색자', emoji: '🔮', desc: '미지의 세계를 향해 나아가는 자', color: '#9b59b6' },
    guardian: { name: '수호자', emoji: '🛡️', desc: '소중한 것을 지키려는 자', color: '#3498db' },
    wanderer: { name: '방랑자', emoji: '🌙', desc: '자유를 갈망하는 영혼', color: '#1abc9c' },
    healer: { name: '치유자', emoji: '✨', desc: '상처를 마주하는 용기를 가진 자', color: '#e91e63' },
    prophet: { name: '예언자', emoji: '👁️', desc: '무의식의 메시지를 받는 자', color: '#ff9800' },
    shadow: { name: '그림자', emoji: '🌑', desc: '내면의 어둠과 대화하는 자', color: '#607d8b' },
};

// 탭 설정
export const TABS = [
    { id: 'today', label: '오늘', icon: '🌅', tooltip: '오늘 올라온 꿈' },
    { id: 'popular', label: '인기', icon: '🔥', tooltip: '인기 꿈 해몽' },
    { id: 'all', label: '전체', icon: '🌙', tooltip: '모든 꿈 보기' },
];

// 타로 카드 덱 (메이저 아르카나 22장)
export const TAROT_DECK = [
    { id: 0, name: 'The Fool', nameKo: '광대', emoji: '🃏', meaning: '새로운 시작, 순수, 모험' },
    { id: 1, name: 'The Magician', nameKo: '마법사', emoji: '🎩', meaning: '의지력, 창조, 재능' },
    { id: 2, name: 'The High Priestess', nameKo: '여사제', emoji: '🌙', meaning: '직관, 비밀, 내면의 지혜' },
    { id: 3, name: 'The Empress', nameKo: '여황제', emoji: '👑', meaning: '풍요, 모성, 창조력' },
    { id: 4, name: 'The Emperor', nameKo: '황제', emoji: '🦁', meaning: '권위, 안정, 리더십' },
    { id: 5, name: 'The Hierophant', nameKo: '교황', emoji: '📿', meaning: '전통, 가르침, 신앙' },
    { id: 6, name: 'The Lovers', nameKo: '연인', emoji: '💕', meaning: '사랑, 조화, 선택' },
    { id: 7, name: 'The Chariot', nameKo: '전차', emoji: '🏎️', meaning: '승리, 의지력, 전진' },
    { id: 8, name: 'Strength', nameKo: '힘', emoji: '🦋', meaning: '내면의 힘, 용기, 인내' },
    { id: 9, name: 'The Hermit', nameKo: '은둔자', emoji: '🏔️', meaning: '성찰, 고독, 내면 탐구' },
    { id: 10, name: 'Wheel of Fortune', nameKo: '운명의 수레바퀴', emoji: '🎡', meaning: '변화, 운명, 전환점' },
    { id: 11, name: 'Justice', nameKo: '정의', emoji: '⚖️', meaning: '공정, 진실, 균형' },
    { id: 12, name: 'The Hanged Man', nameKo: '매달린 사람', emoji: '🙃', meaning: '희생, 새로운 관점, 기다림' },
    { id: 13, name: 'Death', nameKo: '죽음', emoji: '🦋', meaning: '변화, 끝과 시작, 변환' },
    { id: 14, name: 'Temperance', nameKo: '절제', emoji: '⚗️', meaning: '균형, 조화, 인내' },
    { id: 15, name: 'The Devil', nameKo: '악마', emoji: '😈', meaning: '유혹, 속박, 물질주의' },
    { id: 16, name: 'The Tower', nameKo: '탑', emoji: '🗼', meaning: '급변, 깨달음, 해방' },
    { id: 17, name: 'The Star', nameKo: '별', emoji: '⭐', meaning: '희망, 영감, 평온' },
    { id: 18, name: 'The Moon', nameKo: '달', emoji: '🌛', meaning: '환상, 직관, 무의식' },
    { id: 19, name: 'The Sun', nameKo: '태양', emoji: '☀️', meaning: '성공, 기쁨, 활력' },
    { id: 20, name: 'Judgement', nameKo: '심판', emoji: '📯', meaning: '부활, 각성, 결정' },
    { id: 21, name: 'The World', nameKo: '세계', emoji: '🌍', meaning: '완성, 성취, 조화' },
];

// 꿈 검색 카테고리
export const DREAM_CATEGORIES = {
    person: { name: '사람/인물', emoji: '👤', keywords: ['가족', '남편', '부모', '어머니', '조부모', '임산부', '연예인', '아기', '친구'] },
    body: { name: '신체', emoji: '🫀', keywords: ['눈썹', '머리', '발', '치아', '수염', '얼굴', '피', '손', '눈'] },
    action: { name: '행동', emoji: '🏃', keywords: ['수영', '달리기', '날기', '떨어지기', '잠', '싸움', '도망', '춤'] },
    life: { name: '생활', emoji: '🏠', keywords: ['돈', '침대', '이불', '거울', '바늘', '옷', '신발', '열쇠', '문'] },
    food: { name: '음식', emoji: '🍚', keywords: ['고기', '계란', '채소', '술', '밥', '과일', '물', '빵'] },
    nature: { name: '동식물', emoji: '🐍', keywords: ['뱀', '개', '고양이', '새', '물고기', '벌레', '꽃', '나무'] },
    place: { name: '자연/장소', emoji: '🌊', keywords: ['바다', '산', '하늘', '강', '집', '학교', '화장실', '길'] },
    other: { name: '기타', emoji: '✨', keywords: ['죽음', '결혼', '임신', '시험', '전쟁', '불', '지진'] }
};

// 인기 검색어
export const POPULAR_SEARCHES = ['똥', '죽음', '뱀', '물', '옷', '집', '신발', '벌레', '화장실', '이빨'];

// 꿈 상징 데이터
export const dreamSymbols = {
    '물': { emoji: '💧', hint: '감정, 무의식', meaning: '물은 감정의 흐름과 무의식을 상징합니다' },
    '불': { emoji: '🔥', hint: '열정, 분노', meaning: '불은 열정이나 분노, 변화를 의미합니다' },
    '뱀': { emoji: '🐍', hint: '변화, 위험', meaning: '뱀은 변화와 치유, 때로는 위험을 상징합니다' },
    '하늘': { emoji: '☁️', hint: '자유, 희망', meaning: '하늘은 자유와 무한한 가능성을 나타냅니다' },
    '집': { emoji: '🏠', hint: '자아, 안전', meaning: '집은 자신의 마음과 안정을 상징합니다' },
    '죽음': { emoji: '💀', hint: '변화, 끝', meaning: '죽음은 새로운 시작이나 변화를 의미합니다' },
    '날다': { emoji: '🕊️', hint: '자유, 도피', meaning: '비행은 자유나 현실에서의 도피를 나타냅니다' },
    '떨어지다': { emoji: '⬇️', hint: '불안, 통제', meaning: '추락은 불안감이나 통제력 상실을 의미합니다' },
    '시험': { emoji: '📝', hint: '평가, 불안', meaning: '시험은 자기 평가나 불안감을 상징합니다' },
    '이빨': { emoji: '🦷', hint: '자신감, 노화', meaning: '이빨은 자신감이나 외모 걱정을 나타냅니다' },
    '아기': { emoji: '👶', hint: '새 시작, 순수', meaning: '아기는 새로운 시작이나 순수함을 상징합니다' },
    '돈': { emoji: '💰', hint: '가치, 욕망', meaning: '돈은 자기 가치감이나 욕망을 나타냅니다' },
    '동물': { emoji: '🐾', hint: '본능, 감정', meaning: '동물은 본능적인 감정을 상징합니다' },
    '바다': { emoji: '🌊', hint: '무의식, 감정', meaning: '바다는 깊은 무의식과 감정을 나타냅니다' },
    '숲': { emoji: '🌲', hint: '미지, 성장', meaning: '숲은 미지의 영역과 성장을 상징합니다' },
};

// 도파민 힌트 메시지
export const DOPAMINE_HINTS = [
    { emoji: '💕', text: '연애운이 감지되고 있어요...', category: 'love' },
    { emoji: '💰', text: '재물운의 기운이 느껴져요...', category: 'money' },
    { emoji: '💼', text: '직장운에 변화가 보여요...', category: 'career' },
    { emoji: '✨', text: '행운의 조짐이 나타나고 있어요...', category: 'luck' },
    { emoji: '🔮', text: '숨겨진 운명이 드러나려 해요...', category: 'destiny' },
    { emoji: '💫', text: '특별한 인연의 기운이...', category: 'relationship' },
    { emoji: '🌟', text: '성공의 기회가 엿보여요...', category: 'success' },
    { emoji: '💝', text: '누군가 당신을 생각하고 있어요...', category: 'romance' },
];

// 운세 타입
export const FORTUNE_TYPES = {
    today: { name: '오늘의 운세', emoji: '🌅', desc: '하루 전체 운세' },
    love: { name: '연애운', emoji: '💕', desc: '사랑과 관계' },
    career: { name: '직장운', emoji: '💼', desc: '일과 성공' },
    money: { name: '재물운', emoji: '💰', desc: '금전과 풍요' }
};

// 뱃지 정의
export const BADGES = {
    first_dream: { id: 'first_dream', name: '첫 꿈', emoji: '🌱', desc: '첫 번째 꿈을 기록했어요' },
    dream_week: { id: 'dream_week', name: '7일 연속', emoji: '🔥', desc: '7일 연속 꿈을 기록했어요' },
    dream_collector: { id: 'dream_collector', name: '수집가', emoji: '📚', desc: '10개 이상의 꿈을 기록했어요' },
    popular_dreamer: { id: 'popular_dreamer', name: '인기쟁이', emoji: '⭐', desc: '좋아요 10개 이상 받았어요' },
    type_master: { id: 'type_master', name: '유형 마스터', emoji: '🎭', desc: '5가지 이상 꿈 유형을 경험했어요' },
    rare_finder: { id: 'rare_finder', name: '희귀 발견자', emoji: '💎', desc: '새로운 꿈 유형을 발견했어요' },
};
