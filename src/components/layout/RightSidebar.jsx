import { SkeletonList } from '../common/SkeletonCard';

const RightSidebar = ({
    mode,
    loading,
    dreams,
    tarotReadings,
    fortuneReadings,
    dreamTypes,
    onOpenDreamDetail,
    onOpenTarotResult,
    onOpenFortuneResult,
    onCreateClick
}) => {
    // EGR (Engagement Rate) 계산: 좋아요×2 + 댓글×1
    const calculateEGR = (item) => {
        return ((item.likeCount || 0) * 2) + (item.commentCount || 0);
    };

    // EGR 기준으로 정렬 후 상위 5개 반환
    const sortByEGR = (items) => {
        return [...(items || [])]
            .map(item => ({ ...item, egr: calculateEGR(item) }))
            .sort((a, b) => b.egr - a.egr)
            .slice(0, 5);
    };

    const getModeTitle = () => {
        switch(mode) {
            case 'dream': return '인기 꿈 해몽';
            case 'tarot': return '인기 타로 리딩';
            case 'fortune': return '인기 운세';
            default: return '인기 피드';
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
            case 'dream': return '아직 인기 꿈 해몽이 없어요';
            case 'tarot': return '아직 인기 타로가 없어요';
            case 'fortune': return '아직 인기 운세가 없어요';
            default: return '아직 인기 콘텐츠가 없어요';
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
            case 'dream': return sortByEGR(dreams);
            case 'tarot': return sortByEGR(tarotReadings);
            case 'fortune': return sortByEGR(fortuneReadings);
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

    const renderDreamItem = (dream, index) => (
        <div key={dream.id} className="feed-item popular-item" onClick={() => handleItemClick(dream)}>
            <span className={`popular-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}`}>
                {index + 1}
            </span>
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

    const renderTarotItem = (tarot, index) => (
        <div key={tarot.id} className="feed-item tarot-item popular-item" onClick={() => handleItemClick(tarot)}>
            <span className={`popular-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}`}>
                {index + 1}
            </span>
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
                        ❤️ {tarot.likeCount || 0} 💬 {tarot.commentCount || 0}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderFortuneItem = (fortune, index) => (
        <div key={fortune.id} className="feed-item fortune-item popular-item" onClick={() => handleItemClick(fortune)}>
            <span className={`popular-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}`}>
                {index + 1}
            </span>
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
                        ❤️ {fortune.likeCount || 0} 💬 {fortune.commentCount || 0}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderItem = (item, index) => {
        switch(mode) {
            case 'dream': return renderDreamItem(item, index);
            case 'tarot': return renderTarotItem(item, index);
            case 'fortune': return renderFortuneItem(item, index);
            default: return null;
        }
    };

    return (
        <aside className={`right-sidebar ${mode}-mode`}>
            <div className="feed-header">
                <div className="feed-header-top">
                    <span className="popular-icon">🔥</span>
                    <span className="feed-title">{getModeTitle()}</span>
                </div>
            </div>

            {loading ? (
                <SkeletonList count={4} type="sidebar" />
            ) : currentFeed.length === 0 ? (
                <div className="feed-empty">
                    <p>{getEmptyText()}</p>
                    <button onClick={onCreateClick}>{getCreateText()}</button>
                </div>
            ) : (
                <div className="feed-list popular-list">
                    {currentFeed.map((item, index) => renderItem(item, index))}
                </div>
            )}
        </aside>
    );
};

export default RightSidebar;
