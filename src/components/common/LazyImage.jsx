import { useState, useRef, useEffect, useMemo } from 'react';

/**
 * Lazy Loading 이미지 컴포넌트
 * IntersectionObserver를 사용하여 뷰포트에 들어올 때만 로드
 * srcset, sizes 속성 지원으로 반응형 이미지 최적화
 */
const LazyImage = ({
    src,
    alt = '',
    className = '',
    placeholder = null,
    onLoad,
    onError,
    threshold = 0.1,
    rootMargin = '50px',
    // 반응형 이미지 옵션
    srcset = null,
    sizes = null,
    // 로딩 우선순위
    priority = false,
    // 블러 플레이스홀더 (base64 작은 이미지)
    blurDataURL = null,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority); // priority면 바로 로드
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    // priority가 아닐 때만 IntersectionObserver 사용
    useEffect(() => {
        if (priority) return; // priority면 즉시 로드

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin, priority]);

    // 기본 sizes 계산 (반응형)
    const defaultSizes = useMemo(() => {
        if (sizes) return sizes;
        // 일반적인 반응형 sizes
        return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }, [sizes]);

    const handleLoad = (e) => {
        setIsLoaded(true);
        onLoad?.(e);
    };

    const handleError = (e) => {
        setHasError(true);
        onError?.(e);
    };

    // 블러 플레이스홀더 스타일
    const blurPlaceholderStyle = blurDataURL ? {
        backgroundImage: `url(${blurDataURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(20px)',
        transform: 'scale(1.1)'
    } : {};

    // 기본 placeholder
    const defaultPlaceholder = (
        <div className={`lazy-image-placeholder ${className}`} style={{
            background: blurDataURL
                ? 'transparent'
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100px',
            overflow: 'hidden',
            ...blurPlaceholderStyle
        }}>
            {!blurDataURL && <span style={{ opacity: 0.5 }}>...</span>}
        </div>
    );

    // 에러 상태
    if (hasError) {
        return (
            <div className={`lazy-image-error ${className}`} style={{
                background: 'rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100px'
            }}>
                <span style={{ opacity: 0.5 }}>이미지 로드 실패</span>
            </div>
        );
    }

    return (
        <div ref={imgRef} className={`lazy-image-wrapper ${className}`} style={{ position: 'relative' }}>
            {/* Placeholder (로딩 전 또는 로딩 중) */}
            {!isLoaded && (placeholder || defaultPlaceholder)}

            {/* 실제 이미지 (뷰포트에 들어왔을 때만 로드) */}
            {isInView && src && (
                <img
                    src={src}
                    srcSet={srcset || undefined}
                    sizes={srcset ? defaultSizes : undefined}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={priority ? 'high' : 'auto'}
                    className={className}
                    style={{
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        position: isLoaded ? 'relative' : 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;
