/**
 * WordPress Headless CMS 연동 서비스
 * WPGraphQL + RankMath SEO 통합
 *
 * 설정 방법:
 * 1. WordPress 설치 + WPGraphQL 플러그인 활성화
 * 2. RankMath SEO + wp-graphql-rank-math 플러그인 설치
 * 3. WPML (다국어) 설치 시 wp-graphql-wpml도 설치
 * 4. .env에 VITE_WP_GRAPHQL_URL 설정
 */

// WordPress GraphQL 엔드포인트
const WP_GRAPHQL_URL = import.meta.env.VITE_WP_GRAPHQL_URL || 'https://wp.jeom.ai/graphql';

/**
 * GraphQL 쿼리 실행
 */
const fetchGraphQL = async (query, variables = {}) => {
    try {
        const response = await fetch(WP_GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            throw new Error(`GraphQL error: ${response.status}`);
        }

        const { data, errors } = await response.json();

        if (errors) {
            console.error('GraphQL Errors:', errors);
            throw new Error(errors[0]?.message || 'GraphQL query failed');
        }

        return data;
    } catch (error) {
        console.error('WordPress fetch error:', error);
        throw error;
    }
};

/**
 * 블로그 포스트 목록 가져오기 (RankMath SEO 메타 포함)
 * @param {number} first - 가져올 포스트 수
 * @param {string} after - 페이지네이션 커서
 * @param {string} language - 언어 코드 (ko, en, ja, zh)
 */
export const getBlogPosts = async ({ first = 10, after = null, language = 'ko' } = {}) => {
    const query = `
        query GetBlogPosts($first: Int!, $after: String, $language: LanguageCodeFilterEnum) {
            posts(
                first: $first
                after: $after
                where: {
                    status: PUBLISH,
                    language: $language
                }
            ) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                nodes {
                    id
                    databaseId
                    slug
                    title
                    excerpt
                    date
                    modified
                    featuredImage {
                        node {
                            sourceUrl
                            altText
                            mediaDetails {
                                width
                                height
                            }
                        }
                    }
                    categories {
                        nodes {
                            name
                            slug
                        }
                    }
                    tags {
                        nodes {
                            name
                            slug
                        }
                    }
                    author {
                        node {
                            name
                            avatar {
                                url
                            }
                        }
                    }
                    # RankMath SEO 메타데이터
                    seo {
                        title
                        description
                        focusKeywords
                        robots
                        canonical
                        openGraph {
                            title
                            description
                            image {
                                url
                            }
                        }
                    }
                    # 다국어 번역 링크 (WPML)
                    translations {
                        slug
                        language {
                            code
                            name
                        }
                    }
                }
            }
        }
    `;

    const languageMap = {
        ko: 'KO',
        en: 'EN',
        ja: 'JA',
        zh: 'ZH'
    };

    const data = await fetchGraphQL(query, {
        first,
        after,
        language: languageMap[language] || 'KO'
    });

    return data.posts;
};

/**
 * 단일 블로그 포스트 가져오기 (slug 기반)
 * @param {string} slug - 포스트 슬러그
 * @param {string} language - 언어 코드
 */
export const getBlogPost = async (slug, language = 'ko') => {
    const query = `
        query GetBlogPost($slug: ID!) {
            post(id: $slug, idType: SLUG) {
                id
                databaseId
                slug
                title
                content
                excerpt
                date
                modified
                featuredImage {
                    node {
                        sourceUrl
                        altText
                        srcSet
                        sizes
                        mediaDetails {
                            width
                            height
                        }
                    }
                }
                categories {
                    nodes {
                        name
                        slug
                        description
                    }
                }
                tags {
                    nodes {
                        name
                        slug
                    }
                }
                author {
                    node {
                        name
                        description
                        avatar {
                            url
                        }
                    }
                }
                # RankMath SEO 메타데이터
                seo {
                    title
                    description
                    focusKeywords
                    robots
                    canonical
                    jsonLd {
                        raw
                    }
                    openGraph {
                        title
                        description
                        type
                        image {
                            url
                            width
                            height
                        }
                        siteName
                    }
                    twitter {
                        title
                        description
                        image {
                            url
                        }
                    }
                    breadcrumbs {
                        text
                        url
                    }
                }
                # 관련 포스트
                relatedPosts(first: 3) {
                    nodes {
                        slug
                        title
                        excerpt
                        featuredImage {
                            node {
                                sourceUrl
                            }
                        }
                    }
                }
                # 다국어 번역
                translations {
                    slug
                    title
                    language {
                        code
                        name
                        locale
                    }
                }
            }
        }
    `;

    const data = await fetchGraphQL(query, { slug });
    return data.post;
};

/**
 * 가이드(페이지) 목록 가져오기
 * 꿈해몽 가이드, 타로 가이드, 사주 가이드 등
 */
export const getGuidePages = async ({ language = 'ko' } = {}) => {
    const query = `
        query GetGuidePages($language: LanguageCodeFilterEnum) {
            pages(
                where: {
                    status: PUBLISH,
                    language: $language,
                    parent: "guide"
                }
                first: 50
            ) {
                nodes {
                    id
                    slug
                    title
                    excerpt
                    menuOrder
                    featuredImage {
                        node {
                            sourceUrl
                            altText
                        }
                    }
                    seo {
                        title
                        description
                    }
                    translations {
                        slug
                        language {
                            code
                        }
                    }
                }
            }
        }
    `;

    const languageMap = { ko: 'KO', en: 'EN', ja: 'JA', zh: 'ZH' };
    const data = await fetchGraphQL(query, {
        language: languageMap[language] || 'KO'
    });

    return data.pages?.nodes || [];
};

/**
 * 단일 가이드 페이지 가져오기
 */
export const getGuidePage = async (slug) => {
    const query = `
        query GetGuidePage($slug: ID!) {
            page(id: $slug, idType: URI) {
                id
                slug
                title
                content
                modified
                featuredImage {
                    node {
                        sourceUrl
                        altText
                        srcSet
                    }
                }
                seo {
                    title
                    description
                    canonical
                    jsonLd {
                        raw
                    }
                    breadcrumbs {
                        text
                        url
                    }
                }
                translations {
                    slug
                    title
                    language {
                        code
                        name
                    }
                }
                # 테이블 오브 컨텐츠 (목차)
                tableOfContents {
                    headings {
                        text
                        anchor
                        level
                    }
                }
            }
        }
    `;

    const data = await fetchGraphQL(query, { slug });
    return data.page;
};

/**
 * 카테고리 목록 가져오기
 */
export const getCategories = async ({ language = 'ko' } = {}) => {
    const query = `
        query GetCategories($language: LanguageCodeFilterEnum) {
            categories(
                where: { language: $language }
                first: 100
            ) {
                nodes {
                    id
                    slug
                    name
                    description
                    count
                    seo {
                        title
                        description
                    }
                    translations {
                        slug
                        language {
                            code
                        }
                    }
                }
            }
        }
    `;

    const languageMap = { ko: 'KO', en: 'EN', ja: 'JA', zh: 'ZH' };
    const data = await fetchGraphQL(query, {
        language: languageMap[language] || 'KO'
    });

    return data.categories?.nodes || [];
};

/**
 * 카테고리별 포스트 가져오기
 */
export const getPostsByCategory = async (categorySlug, { first = 10, language = 'ko' } = {}) => {
    const query = `
        query GetPostsByCategory($categorySlug: String!, $first: Int!, $language: LanguageCodeFilterEnum) {
            posts(
                where: {
                    categoryName: $categorySlug,
                    status: PUBLISH,
                    language: $language
                }
                first: $first
            ) {
                nodes {
                    slug
                    title
                    excerpt
                    date
                    featuredImage {
                        node {
                            sourceUrl
                            altText
                        }
                    }
                    seo {
                        title
                        description
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    `;

    const languageMap = { ko: 'KO', en: 'EN', ja: 'JA', zh: 'ZH' };
    const data = await fetchGraphQL(query, {
        categorySlug,
        first,
        language: languageMap[language] || 'KO'
    });

    return data.posts;
};

/**
 * 사이트맵용 모든 콘텐츠 슬러그 가져오기
 */
export const getAllContentSlugs = async () => {
    const query = `
        query GetAllSlugs {
            posts(first: 1000, where: { status: PUBLISH }) {
                nodes {
                    slug
                    modified
                    language {
                        code
                    }
                }
            }
            pages(first: 500, where: { status: PUBLISH }) {
                nodes {
                    slug
                    modified
                    language {
                        code
                    }
                }
            }
        }
    `;

    const data = await fetchGraphQL(query);
    return {
        posts: data.posts?.nodes || [],
        pages: data.pages?.nodes || []
    };
};

/**
 * 검색
 */
export const searchContent = async (searchTerm, { first = 10, language = 'ko' } = {}) => {
    const query = `
        query SearchContent($search: String!, $first: Int!, $language: LanguageCodeFilterEnum) {
            posts(
                where: {
                    search: $search,
                    status: PUBLISH,
                    language: $language
                }
                first: $first
            ) {
                nodes {
                    slug
                    title
                    excerpt
                    date
                    categories {
                        nodes {
                            name
                            slug
                        }
                    }
                    seo {
                        title
                        description
                    }
                }
            }
        }
    `;

    const languageMap = { ko: 'KO', en: 'EN', ja: 'JA', zh: 'ZH' };
    const data = await fetchGraphQL(query, {
        search: searchTerm,
        first,
        language: languageMap[language] || 'KO'
    });

    return data.posts?.nodes || [];
};

/**
 * WordPress 연결 상태 확인
 */
export const checkConnection = async () => {
    try {
        const query = `
            query HealthCheck {
                generalSettings {
                    title
                    url
                }
            }
        `;
        const data = await fetchGraphQL(query);
        return {
            connected: true,
            siteName: data.generalSettings?.title,
            siteUrl: data.generalSettings?.url
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
};

export default {
    getBlogPosts,
    getBlogPost,
    getGuidePages,
    getGuidePage,
    getCategories,
    getPostsByCategory,
    getAllContentSlugs,
    searchContent,
    checkConnection
};
