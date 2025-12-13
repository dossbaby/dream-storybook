/**
 * 이미지 최적화 유틸리티
 * - 반응형 srcset 생성
 * - WebP 지원 감지
 * - 이미지 URL 최적화
 */

// WebP 지원 여부 캐시
let webpSupported = null;

// Firebase Resize Extension 크기 설정 (16:9 비율)
const FIREBASE_RESIZE_SIZES = {
    small: '512x288',
    medium: '1024x576',
    large: '1376x768'
};

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
 * Firebase Storage URL을 리사이즈된 버전으로 변환
 * @param {string} url - 원본 Firebase Storage URL
 * @param {'small'|'medium'|'large'} size - 원하는 크기
 * @returns {string} 리사이즈된 이미지 URL (없으면 원본 반환)
 */
export const getResizedFirebaseUrl = (url, size = 'medium') => {
    if (!url || !url.includes('firebasestorage.googleapis.com')) {
        return url;
    }

    // 이미 리사이즈된 URL이면 그대로 반환
    if (url.includes('_512x288') || url.includes('_1024x576') || url.includes('_1376x768')) {
        return url;
    }

    const sizeStr = FIREBASE_RESIZE_SIZES[size] || FIREBASE_RESIZE_SIZES.medium;

    // URL 구조: ...filename.jpg?alt=media&token=...
    // 변환: ...filename_1024x576.webp?alt=media&token=...

    // .jpg, .jpeg, .png 등 확장자 찾기
    const extensionMatch = url.match(/(\.[a-zA-Z]+)(\?|$)/);
    if (!extensionMatch) return url;

    const extension = extensionMatch[1];
    const newUrl = url.replace(extension, `_${sizeStr}.webp`);

    return newUrl;
};

/**
 * 화면 크기에 따라 적절한 이미지 크기 선택
 * @returns {'small'|'medium'|'large'} 권장 이미지 크기
 */
export const getRecommendedImageSize = () => {
    if (typeof window === 'undefined') return 'medium';

    const width = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    const effectiveWidth = width * dpr;

    if (effectiveWidth <= 640) return 'small';      // 모바일
    if (effectiveWidth <= 1280) return 'medium';    // 태블릿/작은 데스크탑
    return 'large';                                  // 큰 데스크탑
};

/**
 * Firebase Storage 이미지를 최적화된 URL로 변환
 * 리사이즈된 이미지가 없으면 원본 반환 (이전 데이터 호환)
 * @param {string} url - 원본 이미지 URL
 * @param {object} options - 옵션
 * @returns {string} 최적화된 URL (또는 원본 URL)
 */
export const getOptimizedImageUrl = (url, options = {}) => {
    const { size, forceOriginal = false } = options;

    if (!url || forceOriginal) return url;

    // Firebase Storage URL이 아니면 그대로 반환
    if (!url.includes('firebasestorage.googleapis.com')) {
        return url;
    }

    // 화면 크기에 맞는 리사이즈 버전 URL 생성
    // Firebase Resize Extension이 자동으로 리사이즈 파일 생성
    const recommendedSize = size || getRecommendedImageSize();
    const optimizedUrl = getResizedFirebaseUrl(url, recommendedSize);

    return optimizedUrl;
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

    // Firebase Storage URL 처리 - srcset 생성
    if (src.includes('firebasestorage.googleapis.com')) {
        const smallUrl = getResizedFirebaseUrl(src, 'small');
        const mediumUrl = getResizedFirebaseUrl(src, 'medium');
        const largeUrl = getResizedFirebaseUrl(src, 'large');

        // 리사이즈된 URL이 원본과 같으면 (리사이즈 안됨) null 반환
        if (smallUrl === src) return null;

        return `${smallUrl} 512w, ${mediumUrl} 1024w, ${largeUrl} 1376w`;
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

/**
 * 이미지를 크롭하여 Canvas로 그리기
 * @param {string} imageUrl - 원본 이미지 URL
 * @param {object} cropOptions - 크롭 옵션
 * @param {number} cropOptions.x - 크롭 중심 X (0-100%)
 * @param {number} cropOptions.y - 크롭 중심 Y (0-100%)
 * @param {number} cropOptions.zoom - 줌 배율 (1-3)
 * @param {number} outputSize - 출력 이미지 크기 (기본 200px)
 * @returns {Promise<Blob>} 크롭된 이미지 Blob
 */
export const cropImageToBlob = async (imageUrl, cropOptions, outputSize = 200) => {
    const { x = 50, y = 50, zoom = 1 } = cropOptions;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = outputSize;
            canvas.height = outputSize;

            // 원본 이미지에서 크롭할 영역 계산
            // 16:9 비율 이미지에서 원형 크롭
            const imgWidth = img.width;
            const imgHeight = img.height;

            // 줌에 따른 크롭 영역 크기 (줌이 클수록 작은 영역을 크롭)
            const cropSize = Math.min(imgWidth, imgHeight) / zoom;

            // 크롭 중심 좌표 계산 (% -> px)
            const centerX = (x / 100) * imgWidth;
            const centerY = (y / 100) * imgHeight;

            // 크롭 시작점 (경계 처리)
            let startX = centerX - cropSize / 2;
            let startY = centerY - cropSize / 2;

            // 경계 넘어가지 않도록 조정
            startX = Math.max(0, Math.min(startX, imgWidth - cropSize));
            startY = Math.max(0, Math.min(startY, imgHeight - cropSize));

            // 원형 클리핑
            ctx.beginPath();
            ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            // 이미지 그리기
            ctx.drawImage(
                img,
                startX, startY, cropSize, cropSize,
                0, 0, outputSize, outputSize
            );

            // Blob으로 변환
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas to Blob 변환 실패'));
                    }
                },
                'image/webp',
                0.85
            );
        };

        img.onerror = () => {
            reject(new Error('이미지 로드 실패'));
        };

        img.src = imageUrl;
    });
};
