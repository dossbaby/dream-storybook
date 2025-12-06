import { useState } from 'react';

const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

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
    onDeleteDream,
    formatTime
}) => {
    // 현재 선택된 카테고리 (dream, tarot, fortune)
    const [category, setCategory] = useState('dream');

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

                {/* AI 리포트 버튼 */}
                {myDreams.length >= 3 && (
                    <button className="ai-report-btn" onClick={onGenerateAiReport}>
                        🔮 AI 꿈 패턴 분석 리포트
                    </button>
                )}

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
                                    <div className="my-dreams-list">
                                        {myDreams.map(dream => (
                                            <div key={dream.id} className="my-dream-item">
                                                <div className="my-dream-thumb" onClick={() => onOpenDreamDetail(dream)}>
                                                    {dream.dreamImage ? (
                                                        <img src={dream.dreamImage} alt="" />
                                                    ) : (
                                                        <span>{dreamTypes[dream.dreamType]?.emoji || '🌙'}</span>
                                                    )}
                                                </div>
                                                <div className="my-dream-info" onClick={() => onOpenDreamDetail(dream)}>
                                                    <span className="my-dream-title">{dream.title}</span>
                                                    <span className="my-dream-date">{dream.dreamDateDisplay || formatTime(dream.createdAt)}</span>
                                                    <span className="my-dream-type">{dreamTypes[dream.dreamType]?.emoji} {dreamTypes[dream.dreamType]?.name}</span>
                                                </div>
                                                <div className="my-dream-actions">
                                                    <div
                                                        className="visibility-toggle"
                                                        onClick={(e) => { e.stopPropagation(); onToggleDreamVisibility(dream.id, dream.isPublic); }}
                                                    >
                                                        <div className={`toggle-switch ${dream.isPublic ? 'active' : ''}`}></div>
                                                        <span className={`visibility-label ${dream.isPublic ? 'public' : ''}`}>
                                                            {dream.isPublic ? '공개' : '비공개'}
                                                        </span>
                                                    </div>
                                                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDeleteDream(dream.id, dream); }}>삭제</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                            <div className="my-dreams-list">
                                {myTarots.map(tarot => (
                                    <div key={tarot.id} className="my-dream-item tarot-item">
                                        <div className="my-dream-thumb" onClick={() => onOpenTarotDetail?.(tarot)}>
                                            {tarot.pastImage || tarot.card1Image ? (
                                                <img src={tarot.pastImage || tarot.card1Image} alt="" />
                                            ) : (
                                                <span>🃏</span>
                                            )}
                                        </div>
                                        <div className="my-dream-info" onClick={() => onOpenTarotDetail?.(tarot)}>
                                            <span className="my-dream-title">{tarot.title}</span>
                                            <span className="my-dream-date">{formatTime(tarot.createdAt)}</span>
                                            <span className="my-dream-type">
                                                {tarot.cards?.slice(0, 3).map((c, i) => (
                                                    <span key={i} style={{ marginRight: '0.25rem' }}>{c.emoji}</span>
                                                ))}
                                            </span>
                                        </div>
                                        <div className="my-dream-actions">
                                            <span className={`visibility-label ${tarot.isPublic ? 'public' : ''}`}>
                                                {tarot.isPublic ? '🌐 공개' : '🔒 비공개'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                            <div className="my-dreams-list">
                                {myFortunes.map(fortune => (
                                    <div key={fortune.id} className="my-dream-item fortune-item">
                                        <div className="my-dream-thumb" onClick={() => onOpenFortuneDetail?.(fortune)}>
                                            {fortune.morningImage ? (
                                                <img src={fortune.morningImage} alt="" />
                                            ) : (
                                                <span>🔮</span>
                                            )}
                                        </div>
                                        <div className="my-dream-info" onClick={() => onOpenFortuneDetail?.(fortune)}>
                                            <span className="my-dream-title">{fortune.title}</span>
                                            <span className="my-dream-date">{formatTime(fortune.createdAt)}</span>
                                            <span className="my-dream-type">
                                                점수: {fortune.score}점
                                            </span>
                                        </div>
                                        <div className="my-dream-actions">
                                            <span className={`visibility-label ${fortune.isPublic ? 'public' : ''}`}>
                                                {fortune.isPublic ? '🌐 공개' : '🔒 비공개'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default MyPage;
