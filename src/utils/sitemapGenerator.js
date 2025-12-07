/**
 * Dynamic Sitemap Generator
 * Firebase 데이터 기반으로 sitemap.xml 생성
 */

import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { extractTags, getTagUrl } from './tagUtils';

const SITE_URL = 'https://jeom.ai';

/**
 * sitemap.xml 생성
 * @returns {Promise<string>} XML 문자열
 */
export const generateSitemap = async () => {
    const urls = [];

    // 정적 페이지들
    const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/tags', priority: '0.9', changefreq: 'daily' },
        { loc: '/dreams', priority: '0.8', changefreq: 'daily' },
        { loc: '/tarots', priority: '0.8', changefreq: 'daily' },
        { loc: '/sajus', priority: '0.8', changefreq: 'daily' }
    ];

    staticPages.forEach(page => {
        urls.push({
            loc: `${SITE_URL}${page.loc}`,
            priority: page.priority,
            changefreq: page.changefreq,
            lastmod: new Date().toISOString().split('T')[0]
        });
    });

    try {
        // 꿈 콘텐츠
        const dreamsQuery = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(500));
        const dreamsSnap = await getDocs(dreamsQuery);
        dreamsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.isPublic) {
                urls.push({
                    loc: `${SITE_URL}/dream/${doc.id}`,
                    priority: '0.7',
                    changefreq: 'monthly',
                    lastmod: data.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
                });
            }
        });

        // 타로 콘텐츠
        const tarotsQuery = query(collection(db, 'tarots'), orderBy('createdAt', 'desc'), limit(500));
        const tarotsSnap = await getDocs(tarotsQuery);
        tarotsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.isPublic) {
                urls.push({
                    loc: `${SITE_URL}/tarot/${doc.id}`,
                    priority: '0.7',
                    changefreq: 'monthly',
                    lastmod: data.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
                });
            }
        });

        // 사주 콘텐츠 (sajus 컬렉션)
        const sajusQuery = query(collection(db, 'sajus'), orderBy('createdAt', 'desc'), limit(500));
        const sajusSnap = await getDocs(sajusQuery);
        sajusSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.isPublic) {
                urls.push({
                    loc: `${SITE_URL}/saju/${doc.id}`,
                    priority: '0.7',
                    changefreq: 'monthly',
                    lastmod: data.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
                });
            }
        });

        // 레거시 fortunes 컬렉션도 saju URL로 포함
        try {
            const fortunesQuery = query(collection(db, 'fortunes'), orderBy('createdAt', 'desc'), limit(500));
            const fortunesSnap = await getDocs(fortunesQuery);
            fortunesSnap.docs.forEach(doc => {
                const data = doc.data();
                if (data.isPublic) {
                    urls.push({
                        loc: `${SITE_URL}/saju/${doc.id}`,
                        priority: '0.7',
                        changefreq: 'monthly',
                        lastmod: data.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
                    });
                }
            });
        } catch (e) {
            // fortunes 컬렉션이 없으면 무시
        }

        // 태그 페이지들 (인기 태그만)
        const allTags = new Set();
        dreamsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.isPublic) {
                extractTags(data.keywords).forEach(tag => allTags.add(tag));
            }
        });
        tarotsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.isPublic) {
                extractTags(data.keywords).forEach(tag => allTags.add(tag));
            }
        });
        sajusSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.isPublic) {
                extractTags(data.keywords).forEach(tag => allTags.add(tag));
            }
        });

        // 태그 URL 추가
        allTags.forEach(tag => {
            urls.push({
                loc: `${SITE_URL}${getTagUrl(tag)}`,
                priority: '0.6',
                changefreq: 'weekly',
                lastmod: new Date().toISOString().split('T')[0]
            });
        });

    } catch (e) {
        console.error('Failed to generate sitemap:', e);
    }

    // XML 생성
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return xml;
};

/**
 * robots.txt 생성
 * @returns {string}
 */
export const generateRobotsTxt = () => {
    return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

# 관리자 페이지 차단
Disallow: /admin/
Disallow: /api/

# 개인 콘텐츠는 허용하되 비공개 설정된 것은 크롤링되지 않음
`;
};

/**
 * 태그별 콘텐츠 수 조회 (sitemap index용)
 * @returns {Promise<Map<string, number>>}
 */
export const getTagContentCounts = async () => {
    const tagCounts = new Map();

    try {
        const dreamsQuery = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(500));
        const dreamsSnap = await getDocs(dreamsQuery);

        dreamsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.isPublic) {
                extractTags(data.keywords).forEach(tag => {
                    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                });
            }
        });

        // 타로, 사주도 동일하게 처리...
    } catch (e) {
        console.error('Failed to get tag counts:', e);
    }

    return tagCounts;
};

export default { generateSitemap, generateRobotsTxt, getTagContentCounts };
