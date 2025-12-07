/**
 * 블로그 목록 페이지
 * jeom.ai/blog
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getBlogPosts, getCategories } from '../../services/wordpress';
import BlogCard from '../../components/blog/BlogCard';
import { useI18n } from '../../hooks/useI18n';

const BlogListPage = () => {
    const { t, language } = useI18n();
    const [searchParams, setSearchParams] = useSearchParams();

    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [endCursor, setEndCursor] = useState(null);

    const currentCategory = searchParams.get('category') || 'all';

    // 포스트 로드
    const loadPosts = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const result = await getBlogPosts({
                first: 12,
                after: reset ? null : endCursor,
                language
            });

            if (reset) {
                setPosts(result.nodes || []);
            } else {
                setPosts(prev => [...prev, ...(result.nodes || [])]);
            }

            setHasMore(result.pageInfo?.hasNextPage || false);
            setEndCursor(result.pageInfo?.endCursor || null);
        } catch (err) {
            console.error('Failed to load posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [language, endCursor]);

    // 카테고리 로드
    const loadCategories = useCallback(async () => {
        try {
            const cats = await getCategories({ language });
            setCategories(cats);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    }, [language]);

    // 초기 로드
    useEffect(() => {
        loadPosts(true);
        loadCategories();
    }, [language]);

    // 카테고리 필터 변경
    const handleCategoryChange = (categorySlug) => {
        if (categorySlug === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category: categorySlug });
        }
    };

    // 필터된 포스트
    const filteredPosts = currentCategory === 'all'
        ? posts
        : posts.filter(post =>
            post.categories?.nodes?.some(cat => cat.slug === currentCategory)
        );

    // 카테고리 이모지
    const categoryEmojis = {
        'dream': '🌙',
        'tarot': '🎴',
        'saju': '☯️',
        'fortune': '🔮',
        'guide': '📖',
        'tips': '💡'
    };

    const pageTitle = language === 'ko' ? '블로그 - 점AI' : 'Blog - JeomAI';
    const pageDescription = language === 'ko'
        ? '꿈해몽, 타로, 사주에 관한 흥미로운 이야기와 가이드'
        : 'Interesting stories and guides about dream interpretation, tarot, and fortune telling';

    return (
        <div className="blog-list-page">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href="https://jeom.ai/blog" />
            </Helmet>

            {/* 헤더 */}
            <header className="blog-header">
                <h1>{language === 'ko' ? '블로그' : 'Blog'}</h1>
                <p>{pageDescription}</p>
            </header>

            {/* 카테고리 필터 */}
            <nav className="blog-categories">
                <button
                    className={`category-btn ${currentCategory === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('all')}
                >
                    {language === 'ko' ? '전체' : 'All'}
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.slug}
                        className={`category-btn ${currentCategory === cat.slug ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(cat.slug)}
                    >
                        {categoryEmojis[cat.slug] || '📝'} {cat.name}
                        {cat.count > 0 && <span className="count">({cat.count})</span>}
                    </button>
                ))}
            </nav>

            {/* 에러 상태 */}
            {error && (
                <div className="blog-error">
                    <p>⚠️ {language === 'ko' ? '콘텐츠를 불러오는데 실패했습니다' : 'Failed to load content'}</p>
                    <button onClick={() => loadPosts(true)}>
                        {language === 'ko' ? '다시 시도' : 'Try again'}
                    </button>
                </div>
            )}

            {/* 포스트 그리드 */}
            <div className="blog-grid">
                {filteredPosts.map(post => (
                    <BlogCard key={post.id} post={post} />
                ))}
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div className="blog-loading">
                    <div className="spinner" />
                    <p>{language === 'ko' ? '로딩 중...' : 'Loading...'}</p>
                </div>
            )}

            {/* 빈 상태 */}
            {!loading && filteredPosts.length === 0 && (
                <div className="blog-empty">
                    <span className="emoji">📭</span>
                    <p>{language === 'ko' ? '아직 포스트가 없습니다' : 'No posts yet'}</p>
                </div>
            )}

            {/* 더 보기 */}
            {hasMore && !loading && (
                <div className="blog-load-more">
                    <button onClick={() => loadPosts(false)}>
                        {language === 'ko' ? '더 보기' : 'Load More'}
                    </button>
                </div>
            )}

            <style>{`
                .blog-list-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 16px;
                }
                .blog-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .blog-header h1 {
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0 0 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .blog-header p {
                    color: #666;
                    font-size: 16px;
                    margin: 0;
                }
                .blog-categories {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    -webkit-overflow-scrolling: touch;
                }
                .category-btn {
                    padding: 8px 16px;
                    border: none;
                    background: #f0f0f0;
                    border-radius: 20px;
                    font-size: 14px;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .category-btn:hover {
                    background: #e0e0e0;
                }
                .category-btn.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .category-btn .count {
                    margin-left: 4px;
                    opacity: 0.7;
                    font-size: 12px;
                }
                .blog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }
                .blog-loading, .blog-empty, .blog-error {
                    text-align: center;
                    padding: 48px 16px;
                    color: #666;
                }
                .blog-loading .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f0f0f0;
                    border-top-color: #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .blog-empty .emoji {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 16px;
                }
                .blog-error button, .blog-load-more button {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 24px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .blog-error button:hover, .blog-load-more button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102,126,234,0.4);
                }
                .blog-load-more {
                    text-align: center;
                    margin-top: 32px;
                }

                @media (max-width: 768px) {
                    .blog-header h1 {
                        font-size: 24px;
                    }
                    .blog-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default BlogListPage;
