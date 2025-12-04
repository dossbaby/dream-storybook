const RightSidebar = ({
    mode,
    tabs,
    activeTab,
    loading,
    dreams,
    tarotReadings,
    fortuneReadings,
    dreamTypes,
    onTabChange,
    onOpenDreamDetail,
    onOpenTarotResult,
    onOpenFortuneResult,
    onCreateClick
}) => {
    const getModeTitle = () => {
        switch(mode) {
            case 'dream': return '실시간 꿈 피드';
            case 'tarot': return '실시간 타로 피드';
            case 'fortune': return '실시간 운세 피드';
            default: return '실시간 피드';
        }
    };

    const getLoadingText = () => {
        switch(mode) {
            case 'dream': return '꿈을 불러오는 중...';
            case 'tarot': return '타로를 불러오는 중...';
            case 'fortune': return '운세를 불러오는 중...';
            default: return '불러오는 중...';
        }
    };

    const getEmptyText = () => {
        switch(mode) {
            case 'dream': return '아직 공유된 꿈이 없어요';
            case 'tarot': return '아직 공유된 타로가 없어요';
            case 'fortune': return '아직 공유된 운세가 없어요';
            default: return '아직 공유된 내용이 없어요';
        }
    };

    const getCreateText = () => {
        switch(mode) {
            case 'dream': return '첫 꿈 해몽하기';
            case 'tarot': return '첫 타로 보기';
            case 'fortune': return '첫 운세 보기';
            default: return '시작하기';
        }
    };

    const getCurrentFeed = () => {
        switch(mode) {
            case 'dream': return dreams || [];
            case 'tarot': return tarotReadings || [];
            case 'fortune': return fortuneReadings || [];
            default: return [];
        }
    };

    const handleItemClick = (item) => {
        switch(mode) {
            case 'dream': onOpenDreamDetail?.(item); break;
            case 'tarot': onOpenTarotResult?.(item); break;
            case 'fortune': onOpenFortuneResult?.(item); break;
        }
    };

    const currentFeed = getCurrentFeed();

    const renderDreamItem = (dream) => (
        <div key={dream.id} className="feed-item" onClick={() => handleItemClick(dream)}>
            <div className="feed-item-thumb">
                {dream.dreamImage ? (
                    <img src={dream.dreamImage} alt="" />
                ) : (
                    <div className="feed-item-thumb-placeholder">
                        {dreamTypes[dream.dreamType]?.emoji || '🌙'}
                    </div>
                )}
            </div>
            <div className="feed-item-content">
                <span className="feed-item-type">
                    {dreamTypes[dream.dreamType]?.emoji} {dreamTypes[dream.dreamType]?.name}
                </span>
                <span className="feed-item-title">{dream.title}</span>
                <span className="feed-item-verdict">{dream.verdict}</span>
                <div className="feed-item-meta">
                    <span className="feed-item-author">
                        {dream.userPhoto && <img src={dream.userPhoto} alt="" />}
                        {dream.userName}
                    </span>
                    <span className="feed-item-stats">
                        ❤️ {dream.likeCount || 0} 💬 {dream.commentCount || 0}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderTarotItem = (tarot) => (
        <div key={tarot.id} className="feed-item tarot-item" onClick={() => handleItemClick(tarot)}>
            <div className="feed-item-thumb">
                {tarot.pastImage ? (
                    <img src={tarot.pastImage} alt="" />
                ) : (
                    <div className="feed-item-thumb-placeholder">🃏</div>
                )}
            </div>
            <div className="feed-item-content">
                <span className="feed-item-type">🃏 타로</span>
                <span className="feed-item-title">{tarot.title || tarot.question}</span>
                <span className="feed-item-verdict">{tarot.verdict}</span>
                <div className="feed-item-meta">
                    <span className="feed-item-author">
                        {tarot.userPhoto && <img src={tarot.userPhoto} alt="" />}
                        {tarot.userName}
                    </span>
                    <span className="feed-item-stats">
                        ❤️ {tarot.likeCount || 0}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderFortuneItem = (fortune) => (
        <div key={fortune.id} className="feed-item fortune-item" onClick={() => handleItemClick(fortune)}>
            <div className="feed-item-thumb">
                {fortune.morningImage ? (
                    <img src={fortune.morningImage} alt="" />
                ) : (
                    <div className="feed-item-thumb-placeholder">🔮</div>
                )}
            </div>
            <div className="feed-item-content">
                <span className="feed-item-type">🔮 운세</span>
                <span className="feed-item-title">{fortune.title}</span>
                <span className="feed-item-verdict">{fortune.verdict}</span>
                <div className="feed-item-meta">
                    <span className="feed-item-author">
                        {fortune.userPhoto && <img src={fortune.userPhoto} alt="" />}
                        {fortune.userName}
                    </span>
                    <span className="feed-item-stats">
                        점수: {fortune.score}점
                    </span>
                </div>
            </div>
        </div>
    );

    const renderItem = (item) => {
        switch(mode) {
            case 'dream': return renderDreamItem(item);
            case 'tarot': return renderTarotItem(item);
            case 'fortune': return renderFortuneItem(item);
            default: return null;
        }
    };

    return (
        <aside className={`right-sidebar ${mode}-mode`}>
            <div className="feed-header">
                <div className="feed-header-top">
                    <span className="live-dot small"></span>
                    <span className="feed-title">{getModeTitle()}</span>
                </div>

                {/* 꿈 모드일 때만 필터 탭 표시 */}
                {mode === 'dream' && tabs && (
                    <div className="feed-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`feed-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => onTabChange(tab.id)}
                                title={tab.tooltip}
                            >
                                {tab.icon}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="feed-loading">{getLoadingText()}</div>
            ) : currentFeed.length === 0 ? (
                <div className="feed-empty">
                    <p>{getEmptyText()}</p>
                    <button onClick={onCreateClick}>{getCreateText()}</button>
                </div>
            ) : (
                <div className="feed-list">
                    {currentFeed.map(item => renderItem(item))}
                </div>
            )}
        </aside>
    );
};

export default RightSidebar;
