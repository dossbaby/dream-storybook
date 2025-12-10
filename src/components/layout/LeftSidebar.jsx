const LeftSidebar = ({
    mode,
    onlineCount,
    todayStats,
    dreamTypes,
    typeFilter,
    typeCounts,
    popularKeywords,
    tarotKeywords = [],
    tarotTopicCounts = {},
    categories,
    onTypeFilterChange,
    onFilterBySymbol
}) => {
    return (
        <aside className="left-sidebar">
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
                                            onClick={() => onFilterBySymbol(kw.word || kw)}
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
                                            onClick={() => onFilterBySymbol(kw)}
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
                <>
                    {/* 주제별 메뉴 */}
                    <div className="tarot-topics-menu">
                        <div className="tarot-topics-header">주제별</div>
                        <div className="tarot-topics-list">
                            {[
                                { topic: '사랑', emoji: '💕' },
                                { topic: '관계', emoji: '🙌' },
                                { topic: '돈', emoji: '💰' },
                                { topic: '성장', emoji: '🌱' },
                                { topic: '건강', emoji: '💪' },
                                { topic: '선택', emoji: '⚖️' },
                                { topic: '일반', emoji: '💬' }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="tarot-topic-item"
                                    onClick={() => onFilterBySymbol(item.topic, 'tarot')}
                                >
                                    <span className="topic-emoji">{item.emoji}</span>
                                    <span className="topic-name">{item.topic}</span>
                                    {tarotTopicCounts[item.topic] > 0 && (
                                        <span className="topic-count">{tarotTopicCounts[item.topic]}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
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
