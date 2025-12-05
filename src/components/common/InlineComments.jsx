import { useState } from 'react';

const InlineComments = ({
    comments = [],
    totalCount = 0,
    user,
    onAddComment,
    onLoginRequired,
    maxPreview = 2
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newComment, setNewComment] = useState('');

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금';
        if (minutes < 60) return `${minutes}분`;
        if (hours < 24) return `${hours}시간`;
        if (days < 7) return `${days}일`;
        return date.toLocaleDateString('ko-KR');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            onLoginRequired?.();
            return;
        }
        if (!newComment.trim()) return;

        onAddComment?.(newComment.trim());
        setNewComment('');
    };

    const previewComments = comments.slice(0, maxPreview);
    const hasMore = comments.length > maxPreview;

    return (
        <div className="inline-comments">
            {/* 댓글 토글 버튼 */}
            <button
                className={`comments-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="icon">{isOpen ? '▼' : '▶'}</span>
                <span>💬 댓글 {totalCount > 0 ? totalCount : ''}</span>
                {!isOpen && previewComments.length > 0 && (
                    <span className="preview-text">
                        {previewComments[0]?.text?.slice(0, 20)}...
                    </span>
                )}
            </button>

            {/* 댓글 리스트 */}
            <div className={`comments-list ${isOpen ? 'open' : ''}`}>
                {comments.length === 0 ? (
                    <div className="comments-empty">
                        첫 번째 댓글을 남겨보세요!
                    </div>
                ) : (
                    <>
                        {(isOpen ? comments : previewComments).map((comment, i) => (
                            <div key={comment.id || i} className="comment-item">
                                <div className="comment-avatar">
                                    {comment.userPhoto ? (
                                        <img src={comment.userPhoto} alt="" />
                                    ) : (
                                        comment.userName?.charAt(0) || '?'
                                    )}
                                </div>
                                <div className="comment-content">
                                    <div className="comment-author">{comment.userName || '익명'}</div>
                                    <div className="comment-text">{comment.text}</div>
                                    <div className="comment-time">{formatTime(comment.createdAt)}</div>
                                </div>
                            </div>
                        ))}
                        {!isOpen && hasMore && (
                            <button
                                className="comments-show-more"
                                onClick={() => setIsOpen(true)}
                            >
                                댓글 {comments.length - maxPreview}개 더보기
                            </button>
                        )}
                    </>
                )}

                {/* 댓글 입력 */}
                {isOpen && (
                    <form className="comment-input-wrapper" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="comment-input"
                            placeholder={user ? "댓글 남기기..." : "로그인하고 댓글 남기기"}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onClick={() => !user && onLoginRequired?.()}
                        />
                        <button
                            type="submit"
                            className="comment-submit-btn"
                            disabled={!newComment.trim()}
                        >
                            등록
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InlineComments;
