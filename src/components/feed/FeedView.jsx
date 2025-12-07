import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Reactions from '../common/Reactions';
import InlineComments from '../common/InlineComments';
import { getTagUrl } from '../../utils/tagUtils';

const FeedView = ({
    mode,
    dreams,
    tarotReadings,
    fortuneReadings,
    dreamTypes,
    popularKeywords,
    symbolFilter,
    onCreateClick,
    onOpenDreamDetail,
    onOpenTarotResult,
    onOpenFortuneResult,
    onKeywordFilter,
    onClearSymbolFilter,
    onModeChange,
    user,
    onLoginRequired
}) => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState(null);

    // 외부 symbolFilter가 변경되면 activeFilter도 업데이트
    useEffect(() => {
        if (symbolFilter) {
            setActiveFilter(symbolFilter);
        }
    }, [symbolFilter]);

    // 현재 적용된 필터 (외부 symbolFilter 우선)
    const currentFilter = symbolFilter || activeFilter;

    // 키워드 필터링된 콘텐츠
    const filteredDreams = currentFilter
        ? dreams.filter(d => d.keywords?.some(k =>
            k.word === currentFilter ||
            k.word.includes(currentFilter) ||
            currentFilter.includes(k.word)
        ))
        : dreams;

    const filteredTarots = currentFilter
        ? tarotReadings.filter(t =>
            // topics 배열로 필터링 (기존 topic 호환)
            (t.topics || (t.topic ? [t.topic] : [])).includes(currentFilter) ||
            // keywords로 필터링
            t.keywords?.some(k =>
                k.word === currentFilter ||
                k.word.includes(currentFilter) ||
                currentFilter.includes(k.word)
            ))
        : tarotReadings;

    const filteredFortunes = currentFilter
        ? fortuneReadings.filter(f => f.keywords?.some(k =>
            k.word === currentFilter ||
            k.word.includes(currentFilter) ||
            currentFilter.includes(k.word)
        ))
        : fortuneReadings;

    // 필터 해제 핸들러
    const clearFilter = () => {
        setActiveFilter(null);
        onClearSymbolFilter?.();
    };

    // 태그 클릭 핸들러 - 로컬 필터링
    const handleTagClick = (keyword) => {
        if (currentFilter === keyword) {
            clearFilter();
        } else {
            setActiveFilter(keyword);
            onClearSymbolFilter?.(); // 외부 필터 해제
        }
        onKeywordFilter?.(keyword);
    };

    // 태그 페이지로 이동 (pSEO)
    const navigateToTagPage = (keyword, e) => {
        e?.stopPropagation();
        navigate(getTagUrl(keyword));
    };

    // 공통 태그 바
    const renderTagBar = (keywords) => (
        <div className="feed-tag-bar">
            <button
                className={`feed-tag ${!currentFilter ? 'active' : ''}`}
                onClick={clearFilter}
            >
                전체
            </button>
            {keywords?.slice(0, 8).map((kw, i) => (
                <button
                    key={i}
                    className={`feed-tag ${currentFilter === kw ? 'active' : ''}`}
                    onClick={() => handleTagClick(kw)}
                >
                    {kw}
                </button>
            ))}
        </div>
    );

    // 시간 포맷팅
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        return date.toLocaleDateString('ko-KR');
    };

    // 트렌딩 키워드 (모든 콘텐츠에서)
    const getTrendingKeywords = () => {
        const allKeywords = [
            ...dreams.flatMap(d => d.keywords?.map(k => k.word) || []),
            ...tarotReadings.flatMap(t => t.keywords?.map(k => k.word) || []),
            ...fortuneReadings.flatMap(f => f.keywords?.map(k => k.word) || [])
        ];
        const counts = {};
        allKeywords.forEach(k => { counts[k] = (counts[k] || 0) + 1; });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => ({ word, count }));
    };

    const trendingKeywords = getTrendingKeywords();

    // 트렌딩 섹션
    const renderTrending = () => (
        <div className="trending-section">
            <div className="trending-header">
                <div className="trending-title">
                    <span className="icon">🔥</span>
                    <span>지금 핫한 키워드</span>
                </div>
            </div>
            <div className="trending-chips">
                {trendingKeywords.map((item, i) => (
                    <button
                        key={item.word}
                        className={`trending-chip ${currentFilter === item.word ? 'active' : ''}`}
                        onClick={() => navigateToTagPage(item.word)}
                    >
                        {i < 3 && <span className="fire">🔥</span>}
                        #{item.word}
                        <span className="trending-count">{item.count}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    // 빈 상태 렌더링
    const renderEmptyState = (type) => {
        const emptyStates = {
            dream: {
                emoji: '🌙',
                title: '아직 공유된 꿈이 없어요',
                subtitle: '첫 번째로 꿈을 공유해보세요!',
                btnText: '꿈 해몽하기',
                btnEmoji: '✨'
            },
            tarot: {
                emoji: '🃏',
                title: '아직 타로 리딩이 없어요',
                subtitle: '카드가 당신을 기다리고 있어요',
                btnText: '타로 보기',
                btnEmoji: '🔮'
            },
            fortune: {
                emoji: '🔮',
                title: '아직 사주가 없어요',
                subtitle: '오늘의 사주를 확인해보세요',
                btnText: '사주 보기',
                btnEmoji: '⭐'
            },
            filtered: {
                emoji: '🔍',
                title: `"${currentFilter}" 관련 결과가 없어요`,
                subtitle: '다른 키워드로 검색해보세요',
                btnText: '필터 해제',
                btnEmoji: '✕'
            }
        };

        const state = currentFilter ? emptyStates.filtered : emptyStates[type];

        return (
            <div className="feed-empty-state">
                <div className="empty-illustration">
                    <span className="empty-emoji">{state.emoji}</span>
                    <div className="empty-sparkles">
                        <span>✦</span>
                        <span>✧</span>
                        <span>✦</span>
                    </div>
                </div>
                <h3 className="empty-title">{state.title}</h3>
                <p className="empty-subtitle">{state.subtitle}</p>
                <button
                    className="empty-action-btn"
                    onClick={currentFilter ? clearFilter : onCreateClick}
                >
                    <span>{state.btnEmoji}</span>
                    <span>{state.btnText}</span>
                </button>
            </div>
        );
    };

    if (mode === 'dream') {
        return (
            <div className="feed-view dream-feed">
                {/* 트렌딩 섹션 */}
                {trendingKeywords.length > 0 && renderTrending()}

                {/* 필터 상태 표시 (사이드바에서 필터링 시) */}
                {currentFilter && (
                    <div className="filter-status">
                        <span>"{currentFilter}" 관련 꿈 {filteredDreams.length}개</span>
                        <button onClick={clearFilter}>✕ 필터 해제</button>
                    </div>
                )}

                {/* 꿈 그리드 */}
                {filteredDreams.length === 0 ? (
                    renderEmptyState('dream')
                ) : (
                    <div className="feed-grid">
                        {filteredDreams.map(dream => (
                            <div
                                key={dream.id}
                                className="feed-card"
                                onClick={() => onOpenDreamDetail(dream)}
                            >
                                <div className="feed-card-thumb">
                                    {dream.dreamImage ? (
                                        <img src={dream.dreamImage} alt="" />
                                    ) : (
                                        <div className="feed-card-emoji">
                                            {dreamTypes?.[dream.dreamType]?.emoji || '🌙'}
                                        </div>
                                    )}
                                    <div className="feed-card-overlay">
                                        <span className="feed-card-type">
                                            {dreamTypes?.[dream.dreamType]?.emoji} {dreamTypes?.[dream.dreamType]?.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="feed-card-info">
                                    <h3 className="feed-card-title">{dream.title}</h3>
                                    <p className="feed-card-verdict">{dream.verdict}</p>
                                    <div className="feed-card-meta">
                                        <span className="feed-card-author">{dream.userName || '익명'}</span>
                                        <span className="feed-card-time">{formatTime(dream.createdAt)}</span>
                                    </div>
                                    {dream.keywords?.length > 0 && (
                                        <div className="feed-card-tags">
                                            {dream.keywords.slice(0, 3).map((k, i) => (
                                                <span
                                                    key={i}
                                                    className="feed-card-tag"
                                                    onClick={(e) => navigateToTagPage(k.word, e)}
                                                >
                                                    #{k.word}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="feed-card-stats">
                                        <span>❤️ {dream.likeCount || 0}</span>
                                        <span>💬 {dream.commentCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (mode === 'tarot') {
        return (
            <div className="feed-view tarot-feed">
                {/* 필터 상태 표시 (사이드바에서 필터링 시) */}
                {currentFilter && (
                    <div className="filter-status">
                        <span>"{currentFilter}" 관련 타로 {filteredTarots.length}개</span>
                        <button onClick={clearFilter}>✕ 필터 해제</button>
                    </div>
                )}

                {/* 타로 그리드 */}
                {filteredTarots.length === 0 ? (
                    renderEmptyState('tarot')
                ) : (
                    <div className="feed-grid">
                        {filteredTarots.map(tarot => (
                            <div
                                key={tarot.id}
                                className="feed-card"
                                onClick={() => onOpenTarotResult(tarot)}
                            >
                                <div className="feed-card-thumb">
                                    {tarot.pastImage ? (
                                        <img src={tarot.pastImage} alt="" />
                                    ) : (
                                        <div className="feed-card-emoji">🃏</div>
                                    )}
                                    <div className="feed-card-overlay tarot-overlay">
                                        <div className="feed-card-cards">
                                            {tarot.cards?.map((c, i) => (
                                                <span key={i} className="mini-card">{c.emoji}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="feed-card-info">
                                    <h3 className="feed-card-title">{tarot.title}</h3>
                                    <p className="feed-card-verdict">{tarot.verdict}</p>
                                    <div className="feed-card-meta">
                                        <span className="feed-card-author">{tarot.userName || '익명'}</span>
                                        <span className="feed-card-time">{formatTime(tarot.createdAt)}</span>
                                    </div>
                                    <div className="feed-card-tags">
                                        {/* 주제 태그들 (topics 배열 또는 기존 topic 호환) */}
                                        {(tarot.topics || (tarot.topic ? [tarot.topic] : [])).map((topic, i) => (
                                            <span
                                                key={`topic-${i}`}
                                                className="feed-card-tag topic-tag"
                                                onClick={(e) => navigateToTagPage(topic, e)}
                                            >
                                                #{topic}
                                            </span>
                                        ))}
                                        {/* 키워드 태그 (주제 제외) */}
                                        {tarot.keywords?.filter(k => !(tarot.topics || [tarot.topic]).includes(k.word)).slice(0, 2).map((k, i) => (
                                            <span
                                                key={i}
                                                className="feed-card-tag"
                                                onClick={(e) => navigateToTagPage(k.word, e)}
                                            >
                                                #{k.word}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="feed-card-stats">
                                        <span>❤️ {tarot.likeCount || 0}</span>
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
            <div className="feed-view fortune-feed">
                {/* 트렌딩 섹션 */}
                {trendingKeywords.length > 0 && renderTrending()}

                {/* 필터 상태 표시 (사이드바에서 필터링 시) */}
                {currentFilter && (
                    <div className="filter-status">
                        <span>"{currentFilter}" 관련 운세 {filteredFortunes.length}개</span>
                        <button onClick={clearFilter}>✕ 필터 해제</button>
                    </div>
                )}

                {/* 운세 그리드 */}
                {filteredFortunes.length === 0 ? (
                    renderEmptyState('fortune')
                ) : (
                    <div className="feed-grid">
                        {filteredFortunes.map(fortune => (
                            <div
                                key={fortune.id}
                                className="feed-card"
                                onClick={() => onOpenFortuneResult(fortune)}
                            >
                                <div className="feed-card-thumb">
                                    {fortune.morningImage ? (
                                        <img src={fortune.morningImage} alt="" />
                                    ) : (
                                        <div className="feed-card-emoji">🔮</div>
                                    )}
                                    <div className="feed-card-overlay fortune-overlay">
                                        <span className="fortune-score">점수 {fortune.score}점</span>
                                    </div>
                                </div>
                                <div className="feed-card-info">
                                    <h3 className="feed-card-title">{fortune.title}</h3>
                                    <p className="feed-card-verdict">{fortune.verdict}</p>
                                    <div className="feed-card-meta">
                                        <span className="feed-card-author">{fortune.userName || '익명'}</span>
                                        <span className="feed-card-time">{formatTime(fortune.createdAt)}</span>
                                    </div>
                                    {fortune.keywords?.length > 0 && (
                                        <div className="feed-card-tags">
                                            {fortune.keywords.slice(0, 3).map((k, i) => (
                                                <span
                                                    key={i}
                                                    className="feed-card-tag"
                                                    onClick={(e) => navigateToTagPage(k.word, e)}
                                                >
                                                    #{k.word}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="feed-card-stats">
                                        <span>❤️ {fortune.likeCount || 0}</span>
                                    </div>
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
