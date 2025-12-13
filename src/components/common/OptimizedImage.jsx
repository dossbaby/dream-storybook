import { useState, useCallback } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

/**
 * 최적화된 이미지 컴포넌트
 * - WebP 리사이즈 버전 로드 시도
 * - 실패시 원본 URL로 fallback
 */
const OptimizedImage = ({
    src,
    size,
    alt = '',
    className = '',
    style = {},
    loading = 'lazy',
    ...props
}) => {
    const optimizedSrc = getOptimizedImageUrl(src, { size });
    const [currentSrc, setCurrentSrc] = useState(optimizedSrc);
    const [hasError, setHasError] = useState(false);

    const handleError = useCallback(() => {
        // 최적화된 URL이 실패하면 원본 URL로 fallback
        if (!hasError && currentSrc !== src && src) {
            setCurrentSrc(src);
            setHasError(true);
        }
    }, [hasError, currentSrc, src]);

    if (!src) return null;

    return (
        <img
            src={currentSrc}
            alt={alt}
            className={className}
            style={style}
            loading={loading}
            onError={handleError}
            {...props}
        />
    );
};

export default OptimizedImage;
