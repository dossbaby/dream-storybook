import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { slugToTag, hasTag, CONTENT_TYPES, getPopularTags, getTagUrl } from '../utils/tagUtils';
import SEOHead from '../components/common/SEOHead';

/**
 * 태그 페이지 - /tag/:tagSlug
 * 특정 태그가 포함된 모든 콘텐츠(꿈, 타로, 사주)를 보여줌
 */
const TagPage = () => {
    const { tagSlug } = useParams();
    const navigate = useNavigate();
    const tag = slugToTag(tagSlug);

    const [loading, setLoading] = useState(true);
    const [dreams, setDreams] = useState([]);
    const [tarots, setTarots] = useState([]);
    const [sajus, setSajus] = useState([]);
    const [activeType, setActiveType] = useState('all'); // all, dream, tarot, saju
    const [relatedTags, setRelatedTags] = useState([]);

    // 데이터 로드
    useEffect(() => {
        const loadTagContent = async () => {
            setLoading(true);
            try {
                // 꿈 로드
                const dreamsQuery = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(100));
                const dreamsSnap = await getDocs(dreamsQuery);
                const dreamsList = dreamsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data(), type: 'dream' }))
                    .filter(d => d.isPublic && hasTag(d.keywords, tag));
                setDreams(dreamsList);

                // 타로 로드
                const tarotsQuery = query(collection(db, 'tarots'), orderBy('createdAt', 'desc'), limit(100));
                const tarotsSnap = await getDocs(tarotsQuery);
                const tarotsList = tarotsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data(), type: 'tarot' }))
                    .filter(t => t.isPublic && hasTag(t.keywords, tag));
                setTarots(tarotsList);

                // 사주 로드
                const sajusQuery = query(collection(db, 'sajus'), orderBy('createdAt', 'desc'), limit(100));
                const sajusSnap = await getDocs(sajusQuery);
                const sajusList = sajusSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data(), type: 'saju' }))
                    .filter(s => s.isPublic && hasTag(s.keywords, tag));
                setSajus(sajusList);

                // 관련 태그 추출
                const allContent = [...dreamsList, ...tarotsList, ...sajusList];
                const popular = getPopularTags(allContent, 8).filter(t => t.tag !== tag.toLowerCase());
                setRelatedTags(popular);

            } catch (e) {
                console.error('Failed to load tag content:', e);
            } finally {
                setLoading(false);
            }
        };

        if (tag) loadTagContent();
    }, [tag]);

    // 필터링된 콘텐츠
    const filteredContent = useMemo(() => {
        const all = [
            ...dreams.map(d => ({ ...d, sortTime: d.createdAt?.toDate?.()?.getTime() || 0 })),
            ...tarots.map(t => ({ ...t, sortTime: t.createdAt?.toDate?.()?.getTime() || 0 })),
            ...sajus.map(s => ({ ...s, sortTime: s.createdAt?.toDate?.()?.getTime() || 0 }))
        ].sort((a, b) => b.sortTime - a.sortTime);

        if (activeType === 'all') return all;
        return all.filter(c => c.type === activeType);
    }, [dreams, tarots, sajus, activeType]);

    // 타입별 카운트
    const typeCounts = useMemo(() => ({
        all: dreams.length + tarots.length + sajus.length,
        dream: dreams.length,
        tarot: tarots.length,
        saju: sajus.length
    }), [dreams, tarots, sajus]);

    // 시간 포맷
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

    // 콘텐츠 클릭 핸들러
    const handleContentClick = (content) => {
        if (content.type === 'dream') {
            navigate(`/dream/${content.id}`);
        } else if (content.type === 'tarot') {
            navigate(`/tarot/${content.id}`);
        } else if (content.type === 'saju') {
            navigate(`/fortune/${content.id}`);
        }
    };

    // 태그 클릭 핸들러
    const handleTagClick = (newTag) => {
        navigate(`/tag/${encodeURIComponent(newTag)}`);
    };

    if (loading) {
        return (
            <div className="tag-page loading">
                <SEOHead
                    title={`#${tag} 꿈해몽, 타로, 사주`}
                    description={`${tag} 관련 꿈 해몽, 타로, 사주 콘텐츠를 확인하세요.`}
                    url={`/tag/${tagSlug}`}
                />
                <div className="loading-spinner">
                    <span className="spinner-icon">🔮</span>
                    <span className="spinner-text">로딩 중...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="tag-page">
            <SEOHead
                title={`#${tag} 꿈해몽, 타로, 사주`}
                description={`${tag} 관련 꿈 해몽 ${typeCounts.dream}개, 타로 리딩 ${typeCounts.tarot}개, 사주 ${typeCounts.saju}개. ${tag}에 대한 운세와 해석을 확인하세요.`}
                keywords={[tag, `${tag} 꿈`, `${tag} 타로`, `${tag} 사주`, `${tag} 해몽`, ...relatedTags.map(t => t.tag)]}
                url={`/tag/${tagSlug}`}
                type="website"
            />

            {/* 헤더 */}
            <header className="tag-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ←
                </button>
                <div className="tag-title-area">
                    <h1 className="tag-title">#{tag}</h1>
                    <span className="tag-count">{typeCounts.all}개의 콘텐츠</span>
                </div>
            </header>

            {/* 타입 필터 탭 */}
            <nav className="type-tabs">
                <button
                    className={`type-tab ${activeType === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveType('all')}
                >
                    전체 <span className="tab-count">{typeCounts.all}</span>
                </button>
                <button
                    className={`type-tab ${activeType === 'dream' ? 'active' : ''}`}
                    onClick={() => setActiveType('dream')}
                >
                    {CONTENT_TYPES.dream.emoji} 꿈 <span className="tab-count">{typeCounts.dream}</span>
                </button>
                <button
                    className={`type-tab ${activeType === 'tarot' ? 'active' : ''}`}
                    onClick={() => setActiveType('tarot')}
                >
                    {CONTENT_TYPES.tarot.emoji} 타로 <span className="tab-count">{typeCounts.tarot}</span>
                </button>
                <button
                    className={`type-tab ${activeType === 'saju' ? 'active' : ''}`}
                    onClick={() => setActiveType('saju')}
                >
                    {CONTENT_TYPES.saju.emoji} 사주 <span className="tab-count">{typeCounts.saju}</span>
                </button>
            </nav>

            {/* 관련 태그 */}
            {relatedTags.length > 0 && (
                <section className="related-tags">
                    <h3 className="related-title">관련 태그</h3>
                    <div className="related-chips">
                        {relatedTags.map(({ tag: relTag, count }) => (
                            <button
                                key={relTag}
                                className="related-chip"
                                onClick={() => handleTagClick(relTag)}
                            >
                                #{relTag}
                                <span className="chip-count">{count}</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* 콘텐츠 그리드 */}
            {filteredContent.length === 0 ? (
                <div className="tag-empty">
                    <span className="empty-icon">🔍</span>
                    <h3>"{tag}" 관련 콘텐츠가 없어요</h3>
                    <p>다른 태그를 검색해보세요</p>
                    <button className="back-home-btn" onClick={() => navigate('/')}>
                        홈으로 돌아가기
                    </button>
                </div>
            ) : (
                <div className="tag-content-grid">
                    {filteredContent.map(content => (
                        <article
                            key={`${content.type}-${content.id}`}
                            className={`tag-card ${content.type}`}
                            onClick={() => handleContentClick(content)}
                        >
                            {/* 썸네일 */}
                            <div className="tag-card-thumb">
                                {(content.dreamImage || content.pastImage || content.morningImage) ? (
                                    <img
                                        src={content.dreamImage || content.pastImage || content.morningImage}
                                        alt=""
                                    />
                                ) : (
                                    <div className="tag-card-emoji">
                                        {CONTENT_TYPES[content.type]?.emoji || '✨'}
                                    </div>
                                )}
                                <span className="type-badge">
                                    {CONTENT_TYPES[content.type]?.emoji} {CONTENT_TYPES[content.type]?.label}
                                </span>
                            </div>

                            {/* 정보 */}
                            <div className="tag-card-info">
                                <h3 className="tag-card-title">{content.title}</h3>
                                <p className="tag-card-verdict">{content.verdict}</p>
                                <div className="tag-card-meta">
                                    <span className="author">{content.userName || '익명'}</span>
                                    <span className="time">{formatTime(content.createdAt)}</span>
                                </div>
                                {/* 키워드 태그 */}
                                {content.keywords?.length > 0 && (
                                    <div className="tag-card-tags">
                                        {content.keywords.slice(0, 3).map((k, i) => (
                                            <span
                                                key={i}
                                                className={`mini-tag ${k.word?.toLowerCase() === tag.toLowerCase() ? 'highlight' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTagClick(k.word);
                                                }}
                                            >
                                                #{k.word}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="tag-card-stats">
                                    <span>❤️ {content.likeCount || 0}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagPage;
