import { useState, useEffect, useRef } from 'react';
import { useComments } from '../../hooks/useComments';
import Reactions from '../common/Reactions';
import AnalysisOverlay from '../common/AnalysisOverlay';
import SEOHead from '../common/SEOHead';
import { generateSEOMeta } from '../../utils/seoConfig';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

// 폴백용 인사이트 (AI 생성 실패 시)
const FALLBACK_INSIGHTS = [
    "이 카드 조합은 100명 중 3명만 받는 희귀한 배치예요",
    "당신의 질문에 우주가 특별히 관심을 보이고 있어요",
    "이 리딩은 3일 후에 다시 보면 새로운 의미가 보일 거예요"
];

// 카드 위치별 라벨 (간결하게)
const CARD_LABELS = ['첫 번째', '두 번째', '세 번째'];

// 주제별 이모지 매핑
const TOPIC_EMOJIS = {
    '사랑': '💕',
    '관계': '🙌',
    '돈': '💰',
    '성장': '🌱',
    '건강': '💪',
    '선택': '⚖️',
    '일반': '💬'
};

// 텍스트 정규화 - AI 응답의 이상한 문자열 패턴 정리
const normalizeText = (text) => {
    if (!text) return '';
    return text
        // 리터럴 \n 문자열을 실제 줄바꿈으로
        .replace(/\\n\\n/g, '\n\n')
        .replace(/\\n/g, '\n')
        // n/n/ 패턴 (AI 오류)
        .replace(/n\/n\//g, '\n')
        .replace(/n\/n/g, '\n')
        // 연속 줄바꿈 정리 (3개 이상 → 2개)
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

// **bold** 마크다운을 무지개 그라디언트 span으로 변환하는 헬퍼
const parseBoldText = (text) => {
    if (!text) return null;

    // 먼저 텍스트 정규화
    const normalizedText = normalizeText(text);

    // **text** 패턴을 찾아서 분리
    const parts = normalizedText.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // bold 텍스트 - 무지개 그라디언트 적용
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

const TarotResultView = ({
    tarotResult,
    onBack,
    onRestart,
    whispers = [],
    onAddWhisper,
    viewerCount = 0,
    similarCount = 0,
    isPremium = false,
    onOpenPremium,
    onKeywordClick,
    onUpdateVisibility, // (visibility: 'private' | 'unlisted' | 'public') => void
    onOpenReferral,
    onOpenFeedback,
    showToast,
    // 엔게이지먼트 시스템용
    user,
    userNickname,
    onLoginRequired
}) => {
    // 작성자인지 확인 (VN 인트로는 작성자만 보여줌)
    const isAuthor = user?.uid && tarotResult.userId && user.uid === tarotResult.userId;

    // Visual Novel 인트로 단계 (클릭 기반 진행) - 작성자만 보여줌
    // 0: 시작 대기 (fade in)
    // VN Intro 단계 (통합 AnalysisOverlay에서 이미 hook/foreshadow 표시했으므로 작성자도 스킵)
    // 1: Hook 타이핑 중 (클릭하면 즉시 완료)
    // 2: Hook 완료, 클릭 대기
    // 3: Foreshadow 타이핑 중 (클릭하면 즉시 완료)
    // 4: Foreshadow 완료, 클릭 대기
    // 5: 인트로 종료, 결과 페이지 표시
    // 작성자/비작성자 모두 바로 5로 시작 (VN Intro 스킵)
    const [introPhase, setIntroPhase] = useState(5);
    const [hookTyped, setHookTyped] = useState('');
    const [foreshadowTyped, setForeshadowTyped] = useState('');
    const [pageRevealed, setPageRevealed] = useState(false);

    // 카드 뒤집기 상태 (순서대로만 열 수 있음)
    const [flippedCards, setFlippedCards] = useState([]);
    // Hidden Insight 봉인 해제 상태
    const [insightUnsealed, setInsightUnsealed] = useState(false);
    // Insight 열림 애니메이션 상태
    const [insightOpening, setInsightOpening] = useState(false);
    // 인트로 재생 오버레이 상태
    const [showIntroOverlay, setShowIntroOverlay] = useState(false);

    // 섹션 참조 (자동 스크롤용)
    const sectionRefs = useRef([]);
    const cardBarRef = useRef(null);

    // 엔게이지먼트 시스템 (좋아요/댓글/리액션)
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
    } = useComments('tarots', user, tarotResult, userNickname);

    // 댓글 더보기 상태 (기본 3개 표시, 더보기 클릭 시 전체)
    const [showAllComments, setShowAllComments] = useState(false);
    const commentInputRef = useRef(null);

    // 대댓글 관련 상태
    const [replyingTo, setReplyingTo] = useState(null); // 대댓글 입력 중인 댓글 ID
    const [replyText, setReplyText] = useState('');
    const [repliesMap, setRepliesMap] = useState({}); // { commentId: replies[] }
    const [expandedReplies, setExpandedReplies] = useState([]); // 펼쳐진 대댓글 목록

    // 표시할 댓글 (기본 3개, 더보기 시 전체)
    const displayedComments = showAllComments ? comments : comments.slice(0, 3);
    const hasMoreComments = comments.length > 3;

    // AI 생성 Jenny 전략 필드 사용 (없으면 폴백)
    const jenny = tarotResult.jenny || {};

    // 숨겨진 인사이트 (최상위 또는 jenny 객체 내부 체크)
    const hiddenInsight = tarotResult.hiddenInsight || jenny.hiddenInsight || FALLBACK_INSIGHTS[Math.floor(tarotResult.title?.length || 0) % FALLBACK_INSIGHTS.length];

    // Hidden Insight 로딩 상태 (실제 AI 생성 데이터가 있는지 확인)
    const isHiddenInsightReady = !!(tarotResult.hiddenInsight || jenny.hiddenInsight);
    // Hook 텍스트 (최상위 또는 jenny 객체 내부 체크)
    const hookText = tarotResult.hook || jenny.hook || '당신의 질문에 카드가 응답했어요... 세 장의 카드가 이야기를 시작합니다.';

    // Foreshadow 텍스트 (최상위 또는 jenny 객체 내부 체크)
    const foreshadowText = tarotResult.foreshadow || jenny.foreshadow || '카드가 말하고 싶은 이야기가 있어요. 함께 들어볼까요?';

    // 히어로 이미지 (질문 기반 생성 이미지, 없으면 카드1 이미지 폴백)
    const heroImageRaw = tarotResult.heroImage || tarotResult.card1Image || tarotResult.pastImage;
    const heroImage = getOptimizedImageUrl(heroImageRaw, { size: 'large' });

    // 카드 이미지 매핑 (4장) - 최적화된 URL 사용
    const cardImages = [
        getOptimizedImageUrl(tarotResult.card1Image || tarotResult.pastImage),
        getOptimizedImageUrl(tarotResult.card2Image || tarotResult.presentImage),
        getOptimizedImageUrl(tarotResult.card3Image || tarotResult.futureImage),
        getOptimizedImageUrl(tarotResult.conclusionImage)
    ];

    // 스토리 리딩 (flat 구조 또는 기존 storyReading 객체 지원)
    const storyReading = tarotResult.storyReading || {
        card1Analysis: tarotResult.card1Analysis || tarotResult.cardMeaning?.detail || '',
        card2Analysis: tarotResult.card2Analysis || tarotResult.reading?.present || '',
        card3Analysis: tarotResult.card3Analysis || tarotResult.reading?.future || '',
        conclusionCard: tarotResult.conclusionCard || tarotResult.reading?.action || '',
        synthesis: tarotResult.synthesis || tarotResult.cardMeaning?.summary || ''
    };

    // cardReady 객체 (스트리밍 중 업데이트됨)
    const cardReady = tarotResult.cardReady || { card1: false, card2: false, card3: false, conclusion: false };

    // 각 카드가 준비되었는지 확인 (cardReady 객체 또는 실제 데이터 체크)
    const isCardReady = (index) => {
        if (index === 0) {
            // 카드 1: cardReady 또는 실제 데이터 체크
            return cardReady.card1 || !!(cardImages[0] && storyReading.card1Analysis);
        } else if (index === 1) {
            // 카드 2: cardReady 또는 실제 데이터 체크
            return cardReady.card2 || !!(cardImages[1] && storyReading.card2Analysis);
        } else if (index === 2) {
            // 카드 3: cardReady 또는 실제 데이터 체크
            return cardReady.card3 || !!(cardImages[2] && storyReading.card3Analysis);
        } else if (index === 3) {
            // 결론 카드: cardReady 또는 실제 데이터 체크 (hiddenInsight 포함)
            return cardReady.conclusion || !!(cardImages[3] && storyReading.conclusionCard && hiddenInsight);
        }
        return false;
    };

    // 카드 개수 (3장 또는 4장)
    const cardCount = tarotResult.cards?.length || 3;
    const hasConclusion = cardCount >= 4;

    // 링크 공유 클릭 시 링크 복사 + visibility 업데이트
    const handleLinkShare = async () => {
        onUpdateVisibility?.('unlisted');
        if (tarotResult.id) {
            const shareUrl = `${window.location.origin}/tarot/${tarotResult.id}`;
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast?.('live', { message: '🔗 링크가 복사되었어요!', type: 'success' });
            } catch (err) {
                // 폴백
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

    // 모든 카드가 뒤집혔는지 확인
    const allCardsFlipped = flippedCards.length >= cardCount;

    // Visual Novel 인트로 시퀀스 - 저장된 리딩이거나 작성자가 아니면 건너뜀
    useEffect(() => {
        // 저장된 리딩(id가 있음) 또는 작성자가 아니면 바로 페이지 표시 (VN Intro 건너뜀)
        if (tarotResult.id || !isAuthor) {
            setIntroPhase(5);
            setPageRevealed(true);
            return;
        }

        // 새 리딩인 경우에만 VN Intro 시작
        // Phase 0 → 1: 0.8초 후 Hook 타이핑 시작
        const startTimer = setTimeout(() => {
            setIntroPhase(1);
        }, 800);

        return () => clearTimeout(startTimer);
    }, [isAuthor, tarotResult.id]);

    // Hook 타이핑 효과 (85ms per char)
    useEffect(() => {
        if (introPhase === 1 && hookTyped.length < hookText.length) {
            const timer = setTimeout(() => {
                setHookTyped(hookText.slice(0, hookTyped.length + 1));
            }, 85); // 타이핑 속도
            return () => clearTimeout(timer);
        } else if (introPhase === 1 && hookTyped.length >= hookText.length) {
            // Hook 완료 → Phase 2 (클릭 대기)
            setIntroPhase(2);
        }
    }, [introPhase, hookTyped, hookText]);

    // Foreshadow 타이핑 효과 (70ms per char)
    useEffect(() => {
        if (introPhase === 3 && foreshadowTyped.length < foreshadowText.length) {
            const timer = setTimeout(() => {
                setForeshadowTyped(foreshadowText.slice(0, foreshadowTyped.length + 1));
            }, 70); // 타이핑 속도
            return () => clearTimeout(timer);
        } else if (introPhase === 3 && foreshadowTyped.length >= foreshadowText.length) {
            // Foreshadow 완료 → Phase 4 (클릭 대기)
            setIntroPhase(4);
        }
    }, [introPhase, foreshadowTyped, foreshadowText]);

    // 페이지 reveal 효과
    useEffect(() => {
        if (introPhase === 5) {
            setTimeout(() => setPageRevealed(true), 100);
        }
    }, [introPhase]);

    // ESC 키로 뒤로가기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onBack?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onBack]);

    // 카드 뒤집기 핸들러 + 자동 스크롤
    const handleCardFlip = (index) => {
        // 인트로 완료 전에는 카드 선택 불가
        if (introPhase < 5) return;

        // 이미 뒤집힌 카드면 해당 섹션으로 스크롤만
        if (flippedCards.includes(index)) {
            scrollToSection(index);
            return;
        }

        // 첫 번째 카드이거나, 이전 카드가 이미 뒤집혔으면 뒤집기 가능
        if (index === 0 || flippedCards.includes(index - 1)) {
            setFlippedCards([...flippedCards, index]);
            // 약간의 딜레이 후 해당 섹션으로 스크롤
            setTimeout(() => scrollToSection(index), 400);
        }
    };

    // 섹션으로 스크롤 (페이지 전체 스크롤 사용)
    const scrollToSection = (index) => {
        const section = sectionRefs.current[index];
        if (section) {
            const stickyBarHeight = cardBarRef.current?.offsetHeight || 120;
            // 헤더 오프셋 CSS 변수 읽기 (헤더 숨김 상태에 따라 0px 또는 60px)
            const headerOffset = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue('--header-offset') || '60'
            );
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;

            // sticky bar가 header-offset 위치에 있으므로 둘 다 고려
            window.scrollTo({
                top: sectionTop - stickyBarHeight - headerOffset,
                behavior: 'smooth'
            });
        }
    };

    // 인트로 클릭 핸들러 (단계별 진행)
    const handleIntroClick = () => {
        if (introPhase === 1) {
            // 타이핑 중이면 즉시 완료
            setHookTyped(hookText);
            setIntroPhase(2);
        } else if (introPhase === 2) {
            // Hook 완료 상태 → Foreshadow 시작
            setIntroPhase(3);
        } else if (introPhase === 3) {
            // Foreshadow 타이핑 중이면 즉시 완료
            setForeshadowTyped(foreshadowText);
            setIntroPhase(4);
        } else if (introPhase === 4) {
            // Foreshadow 완료 → 인트로 종료
            setIntroPhase(5);
        }
    };

    // 인트로 완전 스킵 (더블클릭 또는 특수 동작용)
    const handleSkipIntro = () => {
        setHookTyped(hookText);
        setForeshadowTyped(foreshadowText);
        setIntroPhase(5);
    };

    // 분석 텍스트 배열
    const analyses = [
        storyReading.card1Analysis,
        storyReading.card2Analysis,
        storyReading.card3Analysis,
        storyReading.conclusionCard
    ];

    // Jenny 전환 텍스트 배열
    const transitions = [
        jenny.card1Transition,
        jenny.card2Transition,
        jenny.card3Transition,
        null
    ];

    // SEO 메타데이터 생성 (공유 링크용)
    const seoMeta = tarotResult.id ? generateSEOMeta(tarotResult, 'tarot') : null;

    return (
        <div className={`tarot-result-page ${pageRevealed ? 'revealed' : ''}`}>
            {/* SEO 메타태그 - 공유 링크용 */}
            {seoMeta && (
                <SEOHead
                    title={seoMeta.title}
                    description={seoMeta.description}
                    keywords={seoMeta.keywords}
                    image={seoMeta.ogImage}
                    imageAlt={seoMeta.ogImageAlt}
                    url={seoMeta.canonical}
                    type={seoMeta.ogType}
                    publishedTime={tarotResult.createdAt?.toDate?.()?.toISOString()}
                    structuredData={seoMeta.structuredData}
                />
            )}

            {/* 별 효과 배경 */}
            <div className="stars-layer" aria-hidden="true"></div>

            {/* Visual Novel 인트로 오버레이 */}
            {introPhase < 5 && (
                <div className="vn-intro-overlay" onClick={handleIntroClick}>
                    {/* 신비로운 배경 글로우 */}
                    <div className="vn-bg-glow"></div>
                    <div className="vn-bg-glow secondary"></div>
                    <div className="vn-particles"></div>

                    <div className="vn-intro-content">
                        {/* 우아한 상단 장식 */}
                        <div className="vn-ornament top">~ ✧ ~</div>

                        {/* Hook */}
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

                        {/* Foreshadow */}
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

                        {/* 우아한 하단 장식 */}
                        <div className="vn-ornament bottom">~ ✧ ~</div>

                        {/* 진행 안내 */}
                        <p className="vn-continue-hint">
                            {introPhase === 2 || introPhase === 4
                                ? '탭하여 계속...'
                                : introPhase === 1 || introPhase === 3
                                    ? '탭하면 건너뛰기'
                                    : ''}
                        </p>

                        {/* 스킵 버튼 */}
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
            <div className="tarot-result-content">
                {/* 대각선 패턴 배경 */}
                <div className="modal-pattern-bg"></div>

                {/* 닫기 버튼 */}
                <button className="modal-close-btn" onClick={onBack}>✕</button>

                {/* 히어로 섹션 - 이미지 + 최소 오버레이 */}
                <div className="reading-hero">
                    {heroImage && (
                        <img src={heroImage} alt="" className="reading-hero-img" />
                    )}
                    <div className="reading-hero-overlay">
                        <span className="reading-type-badge">타로</span>
                        <h1 className="reading-title">{tarotResult.title}</h1>
                    </div>
                </div>
                {/* 히어로 하단 메타 정보 - 이미지 아래 배치 */}
                <div className="hero-meta-section">
                    <p className="reading-verdict">"{tarotResult.verdict}"</p>
                    <div className="hero-tags-row">
                        {/* 주제 태그 */}
                        {(() => {
                            const topic = (tarotResult.topics || [tarotResult.topic])[0];
                            if (!topic) return null;
                            return (
                                <span
                                    className="hero-topic-tag"
                                    onClick={() => onKeywordClick?.(topic)}
                                >
                                    {TOPIC_EMOJIS[topic] || '💬'} {topic}
                                </span>
                            );
                        })()}
                        {/* 키워드 태그들 */}
                        {tarotResult.keywords?.length > 0 && tarotResult.keywords.slice(0, 3).map((kw, i) => (
                            <span
                                key={i}
                                className="hero-keyword-tag"
                                onClick={() => onKeywordClick?.(kw.word)}
                            >
                                #{kw.word}
                            </span>
                        ))}
                    </div>
                </div>
                {/* 히어로 하단 divider */}
                <div className="hero-divider"></div>

                {/* 질문 → Hook/Foreshadow 흐름 */}
                {introPhase >= 5 && (
                    <div className="question-answer-flow">
                        {/* 질문 인용 */}
                        {tarotResult.question && (
                            <div className="reading-quote">
                                <span className="quote-icon">💭</span>
                                <p>"{tarotResult.question}"</p>
                                {/* 인트로 보기 텍스트 링크 */}
                                <span
                                    className="intro-replay-text"
                                    onClick={() => setShowIntroOverlay(true)}
                                >
                                    인트로 보기
                                </span>
                            </div>
                        )}
                        {/* 질문/답변 사이 divider */}
                        <div className="qa-divider">
                            <span className="qa-divider-star">✦</span>
                        </div>
                        {/* Hook & Foreshadow - 답변 요약 */}
                        <div className="result-intro-summary">
                            <p className="intro-hook-text">{hookText}</p>
                            <p className="intro-foreshadow-text">{foreshadowText}</p>
                        </div>
                    </div>
                )}

                {/* Persona Style 카드 바 */}
                <div
                    ref={cardBarRef}
                    className={`persona-card-bar ${introPhase >= 5 ? 'visible' : ''} ${allCardsFlipped ? 'all-revealed' : ''}`}
                >
                    {/* 배경 사선 패턴 */}
                    <div className="persona-bg-pattern"></div>

                    {/* 상단 텍스트 */}
                    <div className="persona-bar-header">
                        <span className={`persona-bar-label ${allCardsFlipped ? 'revealed' : 'selecting'}`}>
                            {allCardsFlipped ? 'ALL CARDS REVEALED' : 'SELECT YOUR DESTINY'}
                        </span>
                    </div>

                    {/* 카드들 */}
                    <div className="persona-cards-row">
                        {tarotResult.cards?.slice(0, hasConclusion ? 4 : 3).map((card, i) => {
                            const isFlipped = flippedCards.includes(i);
                            const prevCardFlipped = i === 0 || flippedCards.includes(i - 1);
                            const cardReady = isCardReady(i);
                            const canFlip = prevCardFlipped && cardReady;
                            const isLoading = prevCardFlipped && !cardReady;
                            const isConclusion = hasConclusion && i === 3;

                            return (
                                <div
                                    key={card.id}
                                    className={`persona-card ${isFlipped ? 'revealed' : ''} ${canFlip && !isFlipped ? 'ready' : ''} ${isLoading ? 'loading' : ''} ${isConclusion ? 'finale' : ''}`}
                                    onClick={() => cardReady && handleCardFlip(i)}
                                    style={{ '--card-index': i }}
                                >
                                    {/* 카드 내부 */}
                                    <div className="persona-card-inner">
                                        {isFlipped ? (
                                            <>
                                                {cardImages[i] && (
                                                    <img src={cardImages[i]} alt={card.nameKo} className="persona-card-img" />
                                                )}
                                                <div className="persona-card-overlay">
                                                    <span className="persona-card-name">{card.nameKo}</span>
                                                    <span className="persona-card-en">{card.name}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="persona-card-back">
                                                {/* Pulse 링 - 준비된 경우에만 */}
                                                {canFlip && (
                                                    <>
                                                        <div className="pulse-ring"></div>
                                                        <div className="pulse-ring"></div>
                                                    </>
                                                )}
                                                {/* 로딩 스피너 */}
                                                {isLoading && (
                                                    <div className="card-loading-spinner"></div>
                                                )}
                                                <span className="persona-card-symbol">{isConclusion ? '★' : ['✦', '✶', '✧'][i] || '✦'}</span>
                                                <span className={`persona-tap-hint ${!canFlip ? 'inactive' : ''}`}>
                                                    {isLoading
                                                        ? '운명을 읽는 중...'
                                                        : isConclusion
                                                            ? (canFlip ? '결과 카드 오픈' : '?')
                                                            : (canFlip ? `카드 ${i + 1} 오픈` : `카드 ${i + 1} 오픈`)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 카드 번호 */}
                                    <span className="persona-card-number">{isConclusion ? 'FINAL' : `0${i + 1}`}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 본문 - 카드별 해석 (카드가 하나라도 열렸을 때만 표시) */}
                {flippedCards.length > 0 && (
                <div className="reading-body">
                    {tarotResult.cards?.slice(0, hasConclusion ? 4 : 3).map((card, i) => {
                        const isFlipped = flippedCards.includes(i);
                        const isConclusion = hasConclusion && i === 3;

                        if (!isFlipped) return null;

                        return (
                            <section
                                key={card.id}
                                ref={el => sectionRefs.current[i] = el}
                                className={`card-chapter ${isConclusion ? 'chapter-finale' : ''} card-chapter-${i}`}
                            >
                                {/* 풀 와이드 히어로 이미지 */}
                                {cardImages[i] && (
                                    <div className="chapter-hero">
                                        <img src={cardImages[i]} alt={card.nameKo} className="chapter-hero-img" />
                                        <div className="chapter-hero-overlay">
                                            <span className="chapter-number">
                                                {isConclusion ? 'FINAL' : `0${i + 1}`}
                                            </span>
                                            <span className="chapter-badge">
                                                {isConclusion ? '✦ 운명의 결론' : `${CARD_LABELS[i]} 카드`}
                                            </span>
                                            <h3 className="chapter-card-name">{card.nameKo}</h3>
                                            <p className="chapter-card-en">{card.nameEn || card.name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* 카드별 구분 divider */}
                                <div className={`chapter-divider chapter-divider-${i}`}></div>

                                {/* 해석 본문 */}
                                <div className="chapter-content">
                                    <h2 className="chapter-title">
                                        <span className="title-accent">{isConclusion ? '★' : i + 1}</span>
                                        {isConclusion ? '운명이 전하는 메시지' : `${CARD_LABELS[i]} 카드가 말하는 것`}
                                    </h2>

                                    <div className="chapter-text reading-text">
                                        {normalizeText(analyses[i]).split('\n').filter(line => line.trim()).map((line, j) => (
                                            <p key={j} className="reading-paragraph">{parseBoldText(line)}</p>
                                        ))}
                                    </div>

                                    {/* Jenny Transition - 다음 카드 힌트 */}
                                    {transitions[i] && (
                                        <div className="chapter-transition">
                                            <span className="transition-icon">→</span>
                                            <span>{transitions[i]}</span>
                                        </div>
                                    )}

                                    {/* Definitive Answer - 결론 카드 전용 */}
                                    {isConclusion && jenny.definitiveAnswer && (
                                        <div className="chapter-answer">
                                            <span className="answer-badge">✨ 최종 답변</span>
                                            <p className="answer-text reading-paragraph">{parseBoldText(jenny.definitiveAnswer)}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}

                    {/* 종합 메시지 */}
                    {allCardsFlipped && storyReading.synthesis && (
                        <div className="synthesis-section fade-in-up">
                            <h2 className="reading-section-title">
                                <span className="section-icon">🔮</span>
                                {hasConclusion ? '네' : '세'} 장의 카드가 전하는 메시지
                            </h2>
                            <div className="synthesis-text reading-text">
                                {normalizeText(storyReading.synthesis).split('\n').filter(line => line.trim()).map((line, i) => (
                                    <p key={i} className="reading-paragraph">{parseBoldText(line)}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hidden Insight - 봉인된 메시지 (무료 공개) */}
                    {allCardsFlipped && (
                        <div className="sealed-insight-section fade-in-up">
                            {!insightUnsealed ? (
                                <div
                                    className={`sealed-message ${isHiddenInsightReady ? "ready" : "loading"}`}
                                    onClick={() => {
                                        if (!isHiddenInsightReady) return;
                                        setInsightOpening(true);
                                        setTimeout(() => {
                                            setInsightUnsealed(true);
                                            setInsightOpening(false);
                                        }, 800);
                                    }}
                                >
                                    <div className="seal-visual">
                                        <span className="seal-icon">🌀</span>
                                        <div className="seal-glow"></div>
                                    </div>
                                    <div className={`seal-text fragmenting ${isHiddenInsightReady ? 'ready' : ''}`}>
                                        <span className="seal-char">차</span>
                                        <span className="seal-char">원</span>
                                        <span className="seal-char">의</span>
                                        <span className="seal-char"> </span>
                                        <span className="seal-char">틈</span>
                                    </div>
                                    {/* 별 파티클 배경 - ready 상태에서만 */}
                                    {isHiddenInsightReady && (
                                        <div className="star-particles">
                                            {[...Array(12)].map((_, i) => (
                                                <span key={i} className="star-particle" />
                                            ))}
                                        </div>
                                    )}
                                    <div className="seal-hint">
                                        {isHiddenInsightReady
                                            ? '잠깐, 뭔가 더 있어요!!!'
                                            : '시공간을 넘나드는 중...'}
                                    </div>
                                    {isHiddenInsightReady ? (
                                        <button className="unseal-btn">
                                            ✦ 틈새 엿보기
                                        </button>
                                    ) : (
                                        <div className="insight-loading-indicator">
                                            <span className="loading-dot"></span>
                                            <span className="loading-dot"></span>
                                            <span className="loading-dot"></span>
                                        </div>
                                    )}
                                    {/* 포탈 오픈 이펙트 */}
                                    {insightOpening && (
                                        <div className="insight-portal-effect">
                                            <div className="insight-portal-ring ring-1" />
                                            <div className="insight-portal-ring ring-2" />
                                            <div className="insight-portal-ring ring-3" />
                                            <div className="insight-portal-center" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="unsealed-insight">
                                    <h2 className="insight-header">
                                        <span className="section-icon">🌀</span>
                                        평행우주가 보내는 신호
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

                </div>
                )}

            </div>

            {/* 하단 뒤로가기 버튼 - tarot-result-content 바깥 */}
            {introPhase >= 5 && (
                <div className="bottom-back-section">
                    <button className="bottom-back-btn" onClick={onBack}>
                        <span>←</span>
                        <span>돌아가기</span>
                    </button>
                </div>
            )}

            {/* visibility-panel 임시 삭제 - CSS는 tarot.css에 보존됨 */}

            {/* 엔게이지먼트 사이드 패널 - 카드 오픈 전에도 표시 */}
            {tarotResult.id && introPhase >= 5 && (
                <aside className="engagement-panel">
                    <div className="engagement-panel-inner">
                        {/* 좋아요 버튼 - hover 이모지 효과 */}
                        <div className="engagement-like-section">
                            <button
                                className={`like-button-fancy ${isLiked ? 'liked' : ''}`}
                                onClick={() => {
                                    if (!user) {
                                        onLoginRequired?.();
                                        return;
                                    }
                                    toggleLike();
                                    if (!isLiked) {
                                        showToast?.('live', { message: '💜 리딩에 공감했어요!', type: 'success' });
                                    }
                                }}
                            >
                                <span className="like-emoji-default">{isLiked ? '💜' : '🤍'}</span>
                                <span className="like-emoji-hover">💖</span>
                                <span className="like-ripple"></span>
                            </button>
                            <span className="like-count">{likeCount}</span>
                        </div>

                        {/* 구분선 */}
                        <div className="engagement-divider"></div>

                        {/* 이모지 리액션 */}
                        <div className="engagement-reactions-section">
                            <Reactions
                                reactions={reactions}
                                userReactions={userReactions}
                                onReact={(reactionId) => {
                                    if (!user) {
                                        onLoginRequired?.();
                                        return;
                                    }
                                    toggleReaction(reactionId);
                                }}
                            />
                        </div>

                        {/* 구분선 */}
                        <div className="engagement-divider"></div>

                        {/* 조회수 & 게시일 - 심플 텍스트 */}
                        <div className="engagement-stats-simple">
                            <span className="stat-text">조회수 {tarotResult.viewCount || 0}</span>
                            <span className="stat-dot">·</span>
                            <span className="stat-text">
                                {tarotResult.createdAt?.toDate
                                    ? tarotResult.createdAt.toDate().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                                    : '-'}
                            </span>
                        </div>

                        {/* 구분선 */}
                        <div className="engagement-divider"></div>

                        {/* 댓글 헤더 */}
                        <div className="comments-header">
                            <span className="comments-title">💬 댓글</span>
                            <span className="comments-count-badge">{comments.length}</span>
                        </div>

                        {/* 댓글 입력 */}
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
                                <div
                                    className="comment-login-prompt"
                                    onClick={onLoginRequired}
                                >
                                    <span className="login-icon">✨</span>
                                    <span>로그인하고 댓글을 남겨보세요</span>
                                </div>
                            )}
                        </div>

                        {/* 댓글 리스트 - Blind 스타일 */}
                        <div className="comments-list-blind">
                            {comments.length === 0 ? (
                                <p className="comments-empty-text">첫 댓글을 남겨보세요</p>
                            ) : (
                                <>
                                    {displayedComments.map((comment) => (
                                        <div key={comment.id} className="blind-comment">
                                            {/* 댓글 헤더: 프로필 + 닉네임 */}
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

                                            {/* 댓글 본문 - 프로필 아래 정렬 */}
                                            <div className="blind-comment-body">
                                                <p className="blind-text">{comment.text}</p>

                                                {/* 액션 row: 시간, 좋아요, 대댓글 */}
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

                                                {/* 대댓글 입력창 */}
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

                                                {/* 대댓글 목록 (있으면 표시) */}
                                                {repliesMap[comment.id]?.length > 0 && (
                                                    <div className="blind-replies">
                                                        {repliesMap[comment.id].map((reply) => (
                                                            <div key={reply.id} className="blind-reply-item">
                                                                <div className="blind-reply-header">
                                                                    {reply.userPhoto ? (
                                                                        <img src={reply.userPhoto} alt="" className="blind-avatar-sm" />
                                                                    ) : (
                                                                        <div className="blind-avatar-sm placeholder">
                                                                            {(reply.userName || '?').charAt(0)}
                                                                        </div>
                                                                    )}
                                                                    <span className="blind-nickname-sm">{reply.userName}</span>
                                                                </div>
                                                                <p className="blind-reply-text">{reply.text}</p>
                                                                <div className="blind-reply-actions">
                                                                    <span className="blind-time-sm">
                                                                        {reply.createdAt?.toDate ? formatTimeAgo(reply.createdAt.toDate()) : ''}
                                                                    </span>
                                                                    {user?.uid === reply.userId && (
                                                                        <button
                                                                            className="blind-del-btn-sm"
                                                                            onClick={() => deleteReply(comment.id, reply.id, reply.userId)}
                                                                        >
                                                                            삭제
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* 더보기/접기 */}
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

            {/* 인트로 재생 오버레이 */}
            <AnalysisOverlay
                isVisible={showIntroOverlay}
                mode="tarot"
                streamingData={{
                    hook: hookText,
                    foreshadow: foreshadowText,
                    title: tarotResult.title,
                    verdict: tarotResult.verdict
                }}
                isImagesReady={true}
                onTransitionComplete={() => setShowIntroOverlay(false)}
            />
        </div>
    );
};

export default TarotResultView;
