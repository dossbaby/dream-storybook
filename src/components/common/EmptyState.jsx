/**
 * 빈 상태 표시 컴포넌트
 * 데이터가 없을 때 친근한 메시지와 CTA를 표시
 */
const EmptyState = ({ type = 'dream', onAction, actionLabel }) => {
    const configs = {
        dream: {
            emoji: '🌙',
            title: '아직 꿈 기록이 없어요',
            description: '오늘 밤 꾼 꿈을 기록해보세요\nAI가 숨겨진 의미를 찾아드려요',
            action: '꿈 해몽하기'
        },
        tarot: {
            emoji: '🔮',
            title: '아직 타로 기록이 없어요',
            description: '78장의 카드가 당신을 기다리고 있어요\n운명의 카드를 뽑아보세요',
            action: '타로 보기'
        },
        fortune: {
            emoji: '✨',
            title: '아직 사주 기록이 없어요',
            description: '생년월일시를 입력하면\n오늘의 운세를 알려드려요',
            action: '사주 보기'
        },
        feed: {
            emoji: '📭',
            title: '아직 공개된 글이 없어요',
            description: '첫 번째로 리딩을 공유해보세요!',
            action: '리딩 시작하기'
        },
        comment: {
            emoji: '💬',
            title: '아직 댓글이 없어요',
            description: '첫 번째 댓글을 남겨보세요',
            action: null
        },
        search: {
            emoji: '🔍',
            title: '검색 결과가 없어요',
            description: '다른 키워드로 검색해보세요',
            action: null
        }
    };

    const config = configs[type] || configs.dream;
    const buttonLabel = actionLabel || config.action;

    return (
        <div className="empty-state">
            <div className="empty-emoji">{config.emoji}</div>
            <h4 className="empty-title">{config.title}</h4>
            <p className="empty-description">
                {config.description.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                ))}
            </p>
            {buttonLabel && onAction && (
                <button className="empty-action" onClick={onAction}>
                    {buttonLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
