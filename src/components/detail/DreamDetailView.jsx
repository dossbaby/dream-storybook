const DreamDetailView = ({
    selectedDream,
    user,
    cards,
    currentCard,
    setCurrentCard,
    dreamTypes,
    viewingCount,
    recentViewers,
    similarDreamers,
    floatingHearts,
    interpretations,
    comments,
    newInterpretation,
    setNewInterpretation,
    newComment,
    setNewComment,
    commentEdit,
    setCommentEditField,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onBack,
    onPrevCard,
    onNextCard,
    onToggleLike,
    onShare,
    onGenerateDetailedReading,
    onAddInterpretation,
    onDeleteInterpretation,
    onMarkHelpful,
    onStartEditComment,
    onSaveEditComment,
    onCancelEditComment,
    onDeleteComment,
    renderCard,
    formatTime,
    isPremium = false,
    onOpenPremium
}) => {
    return (
        <>
            <div className="floating-hearts">
                {floatingHearts.map(heart => (
                    <span key={heart.id} className="floating-heart" style={{ left: `${heart.x}%` }}>❤️</span>
                ))}
            </div>
            <button
                className={`floating-like-btn ${selectedDream.likes?.includes(user?.uid) ? 'liked' : ''}`}
                onClick={() => onToggleLike(selectedDream.id)}
            >
                <span>{selectedDream.likes?.includes(user?.uid) ? '❤️' : '🤍'}</span>
                <span className="like-count">{selectedDream.likeCount || 0}</span>
            </button>
            <div className="card-container">
                <div className="detail-header-bar">
                    <div className="detail-author">
                        {selectedDream.userPhoto && <img src={selectedDream.userPhoto} alt="" />}
                        <div className="detail-author-info">
                            <span className="detail-author-name">{selectedDream.userName}</span>
                            <span className="detail-time">{formatTime(selectedDream.createdAt)}</span>
                        </div>
                    </div>
                    <div className="viewing-badge">
                        <span className="viewing-dot"></span>
                        {viewingCount}명이 보는 중
                    </div>
                </div>
                <div className="card-indicators">
                    {cards.map((_, i) => (
                        <div key={i} className={`indicator ${i === currentCard ? 'active' : ''}`} onClick={() => setCurrentCard(i)} />
                    ))}
                </div>
                <div className="card-wrapper" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                    <div className="card-stack" style={{ transform: `translateX(-${currentCard * 100}%)` }}>
                        {cards.map(renderCard)}
                    </div>
                </div>
                <div className="card-nav">
                    <button className="nav-btn" onClick={onPrevCard} disabled={currentCard === 0}>‹</button>
                    <button className="nav-btn" onClick={onNextCard} disabled={currentCard === cards.length - 1}>›</button>
                </div>
                <div className="card-actions-grid">
                    <div className="actions-row primary">
                        <button className={`action-btn ${selectedDream.likes?.includes(user?.uid) ? 'liked' : ''}`} onClick={() => onToggleLike(selectedDream.id)}>
                            {selectedDream.likes?.includes(user?.uid) ? '❤️' : '🤍'} <span>{selectedDream.likeCount || 0}</span>
                        </button>
                        <button className="action-btn">💫 <span>{(interpretations.length + comments.length) || 0}</span></button>
                        <button className="action-btn share" onClick={() => onShare(selectedDream)}>📤 <span>공유</span></button>
                    </div>
                    <button
                        className={`action-btn detailed full-width ${!isPremium ? 'locked' : ''}`}
                        onClick={() => {
                            if (isPremium) {
                                onGenerateDetailedReading(selectedDream);
                            } else {
                                onOpenPremium?.('detailed_analysis');
                            }
                        }}
                    >
                        {isPremium ? '📖 상세 풀이 보기' : '🔒 프리미엄으로 상세 풀이 보기'}
                    </button>
                </div>
                <div className="live-info-cards">
                    <div className="live-info-card viewers">
                        <span className="live-info-icon">👀</span>
                        <span className="live-info-text">방금 <strong>{recentViewers.length}명</strong>이 이 꿈을 스쳐갔어요</span>
                    </div>
                    {similarDreamers > 1 && (
                        <div className="live-info-card similar">
                            <span className="live-info-icon">{dreamTypes[selectedDream.dreamType]?.emoji}</span>
                            <span className="live-info-text">
                                <strong>{dreamTypes[selectedDream.dreamType]?.name}</strong> 유형 꿈을 꾼 사람이 <strong>{similarDreamers}명</strong> 더 있어
                            </span>
                        </div>
                    )}
                </div>
                <div className="original-dream-card">
                    <span className="original-label">원래 꿈 내용</span>
                    <p>{selectedDream.originalDream}</p>
                </div>

                {/* 통합 꿈 속삭임 섹션 */}
                <div className="whispers-section">
                    <div className="whispers-header">
                        <span className="whispers-icon">💫</span>
                        <span className="whispers-title">꿈 속삭임</span>
                        <span className="whispers-count">{interpretations.length + comments.length}개의 속삭임</span>
                    </div>
                    {user && (
                        <div className="whisper-input">
                            <textarea
                                value={newInterpretation || newComment}
                                onChange={(e) => {
                                    setNewInterpretation(e.target.value);
                                    setNewComment(e.target.value);
                                }}
                                placeholder="이 꿈에 대한 당신의 생각이나 해석을 속삭여주세요..."
                                rows={2}
                            />
                            <button onClick={onAddInterpretation} disabled={!(newInterpretation || newComment)?.trim()}>
                                ✨ 속삭이기
                            </button>
                        </div>
                    )}
                    <div className="whispers-list">
                        {interpretations.length === 0 && comments.length === 0 ? (
                            <p className="no-whispers">아직 속삭임이 없어요. 첫 번째로 이 꿈에 대해 속삭여보세요!</p>
                        ) : (
                            <>
                                {interpretations.map(interp => (
                                    <div key={`interp-${interp.id}`} className="whisper-item interpretation-type">
                                        <div className="whisper-type-badge">🔮 해몽</div>
                                        <div className="whisper-header">
                                            <span className="whisper-author">{interp.userName}</span>
                                            <span className="whisper-time">{formatTime(interp.createdAt)}</span>
                                            {user?.uid === interp.userId && (
                                                <div className="whisper-actions">
                                                    <button onClick={() => onDeleteInterpretation(interp.id, interp.userId)}>삭제</button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="whisper-text">{interp.text}</p>
                                        <button
                                            className={`helpful-btn ${interp.helpful > 0 ? 'has-helpful' : ''}`}
                                            onClick={() => onMarkHelpful(interp.id)}
                                        >
                                            👍 도움이 됐어요 {interp.helpful > 0 && `(${interp.helpful})`}
                                        </button>
                                    </div>
                                ))}
                                {comments.map(comment => (
                                    <div key={`comment-${comment.id}`} className="whisper-item comment-type">
                                        <div className="whisper-type-badge">💭 생각</div>
                                        <div className="whisper-header">
                                            {comment.userPhoto && <img src={comment.userPhoto} alt="" className="whisper-avatar" />}
                                            <span className="whisper-author">{comment.userName}</span>
                                            <span className="whisper-time">
                                                {formatTime(comment.createdAt)}
                                                {comment.editedAt && ' (수정됨)'}
                                            </span>
                                            {user?.uid === comment.userId && commentEdit.id !== comment.id && (
                                                <div className="whisper-actions">
                                                    <button onClick={() => onStartEditComment(comment)}>수정</button>
                                                    <button onClick={() => onDeleteComment(comment.id, comment.userId)}>삭제</button>
                                                </div>
                                            )}
                                        </div>
                                        {commentEdit.id === comment.id ? (
                                            <div className="whisper-edit">
                                                <input
                                                    type="text"
                                                    value={commentEdit.text}
                                                    onChange={e => setCommentEditField('text', e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && onSaveEditComment(comment.id)}
                                                />
                                                <div className="whisper-edit-actions">
                                                    <button onClick={onCancelEditComment}>취소</button>
                                                    <button onClick={() => onSaveEditComment(comment.id)}>저장</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="whisper-text">{comment.text}</p>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DreamDetailView;
