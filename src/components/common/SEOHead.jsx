import { Helmet } from 'react-helmet-async';

/**
 * SEO 메타태그 컴포넌트
 * pSEO를 위한 동적 메타태그 생성
 */
const SEOHead = ({
    title,
    description,
    keywords,
    image,
    imageAlt,
    url,
    type = 'article',
    author = '점AI',
    publishedTime,
    modifiedTime,
    structuredData
}) => {
    const siteUrl = 'https://jeom.ai';
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const defaultImage = `${siteUrl}/og-image.png`;
    const ogImage = image || defaultImage;
    const ogImageAlt = imageAlt || title || '점AI 리딩 결과';

    return (
        <Helmet>
            {/* 기본 메타태그 */}
            <title>{title} | 점AI</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords.join(', ')} />}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:alt" content={ogImageAlt} />
            <meta property="og:site_name" content="점AI" />
            <meta property="og:locale" content="ko_KR" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:image:alt" content={ogImageAlt} />

            {/* Article 메타태그 (콘텐츠용) */}
            {type === 'article' && (
                <>
                    <meta property="article:author" content={author} />
                    {publishedTime && <meta property="article:published_time" content={publishedTime} />}
                    {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
                    {keywords && keywords.map((keyword, i) => (
                        <meta key={i} property="article:tag" content={keyword} />
                    ))}
                </>
            )}

            {/* JSON-LD 구조화 데이터 - 커스텀 또는 기본 */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData || {
                    "@context": "https://schema.org",
                    "@type": type === 'article' ? 'Article' : 'WebPage',
                    "headline": title,
                    "description": description,
                    "image": ogImage,
                    "url": fullUrl,
                    "author": {
                        "@type": "Organization",
                        "name": author
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "점AI",
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${siteUrl}/logo.png`
                        }
                    },
                    ...(publishedTime && { "datePublished": publishedTime }),
                    ...(modifiedTime && { "dateModified": modifiedTime }),
                    ...(keywords && { "keywords": keywords.join(', ') })
                })}
            </script>
        </Helmet>
    );
};

export default SEOHead;
