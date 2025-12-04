const MyPage = ({
    user,
    userNickname,
    userBadges,
    BADGES,
    myStats,
    myDreams,
    dreamTypes,
    calendar,
    onBack,
    onOpenNicknameModal,
    onLogout,
    onGenerateAiReport,
    onSetCalendarView,
    onPrevMonth,
    onNextMonth,
    getCalendarDays,
    getDreamsForDate,
    onOpenDreamDetail,
    onToggleDreamVisibility,
    onDeleteDream,
    formatTime
}) => {
    return (
        <>
            <div className="my-page-content">
                <div className="my-profile">
                    <img src={user.photoURL || '/default-avatar.png'} alt="" className="my-avatar" />
                    <h3>{userNickname || user.displayName}</h3>
                    <p>{user.email}</p>
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
                    <div className="my-profile-actions">
                        <button className="nickname-btn" onClick={onOpenNicknameModal}>
                            닉네임 설정
                        </button>
                        <button className="logout-btn" onClick={onLogout}>로그아웃</button>
                    </div>
                </div>
                {/* 통계 섹션 */}
                {myStats && myStats.totalDreams > 0 && (
                    <div className="my-stats">
                        <h4>📊 내 꿈 통계</h4>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{myStats.totalDreams}</span>
                                <span className="stat-label">총 꿈</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{myStats.totalLikes}</span>
                                <span className="stat-label">받은 좋아요</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{myStats.uniqueTypes}</span>
                                <span className="stat-label">꿈 유형</span>
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

                {/* 캘린더 뷰 토글 */}
                <div className="view-toggle">
                    <button className={!calendar.view ? 'active' : ''} onClick={() => onSetCalendarView(false)}>📋 목록</button>
                    <button className={calendar.view ? 'active' : ''} onClick={() => onSetCalendarView(true)}>📅 캘린더</button>
                </div>

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
                            {getCalendarDays().map((day, i) => {
                                const dreamsOnDay = getDreamsForDate(day);
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
            </div>
        </>
    );
};

export default MyPage;
