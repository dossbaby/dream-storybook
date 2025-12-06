import { useState, useRef, useEffect, memo } from 'react';

/**
 * LazyImage - Intersection Observer 기반 이미지 지연 로딩 컴포넌트
 *
 * Features:
 * - 뷰포트 진입 시 이미지 로드
 * - 로딩 중 스켈레톤/플레이스홀더 표시
 * - 로드 완료 시 부드러운 페이드인
 * - 에러 시 폴백 이미지 표시
 */
const LazyImage = memo(({
    src,
    alt = '',
    className = '',
    placeholderSrc,
    fallbackSrc = '/placeholder-image.png',
    rootMargin = '100px',
    threshold = 0.1,
    onLoad,
    onError,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    // Intersection Observer로 뷰포트 진입 감지
    useEffect(() => {
        const element = imgRef.current;
        if (!element) return;

        // 네이티브 lazy loading 지원 확인
        if ('loading' in HTMLImageElement.prototype) {
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(element);
                }
            },
            {
                rootMargin,
                threshold
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [rootMargin, threshold]);

    const handleLoad = (e) => {
        setIsLoaded(true);
        onLoad?.(e);
    };

    const handleError = (e) => {
        setHasError(true);
        onError?.(e);
    };

    // 현재 표시할 이미지 src 결정
    const currentSrc = hasError
        ? fallbackSrc
        : (isInView ? src : (placeholderSrc || ''));

    return (
        <div
            ref={imgRef}
            className={`lazy-image-wrapper ${isLoaded ? 'loaded' : 'loading'} ${className}`}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {/* 스켈레톤/플레이스홀더 */}
            {!isLoaded && (
                <div className="lazy-image-skeleton">
                    <div className="skeleton-shimmer"></div>
                </div>
            )}

            {/* 실제 이미지 */}
            {currentSrc && (
                <img
                    src={currentSrc}
                    alt={alt}
                    loading="lazy"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`lazy-image ${isLoaded ? 'visible' : 'hidden'}`}
                    {...props}
                />
            )}
        </div>
    );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
