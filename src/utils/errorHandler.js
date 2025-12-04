// 에러 메시지 상수
export const ERROR_MESSAGES = {
    API_KEY_MISSING: 'API 키 설정이 필요합니다. .env 파일을 확인해주세요.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    GENERATION_FAILED: '생성에 실패했습니다. 다시 시도해주세요.',
    SAVE_FAILED: '저장에 실패했습니다. 다시 시도해주세요.',
    LOGIN_REQUIRED: '로그인이 필요합니다.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

// 에러 타입 분류
export const classifyError = (error) => {
    if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;

    const message = error.message || error.toString();

    if (message.includes('API') || message.includes('key') || message.includes('401')) {
        return ERROR_MESSAGES.API_KEY_MISSING;
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('CORS')) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (message.includes('quota') || message.includes('limit') || message.includes('429')) {
        return '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    }

    if (message.includes('JSON') || message.includes('parse')) {
        return '응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    }

    return `오류: ${message.slice(0, 100)}`;
};

// 에러 로깅 (콘솔 + 나중에 모니터링 서비스 연동 가능)
export const logError = (context, error) => {
    console.error(`[${context}]`, error);
    // 나중에 Sentry 등 모니터링 서비스 연동 가능
    // if (window.Sentry) window.Sentry.captureException(error);
};

// 안전한 비동기 실행 래퍼
export const safeAsync = async (asyncFn, context = 'Unknown') => {
    try {
        return { data: await asyncFn(), error: null };
    } catch (error) {
        logError(context, error);
        return { data: null, error: classifyError(error) };
    }
};
