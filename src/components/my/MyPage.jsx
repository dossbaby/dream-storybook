import { useState, useRef, useEffect } from 'react';
import { HISTORY_LIMITS } from '../../utils/aiConfig';
import PatternAnalysis from '../common/PatternAnalysis';

// visibility 옵션 정의
const VISIBILITY_OPTIONS = [
    { value: 'private', icon: '🔒', label: '나만 보기', short: '비공개' },
    { value: 'unlisted', icon: '🔗', label: '링크 공유', short: '링크만' },
    { value: 'public', icon: '🌐', label: '전체 공개', short: '공개' }
];

// visibility 값 정규화 (레거시 isPublic 호환)
const normalizeVisibility = (item) => {
    if (item.visibility) return item.visibility;
    return item.isPublic ? 'public' : 'private';
};

const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

// 공개 설정 드롭다운 컴포넌트 (삭제 기능 포함)
const VisibilityDropdown = ({ item, type, onUpdate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const dropdownRef = useRef(null);
    const currentVisibility = normalizeVisibility(item);
    const currentOption = VISIBILITY_OPTIONS.find(o => o.value === currentVisibility) || VISIBILITY_OPTIONS[0];

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setShowDeleteConfirm(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = async (newVisibility) => {
        if (newVisibility !== currentVisibility) {
            await onUpdate(type, item.id, newVisibility);
        }
        setIsOpen(false);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async (e) => {
        e.stopPropagation();
        if (onDelete) {
            await onDelete(type, item.id, item);
        }
        setIsOpen(false);
        setShowDeleteConfirm(false);
    };

    const handleDeleteCancel = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    return (
        <div className="visibility-dropdown" ref={dropdownRef}>
            <button
                className={`visibility-btn ${currentVisibility}`}
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            >
                <span className="visibility-icon">{currentOption.icon}</span>
                <span className="visibility-text">{currentOption.short}</span>
                <span className="visibility-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className="visibility-menu">
                    {VISIBILITY_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            className={`visibility-menu-item ${option.value === currentVisibility ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleSelect(option.value); }}
                        >
                            <span className="menu-icon">{option.icon}</span>
                            <span className="menu-label">{option.label}</span>
                            {option.value === currentVisibility && <span className="menu-check">✓</span>}
                        </button>
                    ))}
                    {/* 구분선 + 삭제 옵션 */}
                    {onDelete && (
                        <>
                            <div className="visibility-menu-divider" />
                            {showDeleteConfirm ? (
                                <div className="delete-confirm-row">
                                    <span className="delete-confirm-text">삭제할까요?</span>
                                    <button className="delete-confirm-btn yes" onClick={handleDeleteConfirm}>예</button>
                                    <button className="delete-confirm-btn no" onClick={handleDeleteCancel}>아니오</button>
                                </div>
                            ) : (
                                <button
                                    className="visibility-menu-item delete-item"
                                    onClick={handleDeleteClick}
                                >
                                    <span className="menu-icon">🗑️</span>
                                    <span className="menu-label">삭제</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const MyPage = ({
    user,
    userNickname,
    userProfile = {},
    userBadges,
    BADGES,
    myStats,
    myDreams,
    myTarots = [],
    myFortunes = [],
    dreamTypes,
    calendar,
    onBack,
    onOpenNicknameModal,
    onOpenProfileModal,
    onOpenFeedback,
    onOpenReferral,
    onLogout,
    onGenerateAiReport,
    onSetCalendarView,
    onPrevMonth,
    onNextMonth,
    getCalendarDays,
    getDreamsForDate,
    onOpenDreamDetail,
    onOpenTarotDetail,
    onOpenFortuneDetail,
    onToggleDreamVisibility,
    onUpdateVisibility,
    onDeleteDream,
    onDeleteTarot,
    onDeleteFortune,
    formatTime,
    // 프리미엄 관련
    isPremium = false,
    tier = 'free',
    onOpenPremium,
    // Admin 티어 변경
    onSetTier,
    // 초기 카테고리 (외부에서 설정 가능)
    initialCategory = 'dream',
    // 사용량 요약
    usageSummary = null
}) => {
    // Admin 이메일 목록
    const ADMIN_EMAILS = ['dossbb@naver.com'];
    // 히스토리 제한 계산
    const historyLimit = HISTORY_LIMITS[tier] || HISTORY_LIMITS.free;
    // 현재 선택된 카테고리 (dream, tarot, fortune)
    const [category, setCategory] = useState(initialCategory);

    // 통합 삭제 핸들러
    const handleDelete = async (type, id, item) => {
        if (type === 'dream' && onDeleteDream) {
            await onDeleteDream(id, item);
        } else if (type === 'tarot' && onDeleteTarot) {
            await onDeleteTarot(id, item);
        } else if (type === 'fortune' && onDeleteFortune) {
            await onDeleteFortune(id, item);
        }
    };

    // 프로필 완성도 계산
    const calculateProfileCompletion = () => {
        const fields = ['name', 'birthDate', 'gender', 'mbti'];
        const filled = fields.filter(f => userProfile[f]).length;
        return Math.round((filled / fields.length) * 100);
    };

    const profileCompletion = calculateProfileCompletion();
    const hasProfile = profileCompletion > 0;

    // 나이 계산
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // 별자리 계산
    const getZodiacSign = (birthDate) => {
        if (!birthDate) return null;
        const date = new Date(birthDate);
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const signs = [
            { name: '물병자리', emoji: '♒', start: [1, 20], end: [2, 18] },
            { name: '물고기자리', emoji: '♓', start: [2, 19], end: [3, 20] },
            { name: '양자리', emoji: '♈', start: [3, 21], end: [4, 19] },
            { name: '황소자리', emoji: '♉', start: [4, 20], end: [5, 20] },
            { name: '쌍둥이자리', emoji: '♊', start: [5, 21], end: [6, 21] },
            { name: '게자리', emoji: '♋', start: [6, 22], end: [7, 22] },
            { name: '사자자리', emoji: '♌', start: [7, 23], end: [8, 22] },
            { name: '처녀자리', emoji: '♍', start: [8, 23], end: [9, 22] },
            { name: '천칭자리', emoji: '♎', start: [9, 23], end: [10, 23] },
            { name: '전갈자리', emoji: '♏', start: [10, 24], end: [11, 21] },
            { name: '사수자리', emoji: '♐', start: [11, 22], end: [12, 21] },
            { name: '염소자리', emoji: '♑', start: [12, 22], end: [1, 19] }
        ];

        for (const sign of signs) {
            const [startMonth, startDay] = sign.start;
            const [endMonth, endDay] = sign.end;

            if (startMonth === 12 && endMonth === 1) {
                if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
                    return sign;
                }
            } else if (
                (month === startMonth && day >= startDay) ||
                (month === endMonth && day <= endDay)
            ) {
                return sign;
            }
        }
        return null;
    };

    const age = calculateAge(userProfile.birthDate);
    const zodiac = getZodiacSign(userProfile.birthDate);

    return (
        <>
            <div className="my-page-content">
                <div className="my-profile">
                    {/* 왼쪽: 아바타 + 뱃지 */}
                    <div className="my-profile-left">
                        <img src={user.photoURL || '/default-avatar.png'} alt="" className="my-avatar" />
                        {/* 뱃지 표시 */}
                        {userBadges.length > 0 && (
                            <div className="my-badges">
                                {userBadges.map(badgeId => (
                                    <span key={badgeId} className="badge-item" title={BADGES[badgeId]?.desc}>
                                        {BADGES[badgeId]?.emoji}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 오른쪽: 정보 + 프로필 */}
                    <div className="my-profile-right">
                        {/* 헤더: 이름 + 버튼들 */}
                        <div className="my-profile-header">
                            <div className="my-profile-info">
                                <h3>{userProfile.name || userNickname || user.displayName}</h3>
                                <p>{user.email}</p>
                                {/* 프로필 완성도 배지 */}
                                {hasProfile && (
                                    <div className="profile-completion-badge">
                                        <div className="completion-bar">
                                            <div className="completion-fill" style={{ width: `${profileCompletion}%` }}></div>
                                        </div>
                                        <span className="completion-text">프로필 {profileCompletion}%</span>
                                    </div>
                                )}
                            </div>
                            <div className="my-profile-actions">
                                <button className="nickname-btn" onClick={onOpenProfileModal || onOpenNicknameModal}>
                                    프로필 설정
                                </button>
                                <button className="referral-btn" onClick={onOpenReferral}>
                                    🎁 친구 초대
                                </button>
                                <button className="feedback-btn" onClick={onOpenFeedback}>
                                    💬 의견 보내기
                                </button>
                                <button className="logout-btn" onClick={onLogout}>로그아웃</button>
                            </div>
                        </div>

                        {/* 프로필 정보가 있으면 표시 */}
                        {hasProfile ? (
                            <div className="profile-details">
                                {/* 이름 / 닉네임 */}
                                <div className="profile-detail-item">
                                    <span className="profile-detail-label">이름 / 닉네임</span>
                                    <span className="profile-detail-value">
                                        {userProfile.name || '—'} / {userNickname || '—'}
                                    </span>
                                </div>
                                {/* 생년월일 / 나이 */}
                                <div className="profile-detail-item">
                                    <span className="profile-detail-label">생년월일</span>
                                    <span className="profile-detail-value">
                                        {userProfile.birthDate ? `${userProfile.birthDate.replace(/-/g, '.')}` : '—'}
                                        {age ? ` (${age}세)` : ''}
                                    </span>
                                </div>
                                {/* 태어난 시간 */}
                                <div className="profile-detail-item">
                                    <span className="profile-detail-label">태어난 시간</span>
                                    <span className="profile-detail-value">
                                        {userProfile.birthTime || '—'}
                                    </span>
                                </div>
                                {/* 별자리 */}
                                <div className="profile-detail-item">
                                    <span className="profile-detail-label">별자리</span>
                                    <span className="profile-detail-value">
                                        {zodiac ? `${zodiac.emoji} ${zodiac.name}` : '—'}
                                    </span>
                                </div>
                                {/* 성별 */}
                                <div className="profile-detail-item">
                                    <span className="profile-detail-label">성별</span>
                                    <span className="profile-detail-value">
                                        {userProfile.gender === 'female' ? '👧🏻 여성' : userProfile.gender === 'male' ? '🧒🏻 남성' : '—'}
                                    </span>
                                </div>
                                {/* MBTI */}
                                <div className="profile-detail-item">
                                    <span className="profile-detail-label">MBTI</span>
                                    <span className="profile-detail-value">{userProfile.mbti || '—'}</span>
                                </div>
                            </div>
                        ) : (
                            /* 프로필 설정 유도 배너 */
                            <div className="profile-setup-hint" onClick={onOpenProfileModal || onOpenNicknameModal}>
                                <span className="hint-icon">✨</span>
                                <div className="hint-content">
                                    <div className="hint-title">맞춤 리딩을 받아보세요!</div>
                                    <div className="hint-desc">
                                        프로필을 설정하면 타로, 꿈해몽, 사주가 당신에게 맞춤으로 제공됩니다.
                                        이미지에 당신의 모습이 반영돼요!
                                    </div>
                                </div>
                                <span className="hint-arrow">→</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin 티어 전환 패널 */}
                {ADMIN_EMAILS.includes(user?.email) && onSetTier && (
                    <div className="admin-tier-panel">
                        <div className="admin-panel-header">
                            <span className="admin-badge">DEV</span>
                            <span className="admin-title">티어 전환 (테스트용)</span>
                        </div>
                        <div className="admin-tier-buttons">
                            <button
                                className={`tier-btn ${tier === 'free' ? 'active' : ''}`}
                                onClick={() => onSetTier('free')}
                            >
                                무료
                            </button>
                            <button
                                className={`tier-btn premium ${tier === 'premium' ? 'active' : ''}`}
                                onClick={() => onSetTier('premium')}
                            >
                                프리미엄
                            </button>
                            <button
                                className={`tier-btn ultra ${tier === 'ultra' ? 'active' : ''}`}
                                onClick={() => onSetTier('ultra')}
                            >
                                울트라
                            </button>
                        </div>
                        <div className="admin-tier-info">
                            현재: <strong>{tier === 'free' ? '무료' : tier === 'premium' ? '프리미엄' : '울트라'}</strong>
                            {tier !== 'free' && ' (Firestore 미반영, 새로고침 시 리셋)'}
                        </div>
                    </div>
                )}

                {/* 무료 리딩 남은 횟수 (비프리미엄 사용자만) */}
                {!isPremium && usageSummary && (
                    <div className="usage-summary-card">
                        <div className="usage-header">
                            <span className="usage-icon">🎁</span>
                            <h4>무료 리딩</h4>
                            <span className="usage-reset">{usageSummary.resetIn}</span>
                        </div>
                        <div className="usage-items">
                            <div className={`usage-item ${!usageSummary.tarot.canUse ? 'depleted' : ''}`}>
                                <span className="usage-emoji">🃏</span>
                                <span className="usage-label">타로</span>
                                <span className="usage-count">{usageSummary.tarot.remaining}/{usageSummary.tarot.limit}</span>
                            </div>
                            <div className={`usage-item ${!usageSummary.dream.canUse ? 'depleted' : ''}`}>
                                <span className="usage-emoji">🌙</span>
                                <span className="usage-label">꿈</span>
                                <span className="usage-count">{usageSummary.dream.remaining}/{usageSummary.dream.limit}</span>
                            </div>
                            <div className={`usage-item ${!usageSummary.saju.canUse ? 'depleted' : ''}`}>
                                <span className="usage-emoji">🔮</span>
                                <span className="usage-label">사주</span>
                                <span className="usage-count">{usageSummary.saju.remaining}/{usageSummary.saju.limit}</span>
                            </div>
                        </div>
                        <button className="upgrade-btn" onClick={() => onOpenPremium?.('usage')}>
                            <span>👑</span> 무제한으로 업그레이드
                        </button>
                    </div>
                )}

                {/* 통계 섹션 */}
                {myStats && myStats.totalDreams > 0 && (
                    <div className="my-stats">
                        <h4>📊 타로, 꿈, 사주</h4>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{myTarots.length}</span>
                                <span className="stat-label">🃏 타로</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{myDreams.length}</span>
                                <span className="stat-label">🌙 꿈</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{myFortunes.length}</span>
                                <span className="stat-label">🔮 사주</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{myStats.totalLikes}</span>
                                <span className="stat-label">❤️ 좋아요</span>
                            </div>
                        </div>
                        {myStats.topType && (
                            <div className="stat-highlight">
                                <span className="stat-highlight-icon">{dreamTypes[myStats.topType]?.emoji}</span>
                                <div className="stat-highlight-info">
                                    <span className="stat-highlight-label">가장 많이 꾸는 꿈</span>
                                    <span className="stat-highlight-value">{dreamTypes[myStats.topType]?.name} ({myStats.topTypeCount}회)</span>
                                </div>
                            </div>
                        )}
                        {myStats.topKeywords?.length > 0 && (
                            <div className="stat-keywords">
                                <span className="stat-keywords-label">자주 등장하는 상징</span>
                                <div className="stat-keywords-list">
                                    {myStats.topKeywords.map((kw, i) => (
                                        <span key={i} className="stat-keyword">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 패턴 분석 (카테고리별) */}
                <PatternAnalysis
                    type={category}
                    data={category === 'dream' ? myDreams : category === 'tarot' ? myTarots : myFortunes}
                    dreamTypes={dreamTypes}
                    isPremium={isPremium}
                    onOpenPremium={onOpenPremium}
                    onGenerateAiInsight={onGenerateAiReport}
                />

                {/* 카테고리 탭 */}
                <div className="my-category-tabs">
                    <button
                        className={`category-tab ${category === 'tarot' ? 'active' : ''}`}
                        onClick={() => setCategory('tarot')}
                    >
                        <span className="tab-emoji">🃏</span>
                        <span className="tab-label">타로</span>
                        <span className="tab-count">{myTarots.length}</span>
                    </button>
                    <button
                        className={`category-tab ${category === 'dream' ? 'active' : ''}`}
                        onClick={() => setCategory('dream')}
                    >
                        <span className="tab-emoji">🌙</span>
                        <span className="tab-label">꿈</span>
                        <span className="tab-count">{myDreams.length}</span>
                    </button>
                    <button
                        className={`category-tab ${category === 'fortune' ? 'active' : ''}`}
                        onClick={() => setCategory('fortune')}
                    >
                        <span className="tab-emoji">🔮</span>
                        <span className="tab-label">사주</span>
                        <span className="tab-count">{myFortunes.length}</span>
                    </button>
                </div>

                {/* 뷰 토글 (꿈에서만) */}
                {category === 'dream' && (
                    <div className="view-toggle">
                        <button className={!calendar.view ? 'active' : ''} onClick={() => onSetCalendarView(false)}>📋 목록</button>
                        <button className={calendar.view ? 'active' : ''} onClick={() => onSetCalendarView(true)}>📅 캘린더</button>
                    </div>
                )}

                {/* 꿈 목록 */}
                {category === 'dream' && (
                    <>
                        {/* 캘린더 뷰 */}
                        {calendar.view ? (
                            <div className="dream-calendar">
                                <div className="calendar-header">
                                    <button onClick={onPrevMonth}>‹</button>
                                    <span>{calendar.month.getFullYear()}년 {calendar.month.getMonth() + 1}월</span>
                                    <button onClick={onNextMonth}>›</button>
                                </div>
                                <div className="calendar-weekdays">
                                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                        <span key={d}>{d}</span>
                                    ))}
                                </div>
                                <div className="calendar-days">
                                    {getCalendarDays(calendar.month).map((day, i) => {
                                        const dreamsOnDay = getDreamsForDate(myDreams, calendar.month, day);
                                        const dreamCount = dreamsOnDay.length;
                                        const firstDream = dreamsOnDay[0];
                                        return (
                                            <div
                                                key={i}
                                                className={`calendar-day ${day ? '' : 'empty'} ${dreamCount > 0 ? 'has-dream' : ''} ${dreamCount > 1 ? 'multi-dream' : ''}`}
                                                onClick={() => firstDream && onOpenDreamDetail(firstDream)}
                                            >
                                                {day && (
                                                    <>
                                                        <span className="day-number">{day}</span>
                                                        {dreamCount > 0 && (
                                                            <span className="day-emoji">{dreamTypes[firstDream.dreamType]?.emoji}</span>
                                                        )}
                                                        {dreamCount > 1 && (
                                                            <span className="dream-count-badge">+{dreamCount - 1}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="my-dreams">
                                <h4>내 꿈 기록 ({myDreams.length}개)</h4>
                                {myDreams.length === 0 ? (
                                    <p className="no-comments">아직 저장된 꿈이 없어요</p>
                                ) : (
                                    <>
                                        <div className="my-dreams-list">
                                            {myDreams.map((dream, index) => {
                                                const isLocked = !isPremium && index >= historyLimit;
                                                return (
                                                    <div
                                                        key={dream.id}
                                                        className={`my-dream-item ${isLocked ? 'locked' : ''}`}
                                                        onClick={() => isLocked ? onOpenPremium?.('history') : null}
                                                    >
                                                        <div className="my-dream-thumb" onClick={() => !isLocked && onOpenDreamDetail(dream)}>
                                                            {dream.dreamImage ? (
                                                                <img src={dream.dreamImage} alt="" />
                                                            ) : (
                                                                <span>{dreamTypes[dream.dreamType]?.emoji || '🌙'}</span>
                                                            )}
                                                            {isLocked && <div className="thumb-lock">🔒</div>}
                                                        </div>
                                                        <div className="my-dream-info" onClick={() => !isLocked && onOpenDreamDetail(dream)}>
                                                            <span className="my-dream-title">{isLocked ? '프리미엄으로 확인' : dream.title}</span>
                                                            <span className="my-dream-date">{dream.dreamDateDisplay || formatTime(dream.createdAt)}</span>
                                                            <span className="my-dream-type">{dreamTypes[dream.dreamType]?.emoji} {dreamTypes[dream.dreamType]?.name}</span>
                                                        </div>
                                                        <div className="my-dream-actions">
                                                            {isLocked ? (
                                                                <button className="unlock-btn" onClick={() => onOpenPremium?.('history')}>🔓 해제</button>
                                                            ) : (
                                                                <VisibilityDropdown
                                                                    item={dream}
                                                                    type="dream"
                                                                    onUpdate={onUpdateVisibility}
                                                                    onDelete={handleDelete}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* 무료 사용자 히스토리 더보기 유도 */}
                                        {!isPremium && myDreams.length > historyLimit && (
                                            <div className="history-upgrade-hint" onClick={() => onOpenPremium?.('history')}>
                                                <span className="hint-icon">👑</span>
                                                <span className="hint-text">프리미엄으로 {myDreams.length - historyLimit}개 기록 더 보기</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* 타로 목록 */}
                {category === 'tarot' && (
                    <div className="my-dreams">
                        <h4>내 타로 기록 ({myTarots.length}개)</h4>
                        {myTarots.length === 0 ? (
                            <p className="no-comments">아직 저장된 타로 리딩이 없어요</p>
                        ) : (
                            <>
                                <div className="my-dreams-list">
                                    {myTarots.map((tarot, index) => {
                                        const isLocked = !isPremium && index >= historyLimit;
                                        return (
                                            <div
                                                key={tarot.id}
                                                className={`my-dream-item tarot-item ${isLocked ? 'locked' : ''}`}
                                                onClick={() => isLocked ? onOpenPremium?.('history') : null}
                                            >
                                                <div className="my-dream-thumb" onClick={() => !isLocked && onOpenTarotDetail?.(tarot)}>
                                                    {tarot.pastImage || tarot.card1Image ? (
                                                        <img src={tarot.pastImage || tarot.card1Image} alt="" />
                                                    ) : (
                                                        <span>🃏</span>
                                                    )}
                                                    {isLocked && <div className="thumb-lock">🔒</div>}
                                                </div>
                                                <div className="my-dream-info" onClick={() => !isLocked && onOpenTarotDetail?.(tarot)}>
                                                    <span className="my-dream-title">{isLocked ? '프리미엄으로 확인' : tarot.title}</span>
                                                    <span className="my-dream-date">{formatTime(tarot.createdAt)}</span>
                                                    <span className="my-dream-type">
                                                        {tarot.cards?.slice(0, 3).map((c, i) => (
                                                            <span key={i} style={{ marginRight: '0.25rem' }}>{c.emoji}</span>
                                                        ))}
                                                    </span>
                                                </div>
                                                <div className="my-dream-actions">
                                                    {isLocked ? (
                                                        <button className="unlock-btn" onClick={() => onOpenPremium?.('history')}>🔓 해제</button>
                                                    ) : (
                                                        <VisibilityDropdown
                                                            item={tarot}
                                                            type="tarot"
                                                            onUpdate={onUpdateVisibility}
                                                            onDelete={handleDelete}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* 무료 사용자 히스토리 더보기 유도 */}
                                {!isPremium && myTarots.length > historyLimit && (
                                    <div className="history-upgrade-hint" onClick={() => onOpenPremium?.('history')}>
                                        <span className="hint-icon">👑</span>
                                        <span className="hint-text">프리미엄으로 {myTarots.length - historyLimit}개 기록 더 보기</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* 사주 목록 */}
                {category === 'fortune' && (
                    <div className="my-dreams">
                        <h4>내 사주 기록 ({myFortunes.length}개)</h4>
                        {myFortunes.length === 0 ? (
                            <p className="no-comments">아직 저장된 사주가 없어요</p>
                        ) : (
                            <>
                                <div className="my-dreams-list">
                                    {myFortunes.map((fortune, index) => {
                                        const isLocked = !isPremium && index >= historyLimit;
                                        return (
                                            <div
                                                key={fortune.id}
                                                className={`my-dream-item fortune-item ${isLocked ? 'locked' : ''}`}
                                                onClick={() => isLocked ? onOpenPremium?.('history') : null}
                                            >
                                                <div className="my-dream-thumb" onClick={() => !isLocked && onOpenFortuneDetail?.(fortune)}>
                                                    {fortune.morningImage ? (
                                                        <img src={fortune.morningImage} alt="" />
                                                    ) : (
                                                        <span>🔮</span>
                                                    )}
                                                    {isLocked && <div className="thumb-lock">🔒</div>}
                                                </div>
                                                <div className="my-dream-info" onClick={() => !isLocked && onOpenFortuneDetail?.(fortune)}>
                                                    <span className="my-dream-title">{isLocked ? '프리미엄으로 확인' : fortune.title}</span>
                                                    <span className="my-dream-date">{formatTime(fortune.createdAt)}</span>
                                                    <span className="my-dream-type">
                                                        점수: {fortune.score}점
                                                    </span>
                                                </div>
                                                <div className="my-dream-actions">
                                                    {isLocked ? (
                                                        <button className="unlock-btn" onClick={() => onOpenPremium?.('history')}>🔓 해제</button>
                                                    ) : (
                                                        <VisibilityDropdown
                                                            item={fortune}
                                                            type="fortune"
                                                            onUpdate={onUpdateVisibility}
                                                            onDelete={handleDelete}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* 무료 사용자 히스토리 더보기 유도 */}
                                {!isPremium && myFortunes.length > historyLimit && (
                                    <div className="history-upgrade-hint" onClick={() => onOpenPremium?.('history')}>
                                        <span className="hint-icon">👑</span>
                                        <span className="hint-text">프리미엄으로 {myFortunes.length - historyLimit}개 기록 더 보기</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default MyPage;
