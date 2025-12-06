import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import SEOHead from '../components/common/SEOHead';
import {
    CONTENT_TYPES,
    DREAM_CATEGORIES,
    TAROT_CATEGORIES,
    SAJU_CATEGORIES
} from '../utils/seoConfig';

/**
 * 콘텐츠 목록 페이지 (SEO 인덱스)
 * /dreams, /tarots, /sajus
 * /dreams/category/animal 등 카테고리별 필터링
 */
const ContentListPage = ({ type }) => {
    const { categoryId } = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);

    const typeConfig = CONTENT_TYPES[type];
    const categories = getCategoriesForType(type);
    const currentCategory = categoryId ? categories[categoryId] : null;

    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        loadItems(true);
    }, [type, categoryId]);

    const loadItems = async (isInitial = false) => {
        try {
            setLoading(true);

            let q = query(
                collection(db, typeConfig.collection),
                where('isPublic', '==', true),
                orderBy('createdAt', 'desc'),
                limit(ITEMS_PER_PAGE)
            );

            if (!isInitial && lastDoc) {
                q = query(
                    collection(db, typeConfig.collection),
                    where('isPublic', '==', true),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(ITEMS_PER_PAGE)
                );
            }

            const snapshot = await getDocs(q);
            const newItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 카테고리 필터링 (클라이언트 사이드)
            let filteredItems = newItems;
            if (categoryId && currentCategory) {
                filteredItems = newItems.filter(item => {
                    const text = JSON.stringify(item).toLowerCase();
                    return currentCategory.keywords.some(keyword =>
                        text.includes(keyword.toLowerCase())
                    );
                });
            }

            if (isInitial) {
                setItems(filteredItems);
            } else {
                setItems(prev => [...prev, ...filteredItems]);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
        } catch (err) {
            console.error('목록 로드 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // SEO 메타데이터
    const getPageMeta = () => {
        if (currentCategory) {
            return {
                title: `${currentCategory.name} - ${typeConfig.name} 모음 | 점AI`,
                description: `${currentCategory.name} 관련 ${typeConfig.name} 모음입니다. ${currentCategory.keywords.slice(0, 5).join(', ')} 등 다양한 ${typeConfig.name}을 확인해보세요.`,
                keywords: `${currentCategory.name}, ${typeConfig.seoKeywords.join(', ')}, ${currentCategory.keywords.join(', ')}`
            };
        }
        return {
            title: `${typeConfig.name} 모음 | 점AI`,
            description: `다양한 ${typeConfig.name} 결과를 확인해보세요. 무료 ${typeConfig.name} 풀이와 해석을 제공합니다.`,
            keywords: typeConfig.seoKeywords.join(', ')
        };
    };

    const pageMeta = getPageMeta();

    return (
        <div className={`seo-page list-page ${type}-list`}>
            <SEOHead
                title={pageMeta.title}
                description={pageMeta.description}
                keywords={pageMeta.keywords}
                canonical={categoryId ? `/${type}s/category/${categoryId}` : `/${type}s`}
            />

            {/* 헤더 */}
            <header className="seo-header">
                <Link to="/" className="logo-link">
                    🔮 점AI
                </Link>
            </header>

            <main className="seo-content list-content">
                {/* 페이지 타이틀 */}
                <div className="list-header">
                    <h1 className="list-title">
                        {currentCategory ? (
                            <>
                                <span className="category-icon">{currentCategory.icon}</span>
                                {currentCategory.name}
                            </>
                        ) : (
                            <>
                                <span className="type-icon">{typeConfig.icon}</span>
                                {typeConfig.name} 모음
                            </>
                        )}
                    </h1>
                    <p className="list-subtitle">
                        {currentCategory
                            ? `${currentCategory.keywords.slice(0, 3).join(', ')} 등의 ${typeConfig.name}`
                            : `다양한 ${typeConfig.name}을 확인해보세요`
                        }
                    </p>
                </div>

                {/* 카테고리 네비게이션 */}
                <nav className="category-nav">
                    <Link
                        to={`/${type}s`}
                        className={`category-link ${!categoryId ? 'active' : ''}`}
                    >
                        전체
                    </Link>
                    {Object.entries(categories).map(([id, cat]) => (
                        <Link
                            key={id}
                            to={`/${type}s/category/${id}`}
                            className={`category-link ${categoryId === id ? 'active' : ''}`}
                        >
                            {cat.icon} {cat.name}
                        </Link>
                    ))}
                </nav>

                {/* 콘텐츠 그리드 */}
                {loading && items.length === 0 ? (
                    <div className="list-loading">
                        <div className="loading-spinner">{typeConfig.icon}</div>
                        <p>불러오는 중...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="list-empty">
                        <p>아직 공개된 {typeConfig.name}이 없습니다</p>
                        <Link to="/" className="cta-button">
                            첫 번째 {typeConfig.name} 만들기
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="content-grid">
                            {items.map(item => (
                                <Link
                                    key={item.id}
                                    to={`/${typeConfig.urlPath}/${item.id}`}
                                    className="content-card"
                                >
                                    <div className="card-thumbnail">
                                        {getItemImage(item, type) ? (
                                            <img
                                                src={getItemImage(item, type)}
                                                alt={item.title}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="thumbnail-placeholder">
                                                {typeConfig.icon}
                                            </div>
                                        )}
                                        {item.rarity && item.rarity !== 'common' && (
                                            <span className={`rarity-badge ${item.rarity}`}>
                                                {getRarityLabel(item.rarity)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <h2 className="card-title">{item.title}</h2>
                                        <p className="card-verdict">
                                            {truncate(item.verdict || item.shareText, 60)}
                                        </p>
                                        <div className="card-meta">
                                            <span className="meta-user">
                                                {item.userName || '익명'}
                                            </span>
                                            <span className="meta-date">
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* 더보기 버튼 */}
                        {hasMore && (
                            <div className="load-more">
                                <button
                                    onClick={() => loadItems(false)}
                                    disabled={loading}
                                    className="load-more-btn"
                                >
                                    {loading ? '불러오는 중...' : '더 보기'}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* CTA */}
                <section className="list-cta">
                    <h3>나만의 {typeConfig.name} 받아보기</h3>
                    <p>AI가 분석하는 특별한 {typeConfig.name}을 무료로 받아보세요</p>
                    <Link to="/" className="cta-button">
                        {typeConfig.icon} 무료로 시작하기
                    </Link>
                </section>
            </main>

            {/* 푸터 */}
            <footer className="seo-footer">
                <p>&copy; {new Date().getFullYear()} 점AI. All rights reserved.</p>
                <nav className="footer-nav">
                    <Link to="/">홈</Link>
                    <Link to="/dreams">꿈해몽</Link>
                    <Link to="/tarots">타로</Link>
                    <Link to="/sajus">사주</Link>
                </nav>
            </footer>
        </div>
    );
};

// 헬퍼 함수들
const getCategoriesForType = (type) => {
    switch (type) {
        case 'dream': return DREAM_CATEGORIES;
        case 'tarot': return TAROT_CATEGORIES;
        case 'saju': return SAJU_CATEGORIES;
        default: return {};
    }
};

const getItemImage = (item, type) => {
    switch (type) {
        case 'dream': return item.dreamImage;
        case 'tarot': return item.pastImage || item.cards?.[0]?.image;
        case 'saju': return item.section1Image || item.heroImage;
        default: return null;
    }
};

const getRarityLabel = (rarity) => {
    const labels = {
        rare: '희귀',
        epic: '특별',
        legendary: '전설'
    };
    return labels[rarity] || '';
};

const truncate = (text, length) => {
    if (!text) return '';
    return text.length > length ? text.slice(0, length) + '...' : text;
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export default ContentListPage;
