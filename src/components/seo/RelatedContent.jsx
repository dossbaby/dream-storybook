import { Link } from 'react-router-dom';
import { CONTENT_TYPES } from '../../utils/seoConfig';

/**
 * 관련 콘텐츠 추천 컴포넌트
 * 같은 카테고리나 비슷한 키워드의 콘텐츠 표시
 */
const RelatedContent = ({ items, type, currentTags = [] }) => {
    const typeConfig = CONTENT_TYPES[type];

    if (!items || items.length === 0) return null;

    return (
        <section className="related-section">
            <h2>비슷한 {typeConfig.name}</h2>
            <div className="related-grid">
                {items.map(item => (
                    <Link
                        key={item.id}
                        to={`/${typeConfig.urlPath}/${item.id}`}
                        className="related-card"
                    >
                        {/* 썸네일 */}
                        <div className="related-thumbnail">
                            {getItemImage(item, type) ? (
                                <img
                                    src={getItemImage(item, type)}
                                    alt={item.title}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="thumbnail-placeholder">
                                    {typeConfig.icon}
                                </div>
                            )}
                        </div>

                        {/* 정보 */}
                        <div className="related-info">
                            <h3 className="related-title">{item.title}</h3>
                            <p className="related-verdict">
                                {truncate(item.verdict || item.shareText, 50)}
                            </p>
                            <div className="related-meta">
                                <span className="related-type">
                                    {typeConfig.icon} {typeConfig.name}
                                </span>
                                <span className="related-date">
                                    {formatDate(item.createdAt)}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 더보기 링크 */}
            <div className="related-more">
                <Link to={`/${typeConfig.urlPath}s`} className="more-link">
                    더 많은 {typeConfig.name} 보기 →
                </Link>
            </div>
        </section>
    );
};

// 아이템 이미지 가져오기
const getItemImage = (item, type) => {
    switch (type) {
        case 'dream':
            return item.dreamImage;
        case 'tarot':
            return item.pastImage || item.cards?.[0]?.image;
        case 'fortune':
            return item.morningImage;
        default:
            return null;
    }
};

// 텍스트 자르기
const truncate = (text, length) => {
    if (!text) return '';
    return text.length > length ? text.slice(0, length) + '...' : text;
};

// 날짜 포맷
const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 24시간 이내
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return hours === 0 ? '방금 전' : `${hours}시간 전`;
    }

    // 7일 이내
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}일 전`;
    }

    // 그 외
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export default RelatedContent;
