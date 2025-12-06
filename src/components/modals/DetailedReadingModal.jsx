// 꿈 상세 풀이 모달 (타로는 TarotResultView에서 직접 표시)
const DetailedReadingModal = ({ isOpen, onClose, loading, content, dreamTypes }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay detailed-reading-overlay" onClick={onClose}>
            <div className="detailed-reading-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                {loading ? (
                    <div className="detailed-reading-loading">
                        <div className="reading-loader">
                            <span className="loader-icon">🌙</span>
                            <span className="loader-text">심층 분석 생성 중...</span>
                            <div className="loader-bar">
                                <div className="loader-progress"></div>
                            </div>
                        </div>
                    </div>
                ) : content && (
                    <div className="detailed-reading-content">
                        {/* 헤더 이미지 (heroImage 우선, 없으면 dreamImage 폴백) */}
                        <div className="reading-hero">
                            {(content.heroImage || content.dreamImage) && (
                                <img src={content.heroImage || content.dreamImage} alt="" className="reading-hero-img" />
                            )}
                            <div className="reading-hero-overlay">
                                {content.dreamType && dreamTypes && (
                                    <span className="reading-type-badge">
                                        {dreamTypes[content.dreamType]?.emoji} {dreamTypes[content.dreamType]?.name}
                                    </span>
                                )}
                                <h1 className="reading-title">{content.title}</h1>
                                <p className="reading-verdict">"{content.verdict}"</p>
                            </div>
                        </div>

                        {/* 블로그 본문 */}
                        <div className="reading-body">
                            {/* 원문 인용 */}
                            {content.originalDream && (
                                <div className="reading-quote">
                                    <span className="quote-icon">💭</span>
                                    <p>"{content.originalDream}"</p>
                                </div>
                            )}

                            {/* 꿈 이미지 갤러리 */}
                            {(content.meaningImage || content.adviceImage) && (
                                <div className="reading-gallery">
                                    {content.meaningImage && (
                                        <div className="gallery-item">
                                            <img src={content.meaningImage} alt="의미 이미지" />
                                            <span className="gallery-label">상징의 시각화</span>
                                        </div>
                                    )}
                                    {content.adviceImage && (
                                        <div className="gallery-item">
                                            <img src={content.adviceImage} alt="조언 이미지" />
                                            <span className="gallery-label">미래의 길</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 심층 분석 본문 */}
                            <div className="reading-analysis">
                                {content.detailedAnalysis?.split('\n').map((line, i) => {
                                    if (line.startsWith('## ')) {
                                        return <h2 key={i} className="reading-section-title">{line.replace('## ', '')}</h2>;
                                    } else if (line.trim() === '') {
                                        return <br key={i} />;
                                    } else {
                                        return <p key={i} className="reading-paragraph">{line}</p>;
                                    }
                                })}
                            </div>

                            {/* 키워드 태그 */}
                            {content.keywords?.length > 0 && (
                                <div className="reading-keywords">
                                    <span className="keywords-label">관련 상징</span>
                                    <div className="keywords-tags">
                                        {content.keywords.map((kw, i) => (
                                            <span key={i} className="keyword-tag">#{kw.word}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailedReadingModal;
