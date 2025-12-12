import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SEOHead from '../components/common/SEOHead';
import RelatedContent from '../components/seo/RelatedContent';
import CategoryTags from '../components/seo/CategoryTags';
import { CONTENT_TYPES, extractTags, generateSEOMeta } from '../utils/seoConfig';

/**
 * 통합 콘텐츠 페이지 - 꿈, 타로, 운세 모두 처리
 */
const ContentPage = ({ type }) => {
    const { id } = useParams();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);
    const [tags, setTags] = useState([]);

    const typeConfig = CONTENT_TYPES[type];

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, typeConfig.collection, id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };

                    // visibility 기반 접근 권한 체크
                    // public: 모두 접근 가능
                    // link: 링크가 있으면 접근 가능 (피드에는 안 뜸)
                    // private: 본인만 접근 가능 (링크 있어도 차단)
                    const visibility = data.visibility || (data.isPublic ? 'public' : 'private');

                    if (visibility === 'private') {
                        setError('비공개 콘텐츠입니다');
                        return;
                    }
                    // 'public' 또는 'link'는 접근 허용

                    setContent(data);

                    // 태그 추출
                    const extractedTags = extractTags(data, type);
                    setTags(extractedTags);

                    // 관련 콘텐츠 가져오기
                    await fetchRelatedContent(data, extractedTags);
                } else {
                    setError('콘텐츠를 찾을 수 없습니다');
                }
            } catch (err) {
                console.error('콘텐츠 로드 실패:', err);
                setError('콘텐츠를 불러오는데 실패했습니다');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id, type]);

    // 관련 콘텐츠 가져오기
    const fetchRelatedContent = async (currentContent, currentTags) => {
        try {
            // 같은 타입의 공개 콘텐츠 중 최신 6개
            const q = query(
                collection(db, typeConfig.collection),
                where('isPublic', '==', true),
                orderBy('createdAt', 'desc'),
                limit(7)
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(item => item.id !== id) // 현재 콘텐츠 제외
                .slice(0, 6);

            setRelatedItems(items);
        } catch (err) {
            console.error('관련 콘텐츠 로드 실패:', err);
        }
    };

    // 로딩 상태
    if (loading) {
        return (
            <div className="seo-page loading">
                <div className="loading-spinner">{typeConfig.icon}</div>
                <p>{typeConfig.name} 불러오는 중...</p>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="seo-page error">
                <h1>{error}</h1>
                <Link to="/" className="back-home">홈으로 돌아가기</Link>
            </div>
        );
    }

    const seoMeta = generateSEOMeta(content, type);

    return (
        <div className={`seo-page ${type}-page`}>
            <SEOHead
                title={seoMeta.title}
                description={seoMeta.description}
                keywords={seoMeta.keywords}
                ogImage={seoMeta.ogImage}
                ogType={seoMeta.ogType}
                canonical={seoMeta.canonical}
                structuredData={seoMeta.structuredData}
            />

            {/* 헤더 */}
            <header className="seo-header">
                <Link to="/" className="logo-link">
                    🔮 점AI
                </Link>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="seo-content">
                <article className={`${type}-article`}>
                    {/* 헤더 섹션 */}
                    <header className={`${type}-header`}>
                        <span
                            className={`${type}-badge`}
                            style={{
                                background: `linear-gradient(135deg, ${typeConfig.gradientFrom}, ${typeConfig.gradientTo})`,
                                borderColor: typeConfig.color
                            }}
                        >
                            {typeConfig.icon} {typeConfig.name}
                        </span>
                        <h1 className={`${type}-title`}>{content.title}</h1>
                        <p className={`${type}-verdict`}>{content.verdict}</p>

                        {/* 타입별 추가 헤더 정보 */}
                        {type === 'tarot' && content.question && (
                            <blockquote className="tarot-question">
                                "{content.question}"
                            </blockquote>
                        )}
                        {type === 'fortune' && content.score && (
                            <div className="fortune-score">
                                <span className="score-label">오늘의 운세 점수</span>
                                <span className="score-value">{content.score}점</span>
                            </div>
                        )}
                    </header>

                    {/* 카테고리 태그 */}
                    {tags.length > 0 && (
                        <CategoryTags tags={tags} type={type} />
                    )}

                    {/* 이미지 섹션 */}
                    {renderImageSection(content, type)}

                    {/* 키워드 섹션 */}
                    {content.keywords?.length > 0 && (
                        <section className="keywords-section">
                            <h2>핵심 키워드</h2>
                            <div className="keywords-grid">
                                {content.keywords.map((keyword, index) => (
                                    <div key={index} className="keyword-card">
                                        <span className="keyword-word">
                                            {typeof keyword === 'string' ? keyword : keyword.word}
                                        </span>
                                        {keyword.meaning && (
                                            <span className="keyword-meaning">{keyword.meaning}</span>
                                        )}
                                        {keyword.hiddenMeaning && (
                                            <span className="keyword-hidden">{keyword.hiddenMeaning}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 타입별 메인 콘텐츠 */}
                    {renderMainContent(content, type)}

                    {/* 상세 분석 */}
                    {content.detailedAnalysis && (
                        <section className="detailed-section">
                            <h2>상세 분석</h2>
                            <div className="detailed-content">
                                {content.detailedAnalysis.split('\n').map((para, i) => (
                                    para.trim() && <p key={i}>{para}</p>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CTA 섹션 */}
                    <section className="cta-section">
                        <h3>나만의 {typeConfig.name} 받아보기</h3>
                        <p>당신만의 특별한 {typeConfig.name}을 무료로 받아보세요</p>
                        <Link to="/" className="cta-button">
                            {typeConfig.icon} 무료로 시작하기
                        </Link>
                    </section>
                </article>

                {/* 관련 콘텐츠 */}
                {relatedItems.length > 0 && (
                    <RelatedContent items={relatedItems} type={type} />
                )}
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

// 이미지 섹션 렌더링
const renderImageSection = (content, type) => {
    switch (type) {
        case 'dream':
            return content.dreamImage && (
                <section className="image-section">
                    <img
                        src={content.dreamImage}
                        alt={content.title}
                        className="main-image"
                        loading="lazy"
                    />
                </section>
            );

        case 'tarot':
            return content.cards && (
                <section className="cards-section">
                    <h2>뽑은 카드</h2>
                    <div className="cards-grid">
                        {content.cards.map((card, index) => (
                            <div key={index} className="card-item">
                                <span className="card-position">
                                    {['과거', '현재', '미래'][index]}
                                </span>
                                <img
                                    src={card.image}
                                    alt={card.name}
                                    className="card-image"
                                    loading="lazy"
                                />
                                <div className="card-info">
                                    <span className="card-name-en">{card.nameEn}</span>
                                    <span className="card-name-ko">{card.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            );

        case 'saju':
            return (
                <section className="sections-grid">
                    <h2>사주 분석</h2>
                    <div className="sections-container">
                        {['section1', 'section2', 'section3'].map((section, index) => (
                            <div key={section} className={`section-item ${section}`}>
                                {content[`${section}Image`] && (
                                    <img
                                        src={content[`${section}Image`]}
                                        alt={content.sections?.[section]?.category || `섹션 ${index + 1}`}
                                        className="section-image"
                                        loading="lazy"
                                    />
                                )}
                                <h3>{content.sections?.[section]?.icon} {content.sections?.[section]?.category}</h3>
                                <p>{content.sections?.[section]?.analysis}</p>
                            </div>
                        ))}
                    </div>
                </section>
            );

        default:
            return null;
    }
};

// 메인 콘텐츠 렌더링
const renderMainContent = (content, type) => {
    switch (type) {
        case 'dream':
            return (
                <>
                    {/* 꿈의 의미 */}
                    {content.dreamMeaning && (
                        <section className="meaning-section">
                            <h2>꿈의 의미</h2>
                            <p>{content.dreamMeaning}</p>
                        </section>
                    )}

                    {/* 타로 해석 */}
                    {content.tarot && (
                        <section className="tarot-section">
                            <h2>타로 카드 해석</h2>
                            <p>{content.tarot}</p>
                        </section>
                    )}
                </>
            );

        case 'tarot':
            return (
                <>
                    {/* 카드별 해석 */}
                    {content.reading && (
                        <section className="reading-section">
                            <h2>카드 리딩</h2>
                            <div className="reading-grid">
                                {['card1', 'card2', 'card3'].map((cardKey, index) => {
                                    // 새 구조 (card1, card2, card3) 또는 레거시 (past, present, future)
                                    const legacyKeys = ['past', 'present', 'future'];
                                    const reading = content.reading[cardKey] || content.reading[legacyKeys[index]];
                                    return reading && (
                                        <div key={cardKey} className={`reading-item card-${index + 1}`}>
                                            <h3>{['첫 번째 카드', '두 번째 카드', '세 번째 카드'][index]}</h3>
                                            <p>{reading}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            {content.reading.action && (
                                <div className="reading-action">
                                    <h3>조언</h3>
                                    <p>{content.reading.action}</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* 행운 요소 */}
                    {content.luckyElements && (
                        <section className="lucky-section">
                            <h2>행운의 요소</h2>
                            <div className="lucky-grid">
                                {content.luckyElements.color && (
                                    <div className="lucky-item">
                                        <span className="lucky-icon">🎨</span>
                                        <span className="lucky-label">행운의 색</span>
                                        <span className="lucky-value">{content.luckyElements.color}</span>
                                    </div>
                                )}
                                {content.luckyElements.number && (
                                    <div className="lucky-item">
                                        <span className="lucky-icon">🔢</span>
                                        <span className="lucky-label">행운의 숫자</span>
                                        <span className="lucky-value">{content.luckyElements.number}</span>
                                    </div>
                                )}
                                {content.luckyElements.direction && (
                                    <div className="lucky-item">
                                        <span className="lucky-icon">🧭</span>
                                        <span className="lucky-label">행운의 방향</span>
                                        <span className="lucky-value">{content.luckyElements.direction}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </>
            );

        case 'saju':
            return (
                <>
                    {/* 사주 정보 */}
                    {content.sajuInfo && (
                        <section className="saju-info-section">
                            <h2>사주팔자</h2>
                            <div className="saju-pillars">
                                <div className="pillar">
                                    <span className="pillar-label">년주</span>
                                    <span className="pillar-value">{content.sajuInfo.yearPillar}</span>
                                </div>
                                <div className="pillar">
                                    <span className="pillar-label">월주</span>
                                    <span className="pillar-value">{content.sajuInfo.monthPillar}</span>
                                </div>
                                <div className="pillar">
                                    <span className="pillar-label">일주</span>
                                    <span className="pillar-value">{content.sajuInfo.dayPillar}</span>
                                </div>
                                {content.sajuInfo.hourPillar && (
                                    <div className="pillar">
                                        <span className="pillar-label">시주</span>
                                        <span className="pillar-value">{content.sajuInfo.hourPillar}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                    {/* 종합 분석 */}
                    {content.synthesisAnalysis && (
                        <section className="synthesis-section">
                            <h2>종합 분석</h2>
                            <p>{content.synthesisAnalysis}</p>
                        </section>
                    )}
                </>
            );

        default:
            return null;
    }
};

export default ContentPage;
