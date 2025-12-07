/**
 * 이미지 최적화 유틸리티
 * - 반응형 srcset 생성
 * - WebP 지원 감지
 * - 이미지 URL 최적화
 */

// WebP 지원 여부 캐시
let webpSupported = null;

/**
 * WebP 지원 여부 확인
 */
export const checkWebPSupport = () => {
    if (webpSupported !== null) return webpSupported;

    if (typeof window === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    return webpSupported;
};

/**
 * 이미지 URL에서 srcset 생성
 * Cloudinary, Firebase Storage, imgix 등 CDN에서 사용 가능
 * @param {string} src - 원본 이미지 URL
 * @param {number[]} widths - 생성할 너비 배열
 * @returns {string|null} srcset 문자열
 */
export const generateSrcset = (src, widths = [320, 640, 1024, 1536]) => {
    if (!src) return null;

    // Firebase Storage URL 처리
    if (src.includes('firebasestorage.googleapis.com')) {
        // Firebase Storage는 URL 파라미터로 리사이징 지원하지 않음
        // 원본 반환
        return null;
    }

    // Cloudinary URL 처리
    if (src.includes('cloudinary.com')) {
        return widths
            .map(w => `${src.replace('/upload/', `/upload/w_${w},f_auto,q_auto/`)} ${w}w`)
            .join(', ');
    }

    // imgix URL 처리
    if (src.includes('imgix.net')) {
        return widths
            .map(w => `${src}?w=${w}&auto=format,compress ${w}w`)
            .join(', ');
    }

    // Unsplash URL 처리
    if (src.includes('unsplash.com')) {
        return widths
            .map(w => `${src}&w=${w}&q=75&fm=webp ${w}w`)
            .join(', ');
    }

    // 기타 URL은 srcset 생성하지 않음
    return null;
};

/**
 * 최적화된 이미지 props 생성
 * @param {string} src - 원본 이미지 URL
 * @param {object} options - 옵션
 * @returns {object} 최적화된 props
 */
export const getOptimizedImageProps = (src, options = {}) => {
    const {
        widths = [320, 640, 1024, 1536],
        sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
        priority = false
    } = options;

    const srcset = generateSrcset(src, widths);

    return {
        src,
        srcset,
        sizes: srcset ? sizes : undefined,
        loading: priority ? 'eager' : 'lazy',
        decoding: 'async',
        fetchPriority: priority ? 'high' : 'auto'
    };
};

/**
 * 작은 블러 placeholder 이미지 생성 (서버 사이드용)
 * 클라이언트에서는 사용 불가
 */
export const generateBlurPlaceholder = async (src) => {
    // 브라우저에서는 canvas를 사용하여 생성 가능하지만
    // CORS 이슈로 인해 외부 이미지는 처리 불가
    // 서버 사이드에서 처리하는 것이 좋음
    return null;
};

/**
 * 이미지 프리로드
 * @param {string} src - 이미지 URL
 */
export const preloadImage = (src) => {
    if (!src || typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
};

/**
 * 여러 이미지 프리로드
 * @param {string[]} srcs - 이미지 URL 배열
 */
export const preloadImages = (srcs) => {
    srcs.forEach(preloadImage);
};

/**
 * 네이티브 lazy loading 지원 여부
 */
export const supportsLazyLoading = () => {
    if (typeof window === 'undefined') return false;
    return 'loading' in HTMLImageElement.prototype;
};

/**
 * IntersectionObserver 지원 여부
 */
export const supportsIntersectionObserver = () => {
    if (typeof window === 'undefined') return false;
    return 'IntersectionObserver' in window;
};
