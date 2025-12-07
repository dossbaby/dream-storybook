/**
 * 블로그 포스트 카드 컴포넌트
 * WordPress Headless CMS 연동
 */

import { Link } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';

const BlogCard = ({ post, compact = false }) => {
    const { language } = useI18n();

    if (!post) return null;

    const {
        slug,
        title,
        excerpt,
        date,
        featuredImage,
        categories,
        author,
        seo
    } = post;

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // HTML 태그 제거
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
    };

    // 카테고리 이모지 매핑
    const categoryEmojis = {
        'dream': '🌙',
        'tarot': '🎴',
        'saju': '☯️',
        'fortune': '🔮',
        'guide': '📖',
        'tips': '💡',
        'story': '📚'
    };

    const getCategoryEmoji = (slug) => categoryEmojis[slug] || '📝';

    if (compact) {
        return (
            <Link
                to={`/blog/${slug}`}
                className="blog-card-compact"
            >
                {featuredImage?.node?.sourceUrl && (
                    <div className="blog-card-compact-image">
                        <img
                            src={featuredImage.node.sourceUrl}
                            alt={featuredImage.node.altText || title}
                            loading="lazy"
                        />
                    </div>
                )}
                <div className="blog-card-compact-content">
                    <h4>{title}</h4>
                    <span className="blog-card-date">{formatDate(date)}</span>
                </div>

                <style>{`
                    .blog-card-compact {
                        display: flex;
                        gap: 12px;
                        padding: 12px;
                        background: var(--card-bg, #f8f9fa);
                        border-radius: 12px;
                        text-decoration: none;
                        color: inherit;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .blog-card-compact:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .blog-card-compact-image {
                        width: 60px;
                        height: 60px;
                        border-radius: 8px;
                        overflow: hidden;
                        flex-shrink: 0;
                    }
                    .blog-card-compact-image img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .blog-card-compact-content {
                        flex: 1;
                        min-width: 0;
                    }
                    .blog-card-compact-content h4 {
                        margin: 0 0 4px;
                        font-size: 14px;
                        font-weight: 600;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .blog-card-date {
                        font-size: 12px;
                        color: #888;
                    }
                `}</style>
            </Link>
        );
    }

    return (
        <article className="blog-card">
            <Link to={`/blog/${slug}`} className="blog-card-link">
                {/* 썸네일 이미지 */}
                <div className="blog-card-image">
                    {featuredImage?.node?.sourceUrl ? (
                        <img
                            src={featuredImage.node.sourceUrl}
                            alt={featuredImage.node.altText || title}
                            loading="lazy"
                            width={featuredImage.node.mediaDetails?.width}
                            height={featuredImage.node.mediaDetails?.height}
                        />
                    ) : (
                        <div className="blog-card-placeholder">
                            <span>📝</span>
                        </div>
                    )}
                </div>

                {/* 콘텐츠 */}
                <div className="blog-card-content">
                    {/* 카테고리 */}
                    {categories?.nodes?.length > 0 && (
                        <div className="blog-card-categories">
                            {categories.nodes.slice(0, 2).map((cat) => (
                                <span key={cat.slug} className="blog-card-category">
                                    {getCategoryEmoji(cat.slug)} {cat.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* 제목 */}
                    <h3 className="blog-card-title">{title}</h3>

                    {/* 요약 */}
                    <p className="blog-card-excerpt">
                        {seo?.description || stripHtml(excerpt)}
                    </p>

                    {/* 메타 정보 */}
                    <div className="blog-card-meta">
                        {author?.node && (
                            <div className="blog-card-author">
                                {author.node.avatar?.url && (
                                    <img
                                        src={author.node.avatar.url}
                                        alt={author.node.name}
                                        className="blog-card-avatar"
                                    />
                                )}
                                <span>{author.node.name}</span>
                            </div>
                        )}
                        <span className="blog-card-date">{formatDate(date)}</span>
                    </div>
                </div>
            </Link>

            <style>{`
                .blog-card {
                    background: var(--card-bg, #ffffff);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .blog-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }
                .blog-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }
                .blog-card-image {
                    width: 100%;
                    aspect-ratio: 16/9;
                    overflow: hidden;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .blog-card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }
                .blog-card:hover .blog-card-image img {
                    transform: scale(1.05);
                }
                .blog-card-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                }
                .blog-card-content {
                    padding: 20px;
                }
                .blog-card-categories {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }
                .blog-card-category {
                    font-size: 12px;
                    padding: 4px 10px;
                    background: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                    border-radius: 20px;
                    font-weight: 500;
                }
                .blog-card-title {
                    margin: 0 0 12px;
                    font-size: 18px;
                    font-weight: 700;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .blog-card-excerpt {
                    margin: 0 0 16px;
                    font-size: 14px;
                    color: #666;
                    line-height: 1.6;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .blog-card-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 13px;
                    color: #888;
                }
                .blog-card-author {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .blog-card-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                }

                @media (max-width: 768px) {
                    .blog-card-title {
                        font-size: 16px;
                    }
                    .blog-card-content {
                        padding: 16px;
                    }
                }
            `}</style>
        </article>
    );
};

export default BlogCard;
