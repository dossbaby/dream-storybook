/**
 * 블로그 포스트 상세 페이지
 * jeom.ai/blog/:slug
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlogPost } from '../../services/wordpress';
import BlogSEO from '../../components/blog/BlogSEO';
import BlogCard from '../../components/blog/BlogCard';
import { useI18n } from '../../hooks/useI18n';

const BlogPostPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { language, t } = useI18n();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 포스트 로드
    useEffect(() => {
        const loadPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getBlogPost(slug, language);

                if (!data) {
                    setError('Post not found');
                    return;
                }

                setPost(data);
            } catch (err) {
                console.error('Failed to load post:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadPost();
            window.scrollTo(0, 0);
        }
    }, [slug, language]);

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString(
            language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
        );
    };

    // 읽기 시간 추정
    const getReadingTime = (content) => {
        if (!content) return 1;
        const text = content.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return Math.max(1, minutes);
    };

    // 공유 기능
    const handleShare = async () => {
        const shareData = {
            title: post.title,
            text: post.seo?.description || post.excerpt?.replace(/<[^>]*>/g, '').substring(0, 100),
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert(language === 'ko' ? '링크가 복사되었습니다!' : 'Link copied!');
        }
    };

    // 로딩 상태
    if (loading) {
        return (
            <div className="blog-post-loading">
                <div className="skeleton-header" />
                <div className="skeleton-content">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                    <div className="skeleton-line" />
                </div>

                <style>{`
                    .blog-post-loading {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 24px 16px;
                    }
                    .skeleton-header {
                        height: 300px;
                        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite;
                        border-radius: 16px;
                        margin-bottom: 24px;
                    }
                    .skeleton-line {
                        height: 20px;
                        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite;
                        border-radius: 4px;
                        margin-bottom: 12px;
                    }
                    .skeleton-line.short {
                        width: 60%;
                    }
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `}</style>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="blog-post-error">
                <span className="emoji">😕</span>
                <h2>{language === 'ko' ? '포스트를 찾을 수 없습니다' : 'Post not found'}</h2>
                <p>{error}</p>
                <Link to="/blog" className="back-btn">
                    {language === 'ko' ? '블로그로 돌아가기' : 'Back to Blog'}
                </Link>

                <style>{`
                    .blog-post-error {
                        text-align: center;
                        padding: 80px 16px;
                    }
                    .blog-post-error .emoji {
                        font-size: 64px;
                        display: block;
                        margin-bottom: 16px;
                    }
                    .blog-post-error h2 {
                        margin: 0 0 8px;
                        font-size: 24px;
                    }
                    .blog-post-error p {
                        color: #666;
                        margin: 0 0 24px;
                    }
                    .back-btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 24px;
                        font-weight: 600;
                    }
                `}</style>
            </div>
        );
    }

    if (!post) return null;

    const readingTime = getReadingTime(post.content);

    return (
        <article className="blog-post-page">
            <BlogSEO post={post} type="post" />

            {/* Breadcrumb */}
            <nav className="breadcrumb">
                <Link to="/">{language === 'ko' ? '홈' : 'Home'}</Link>
                <span>/</span>
                <Link to="/blog">{language === 'ko' ? '블로그' : 'Blog'}</Link>
                {post.categories?.nodes?.[0] && (
                    <>
                        <span>/</span>
                        <Link to={`/blog?category=${post.categories.nodes[0].slug}`}>
                            {post.categories.nodes[0].name}
                        </Link>
                    </>
                )}
            </nav>

            {/* 헤더 */}
            <header className="post-header">
                {/* 카테고리 */}
                {post.categories?.nodes?.length > 0 && (
                    <div className="post-categories">
                        {post.categories.nodes.map(cat => (
                            <Link
                                key={cat.slug}
                                to={`/blog?category=${cat.slug}`}
                                className="category-tag"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* 제목 */}
                <h1>{post.title}</h1>

                {/* 메타 정보 */}
                <div className="post-meta">
                    {post.author?.node && (
                        <div className="author">
                            {post.author.node.avatar?.url && (
                                <img
                                    src={post.author.node.avatar.url}
                                    alt={post.author.node.name}
                                    className="avatar"
                                />
                            )}
                            <span>{post.author.node.name}</span>
                        </div>
                    )}
                    <span className="separator">•</span>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span className="separator">•</span>
                    <span className="reading-time">
                        📖 {readingTime}{language === 'ko' ? '분' : ' min'}
                    </span>
                </div>
            </header>

            {/* 피처드 이미지 */}
            {post.featuredImage?.node?.sourceUrl && (
                <figure className="featured-image">
                    <img
                        src={post.featuredImage.node.sourceUrl}
                        srcSet={post.featuredImage.node.srcSet}
                        sizes={post.featuredImage.node.sizes}
                        alt={post.featuredImage.node.altText || post.title}
                    />
                </figure>
            )}

            {/* 다국어 전환 */}
            {post.translations?.length > 0 && (
                <div className="language-switcher">
                    <span>{language === 'ko' ? '다른 언어로 보기:' : 'Read in:'}</span>
                    {post.translations.map(trans => (
                        <Link
                            key={trans.language.code}
                            to={`/blog/${trans.slug}`}
                            className="lang-link"
                        >
                            {trans.language.name}
                        </Link>
                    ))}
                </div>
            )}

            {/* 본문 */}
            <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 태그 */}
            {post.tags?.nodes?.length > 0 && (
                <div className="post-tags">
                    {post.tags.nodes.map(tag => (
                        <Link key={tag.slug} to={`/tags/${tag.slug}`} className="tag">
                            #{tag.name}
                        </Link>
                    ))}
                </div>
            )}

            {/* 공유 버튼 */}
            <div className="share-section">
                <button onClick={handleShare} className="share-btn">
                    📤 {language === 'ko' ? '공유하기' : 'Share'}
                </button>
            </div>

            {/* 관련 포스트 */}
            {post.relatedPosts?.nodes?.length > 0 && (
                <section className="related-posts">
                    <h3>{language === 'ko' ? '관련 포스트' : 'Related Posts'}</h3>
                    <div className="related-grid">
                        {post.relatedPosts.nodes.map(related => (
                            <BlogCard key={related.slug} post={related} compact />
                        ))}
                    </div>
                </section>
            )}

            {/* 네비게이션 */}
            <nav className="post-navigation">
                <Link to="/blog" className="back-link">
                    ← {language === 'ko' ? '블로그 목록' : 'Back to Blog'}
                </Link>
            </nav>

            <style>{`
                .blog-post-page {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 24px 16px;
                }
                .breadcrumb {
                    display: flex;
                    gap: 8px;
                    font-size: 13px;
                    color: #888;
                    margin-bottom: 24px;
                }
                .breadcrumb a {
                    color: #667eea;
                    text-decoration: none;
                }
                .breadcrumb a:hover {
                    text-decoration: underline;
                }
                .post-header {
                    margin-bottom: 24px;
                }
                .post-categories {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .category-tag {
                    font-size: 12px;
                    padding: 4px 12px;
                    background: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                    text-decoration: none;
                    border-radius: 20px;
                    font-weight: 500;
                }
                .post-header h1 {
                    font-size: 32px;
                    font-weight: 800;
                    line-height: 1.3;
                    margin: 0 0 16px;
                }
                .post-meta {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #666;
                    font-size: 14px;
                    flex-wrap: wrap;
                }
                .author {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                }
                .separator {
                    color: #ccc;
                }
                .featured-image {
                    margin: 0 -16px 32px;
                    border-radius: 16px;
                    overflow: hidden;
                }
                .featured-image img {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                .language-switcher {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    font-size: 14px;
                }
                .lang-link {
                    color: #667eea;
                    text-decoration: none;
                    padding: 4px 8px;
                    background: white;
                    border-radius: 4px;
                }
                .lang-link:hover {
                    background: #667eea;
                    color: white;
                }
                .post-content {
                    font-size: 17px;
                    line-height: 1.8;
                    color: #333;
                }
                .post-content h2, .post-content h3, .post-content h4 {
                    margin-top: 32px;
                    margin-bottom: 16px;
                    font-weight: 700;
                }
                .post-content p {
                    margin-bottom: 20px;
                }
                .post-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                }
                .post-content a {
                    color: #667eea;
                }
                .post-content blockquote {
                    border-left: 4px solid #667eea;
                    padding-left: 20px;
                    margin: 24px 0;
                    font-style: italic;
                    color: #555;
                }
                .post-content pre {
                    background: #1e1e1e;
                    color: #f8f8f2;
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                }
                .post-content code {
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.9em;
                }
                .post-content pre code {
                    background: none;
                    padding: 0;
                }
                .post-tags {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin: 32px 0;
                    padding-top: 24px;
                    border-top: 1px solid #eee;
                }
                .tag {
                    color: #667eea;
                    text-decoration: none;
                    font-size: 14px;
                }
                .tag:hover {
                    text-decoration: underline;
                }
                .share-section {
                    text-align: center;
                    padding: 24px 0;
                }
                .share-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 24px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .share-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102,126,234,0.4);
                }
                .related-posts {
                    margin-top: 48px;
                    padding-top: 32px;
                    border-top: 1px solid #eee;
                }
                .related-posts h3 {
                    font-size: 20px;
                    margin: 0 0 20px;
                }
                .related-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .post-navigation {
                    margin-top: 48px;
                    padding-top: 24px;
                    border-top: 1px solid #eee;
                }
                .back-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                }
                .back-link:hover {
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .post-header h1 {
                        font-size: 24px;
                    }
                    .post-content {
                        font-size: 16px;
                    }
                    .featured-image {
                        margin: 0 0 24px;
                    }
                }
            `}</style>
        </article>
    );
};

export default BlogPostPage;
