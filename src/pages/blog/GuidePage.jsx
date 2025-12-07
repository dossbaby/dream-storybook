/**
 * 가이드 페이지
 * jeom.ai/guide/:slug
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGuidePage, getGuidePages } from '../../services/wordpress';
import BlogSEO from '../../components/blog/BlogSEO';
import { useI18n } from '../../hooks/useI18n';

const GuidePage = () => {
    const { slug } = useParams();
    const { language } = useI18n();

    const [page, setPage] = useState(null);
    const [allGuides, setAllGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 가이드 로드
    useEffect(() => {
        const loadGuide = async () => {
            try {
                setLoading(true);
                setError(null);

                const [pageData, guides] = await Promise.all([
                    slug ? getGuidePage(`guide/${slug}`) : null,
                    getGuidePages({ language })
                ]);

                setPage(pageData);
                setAllGuides(guides);
            } catch (err) {
                console.error('Failed to load guide:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadGuide();
        window.scrollTo(0, 0);
    }, [slug, language]);

    // 가이드 목록 페이지 (slug 없을 때)
    if (!slug) {
        return (
            <div className="guide-list-page">
                <header className="guide-header">
                    <h1>{language === 'ko' ? '가이드' : 'Guides'}</h1>
                    <p>
                        {language === 'ko'
                            ? '꿈해몽, 타로, 사주에 대해 더 자세히 알아보세요'
                            : 'Learn more about dream interpretation, tarot, and fortune telling'}
                    </p>
                </header>

                {loading ? (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="guide-grid">
                        {allGuides.map(guide => (
                            <Link
                                key={guide.slug}
                                to={`/guide/${guide.slug}`}
                                className="guide-card"
                            >
                                {guide.featuredImage?.node?.sourceUrl ? (
                                    <img
                                        src={guide.featuredImage.node.sourceUrl}
                                        alt={guide.featuredImage.node.altText || guide.title}
                                        className="guide-image"
                                    />
                                ) : (
                                    <div className="guide-placeholder">
                                        📖
                                    </div>
                                )}
                                <div className="guide-info">
                                    <h3>{guide.title}</h3>
                                    <p>{guide.seo?.description || guide.excerpt?.replace(/<[^>]*>/g, '').substring(0, 100)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <style>{`
                    .guide-list-page {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 24px 16px;
                    }
                    .guide-header {
                        text-align: center;
                        margin-bottom: 32px;
                    }
                    .guide-header h1 {
                        font-size: 32px;
                        font-weight: 800;
                        margin: 0 0 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    .guide-header p {
                        color: #666;
                        font-size: 16px;
                        margin: 0;
                    }
                    .loading {
                        text-align: center;
                        padding: 48px;
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid #f0f0f0;
                        border-top-color: #667eea;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    .guide-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                        gap: 24px;
                    }
                    .guide-card {
                        display: flex;
                        gap: 16px;
                        padding: 20px;
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                        text-decoration: none;
                        color: inherit;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .guide-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    }
                    .guide-image {
                        width: 100px;
                        height: 100px;
                        border-radius: 12px;
                        object-fit: cover;
                        flex-shrink: 0;
                    }
                    .guide-placeholder {
                        width: 100px;
                        height: 100px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 36px;
                        flex-shrink: 0;
                    }
                    .guide-info h3 {
                        margin: 0 0 8px;
                        font-size: 18px;
                        font-weight: 700;
                    }
                    .guide-info p {
                        margin: 0;
                        font-size: 14px;
                        color: #666;
                        line-height: 1.5;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    @media (max-width: 768px) {
                        .guide-grid {
                            grid-template-columns: 1fr;
                        }
                        .guide-card {
                            flex-direction: column;
                        }
                        .guide-image, .guide-placeholder {
                            width: 100%;
                            height: 150px;
                        }
                    }
                `}</style>
            </div>
        );
    }

    // 로딩 상태
    if (loading) {
        return (
            <div className="guide-loading">
                <div className="skeleton-header" />
                <div className="skeleton-content">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                </div>

                <style>{`
                    .guide-loading {
                        max-width: 900px;
                        margin: 0 auto;
                        padding: 24px 16px;
                    }
                    .skeleton-header {
                        height: 60px;
                        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite;
                        border-radius: 8px;
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
                    .skeleton-line.short { width: 60%; }
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `}</style>
            </div>
        );
    }

    // 에러/404 상태
    if (error || !page) {
        return (
            <div className="guide-error">
                <span className="emoji">📖</span>
                <h2>{language === 'ko' ? '가이드를 찾을 수 없습니다' : 'Guide not found'}</h2>
                <Link to="/guide" className="back-btn">
                    {language === 'ko' ? '가이드 목록으로' : 'Back to Guides'}
                </Link>

                <style>{`
                    .guide-error {
                        text-align: center;
                        padding: 80px 16px;
                    }
                    .guide-error .emoji {
                        font-size: 64px;
                        display: block;
                        margin-bottom: 16px;
                    }
                    .guide-error h2 {
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

    return (
        <div className="guide-page">
            <BlogSEO post={page} type="page" />

            <div className="guide-layout">
                {/* 사이드바 - 목차 */}
                <aside className="guide-sidebar">
                    <nav className="guide-toc">
                        <h4>{language === 'ko' ? '목차' : 'Contents'}</h4>
                        {page.tableOfContents?.headings?.map((heading, idx) => (
                            <a
                                key={idx}
                                href={`#${heading.anchor}`}
                                className={`toc-item level-${heading.level}`}
                            >
                                {heading.text}
                            </a>
                        ))}
                    </nav>

                    {/* 다른 가이드 */}
                    {allGuides.length > 1 && (
                        <nav className="other-guides">
                            <h4>{language === 'ko' ? '다른 가이드' : 'Other Guides'}</h4>
                            {allGuides
                                .filter(g => g.slug !== slug)
                                .slice(0, 5)
                                .map(guide => (
                                    <Link
                                        key={guide.slug}
                                        to={`/guide/${guide.slug}`}
                                        className="other-guide-link"
                                    >
                                        {guide.title}
                                    </Link>
                                ))}
                        </nav>
                    )}
                </aside>

                {/* 메인 콘텐츠 */}
                <main className="guide-main">
                    {/* Breadcrumb */}
                    <nav className="breadcrumb">
                        <Link to="/">{language === 'ko' ? '홈' : 'Home'}</Link>
                        <span>/</span>
                        <Link to="/guide">{language === 'ko' ? '가이드' : 'Guides'}</Link>
                        <span>/</span>
                        <span>{page.title}</span>
                    </nav>

                    <h1>{page.title}</h1>

                    {/* 다국어 전환 */}
                    {page.translations?.length > 0 && (
                        <div className="language-switcher">
                            {page.translations.map(trans => (
                                <Link
                                    key={trans.language.code}
                                    to={`/guide/${trans.slug}`}
                                    className="lang-link"
                                >
                                    {trans.language.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* 본문 */}
                    <div
                        className="guide-content"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />

                    {/* 수정일 */}
                    {page.modified && (
                        <p className="last-updated">
                            {language === 'ko' ? '마지막 업데이트: ' : 'Last updated: '}
                            {new Date(page.modified).toLocaleDateString()}
                        </p>
                    )}
                </main>
            </div>

            <style>{`
                .guide-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 16px;
                }
                .guide-layout {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 40px;
                }
                .guide-sidebar {
                    position: sticky;
                    top: 80px;
                    height: fit-content;
                }
                .guide-toc, .other-guides {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                }
                .guide-toc h4, .other-guides h4 {
                    font-size: 14px;
                    font-weight: 700;
                    color: #666;
                    margin: 0 0 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .toc-item {
                    display: block;
                    padding: 6px 0;
                    color: #333;
                    text-decoration: none;
                    font-size: 14px;
                    border-left: 2px solid transparent;
                    padding-left: 12px;
                    margin-left: -12px;
                    transition: all 0.2s;
                }
                .toc-item:hover {
                    color: #667eea;
                    border-left-color: #667eea;
                }
                .toc-item.level-3 {
                    padding-left: 24px;
                    font-size: 13px;
                }
                .toc-item.level-4 {
                    padding-left: 36px;
                    font-size: 12px;
                }
                .other-guide-link {
                    display: block;
                    padding: 8px 0;
                    color: #667eea;
                    text-decoration: none;
                    font-size: 14px;
                }
                .other-guide-link:hover {
                    text-decoration: underline;
                }
                .guide-main {
                    min-width: 0;
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
                .guide-main h1 {
                    font-size: 36px;
                    font-weight: 800;
                    margin: 0 0 24px;
                    line-height: 1.2;
                }
                .language-switcher {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                }
                .lang-link {
                    padding: 4px 12px;
                    background: #f0f0f0;
                    border-radius: 16px;
                    font-size: 13px;
                    color: #666;
                    text-decoration: none;
                }
                .lang-link:hover {
                    background: #667eea;
                    color: white;
                }
                .guide-content {
                    font-size: 17px;
                    line-height: 1.8;
                    color: #333;
                }
                .guide-content h2 {
                    font-size: 24px;
                    margin: 40px 0 16px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
                .guide-content h3 {
                    font-size: 20px;
                    margin: 32px 0 12px;
                }
                .guide-content p {
                    margin-bottom: 20px;
                }
                .guide-content ul, .guide-content ol {
                    margin-bottom: 20px;
                    padding-left: 24px;
                }
                .guide-content li {
                    margin-bottom: 8px;
                }
                .guide-content img {
                    max-width: 100%;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .guide-content a {
                    color: #667eea;
                }
                .guide-content blockquote {
                    border-left: 4px solid #667eea;
                    padding-left: 20px;
                    margin: 24px 0;
                    color: #555;
                    font-style: italic;
                }
                .guide-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .guide-content th, .guide-content td {
                    padding: 12px;
                    border: 1px solid #eee;
                    text-align: left;
                }
                .guide-content th {
                    background: #f8f9fa;
                    font-weight: 600;
                }
                .last-updated {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #888;
                    font-size: 14px;
                }

                @media (max-width: 900px) {
                    .guide-layout {
                        grid-template-columns: 1fr;
                    }
                    .guide-sidebar {
                        display: none;
                    }
                    .guide-main h1 {
                        font-size: 28px;
                    }
                }
            `}</style>
        </div>
    );
};

export default GuidePage;
