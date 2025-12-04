// 캘린더 관련 헬퍼 함수들

/**
 * 캘린더에 표시할 날짜 배열 생성
 * @param {Date} month - 기준 월
 * @returns {(number|null)[]} - 날짜 배열 (빈 칸은 null)
 */
export const getCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return days;
};

/**
 * 날짜 문자열 생성
 * @param {number} year
 * @param {number} month - 0-indexed
 * @param {number} day
 * @returns {string} - YYYY-MM-DD 형식
 */
export const formatDateStr = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/**
 * 특정 날짜의 꿈 목록 필터링
 * @param {Array} dreams - 꿈 목록
 * @param {Date} month - 기준 월
 * @param {number} day - 날짜
 * @returns {Array} - 해당 날짜의 꿈들
 */
export const getDreamsForDate = (dreams, month, day) => {
    if (!day) return [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const dateStr = formatDateStr(year, monthIndex, day);

    return dreams.filter(d => {
        // dreamDate 필드로 먼저 체크
        if (d.dreamDate === dateStr) return true;
        // createdAt으로도 체크 (fallback)
        if (d.createdAt) {
            const createdDate = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
            const createdStr = formatDateStr(
                createdDate.getFullYear(),
                createdDate.getMonth(),
                createdDate.getDate()
            );
            return createdStr === dateStr;
        }
        return false;
    });
};

/**
 * 특정 날짜의 첫 번째 꿈 가져오기
 * @param {Array} dreams - 꿈 목록
 * @param {Date} month - 기준 월
 * @param {number} day - 날짜
 * @returns {Object|null} - 꿈 객체 또는 null
 */
export const getDreamForDate = (dreams, month, day) => {
    const dreamsForDate = getDreamsForDate(dreams, month, day);
    return dreamsForDate.length > 0 ? dreamsForDate[0] : null;
};

/**
 * 이전/다음 월 계산
 * @param {Date} currentMonth - 현재 월
 * @param {number} delta - 변경량 (-1: 이전, 1: 다음)
 * @returns {Date} - 새로운 월
 */
export const getAdjacentMonth = (currentMonth, delta) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
