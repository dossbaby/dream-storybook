import { useMemo, useEffect } from 'react';

// 랜덤 헤딩 (prompt 화면용)
const RANDOM_HEADINGS = [
    '운명의 지도를 펼쳐볼까요?',
    '사주팔자, 궁금하지 않으세요?',
    '타고난 기운, 읽어볼까요?',
    '오늘의 운세가 궁금하세요?',
    '당신의 사주, 볼까요?'
];

// 랜덤 플레이스홀더 (기존 프리셋 옵션 + 추가)
const RANDOM_PLACEHOLDERS = [
    '오늘 하루 전반적인 운세가 궁금해요',
    '올해 연애운이 어떤가요?',
    '이직하려는데 좋은 시기일까요?',
    '이번 달 재물운이 궁금해요',
    '건강 관련해서 조심할 게 있을까요?',
    '올해 종합 사주 분석으로 보고 싶어요',
    '결혼운이 언제 들어올까요?',
    '사업 시작하기 좋은 시기인가요?'
];

// 생년월일 포맷 헬퍼 (간결)
const formatBirthDateShort = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}.${m}.${d}`;
};

// 성별 표시 헬퍼 (간결)
const getGenderShort = (gender) => {
    if (gender === 'male') return '남';
    if (gender === 'female') return '여';
    return '';
};

// 시간 표시 헬퍼 (간결)
const getTimeShort = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
};

const FortuneInput = ({
    fortuneType,
    setFortuneType,
    fortuneBirthdate,
    setFortuneBirthdate,
    userProfile = {},
    onOpenProfileModal,
    fortuneQuestion,
    setFortuneQuestion,
    loading,
    analysisPhase,
    progress,
    error,
    onBack,
    onGenerate,
    // 맞춤 질문 관련 props
    tier = 'free',
    selectedQuestion,
    customQuestion,
    onSelectPreset,
    onCustomQuestionChange,
    onOpenPremium,
    // 로그인 관련
    user,
    onLoginRequired
}) => {
    // 프로필에 생년월일이 있으면 자동 설정
    useEffect(() => {
        if (userProfile?.birthDate && !fortuneBirthdate) {
            setFortuneBirthdate(userProfile.birthDate);
        }
    }, [userProfile?.birthDate, fortuneBirthdate, setFortuneBirthdate]);

    // 프로필 필수 항목 체크 (이름, 생년월일)
    const hasRequiredProfile = userProfile?.name && userProfile?.birthDate;

    // 랜덤 헤딩 (컴포넌트 마운트 시 한 번만 선택)
    const randomHeading = useMemo(() => {
        return RANDOM_HEADINGS[Math.floor(Math.random() * RANDOM_HEADINGS.length)];
    }, []);

    // 랜덤 플레이스홀더 (컴포넌트 마운트 시 한 번만 선택)
    const randomPlaceholder = useMemo(() => {
        return RANDOM_PLACEHOLDERS[Math.floor(Math.random() * RANDOM_PLACEHOLDERS.length)];
    }, []);

    // 프로필 요약 문자열 생성
    const getProfileSummary = () => {
        // 비로그인 상태
        if (!user) return '로그인해서 프로필을 불러오세요';
        // 로그인했지만 프로필 미설정
        if (!hasRequiredProfile) return '프로필을 설정해주세요';
        const parts = [userProfile.name];
        const gender = getGenderShort(userProfile.gender);
        if (gender) parts.push(gender);
        parts.push(formatBirthDateShort(userProfile.birthDate));
        const time = getTimeShort(userProfile.birthTime);
        if (time) parts.push(time);
        return parts.join(' · ');
    };

    // 프로필 클릭 핸들러
    const handleProfileClick = () => {
        if (!user) {
            // 비로그인 → 로그인 모달
            onLoginRequired?.('profile');
        } else {
            // 로그인 → 프로필 설정 모달
            onOpenProfileModal?.();
        }
    };

    // 버튼 비활성화 조건: 프로필 없음 OR 질문 없음
    const isButtonDisabled = loading || !hasRequiredProfile || !fortuneQuestion?.trim();

    return (
        <div className="create-card fortune-input-card fortune-theme">
            {!loading && (
                <>
                    <div className="fortune-question-header">
                        <div className="mystical-orb fortune-orb">
                            <span className="orb-emoji">☀️</span>
                            <div className="orb-sparkles fortune-sparkles">
                                <span>✦</span>
                                <span>✧</span>
                                <span>✦</span>
                            </div>
                        </div>
                        <h2 className="create-title fortune-title">{randomHeading}</h2>
                        {/* 프로필 정보 인라인 (subtitle 대체) */}
                        <p
                            className={`fortune-profile-text ${!user || !hasRequiredProfile ? 'empty' : ''}`}
                            onClick={handleProfileClick}
                        >
                            <span className="profile-label">내 정보:</span>
                            <span className="profile-info">{getProfileSummary()}</span>
                            <span className="profile-edit-btn">✎</span>
                        </p>
                    </div>

                    {/* 질문 입력 (항상 표시) */}
                    <textarea
                        value={fortuneQuestion || ''}
                        onChange={(e) => setFortuneQuestion?.(e.target.value)}
                        placeholder={randomPlaceholder}
                        className="dream-input fortune-textarea"
                        disabled={loading}
                        inputMode="text"
                        enterKeyHint="done"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        rows={3}
                    />

                    {error && <div className="error">{error}</div>}
                    <button
                        onClick={onGenerate}
                        disabled={isButtonDisabled}
                        className="submit-btn fortune-submit mystical-btn"
                    >
                        {loading ? '분석 중...' : '☀️ 사주 보기'}
                    </button>
                </>
            )}
        </div>
    );
};

export default FortuneInput;
