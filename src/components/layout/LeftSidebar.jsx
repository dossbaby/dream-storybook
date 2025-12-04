const LeftSidebar = ({
    mode,
    onlineCount,
    todayStats,
    dreamTypes,
    hotDreams,
    hotTarots,
    hotFortunes,
    typeFilter,
    typeCounts,
    popularKeywords,
    categories,
    onOpenDreamDetail,
    onOpenTarotResult,
    onOpenFortuneResult,
    onTypeFilterChange,
    onOpenSymbolShorts
}) => {
    // 통합 HOT 랭킹 (꿈/타로/운세 합산)
    const getUnifiedHotList = () => {
        const dreamItems = (hotDreams || []).map(d => ({ ...d, type: 'dream', score: d.likeCount || 0 }));
        const tarotItems = (hotTarots || []).map(t => ({ ...t, type: 'tarot', score: t.likeCount || 0 }));
        const fortuneItems = (hotFortunes || []).map(f => ({ ...f, type: 'fortune', score: f.likeCount || 0 }));
        return [...dreamItems, ...tarotItems, ...fortuneItems]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    };

    const unifiedHot = getUnifiedHotList();

    const getTypeIcon = (type) => {
        switch(type) {
            case 'dream': return '🌙';
            case 'tarot': return '🃏';
            case 'fortune': return '🔮';
            default: return '✨';
        }
    };

    const handleHotItemClick = (item) => {
        if (item.type === 'dream') onOpenDreamDetail?.(item);
        else if (item.type === 'tarot') onOpenTarotResult?.(item);
        else if (item.type === 'fortune') onOpenFortuneResult?.(item);
    };

    return (
        <aside className="left-sidebar">
            {/* 실시간 통합 상태 */}
            <div className="live-status-card">
                <div className="live-status-header">
                    <span className="live-dot"></span>
                    <span className="live-label">LIVE</span>
                </div>
                <div className="live-stats">
                    <div className="live-stat-row">
                        <span className="live-stat-label">접속 중</span>
                        <span className="live-stat-value">{onlineCount}명</span>
                    </div>
                    <div className="live-stat-row">
                        <span className="live-stat-label">오늘 활동</span>
                        <span className="live-stat-value highlight">{todayStats.total}개</span>
                    </div>
                    {todayStats.topType && dreamTypes[todayStats.topType] && (
                        <div className="live-stat-row">
                            <span className="live-stat-label">인기 유형</span>
                            <span className="live-stat-value">
                                {dreamTypes[todayStats.topType]?.emoji} {dreamTypes[todayStats.topType]?.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 통합 HOT 랭킹 */}
            {unifiedHot.length > 0 && (
                <div className="hot-ranking-card">
                    <div className="hot-ranking-header">
                        <span className="fire-icon">🔥</span>
                        <span className="hot-ranking-title">HOT 랭킹</span>
                    </div>
                    <div className="hot-ranking-list">
                        {unifiedHot.map((item, i) => (
                            <div key={`${item.type}-${item.id}`} className="hot-item" onClick={() => handleHotItemClick(item)}>
                                <span className={`hot-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze'}`}>
                                    {i + 1}
                                </span>
                                <div className="hot-info">
                                    <div className="hot-title">
                                        <span className="hot-type-icon">{getTypeIcon(item.type)}</span>
                                        {item.title}
                                    </div>
                                    <div className="hot-meta">❤️ {item.score}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 모드별 추가 정보 */}
            {mode === 'dream' && (
                <>
                    {/* 꿈 유형별 통계 */}
                    <div className="type-stats-card">
                        <div className="type-stats-header">꿈 유형</div>
                        <div className="type-stats-grid">
                            {Object.entries(dreamTypes).map(([key, type]) => (
                                <div
                                    key={key}
                                    className={`type-stat-item ${typeFilter === key ? 'active' : ''}`}
                                    onClick={() => onTypeFilterChange(typeFilter === key ? null : key)}
                                >
                                    <span className="type-emoji">{type.emoji}</span>
                                    <span className="type-name">{type.name}</span>
                                    <span className="type-count">{typeCounts[key] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 꿈 상징 */}
                    <div className="unified-symbols-card">
                        <div className="unified-symbols-header">
                            <span>✨</span>
                            <span>꿈 상징</span>
                            <span className="symbol-hint">클릭해서 관련 꿈 보기</span>
                        </div>

                        {popularKeywords.length > 0 && (
                            <div className="symbol-section">
                                <span className="symbol-section-label">🔥 인기</span>
                                <div className="symbol-tags">
                                    {popularKeywords.slice(0, 8).map((kw, i) => (
                                        <span
                                            key={i}
                                            className={`symbol-tag hot ${kw.isRecent ? 'recent' : ''}`}
                                            onClick={() => onOpenSymbolShorts(kw.word || kw)}
                                        >
                                            {kw.isRecent && <span className="symbol-new-dot"></span>}
                                            {kw.word || kw}
                                            {kw.count && <span className="symbol-count">{kw.count}</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {categories && Object.entries(categories).map(([key, cat]) => (
                            <div key={key} className="symbol-section">
                                <span className="symbol-section-label">{cat.emoji} {cat.name}</span>
                                <div className="symbol-tags">
                                    {cat.keywords.slice(0, 6).map((kw, i) => (
                                        <span
                                            key={i}
                                            className="symbol-tag"
                                            onClick={() => onOpenSymbolShorts(kw)}
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {mode === 'tarot' && (
                <div className="mode-info-card tarot-theme">
                    <div className="mode-info-header">🃏 타로 가이드</div>
                    <div className="mode-info-content">
                        <p>3장의 카드가 과거, 현재, 미래를 보여줍니다.</p>
                        <div className="tarot-spreads">
                            <span className="spread-tag">연애운</span>
                            <span className="spread-tag">금전운</span>
                            <span className="spread-tag">직장운</span>
                            <span className="spread-tag">오늘의 조언</span>
                        </div>
                    </div>
                </div>
            )}

            {mode === 'fortune' && (
                <div className="mode-info-card fortune-theme">
                    <div className="mode-info-header">🔮 운세 가이드</div>
                    <div className="mode-info-content">
                        <p>생년월일로 더 정확한 운세를 받아보세요.</p>
                        <div className="fortune-types">
                            <span className="fortune-tag">오늘의 운세</span>
                            <span className="fortune-tag">이번 주 운세</span>
                            <span className="fortune-tag">이번 달 운세</span>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default LeftSidebar;
