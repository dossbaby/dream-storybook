import { Link } from 'react-router-dom';
import { DREAM_CATEGORIES, TAROT_CATEGORIES, FORTUNE_CATEGORIES } from '../../utils/seoConfig';

/**
 * 카테고리 태그 컴포넌트
 * 콘텐츠에서 추출한 태그를 표시하고 카테고리 페이지로 연결
 */
const CategoryTags = ({ tags, type }) => {
    const categories = getCategoriesForType(type);

    if (!tags || tags.length === 0) return null;

    return (
        <div className="category-tags">
            <span className="tags-label">관련 카테고리</span>
            <div className="tags-list">
                {tags.map(tagId => {
                    const category = categories[tagId];
                    if (!category) return null;

                    return (
                        <Link
                            key={tagId}
                            to={`/${type}s/category/${tagId}`}
                            className="category-tag"
                        >
                            <span className="tag-icon">{category.icon}</span>
                            <span className="tag-name">{category.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

// 타입별 카테고리 가져오기
const getCategoriesForType = (type) => {
    switch (type) {
        case 'dream':
            return DREAM_CATEGORIES;
        case 'tarot':
            return TAROT_CATEGORIES;
        case 'fortune':
            return FORTUNE_CATEGORIES;
        default:
            return {};
    }
};

export default CategoryTags;
