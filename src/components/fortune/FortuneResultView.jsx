import { useState, useEffect, useRef } from 'react';
import { useComments } from '../../hooks/useComments';
import Reactions from '../common/Reactions';

// 폴백용 인사이트
const FALLBACK_INSIGHTS = [
    "오늘의 사주에서 특별한 기운이 감지됐어요",
    "이 사주풀이를 다시 저녁에 보면 새로운 의미가 보일 거예요",
    "오늘 당신에게 좋은 기운이 숨어있어요"
];

// **bold** 마크다운을 하이라이트 span으로 변환
const parseBoldText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return (
                <span key={index} className="reading-highlight">
                    {boldText}
                </span>
            );
        }
        return part;
    });
};

// 시간 포맷팅 헬퍼
const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
};

const FortuneResultView = ({
    fortuneResult,
    onBack,
    onRestart,
    onKeywordClick,
    onUpdateVisibility,
    showToast,
    user,
    userNickname,
    onLoginRequired,
    isPremium = false,
    onOpenPremium
}) => {
    // 작성자인지 확인
    const isAuthor = user?.uid && fortuneResult.userId && user.uid === fortuneResult.userId;

    // VN 인트로 단계
    const [introPhase, setIntroPhase] = useState(isAuthor ? 0 : 5);
    const [hookTyped, setHookTyped] = useState('');
    const [foreshadowTyped, setForeshadowTyped] = useState('');
    const [pageRevealed, setPageRevealed] = useState(false);

    // 섹션 reveal 상태
    const [revealedSections, setRevealedSections] = useState([]);
    const [insightUnsealed, setInsightUnsealed] = useState(false);

    // 섹션 참조
    const sectionRefs = useRef([]);
    const sectionBarRef = useRef(null);

    // 엔게이지먼트 시스템
    const {
        isLiked,
        likeCount,
        toggleLike,
        reactions,
        userReactions,
        toggleReaction,
        comments,
        newComment,
        setNewComment,
        addComment,
        deleteComment,
        toggleCommentLike,
        isCommentLiked,
        addReply,
        loadReplies,
        deleteReply
    } = useComments('sajus', user, fortuneResult, userNickname);

    // 댓글 상태
    const [showAllComments, setShowAllComments] = useState(false);
    const commentInputRef = useRef(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [repliesMap, setRepliesMap] = useState({});

    const displayedComments = showAllComments ? comments : comments.slice(0, 3);
    const hasMoreComments = comments.length > 3;

    // Jenny 필드
    const jenny = fortuneResult.jenny || {};
    const rarity = fortuneResult.rarity || {};
    const sajuInfo = fortuneResult.sajuInfo || {};

    // 숨겨진 인사이트
    const hiddenInsight = jenny.hiddenInsight || FALLBACK_INSIGHTS[Math.floor(fortuneResult.overallScore || 0) % FALLBACK_INSIGHTS.length];

    // 희귀도
    const rarityText = rarity.description || '';

    // Hook/Foreshadow 텍스트
    const hookText = jenny.hook || '오늘의 운세가 도착했어요... 사주팔자가 전하는 메시지를 함께 확인해볼까요?';
    const foreshadowText = jenny.foreshadow || '별자리와 사주가 오늘 하루를 안내해줄 거예요.';

    // 히어로 이미지
    const heroImage = fortuneResult.heroImage || fortuneResult.morningImage || fortuneResult.image;

    // 섹션 데이터
    const sectionsData = fortuneResult.sections || {};
    const sections = [
        {
            id: 'section1',
            icon: sectionsData.section1?.icon || '✨',
            label: sectionsData.section1?.category || '첫 번째 운',
            title: sectionsData.section1?.title || '',
            content: sectionsData.section1?.analysis,
            transition: jenny.section1Transition,
            image: fortuneResult.section1Image
        },
        {
            id: 'section2',
            icon: sectionsData.section2?.icon || '💫',
            label: sectionsData.section2?.category || '두 번째 운',
            title: sectionsData.section2?.title || '',
            content: sectionsData.section2?.analysis,
            transition: jenny.section2Transition,
            image: fortuneResult.section2Image
        },
        {
            id: 'section3',
            icon: sectionsData.section3?.icon || '🌟',
            label: sectionsData.section3?.category || '세 번째 운',
            title: sectionsData.section3?.title || '',
            content: sectionsData.section3?.analysis,
            transition: null,
            image: fortuneResult.section3Image
        }
    ];

    const allSectionsRevealed = revealedSections.length >= sections.length;

    // 링크 공유
    const handleLinkShare = async () => {
        onUpdateVisibility?.('unlisted');
        if (fortuneResult.id) {
            const shareUrl = `${window.location.origin}/fortune/${fortuneResult.id}`;
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast?.('live', { message: '🔗 링크가 복사되었어요!', type: 'success' });
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast?.('live', { message: '🔗 링크가 복사되었어요!', type: 'success' });
            }
        }
    };

    // VN 인트로 시퀀스
    useEffect(() => {
        if (!isAuthor) {
            setIntroPhase(5);
            setPageRevealed(true);
            return;
        }
        const startTimer = setTimeout(() => setIntroPhase(1), 800);
        return () => clearTimeout(startTimer);
    }, [isAuthor]);

    // Hook 타이핑
    useEffect(() => {
        if (introPhase === 1 && hookTyped.length < hookText.length) {
            const timer = setTimeout(() => {
                setHookTyped(hookText.slice(0, hookTyped.length + 1));
            }, 85);
            return () => clearTimeout(timer);
        } else if (introPhase === 1 && hookTyped.length >= hookText.length) {
            setIntroPhase(2);
        }
    }, [introPhase, hookTyped, hookText]);

    // Foreshadow 타이핑
    useEffect(() => {
        if (introPhase === 3 && foreshadowTyped.length < foreshadowText.length) {
            const timer = setTimeout(() => {
                setForeshadowTyped(foreshadowText.slice(0, foreshadowTyped.length + 1));
            }, 70);
            return () => clearTimeout(timer);
        } else if (introPhase === 3 && foreshadowTyped.length >= foreshadowText.length) {
            setIntroPhase(4);
        }
    }, [introPhase, foreshadowTyped, foreshadowText]);

    // 페이지 reveal
    useEffect(() => {
        if (introPhase === 5) {
            setTimeout(() => setPageRevealed(true), 100);
        }
    }, [introPhase]);

    // ESC 키
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onBack?.();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onBack]);

    // 섹션 reveal 핸들러
    const handleSectionReveal = (index) => {
        if (introPhase < 5) return;
        if (revealedSections.includes(index)) {
            scrollToSection(index);
            return;
        }
        if (index === 0 || revealedSections.includes(index - 1)) {
            setRevealedSections([...revealedSections, index]);
            setTimeout(() => scrollToSection(index), 400);
        }
    };

    // 섹션 스크롤
    const scrollToSection = (index) => {
        const section = sectionRefs.current[index];
        if (section) {
            const stickyBarHeight = sectionBarRef.current?.offsetHeight || 120;
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: sectionTop - stickyBarHeight - 45,
                behavior: 'smooth'
            });
        }
    };

    // 인트로 클릭 핸들러
    const handleIntroClick = () => {
        if (introPhase === 1) {
            setHookTyped(hookText);
            setIntroPhase(2);
        } else if (introPhase === 2) {
            setIntroPhase(3);
        } else if (introPhase === 3) {
            setForeshadowTyped(foreshadowText);
            setIntroPhase(4);
        } else if (introPhase === 4) {
            setIntroPhase(5);
        }
    };

    const handleSkipIntro = () => {
        setHookTyped(hookText);
        setForeshadowTyped(foreshadowText);
        setIntroPhase(5);
    };

    return (
        <div className={`tarot-result-page fortune-result-page ${pageRevealed ? 'revealed' : ''}`}>
            {/* 별 효과 배경 */}
            <div className="stars-layer" aria-hidden="true"></div>

            {/* VN 인트로 오버레이 */}
            {introPhase < 5 && (
                <div className="vn-intro-overlay" onClick={handleIntroClick}>
                    <div className="vn-bg-glow"></div>
                    <div className="vn-bg-glow secondary"></div>
                    <div className="vn-particles"></div>

                    <div className="vn-intro-content">
                        <div className="vn-ornament top">~ ✧ ~</div>

                        {introPhase >= 1 && (
                            <div className={`vn-hook ${introPhase >= 2 ? 'complete' : ''}`}>
                                <p className="vn-typing-text">
                                    {hookTyped}
                                    {introPhase === 1 && hookTyped.length < hookText.length && (
                                        <span className="vn-cursor">|</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {introPhase >= 3 && (
                            <div className={`vn-foreshadow ${introPhase >= 4 ? 'complete' : ''}`}>
                                <p className="vn-typing-text">
                                    {foreshadowTyped}
                                    {introPhase === 3 && foreshadowTyped.length < foreshadowText.length && (
                                        <span className="vn-cursor">|</span>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="vn-ornament bottom">~ ✧ ~</div>

                        <p className="vn-continue-hint">
                            {introPhase === 2 || introPhase === 4
                                ? '탭하여 계속...'
                                : introPhase === 1 || introPhase === 3
                                    ? '탭하면 건너뛰기'
                                    : ''}
                        </p>

                        <button
                            className="vn-skip-btn"
                            onClick={(e) => { e.stopPropagation(); handleSkipIntro(); }}
                        >
                            <span className="skip-icon">»</span>SKIP
                        </button>
                    </div>
                </div>
            )}

            {/* 메인 콘텐츠 */}
            <div className="tarot-result-content fortune-result-content">
                <div className="modal-pattern-bg"></div>
                <button className="modal-close-btn" onClick={onBack}>✕</button>

                {/* 히어로 섹션 */}
                <div className="reading-hero fortune-hero">
                    {heroImage && (
                        <img src={heroImage} alt="" className="reading-hero-img" />
                    )}
                    <div className="reading-hero-overlay">
                        <span className="reading-type-badge fortune-badge">☀️ 오늘의 사주</span>

                        {rarityText && (
                            <div className="rarity-hook">
                                <span>✨</span> {rarityText}
                            </div>
                        )}

                        <h1 className="reading-title">{fortuneResult.title}</h1>
                        <p className="reading-verdict">"{fortuneResult.verdict}"</p>

                        {/* 사주 점수 */}
                        <div className="fortune-score-display">
                            <div className="score-circle">
                                <span className="score-number">{fortuneResult.overallScore}</span>
                                <span className="score-unit">점</span>
                            </div>
                        </div>

                        {/* 키워드 */}
                        <div className="hero-tags-row">
                            {fortuneResult.keywords?.slice(0, 3).map((kw, i) => (
                                <span
                                    key={i}
                                    className="hero-keyword-tag"
                                    onClick={() => onKeywordClick?.(kw.word || kw)}
                                >
                                    #{kw.word || kw}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="hero-divider"></div>

                {/* Hook/Foreshadow 요약 */}
                {introPhase >= 5 && (
                    <div className="question-answer-flow">
                        {fortuneResult.affirmation && (
                            <div className="reading-quote fortune-quote">
                                <span className="quote-icon">💫</span>
                                <p>"{fortuneResult.affirmation}"</p>
                            </div>
                        )}
                        <div className="qa-divider">
                            <span className="qa-divider-star">✦</span>
                        </div>
                        <div className="result-intro-summary">
                            <p className="intro-hook-text">{hookText}</p>
                            <p className="intro-foreshadow-text">{foreshadowText}</p>
                        </div>
                    </div>
                )}

                {/* 섹션 바 (Persona 스타일) */}
                <div
                    ref={sectionBarRef}
                    className={`persona-card-bar fortune-section-bar ${introPhase >= 5 ? 'visible' : ''} ${allSectionsRevealed ? 'all-revealed' : ''}`}
                >
                    <div className="persona-bg-pattern"></div>
                    <div className="persona-bar-header">
                        <span className={`persona-bar-label ${allSectionsRevealed ? 'revealed' : 'selecting'}`}>
                            {allSectionsRevealed ? 'ALL FORTUNES REVEALED' : 'DISCOVER YOUR DESTINY'}
                        </span>
                    </div>

                    <div className="persona-cards-row fortune-sections-row">
                        {sections.map((section, i) => {
                            const isRevealed = revealedSections.includes(i);
                            const canReveal = i === 0 || revealedSections.includes(i - 1);

                            return (
                                <div
                                    key={section.id}
                                    className={`persona-card fortune-section-card ${isRevealed ? 'revealed' : ''} ${canReveal && !isRevealed ? 'ready' : ''}`}
                                    onClick={() => handleSectionReveal(i)}
                                    style={{ '--card-index': i }}
                                >
                                    <div className="persona-card-inner">
                                        {isRevealed ? (
                                            <div className="fortune-section-revealed">
                                                <span className="section-icon-large">{section.icon}</span>
                                                <span className="section-label">{section.label}</span>
                                            </div>
                                        ) : (
                                            <div className="persona-card-back">
                                                {canReveal && (
                                                    <>
                                                        <div className="pulse-ring"></div>
                                                        <div className="pulse-ring"></div>
                                                    </>
                                                )}
                                                <span className="persona-card-symbol">{section.icon}</span>
                                                <span className={`persona-tap-hint ${!canReveal ? 'inactive' : ''}`}>
                                                    {section.label} 열기
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="persona-card-number">0{i + 1}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 본문 */}
                {revealedSections.length > 0 && (
                    <div className="reading-body">
                        {/* 사주팔자 정보 */}
                        {sajuInfo.yearPillar && (
                            <div className="saju-pillars-section fade-in-up">
                                <h3 className="saju-pillars-title">📜 사주팔자</h3>
                                <div className="saju-pillars-grid">
                                    <div className="saju-pillar">
                                        <span className="pillar-label">년주</span>
                                        <span className="pillar-value">{sajuInfo.yearPillar}</span>
                                    </div>
                                    <div className="saju-pillar">
                                        <span className="pillar-label">월주</span>
                                        <span className="pillar-value">{sajuInfo.monthPillar}</span>
                                    </div>
                                    <div className="saju-pillar">
                                        <span className="pillar-label">일주</span>
                                        <span className="pillar-value">{sajuInfo.dayPillar}</span>
                                    </div>
                                    {sajuInfo.hourPillar && (
                                        <div className="saju-pillar">
                                            <span className="pillar-label">시주</span>
                                            <span className="pillar-value">{sajuInfo.hourPillar}</span>
                                        </div>
                                    )}
                                </div>
                                {sajuInfo.mainElement && (
                                    <div className="saju-element-info">
                                        <span>주요 오행: <strong>{sajuInfo.mainElement}</strong></span>
                                        {sajuInfo.yongsin && <span> | 용신: <strong>{sajuInfo.yongsin}</strong></span>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 섹션별 내용 */}
                        {sections.map((section, i) => {
                            const isRevealed = revealedSections.includes(i);
                            if (!isRevealed) return null;

                            return (
                                <section
                                    key={section.id}
                                    ref={el => sectionRefs.current[i] = el}
                                    className={`card-chapter fortune-chapter chapter-${i}`}
                                >
                                    {section.image && (
                                        <div className="chapter-hero">
                                            <img src={section.image} alt={section.label} className="chapter-hero-img" />
                                            <div className="chapter-hero-overlay">
                                                <span className="chapter-number">0{i + 1}</span>
                                                <span className="chapter-badge">{section.icon} {section.label}</span>
                                                {section.title && (
                                                    <h3 className="chapter-card-name">{section.title}</h3>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`chapter-divider chapter-divider-${i}`}></div>

                                    <div className="chapter-content">
                                        <h2 className="chapter-title">
                                            <span className="title-accent">{i + 1}</span>
                                            {section.label} {section.title && `- ${section.title}`}
                                        </h2>

                                        <div className="chapter-text reading-text">
                                            {section.content?.split('\n').map((line, j) => (
                                                <p key={j} className="reading-paragraph">{parseBoldText(line)}</p>
                                            ))}
                                        </div>

                                        {section.transition && (
                                            <div className="chapter-transition">
                                                <span className="transition-icon">→</span>
                                                <span>{section.transition}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            );
                        })}

                        {/* 종합 분석 */}
                        {allSectionsRevealed && fortuneResult.synthesisAnalysis && (
                            <div className="synthesis-section fade-in-up">
                                <h2 className="reading-section-title">
                                    <span className="section-icon">🔮</span>
                                    종합 사주 분석
                                </h2>
                                <div className="synthesis-text reading-text">
                                    {fortuneResult.synthesisAnalysis.split('\n').map((line, i) => (
                                        <p key={i} className="reading-paragraph">{parseBoldText(line)}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hidden Insight */}
                        {allSectionsRevealed && (
                            <div className="sealed-insight-section fade-in-up">
                                {!insightUnsealed ? (
                                    <div
                                        className="sealed-message"
                                        onClick={() => setInsightUnsealed(true)}
                                    >
                                        <div className="seal-visual">
                                            <span className="seal-icon">🌌</span>
                                            <div className="seal-glow"></div>
                                        </div>
                                        <div className="seal-text">운명의 문</div>
                                        <div className="seal-hint">
                                            잠깐, 뭔가 더 있어요!!!
                                        </div>
                                        <button className="unseal-btn">
                                            ✦ 문 열어보기
                                        </button>
                                    </div>
                                ) : (
                                    <div className="unsealed-insight">
                                        <h2 className="insight-header">
                                            <span className="section-icon">🌌</span>
                                            운명이 보낸 숨겨진 메시지
                                        </h2>
                                        <div className="insight-content reading-text">
                                            <p className="insight-text reading-paragraph">{parseBoldText(hiddenInsight)}</p>
                                            {jenny.hiddenInsightDetail && (
                                                <p className="insight-detail reading-paragraph">{parseBoldText(jenny.hiddenInsightDetail)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DO / DON'T 카드 */}
                        {allSectionsRevealed && (
                            <div className="advice-grid fade-in-up">
                                {fortuneResult.doList?.length > 0 && (
                                    <div className="advice-card do-card">
                                        <span className="advice-icon">✅</span>
                                        <span className="advice-label">오늘 하면 좋은 것</span>
                                        <ul className="do-dont-list">
                                            {fortuneResult.doList.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {fortuneResult.dontList?.length > 0 && (
                                    <div className="advice-card warning dont-card">
                                        <span className="advice-icon">❌</span>
                                        <span className="advice-label">오늘 피해야 할 것</span>
                                        <ul className="do-dont-list">
                                            {fortuneResult.dontList.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* 공유 프리뷰 */}
                                <div className="advice-card share-preview-card">
                                    <span className="advice-icon">☀️</span>
                                    <span className="advice-label">{fortuneResult.title}</span>
                                    <p className="share-preview-verdict">"{fortuneResult.verdict}"</p>
                                    <p className="share-preview-score">{fortuneResult.overallScore}점</p>
                                </div>
                            </div>
                        )}

                        {/* 행운의 요소 */}
                        {allSectionsRevealed && fortuneResult.luckyElements && (
                            <div className="lucky-elements-section fade-in-up">
                                <h3 className="lucky-title">🍀 행운의 요소</h3>
                                <div className="lucky-grid">
                                    <div className="lucky-item">
                                        <span className="lucky-icon">🎨</span>
                                        <span className="lucky-label">색상</span>
                                        <span className="lucky-value">{fortuneResult.luckyElements.color}</span>
                                    </div>
                                    <div className="lucky-item">
                                        <span className="lucky-icon">🔢</span>
                                        <span className="lucky-label">숫자</span>
                                        <span className="lucky-value">{fortuneResult.luckyElements.number}</span>
                                    </div>
                                    <div className="lucky-item">
                                        <span className="lucky-icon">🧭</span>
                                        <span className="lucky-label">방향</span>
                                        <span className="lucky-value">{fortuneResult.luckyElements.direction}</span>
                                    </div>
                                    <div className="lucky-item">
                                        <span className="lucky-icon">⏰</span>
                                        <span className="lucky-label">시간</span>
                                        <span className="lucky-value">{fortuneResult.luckyElements.time}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 하단 뒤로가기 버튼 */}
            {introPhase >= 5 && (
                <div className="bottom-back-section">
                    <button className="bottom-back-btn" onClick={onBack}>
                        <span>←</span>
                        <span>돌아가기</span>
                    </button>
                </div>
            )}

            {/* visibility-panel 임시 삭제 - CSS는 tarot.css에 보존됨 */}

            {/* 엔게이지먼트 패널 */}
            {fortuneResult.id && introPhase >= 5 && (
                <aside className="engagement-panel">
                    <div className="engagement-panel-inner">
                        {/* 좋아요 */}
                        <div className="engagement-like-section">
                            <button
                                className={`like-button-fancy ${isLiked ? 'liked' : ''}`}
                                onClick={() => {
                                    if (!user) { onLoginRequired?.(); return; }
                                    toggleLike();
                                    if (!isLiked) {
                                        showToast?.('live', { message: '💜 사주 풀이에 공감했어요!', type: 'success' });
                                    }
                                }}
                            >
                                <span className="like-emoji-default">{isLiked ? '💜' : '🤍'}</span>
                                <span className="like-emoji-hover">💖</span>
                                <span className="like-ripple"></span>
                            </button>
                            <span className="like-count">{likeCount}</span>
                        </div>

                        <div className="engagement-divider"></div>

                        <div className="engagement-reactions-section">
                            <Reactions
                                reactions={reactions}
                                userReactions={userReactions}
                                onReact={(reactionId) => {
                                    if (!user) { onLoginRequired?.(); return; }
                                    toggleReaction(reactionId);
                                }}
                            />
                        </div>

                        <div className="engagement-divider"></div>

                        <div className="engagement-stats-simple">
                            <span className="stat-text">조회수 {fortuneResult.viewCount || 0}</span>
                            <span className="stat-dot">·</span>
                            <span className="stat-text">
                                {fortuneResult.createdAt?.toDate
                                    ? fortuneResult.createdAt.toDate().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                                    : '-'}
                            </span>
                        </div>

                        <div className="engagement-divider"></div>

                        <div className="comments-header">
                            <span className="comments-title">💬 댓글</span>
                            <span className="comments-count-badge">{comments.length}</span>
                        </div>

                        <div className="comment-input-area">
                            {user ? (
                                <form
                                    className="comment-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (newComment.trim()) {
                                            addComment();
                                            showToast?.('live', { message: '💬 댓글이 등록됐어요!', type: 'success' });
                                        }
                                    }}
                                >
                                    <div className="comment-input-wrapper">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="" className="comment-avatar" />
                                        ) : (
                                            <div className="comment-avatar-placeholder">
                                                {(userNickname || user.displayName || '?').charAt(0)}
                                            </div>
                                        )}
                                        <input
                                            ref={commentInputRef}
                                            type="text"
                                            className="comment-input"
                                            placeholder="댓글을 남겨보세요"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            maxLength={500}
                                        />
                                        <button
                                            type="submit"
                                            className="comment-submit-btn"
                                            disabled={!newComment.trim()}
                                        >
                                            <span>💬</span>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="comment-login-prompt" onClick={onLoginRequired}>
                                    <span className="login-icon">✨</span>
                                    <span>로그인하고 댓글을 남겨보세요</span>
                                </div>
                            )}
                        </div>

                        <div className="comments-list-blind">
                            {comments.length === 0 ? (
                                <p className="comments-empty-text">첫 댓글을 남겨보세요</p>
                            ) : (
                                <>
                                    {displayedComments.map((comment) => (
                                        <div key={comment.id} className="blind-comment">
                                            <div className="blind-comment-header">
                                                {comment.userPhoto ? (
                                                    <img src={comment.userPhoto} alt="" className="blind-avatar" />
                                                ) : (
                                                    <div className="blind-avatar placeholder">
                                                        {(comment.userName || '?').charAt(0)}
                                                    </div>
                                                )}
                                                <span className="blind-nickname">{comment.userName}</span>
                                            </div>
                                            <div className="blind-comment-body">
                                                <p className="blind-text">{comment.text}</p>
                                                <div className="blind-actions">
                                                    <span className="blind-time">
                                                        {comment.createdAt?.toDate ? formatTimeAgo(comment.createdAt.toDate()) : ''}
                                                    </span>
                                                    <button
                                                        className={`blind-like-btn ${isCommentLiked(comment.id) ? 'liked' : ''}`}
                                                        onClick={() => toggleCommentLike(comment.id)}
                                                    >
                                                        ♡ {comment.likeCount || 0}
                                                    </button>
                                                    <button
                                                        className="blind-reply-btn"
                                                        onClick={() => {
                                                            if (!user) { onLoginRequired?.(); return; }
                                                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                                            setReplyText('');
                                                        }}
                                                    >
                                                        대댓글
                                                    </button>
                                                    {user?.uid === comment.userId && (
                                                        <button
                                                            className="blind-del-btn"
                                                            onClick={() => deleteComment(comment.id, comment.userId)}
                                                        >
                                                            삭제
                                                        </button>
                                                    )}
                                                </div>

                                                {replyingTo === comment.id && user && (
                                                    <div className="blind-reply-input">
                                                        <input
                                                            type="text"
                                                            placeholder="대댓글을 입력하세요"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && replyText.trim()) {
                                                                    addReply(comment.id, replyText);
                                                                    setReplyText('');
                                                                    setReplyingTo(null);
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                if (replyText.trim()) {
                                                                    addReply(comment.id, replyText);
                                                                    setReplyText('');
                                                                    setReplyingTo(null);
                                                                }
                                                            }}
                                                            disabled={!replyText.trim()}
                                                        >
                                                            등록
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {hasMoreComments && (
                                        <button
                                            className="comments-toggle"
                                            onClick={() => setShowAllComments(!showAllComments)}
                                        >
                                            {showAllComments ? '접기' : `댓글 ${comments.length - 3}개 더 보기`}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
};

export default FortuneResultView;
