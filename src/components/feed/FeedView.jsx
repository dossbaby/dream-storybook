const FeedView = ({
    mode,
    dreams,
    tarotReadings,
    fortuneReadings,
    onCreateClick,
    onOpenDreamDetail,
    onOpenTarotResult,
    onOpenFortuneResult
}) => {
    if (mode === 'dream') {
        return (
            <div className="card-container feed-container">
                <h2 className="create-title">오늘 밤 어떤 꿈을 꿨어?</h2>
                <p className="create-subtitle">꿈을 말해주면 해몽해줄게</p>
                <button className="nav-btn-create" onClick={onCreateClick} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                    + 꿈 해몽 시작하기
                </button>
            </div>
        );
    }

    if (mode === 'tarot') {
        return (
            <div className="card-container feed-container tarot-theme">
                <h2 className="create-title">타로에게 물어보세요</h2>
                <p className="create-subtitle">카드가 당신의 운명을 속삭여요</p>
                <button className="nav-btn-create tarot-btn" onClick={onCreateClick} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                    + 타로 카드 뽑기
                </button>
                {/* 타로 피드 */}
                {tarotReadings.length > 0 && (
                    <div className="feed-list">
                        <h3 className="feed-section-title">최근 타로 리딩</h3>
                        {tarotReadings.slice(0, 10).map(tarot => (
                            <div key={tarot.id} className="feed-card tarot-feed" onClick={() => onOpenTarotResult(tarot)}>
                                {tarot.pastImage && <img src={tarot.pastImage} alt="" className="feed-thumbnail" />}
                                <div className="feed-info">
                                    <span className="feed-title">{tarot.title}</span>
                                    <span className="feed-author">{tarot.userName}</span>
                                    <span className="feed-verdict">{tarot.verdict}</span>
                                    <div className="feed-cards-mini">
                                        {tarot.cards?.map((c, i) => <span key={i}>{c.emoji}</span>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (mode === 'fortune') {
        return (
            <div className="card-container feed-container fortune-theme">
                <h2 className="create-title">오늘의 운세를 확인하세요</h2>
                <p className="create-subtitle">하루의 기운을 미리 엿보세요</p>
                <button className="nav-btn-create fortune-btn" onClick={onCreateClick} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                    + 오늘의 운세 보기
                </button>
                {/* 운세 피드 */}
                {fortuneReadings.length > 0 && (
                    <div className="feed-list">
                        <h3 className="feed-section-title">최근 운세</h3>
                        {fortuneReadings.slice(0, 10).map(fortune => (
                            <div key={fortune.id} className="feed-card fortune-feed" onClick={() => onOpenFortuneResult(fortune)}>
                                {fortune.morningImage && <img src={fortune.morningImage} alt="" className="feed-thumbnail" />}
                                <div className="feed-info">
                                    <span className="feed-title">{fortune.title}</span>
                                    <span className="feed-author">{fortune.userName}</span>
                                    <span className="feed-verdict">{fortune.verdict}</span>
                                    <span className="feed-score">운세 점수: {fortune.score}점</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default FeedView;
