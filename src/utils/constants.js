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

// 타로 카드 덱 (전체 78장: 메이저 아르카나 22장 + 마이너 아르카나 56장)
export const TAROT_DECK = [
    // 메이저 아르카나 (22장)
    { id: 0, name: 'The Fool', nameKo: '광대', emoji: '🃏', meaning: '새로운 시작, 순수, 모험', arcana: 'major' },
    { id: 1, name: 'The Magician', nameKo: '마법사', emoji: '🎩', meaning: '의지력, 창조, 재능', arcana: 'major' },
    { id: 2, name: 'The High Priestess', nameKo: '여사제', emoji: '🌙', meaning: '직관, 비밀, 내면의 지혜', arcana: 'major' },
    { id: 3, name: 'The Empress', nameKo: '여황제', emoji: '👑', meaning: '풍요, 모성, 창조력', arcana: 'major' },
    { id: 4, name: 'The Emperor', nameKo: '황제', emoji: '🦁', meaning: '권위, 안정, 리더십', arcana: 'major' },
    { id: 5, name: 'The Hierophant', nameKo: '교황', emoji: '📿', meaning: '전통, 가르침, 신앙', arcana: 'major' },
    { id: 6, name: 'The Lovers', nameKo: '연인', emoji: '💕', meaning: '사랑, 조화, 선택', arcana: 'major' },
    { id: 7, name: 'The Chariot', nameKo: '전차', emoji: '🏎️', meaning: '승리, 의지력, 전진', arcana: 'major' },
    { id: 8, name: 'Strength', nameKo: '힘', emoji: '🦁', meaning: '내면의 힘, 용기, 인내', arcana: 'major' },
    { id: 9, name: 'The Hermit', nameKo: '은둔자', emoji: '🏔️', meaning: '성찰, 고독, 내면 탐구', arcana: 'major' },
    { id: 10, name: 'Wheel of Fortune', nameKo: '운명의 수레바퀴', emoji: '🎡', meaning: '변화, 운명, 전환점', arcana: 'major' },
    { id: 11, name: 'Justice', nameKo: '정의', emoji: '⚖️', meaning: '공정, 진실, 균형', arcana: 'major' },
    { id: 12, name: 'The Hanged Man', nameKo: '매달린 사람', emoji: '🙃', meaning: '희생, 새로운 관점, 기다림', arcana: 'major' },
    { id: 13, name: 'Death', nameKo: '죽음', emoji: '💀', meaning: '변화, 끝과 시작, 변환', arcana: 'major' },
    { id: 14, name: 'Temperance', nameKo: '절제', emoji: '⚗️', meaning: '균형, 조화, 인내', arcana: 'major' },
    { id: 15, name: 'The Devil', nameKo: '악마', emoji: '😈', meaning: '유혹, 속박, 물질주의', arcana: 'major' },
    { id: 16, name: 'The Tower', nameKo: '탑', emoji: '🗼', meaning: '급변, 깨달음, 해방', arcana: 'major' },
    { id: 17, name: 'The Star', nameKo: '별', emoji: '⭐', meaning: '희망, 영감, 평온', arcana: 'major' },
    { id: 18, name: 'The Moon', nameKo: '달', emoji: '🌛', meaning: '환상, 직관, 무의식', arcana: 'major' },
    { id: 19, name: 'The Sun', nameKo: '태양', emoji: '☀️', meaning: '성공, 기쁨, 활력', arcana: 'major' },
    { id: 20, name: 'Judgement', nameKo: '심판', emoji: '📯', meaning: '부활, 각성, 결정', arcana: 'major' },
    { id: 21, name: 'The World', nameKo: '세계', emoji: '🌍', meaning: '완성, 성취, 조화', arcana: 'major' },
    // 마이너 아르카나 - 완드 (Wands) 14장: 열정, 창의력, 행동
    { id: 22, name: 'Ace of Wands', nameKo: '완드 에이스', emoji: '🔥', meaning: '영감, 새로운 기회, 잠재력', arcana: 'wands' },
    { id: 23, name: 'Two of Wands', nameKo: '완드 2', emoji: '🌅', meaning: '계획, 결정, 미래 전망', arcana: 'wands' },
    { id: 24, name: 'Three of Wands', nameKo: '완드 3', emoji: '🚢', meaning: '확장, 진전, 선견지명', arcana: 'wands' },
    { id: 25, name: 'Four of Wands', nameKo: '완드 4', emoji: '🎊', meaning: '축하, 안정, 조화', arcana: 'wands' },
    { id: 26, name: 'Five of Wands', nameKo: '완드 5', emoji: '⚔️', meaning: '경쟁, 갈등, 도전', arcana: 'wands' },
    { id: 27, name: 'Six of Wands', nameKo: '완드 6', emoji: '🏆', meaning: '승리, 인정, 성공', arcana: 'wands' },
    { id: 28, name: 'Seven of Wands', nameKo: '완드 7', emoji: '🛡️', meaning: '방어, 용기, 도전 극복', arcana: 'wands' },
    { id: 29, name: 'Eight of Wands', nameKo: '완드 8', emoji: '✈️', meaning: '빠른 진행, 움직임, 소식', arcana: 'wands' },
    { id: 30, name: 'Nine of Wands', nameKo: '완드 9', emoji: '💪', meaning: '인내, 회복력, 끈기', arcana: 'wands' },
    { id: 31, name: 'Ten of Wands', nameKo: '완드 10', emoji: '🏋️', meaning: '부담, 책임, 완수', arcana: 'wands' },
    { id: 32, name: 'Page of Wands', nameKo: '완드 시종', emoji: '🌱', meaning: '열정, 탐험, 새로운 아이디어', arcana: 'wands' },
    { id: 33, name: 'Knight of Wands', nameKo: '완드 기사', emoji: '🐎', meaning: '행동, 모험, 에너지', arcana: 'wands' },
    { id: 34, name: 'Queen of Wands', nameKo: '완드 여왕', emoji: '👸', meaning: '자신감, 결단력, 매력', arcana: 'wands' },
    { id: 35, name: 'King of Wands', nameKo: '완드 왕', emoji: '🤴', meaning: '리더십, 비전, 명예', arcana: 'wands' },
    // 마이너 아르카나 - 컵 (Cups) 14장: 감정, 관계, 직관
    { id: 36, name: 'Ace of Cups', nameKo: '컵 에이스', emoji: '💝', meaning: '새로운 사랑, 감정의 시작', arcana: 'cups' },
    { id: 37, name: 'Two of Cups', nameKo: '컵 2', emoji: '💑', meaning: '파트너십, 사랑, 연결', arcana: 'cups' },
    { id: 38, name: 'Three of Cups', nameKo: '컵 3', emoji: '🥂', meaning: '축하, 우정, 기쁨', arcana: 'cups' },
    { id: 39, name: 'Four of Cups', nameKo: '컵 4', emoji: '😔', meaning: '무관심, 명상, 재평가', arcana: 'cups' },
    { id: 40, name: 'Five of Cups', nameKo: '컵 5', emoji: '😢', meaning: '상실, 슬픔, 후회', arcana: 'cups' },
    { id: 41, name: 'Six of Cups', nameKo: '컵 6', emoji: '🧸', meaning: '추억, 향수, 순수', arcana: 'cups' },
    { id: 42, name: 'Seven of Cups', nameKo: '컵 7', emoji: '💭', meaning: '환상, 선택, 상상', arcana: 'cups' },
    { id: 43, name: 'Eight of Cups', nameKo: '컵 8', emoji: '🚶', meaning: '떠남, 포기, 더 높은 목표', arcana: 'cups' },
    { id: 44, name: 'Nine of Cups', nameKo: '컵 9', emoji: '😊', meaning: '만족, 소원성취, 행복', arcana: 'cups' },
    { id: 45, name: 'Ten of Cups', nameKo: '컵 10', emoji: '🌈', meaning: '완전한 행복, 가족, 조화', arcana: 'cups' },
    { id: 46, name: 'Page of Cups', nameKo: '컵 시종', emoji: '🐟', meaning: '창의성, 직관, 메시지', arcana: 'cups' },
    { id: 47, name: 'Knight of Cups', nameKo: '컵 기사', emoji: '🦢', meaning: '로맨스, 매력, 제안', arcana: 'cups' },
    { id: 48, name: 'Queen of Cups', nameKo: '컵 여왕', emoji: '🧜‍♀️', meaning: '직관, 공감, 감정 지성', arcana: 'cups' },
    { id: 49, name: 'King of Cups', nameKo: '컵 왕', emoji: '🔱', meaning: '감정 균형, 지혜, 관용', arcana: 'cups' },
    // 마이너 아르카나 - 소드 (Swords) 14장: 지성, 갈등, 진실
    { id: 50, name: 'Ace of Swords', nameKo: '소드 에이스', emoji: '🗡️', meaning: '명확함, 진실, 돌파구', arcana: 'swords' },
    { id: 51, name: 'Two of Swords', nameKo: '소드 2', emoji: '⚖️', meaning: '결정 회피, 균형, 교착', arcana: 'swords' },
    { id: 52, name: 'Three of Swords', nameKo: '소드 3', emoji: '💔', meaning: '상처, 이별, 슬픔', arcana: 'swords' },
    { id: 53, name: 'Four of Swords', nameKo: '소드 4', emoji: '🛏️', meaning: '휴식, 회복, 명상', arcana: 'swords' },
    { id: 54, name: 'Five of Swords', nameKo: '소드 5', emoji: '😤', meaning: '갈등, 패배, 승리의 대가', arcana: 'swords' },
    { id: 55, name: 'Six of Swords', nameKo: '소드 6', emoji: '⛵', meaning: '전환, 이동, 회복', arcana: 'swords' },
    { id: 56, name: 'Seven of Swords', nameKo: '소드 7', emoji: '🦊', meaning: '전략, 속임, 은밀함', arcana: 'swords' },
    { id: 57, name: 'Eight of Swords', nameKo: '소드 8', emoji: '🔒', meaning: '갇힘, 제한, 자기 의심', arcana: 'swords' },
    { id: 58, name: 'Nine of Swords', nameKo: '소드 9', emoji: '😰', meaning: '불안, 걱정, 악몽', arcana: 'swords' },
    { id: 59, name: 'Ten of Swords', nameKo: '소드 10', emoji: '🌑', meaning: '끝, 배신, 바닥', arcana: 'swords' },
    { id: 60, name: 'Page of Swords', nameKo: '소드 시종', emoji: '🔍', meaning: '호기심, 경계, 새 아이디어', arcana: 'swords' },
    { id: 61, name: 'Knight of Swords', nameKo: '소드 기사', emoji: '⚡', meaning: '행동, 야망, 충동', arcana: 'swords' },
    { id: 62, name: 'Queen of Swords', nameKo: '소드 여왕', emoji: '❄️', meaning: '명석함, 독립, 직접적', arcana: 'swords' },
    { id: 63, name: 'King of Swords', nameKo: '소드 왕', emoji: '👨‍⚖️', meaning: '권위, 진실, 지적 힘', arcana: 'swords' },
    // 마이너 아르카나 - 펜타클 (Pentacles) 14장: 물질, 재물, 현실
    { id: 64, name: 'Ace of Pentacles', nameKo: '펜타클 에이스', emoji: '💎', meaning: '새 기회, 번영, 물질적 시작', arcana: 'pentacles' },
    { id: 65, name: 'Two of Pentacles', nameKo: '펜타클 2', emoji: '🎪', meaning: '균형, 적응, 우선순위', arcana: 'pentacles' },
    { id: 66, name: 'Three of Pentacles', nameKo: '펜타클 3', emoji: '🏗️', meaning: '협력, 기술, 계획', arcana: 'pentacles' },
    { id: 67, name: 'Four of Pentacles', nameKo: '펜타클 4', emoji: '🏦', meaning: '안정, 소유, 인색', arcana: 'pentacles' },
    { id: 68, name: 'Five of Pentacles', nameKo: '펜타클 5', emoji: '🥶', meaning: '어려움, 결핍, 고립', arcana: 'pentacles' },
    { id: 69, name: 'Six of Pentacles', nameKo: '펜타클 6', emoji: '🤝', meaning: '관대함, 나눔, 공정', arcana: 'pentacles' },
    { id: 70, name: 'Seven of Pentacles', nameKo: '펜타클 7', emoji: '🌾', meaning: '인내, 투자, 장기 전망', arcana: 'pentacles' },
    { id: 71, name: 'Eight of Pentacles', nameKo: '펜타클 8', emoji: '🔨', meaning: '숙련, 노력, 헌신', arcana: 'pentacles' },
    { id: 72, name: 'Nine of Pentacles', nameKo: '펜타클 9', emoji: '🦚', meaning: '풍요, 독립, 자족', arcana: 'pentacles' },
    { id: 73, name: 'Ten of Pentacles', nameKo: '펜타클 10', emoji: '🏰', meaning: '유산, 가족 부, 안정', arcana: 'pentacles' },
    { id: 74, name: 'Page of Pentacles', nameKo: '펜타클 시종', emoji: '📖', meaning: '학습, 새 기회, 실용성', arcana: 'pentacles' },
    { id: 75, name: 'Knight of Pentacles', nameKo: '펜타클 기사', emoji: '🐂', meaning: '근면, 책임, 인내', arcana: 'pentacles' },
    { id: 76, name: 'Queen of Pentacles', nameKo: '펜타클 여왕', emoji: '🌻', meaning: '풍요, 돌봄, 실용적 지혜', arcana: 'pentacles' },
    { id: 77, name: 'King of Pentacles', nameKo: '펜타클 왕', emoji: '💰', meaning: '부, 사업 성공, 안정', arcana: 'pentacles' },
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
