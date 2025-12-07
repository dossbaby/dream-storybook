/**
 * 블로그용 SEO 컴포넌트
 * RankMath SEO 메타데이터 렌더링
 */

import { Helmet } from 'react-helmet-async';

const BlogSEO = ({ post, type = 'post' }) => {
    if (!post?.seo) {
        return null;
    }

    const { seo, title: postTitle, slug, modified, date, author, featuredImage } = post;
    const {
        title,
        description,
        canonical,
        robots,
        openGraph,
        twitter,
        jsonLd,
        breadcrumbs
    } = seo;

    const siteUrl = 'https://jeom.ai';
    const fullUrl = `${siteUrl}/blog/${slug}`;

    // Schema.org JSON-LD 생성
    const generateJsonLd = () => {
        // RankMath에서 제공하는 JSON-LD 사용
        if (jsonLd?.raw) {
            try {
                return JSON.parse(jsonLd.raw);
            } catch {
                // fallback to manual generation
            }
        }

        // 수동 생성
        const schemaData = {
            '@context': 'https://schema.org',
            '@type': type === 'post' ? 'BlogPosting' : 'WebPage',
            headline: title || postTitle,
            description: description,
            url: canonical || fullUrl,
            datePublished: date,
            dateModified: modified || date,
            author: author?.node ? {
                '@type': 'Person',
                name: author.node.name
            } : undefined,
            image: featuredImage?.node?.sourceUrl || openGraph?.image?.url,
            publisher: {
                '@type': 'Organization',
                name: '점AI',
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/icons/icon-512.png`
                }
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': fullUrl
            }
        };

        // Breadcrumb Schema
        if (breadcrumbs?.length > 0) {
            schemaData.breadcrumb = {
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbs.map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.text,
                    item: item.url
                }))
            };
        }

        return schemaData;
    };

    return (
        <Helmet>
            {/* 기본 메타 */}
            <title>{title || postTitle}</title>
            <meta name="description" content={description} />
            {canonical && <link rel="canonical" href={canonical} />}
            {robots && <meta name="robots" content={robots} />}

            {/* Open Graph */}
            <meta property="og:type" content={openGraph?.type || (type === 'post' ? 'article' : 'website')} />
            <meta property="og:title" content={openGraph?.title || title || postTitle} />
            <meta property="og:description" content={openGraph?.description || description} />
            <meta property="og:url" content={canonical || fullUrl} />
            {openGraph?.image?.url && (
                <>
                    <meta property="og:image" content={openGraph.image.url} />
                    {openGraph.image.width && <meta property="og:image:width" content={openGraph.image.width} />}
                    {openGraph.image.height && <meta property="og:image:height" content={openGraph.image.height} />}
                </>
            )}
            {openGraph?.siteName && <meta property="og:site_name" content={openGraph.siteName} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={twitter?.title || openGraph?.title || title} />
            <meta name="twitter:description" content={twitter?.description || openGraph?.description || description} />
            {(twitter?.image?.url || openGraph?.image?.url) && (
                <meta name="twitter:image" content={twitter?.image?.url || openGraph?.image?.url} />
            )}

            {/* Article 메타 */}
            {type === 'post' && (
                <>
                    <meta property="article:published_time" content={date} />
                    {modified && <meta property="article:modified_time" content={modified} />}
                    {author?.node?.name && <meta property="article:author" content={author.node.name} />}
                </>
            )}

            {/* JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(generateJsonLd())}
            </script>
        </Helmet>
    );
};

export default BlogSEO;
