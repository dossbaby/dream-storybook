import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { extractTags, getTagUrl, CONTENT_TYPES } from '../utils/tagUtils';
import SEOHead from '../components/common/SEOHead';

/**
 * 전체 태그 탐색 페이지 - /tags
 * 모든 태그를 카테고리별로 보여줌
 */
const TagsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allTags, setAllTags] = useState([]);
    const [sortBy, setSortBy] = useState('count'); // count, alpha, recent

    // 데이터 로드
    useEffect(() => {
        const loadAllTags = async () => {
            setLoading(true);
            try {
                const tagData = {};

                // 꿈 로드
                const dreamsQuery = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(500));
                const dreamsSnap = await getDocs(dreamsQuery);
                dreamsSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (!data.isPublic) return;
                    const tags = extractTags(data.keywords);
                    const time = data.createdAt?.toDate?.()?.getTime() || 0;
                    tags.forEach(tag => {
                        if (!tagData[tag]) tagData[tag] = { tag, count: 0, types: new Set(), lastSeen: 0 };
                        tagData[tag].count++;
                        tagData[tag].types.add('dream');
                        tagData[tag].lastSeen = Math.max(tagData[tag].lastSeen, time);
                    });
                });

                // 타로 로드
                const tarotsQuery = query(collection(db, 'tarots'), orderBy('createdAt', 'desc'), limit(500));
                const tarotsSnap = await getDocs(tarotsQuery);
                tarotsSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (!data.isPublic) return;
                    const tags = extractTags(data.keywords);
                    const time = data.createdAt?.toDate?.()?.getTime() || 0;
                    tags.forEach(tag => {
                        if (!tagData[tag]) tagData[tag] = { tag, count: 0, types: new Set(), lastSeen: 0 };
                        tagData[tag].count++;
                        tagData[tag].types.add('tarot');
                        tagData[tag].lastSeen = Math.max(tagData[tag].lastSeen, time);
                    });
                });

                // 사주 로드
                const sajusQuery = query(collection(db, 'sajus'), orderBy('createdAt', 'desc'), limit(500));
                const sajusSnap = await getDocs(sajusQuery);
                sajusSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (!data.isPublic) return;
                    const tags = extractTags(data.keywords);
                    const time = data.createdAt?.toDate?.()?.getTime() || 0;
                    tags.forEach(tag => {
                        if (!tagData[tag]) tagData[tag] = { tag, count: 0, types: new Set(), lastSeen: 0 };
                        tagData[tag].count++;
                        tagData[tag].types.add('saju');
                        tagData[tag].lastSeen = Math.max(tagData[tag].lastSeen, time);
                    });
                });

                // Set을 배열로 변환
                const tagsArray = Object.values(tagData).map(t => ({
                    ...t,
                    types: Array.from(t.types)
                }));

                setAllTags(tagsArray);
            } catch (e) {
                console.error('Failed to load tags:', e);
            } finally {
                setLoading(false);
            }
        };

        loadAllTags();
    }, []);

    // 정렬된 태그
    const sortedTags = useMemo(() => {
        const sorted = [...allTags];
        switch (sortBy) {
            case 'alpha':
                sorted.sort((a, b) => a.tag.localeCompare(b.tag, 'ko'));
                break;
            case 'recent':
                sorted.sort((a, b) => b.lastSeen - a.lastSeen);
                break;
            case 'count':
            default:
                sorted.sort((a, b) => b.count - a.count);
        }
        return sorted;
    }, [allTags, sortBy]);

    // 인기 태그 (상위 10개)
    const popularTags = useMemo(() => {
        return [...allTags].sort((a, b) => b.count - a.count).slice(0, 10);
    }, [allTags]);

    // 통계
    const stats = useMemo(() => ({
        totalTags: allTags.length,
        totalContent: allTags.reduce((sum, t) => sum + t.count, 0),
        dreamTags: allTags.filter(t => t.types.includes('dream')).length,
        tarotTags: allTags.filter(t => t.types.includes('tarot')).length,
        sajuTags: allTags.filter(t => t.types.includes('saju')).length
    }), [allTags]);

    if (loading) {
        return (
            <div className="tags-page loading">
                <SEOHead
                    title="태그 탐색"
                    description="꿈해몽, 타로, 사주의 모든 태그를 탐색하세요."
                    url="/tags"
                />
                <div className="loading-spinner">
                    <span className="spinner-icon">🏷️</span>
                    <span className="spinner-text">태그 로딩 중...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="tags-page">
            <SEOHead
                title="태그 탐색 - 꿈해몽, 타로, 사주 키워드"
                description={`${stats.totalTags}개의 태그로 꿈해몽, 타로, 사주 콘텐츠를 탐색하세요. 인기 키워드: ${popularTags.slice(0, 5).map(t => t.tag).join(', ')}`}
                keywords={popularTags.map(t => t.tag)}
                url="/tags"
                type="website"
            />

            {/* 헤더 */}
            <header className="tags-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ←
                </button>
                <div className="tags-title-area">
                    <h1 className="tags-title">🏷️ 태그 탐색</h1>
                    <span className="tags-subtitle">{stats.totalTags}개의 태그</span>
                </div>
                <Link to="/tags" className="all-tags-link">
                    전체 보기
                </Link>
            </header>

            {/* 통계 */}
            <section className="tags-stats">
                <div className="stat-item">
                    <span className="stat-value">{stats.totalTags}</span>
                    <span className="stat-label">전체 태그</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{stats.totalContent}</span>
                    <span className="stat-label">콘텐츠</span>
                </div>
                <div className="stat-item dream">
                    <span className="stat-value">{stats.dreamTags}</span>
                    <span className="stat-label">{CONTENT_TYPES.dream.emoji} 꿈</span>
                </div>
                <div className="stat-item tarot">
                    <span className="stat-value">{stats.tarotTags}</span>
                    <span className="stat-label">{CONTENT_TYPES.tarot.emoji} 타로</span>
                </div>
                <div className="stat-item saju">
                    <span className="stat-value">{stats.sajuTags}</span>
                    <span className="stat-label">{CONTENT_TYPES.saju.emoji} 사주</span>
                </div>
            </section>

            {/* 인기 태그 */}
            <section className="popular-tags-section">
                <h2 className="section-title">🔥 인기 태그</h2>
                <div className="popular-tags-grid">
                    {popularTags.map((tagItem, index) => (
                        <Link
                            key={tagItem.tag}
                            to={getTagUrl(tagItem.tag)}
                            className={`popular-tag-card rank-${index + 1}`}
                        >
                            <span className="rank">#{index + 1}</span>
                            <span className="tag-name">#{tagItem.tag}</span>
                            <span className="tag-count">{tagItem.count}개</span>
                            <div className="tag-types">
                                {tagItem.types.map(type => (
                                    <span key={type} className={`type-dot ${type}`} title={CONTENT_TYPES[type]?.label}>
                                        {CONTENT_TYPES[type]?.emoji}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 정렬 옵션 */}
            <div className="sort-options">
                <span className="sort-label">정렬:</span>
                <button
                    className={`sort-btn ${sortBy === 'count' ? 'active' : ''}`}
                    onClick={() => setSortBy('count')}
                >
                    인기순
                </button>
                <button
                    className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
                    onClick={() => setSortBy('recent')}
                >
                    최신순
                </button>
                <button
                    className={`sort-btn ${sortBy === 'alpha' ? 'active' : ''}`}
                    onClick={() => setSortBy('alpha')}
                >
                    가나다순
                </button>
            </div>

            {/* 전체 태그 그리드 */}
            <section className="all-tags-section">
                <h2 className="section-title">전체 태그</h2>
                <div className="all-tags-grid">
                    {sortedTags.map(tagItem => (
                        <Link
                            key={tagItem.tag}
                            to={getTagUrl(tagItem.tag)}
                            className="tag-chip"
                        >
                            <span className="chip-name">#{tagItem.tag}</span>
                            <span className="chip-count">{tagItem.count}</span>
                            <div className="chip-types">
                                {tagItem.types.map(type => (
                                    <span key={type} className={`chip-type ${type}`}>
                                        {CONTENT_TYPES[type]?.emoji}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="tags-cta">
                <h3>나만의 콘텐츠를 만들어보세요</h3>
                <p>꿈 해몽, 타로 리딩, 사주를 통해 새로운 태그를 만들 수 있어요</p>
                <button className="cta-btn" onClick={() => navigate('/')}>
                    시작하기
                </button>
            </section>
        </div>
    );
};

export default TagsPage;
