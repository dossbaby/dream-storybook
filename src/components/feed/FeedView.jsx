import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Reactions from '../common/Reactions';
import InlineComments from '../common/InlineComments';
import { getTagUrl } from '../../utils/tagUtils';

// 리액션 합계 계산 (피드 좋아요 표시용)
const getReactionTotal = (item) => {
    if (!item?.reactions) return item?.likeCount || 0;
    const reactionSum = Object.values(item.reactions).reduce((a, b) => a + b, 0);
    // 리액션이 있으면 리액션 합계, 없으면 likeCount (하위 호환)
    return reactionSum > 0 ? reactionSum : (item.likeCount || 0);
};

// 카테고리 매핑 (기존 카테고리 → 새 7개 카테고리)
const CATEGORY_MAP = {
    // 기존 → 새 카테고리
    '금전': '돈',
    '재물': '돈',
    '직장': '성장',
    '커리어': '성장',
    '취업': '성장',
    '시험': '성장',
    '연애': '사랑',
    '이별': '사랑',
    '결혼': '사랑',
    '가족': '관계',
    '친구': '관계',
    '대인관계': '관계',
    '운세': '일반',
    '기타': '일반',
};

// 카테고리 정규화 (새 7개 중 하나로 변환)
const VALID_TOPICS = ['사랑', '관계', '돈', '성장', '건강', '선택', '일반'];
const normalizeCategory = (topic) => {
    if (!topic) return '일반';
    if (VALID_TOPICS.includes(topic)) return topic;
    return CATEGORY_MAP[topic] || '일반';
};

// 카테고리별 이모지
const TOPIC_EMOJI = {
    '사랑': '💕',
    '관계': '🙌',
    '돈': '💰',
    '성장': '🌱',
    '건강': '💪',
    '선택': '⚖️',
    '일반': '💬',
};

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
    // 모바일에서는 자동으로 컴팩트, 데스크톱에서는 선택 가능
    const [viewMode, setViewMode] = useState(() => {
        return window.innerWidth <= 768 ? 'compact' : 'grid';
    });
    const isMobile = window.innerWidth <= 768;

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

    // 인기 타로 (반응 많은 순, 최대 6개)
    const popularTarots = [...tarotReadings]
        .sort((a, b) => getReactionTotal(b) - getReactionTotal(a))
        .slice(0, 6);

    // 카테고리별 타로 그룹화 (최신 3개씩)
    const tarotsByCategory = VALID_TOPICS.reduce((acc, topic) => {
        acc[topic] = tarotReadings
            .filter(t => normalizeCategory((t.topics || [t.topic])[0]) === topic)
            .slice(0, 3);
        return acc;
    }, {});

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
                subtitle: '어젯밤 꿈을 풀어보세요!',
                btnText: '꿈 풀이 보기',
                btnEmoji: '🌙',
                btnClass: 'dream-btn'
            },
            tarot: {
                emoji: '🔮',
                title: '아직 타로 리딩이 없어요',
                subtitle: '카드가 당신을 기다리고 있어요',
                btnText: '타로 보기',
                btnEmoji: '🔮',
                btnClass: 'tarot-btn'
            },
            fortune: {
                emoji: '🔮',
                title: '아직 사주가 없어요',
                subtitle: '오늘의 사주를 확인해보세요',
                btnText: '사주 보기',
                btnEmoji: '☀️',
                btnClass: 'fortune-btn'
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
            <div className={`feed-empty-state ${type}-mode`}>
                <div className="empty-illustration">
                    <span className="empty-emoji">{state.emoji}</span>
                    <div className={`empty-sparkles ${type}-sparkles`}>
                        <span>✦</span>
                        <span>✧</span>
                        <span>✦</span>
                    </div>
                </div>
                <h3 className="empty-title">{state.title}</h3>
                <p className="empty-subtitle">{state.subtitle}</p>
                <button
                    className={`empty-action-btn ${state.btnClass || ''}`}
                    onClick={currentFilter ? clearFilter : (user ? onCreateClick : onLoginRequired)}
                >
                    <span>{state.btnEmoji}</span>
                    <span>{state.btnText}</span>
                </button>
            </div>
        );
    };

    // 뷰 모드 토글 (데스크톱만)
    const renderViewToggle = () => {
        if (isMobile) return null;
        return (
            <div className="feed-view-toggle">
                <button
                    className={viewMode === 'compact' ? 'active' : ''}
                    onClick={() => setViewMode('compact')}
                >
                    ☰ 리스트
                </button>
                <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                >
                    ▦ 카드
                </button>
            </div>
        );
    };

    // 컴팩트 카드 렌더링 (타로) - Q&A 형식: 질문 + 공감형 답변
    const renderCompactTarotCard = (tarot) => {
        const rawTopics = tarot.topics || (tarot.topic ? [tarot.topic] : []);
        // 카테고리 정규화 (7개 중 하나로)
        const mainTopic = normalizeCategory(rawTopics[0]);
        const topicEmoji = TOPIC_EMOJI[mainTopic] || '💬';
        // 질문 표시 (피드 메인)
        const question = tarot.question || '질문';
        // 답변 표시 (title이 이제 공감형 답변)
        const answer = tarot.title;
        // 썸네일 = heroImage 또는 pastImage
        const thumbImage = tarot.heroImage || tarot.pastImage;

        return (
            <div
                key={tarot.id}
                className="feed-card-compact tarot-card"
                onClick={() => onOpenTarotResult(tarot)}
            >
                {/* 썸네일 */}
                <div className="compact-thumb">
                    {thumbImage ? (
                        <img src={thumbImage} alt="" loading="lazy" />
                    ) : (
                        <div className="compact-thumb-placeholder">🔮</div>
                    )}
                </div>

                {/* 콘텐츠 - Q&A 형식 */}
                <div className="compact-content">
                    <div className="compact-header">
                        <div className="compact-meta">
                            <span className="compact-topic">{topicEmoji} {mainTopic}</span>
                            <span className="compact-author">• {tarot.userName || '익명'}</span>
                            <span className="compact-time">• {formatTime(tarot.createdAt)}</span>
                        </div>
                        <div className="compact-stats">
                            <span className="compact-stat">❤️ {getReactionTotal(tarot)}</span>
                        </div>
                    </div>
                    {/* 질문 */}
                    <h3 className="compact-title compact-question">{question}</h3>
                    {/* 답변 */}
                    {answer && <p className="compact-answer">{answer}</p>}
                    {tarot.keywords?.length > 0 && (
                        <div className="compact-footer">
                            <div className="compact-tags">
                                {tarot.keywords.slice(0, 3).map((k, i) => (
                                    <span
                                        key={i}
                                        className="compact-tag"
                                        onClick={(e) => { e.stopPropagation(); navigateToTagPage(k.word, e); }}
                                    >
                                        #{k.word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 컴팩트 카드 렌더링 (꿈) - 썸네일 + 제목 중심
    const renderCompactDreamCard = (dream) => {
        const thumbImage = dream.dreamImage;

        return (
            <div
                key={dream.id}
                className="feed-card-compact dream-card"
                onClick={() => onOpenDreamDetail(dream)}
            >
                {/* 썸네일 */}
                <div className="compact-thumb">
                    {thumbImage ? (
                        <img src={thumbImage} alt="" loading="lazy" />
                    ) : (
                        <div className="compact-thumb-placeholder">
                            {dreamTypes?.[dream.dreamType]?.emoji || '🌙'}
                        </div>
                    )}
                </div>

                {/* 콘텐츠 */}
                <div className="compact-content">
                    <div className="compact-header">
                        <div className="compact-meta">
                            <span className="compact-topic">{dreamTypes?.[dream.dreamType]?.name || '꿈'}</span>
                            <span className="compact-author">• {dream.userName || '익명'}</span>
                            <span className="compact-time">• {formatTime(dream.createdAt)}</span>
                        </div>
                        <div className="compact-stats">
                            <span className="compact-stat">❤️ {getReactionTotal(dream)}</span>
                        </div>
                    </div>
                    <h3 className="compact-title">{dream.title}</h3>
                    {dream.keywords?.length > 0 && (
                        <div className="compact-footer">
                            <div className="compact-tags">
                                {dream.keywords.slice(0, 3).map((k, i) => (
                                    <span
                                        key={i}
                                        className="compact-tag"
                                        onClick={(e) => { e.stopPropagation(); navigateToTagPage(k.word, e); }}
                                    >
                                        {k.word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 컴팩트 카드 렌더링 (사주) - 썸네일 + 제목 중심
    const renderCompactFortuneCard = (fortune) => {
        const thumbImage = fortune.morningImage;

        return (
            <div
                key={fortune.id}
                className="feed-card-compact fortune-card"
                onClick={() => onOpenFortuneResult(fortune)}
            >
                {/* 썸네일 */}
                <div className="compact-thumb">
                    {thumbImage ? (
                        <img src={thumbImage} alt="" loading="lazy" />
                    ) : (
                        <div className="compact-thumb-placeholder">☀️</div>
                    )}
                </div>

                {/* 콘텐츠 */}
                <div className="compact-content">
                    <div className="compact-header">
                        <div className="compact-meta">
                            <span className="compact-topic">사주</span>
                            <span className="compact-author">• {fortune.userName || '익명'}</span>
                            <span className="compact-time">• {formatTime(fortune.createdAt)}</span>
                        </div>
                        <div className="compact-stats">
                            <span className="compact-stat">❤️ {getReactionTotal(fortune)}</span>
                        </div>
                    </div>
                    <h3 className="compact-title">{fortune.title}</h3>
                    {fortune.keywords?.length > 0 && (
                        <div className="compact-footer">
                            <div className="compact-tags">
                                {fortune.keywords.slice(0, 3).map((k, i) => (
                                    <span
                                        key={i}
                                        className="compact-tag"
                                        onClick={(e) => { e.stopPropagation(); navigateToTagPage(k.word, e); }}
                                    >
                                        {k.word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 기존 그리드 카드 렌더링 (꿈)
    const renderGridDreamCard = (dream) => (
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
                    <span>❤️ {getReactionTotal(dream)}</span>
                    <span>💬 {dream.commentCount || 0}</span>
                </div>
            </div>
        </div>
    );

    // 기존 그리드 카드 렌더링 (타로)
    const renderGridTarotCard = (tarot) => (
        <div
            key={tarot.id}
            className="feed-card"
            onClick={() => onOpenTarotResult(tarot)}
        >
            <div className="feed-card-thumb">
                {tarot.pastImage ? (
                    <img src={tarot.pastImage} alt="" />
                ) : (
                    <div className="feed-card-emoji">🔮</div>
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
                    {(tarot.topics || (tarot.topic ? [tarot.topic] : [])).map((topic, i) => (
                        <span
                            key={`topic-${i}`}
                            className="feed-card-tag topic-tag"
                            onClick={(e) => navigateToTagPage(topic, e)}
                        >
                            #{topic}
                        </span>
                    ))}
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
                    <span>❤️ {getReactionTotal(tarot)}</span>
                </div>
            </div>
        </div>
    );

    // 기존 그리드 카드 렌더링 (사주)
    const renderGridFortuneCard = (fortune) => (
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
                    <span>❤️ {getReactionTotal(fortune)}</span>
                </div>
            </div>
        </div>
    );

    // 실제 뷰 모드 결정 (모바일은 항상 컴팩트)
    const effectiveViewMode = isMobile ? 'compact' : viewMode;

    if (mode === 'dream') {
        return (
            <div className="feed-view dream-feed">
                {renderViewToggle()}

                {/* 필터 상태 표시 (사이드바에서 필터링 시) */}
                {currentFilter && (
                    <div className="filter-status">
                        <span>"{currentFilter}" 관련 꿈 {filteredDreams.length}개</span>
                        <button onClick={clearFilter}>✕ 필터 해제</button>
                    </div>
                )}

                {/* 꿈 피드 */}
                {filteredDreams.length === 0 ? (
                    renderEmptyState('dream')
                ) : effectiveViewMode === 'compact' ? (
                    <div className="feed-compact">
                        {filteredDreams.map(renderCompactDreamCard)}
                    </div>
                ) : (
                    <div className="feed-grid">
                        {filteredDreams.map(renderGridDreamCard)}
                    </div>
                )}
            </div>
        );
    }

    if (mode === 'tarot') {
        // 인기 필터 - 반응순 정렬
        if (currentFilter === '인기') {
            const sortedByPopular = [...tarotReadings].sort((a, b) => getReactionTotal(b) - getReactionTotal(a));
            return (
                <div className="feed-view tarot-feed tarot-home">
                    {renderViewToggle()}
                    <div className="filter-status">
                        <span>🔥 인기순 {sortedByPopular.length}개</span>
                        <button onClick={clearFilter}>✕ 필터 해제</button>
                    </div>
                    <section className="feed-section filtered-section">
                        <div className="feed-compact">
                            {sortedByPopular.map(renderCompactTarotCard)}
                        </div>
                    </section>
                </div>
            );
        }

        // 카테고리 필터
        if (currentFilter) {
            return (
                <div className="feed-view tarot-feed tarot-home">
                    {renderViewToggle()}
                    <div className="filter-status">
                        <span>"{currentFilter}" 관련 타로 {filteredTarots.length}개</span>
                        <button onClick={clearFilter}>✕ 필터 해제</button>
                    </div>
                    {filteredTarots.length === 0 ? (
                        renderEmptyState('tarot')
                    ) : (
                        <section className="feed-section filtered-section">
                            {effectiveViewMode === 'compact' ? (
                                <div className="feed-compact">
                                    {filteredTarots.map(renderCompactTarotCard)}
                                </div>
                            ) : (
                                <div className="feed-grid">
                                    {filteredTarots.map(renderGridTarotCard)}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            );
        }

        // 홈 구조: 인기 + 카테고리별
        return (
            <div className="feed-view tarot-feed tarot-home">
                {/* 인기 주제 섹션 */}
                {popularTarots.length > 0 && (
                    <section className="feed-section popular-section">
                        <h2 className="section-title">
                            🔥 인기
                            <button
                                className="section-more"
                                onClick={() => setActiveFilter('인기')}
                            >
                                더보기 →
                            </button>
                        </h2>
                        <div className="feed-compact">
                            {popularTarots.map(renderCompactTarotCard)}
                        </div>
                    </section>
                )}

                {/* 카테고리별 섹션 */}
                {VALID_TOPICS.map(topic => {
                    const items = tarotsByCategory[topic];
                    if (!items || items.length === 0) return null;
                    return (
                        <section key={topic} className="feed-section category-section">
                            <h2 className="section-title">
                                {TOPIC_EMOJI[topic]} {topic}
                                <button
                                    className="section-more"
                                    onClick={() => setActiveFilter(topic)}
                                >
                                    더보기 →
                                </button>
                            </h2>
                            <div className="feed-compact">
                                {items.map(renderCompactTarotCard)}
                            </div>
                        </section>
                    );
                })}

                {/* 아무것도 없을 때 */}
                {tarotReadings.length === 0 && renderEmptyState('tarot')}
            </div>
        );
    }

    if (mode === 'fortune') {
        return (
            <div className="feed-view fortune-feed">
                {renderViewToggle()}

                {/* 필터 상태 표시 (사이드바에서 필터링 시) */}
                {currentFilter && (
                    <div className="filter-status">
                        <span>"{currentFilter}" 관련 운세 {filteredFortunes.length}개</span>
                        <button onClick={clearFilter}>✕ 필터 해제</button>
                    </div>
                )}

                {/* 운세 피드 */}
                {filteredFortunes.length === 0 ? (
                    renderEmptyState('fortune')
                ) : effectiveViewMode === 'compact' ? (
                    <div className="feed-compact">
                        {filteredFortunes.map(renderCompactFortuneCard)}
                    </div>
                ) : (
                    <div className="feed-grid">
                        {filteredFortunes.map(renderGridFortuneCard)}
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default FeedView;
