/**
 * 캐싱 효과 모니터링 유틸리티
 *
 * Claude API 프롬프트 캐싱의 효과를 추적하고 분석
 * - 캐시 히트/미스 비율
 * - 토큰 절감량 계산
 * - 비용 절감 추정
 */

// localStorage 키
const CACHE_STATS_KEY = 'claude_cache_stats';
const CACHE_HISTORY_KEY = 'claude_cache_history';

// Claude 토큰 가격 (2024년 기준, USD per 1M tokens)
const PRICING = {
    'claude-sonnet-4-20250514': {
        input: 3.00,
        output: 15.00,
        cacheWrite: 3.75,  // 25% premium
        cacheRead: 0.30    // 90% discount
    },
    'claude-3-5-sonnet-20241022': {
        input: 3.00,
        output: 15.00,
        cacheWrite: 3.75,
        cacheRead: 0.30
    },
    'claude-3-haiku-20240307': {
        input: 0.25,
        output: 1.25,
        cacheWrite: 0.3125,
        cacheRead: 0.025
    }
};

/**
 * 캐시 통계 초기화
 */
const getInitialStats = () => ({
    totalCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheCreations: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    cachedInputTokens: 0,
    cacheCreatedTokens: 0,
    estimatedSavingsUSD: 0,
    lastUpdated: null,
    byMode: {
        dream: { calls: 0, hits: 0, tokens: 0 },
        tarot: { calls: 0, hits: 0, tokens: 0 },
        saju: { calls: 0, hits: 0, tokens: 0 },
        detailed: { calls: 0, hits: 0, tokens: 0 }
    }
});

/**
 * localStorage에서 통계 로드
 */
export const loadCacheStats = () => {
    try {
        const stored = localStorage.getItem(CACHE_STATS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('캐시 통계 로드 실패:', e);
    }
    return getInitialStats();
};

/**
 * 통계 저장
 */
const saveCacheStats = (stats) => {
    try {
        localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
        console.warn('캐시 통계 저장 실패:', e);
    }
};

/**
 * 캐시 호출 기록 저장 (최근 100건)
 */
const saveCallHistory = (entry) => {
    try {
        const history = JSON.parse(localStorage.getItem(CACHE_HISTORY_KEY) || '[]');
        history.unshift(entry);
        if (history.length > 100) history.pop();
        localStorage.setItem(CACHE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.warn('캐시 히스토리 저장 실패:', e);
    }
};

/**
 * 비용 절감액 계산
 * @param {number} cachedTokens - 캐시에서 읽은 토큰 수
 * @param {string} model - 모델 ID
 * @returns {number} - 절감액 (USD)
 */
const calculateSavings = (cachedTokens, model) => {
    const pricing = PRICING[model] || PRICING['claude-sonnet-4-20250514'];
    const normalCost = (cachedTokens / 1_000_000) * pricing.input;
    const cachedCost = (cachedTokens / 1_000_000) * pricing.cacheRead;
    return normalCost - cachedCost;
};

/**
 * API 호출 결과 기록
 * @param {Object} usage - API 응답의 usage 객체
 * @param {string} mode - 모드 (dream, tarot, saju, detailed)
 * @param {string} model - 모델 ID
 */
export const recordCacheUsage = (usage, mode = 'dream', model = 'claude-sonnet-4-20250514') => {
    if (!usage) return;

    const {
        input_tokens = 0,
        output_tokens = 0,
        cache_creation_input_tokens = 0,
        cache_read_input_tokens = 0
    } = usage;

    const stats = loadCacheStats();

    // 통계 업데이트
    stats.totalCalls++;
    stats.totalInputTokens += input_tokens;
    stats.totalOutputTokens += output_tokens;

    if (cache_read_input_tokens > 0) {
        stats.cacheHits++;
        stats.cachedInputTokens += cache_read_input_tokens;
        stats.estimatedSavingsUSD += calculateSavings(cache_read_input_tokens, model);
    } else {
        stats.cacheMisses++;
    }

    if (cache_creation_input_tokens > 0) {
        stats.cacheCreations++;
        stats.cacheCreatedTokens += cache_creation_input_tokens;
    }

    // 모드별 통계
    if (stats.byMode[mode]) {
        stats.byMode[mode].calls++;
        if (cache_read_input_tokens > 0) {
            stats.byMode[mode].hits++;
        }
        stats.byMode[mode].tokens += input_tokens + output_tokens;
    }

    stats.lastUpdated = new Date().toISOString();

    saveCacheStats(stats);

    // 히스토리 저장
    saveCallHistory({
        timestamp: new Date().toISOString(),
        mode,
        model,
        inputTokens: input_tokens,
        outputTokens: output_tokens,
        cacheCreated: cache_creation_input_tokens,
        cacheRead: cache_read_input_tokens,
        isCacheHit: cache_read_input_tokens > 0
    });

    // 콘솔에 상세 로그
    const hitRate = stats.totalCalls > 0
        ? ((stats.cacheHits / stats.totalCalls) * 100).toFixed(1)
        : 0;

    console.log(`📊 Cache Analytics [${mode}]`, {
        thisCall: {
            input: input_tokens,
            output: output_tokens,
            cacheHit: cache_read_input_tokens > 0,
            cacheRead: cache_read_input_tokens,
            cacheCreated: cache_creation_input_tokens
        },
        cumulative: {
            totalCalls: stats.totalCalls,
            hitRate: `${hitRate}%`,
            savedUSD: `$${stats.estimatedSavingsUSD.toFixed(4)}`
        }
    });

    return stats;
};

/**
 * 캐시 효율성 리포트 생성
 */
export const getCacheReport = () => {
    const stats = loadCacheStats();

    const hitRate = stats.totalCalls > 0
        ? (stats.cacheHits / stats.totalCalls) * 100
        : 0;

    const avgInputTokens = stats.totalCalls > 0
        ? Math.round(stats.totalInputTokens / stats.totalCalls)
        : 0;

    const avgOutputTokens = stats.totalCalls > 0
        ? Math.round(stats.totalOutputTokens / stats.totalCalls)
        : 0;

    return {
        summary: {
            totalCalls: stats.totalCalls,
            cacheHits: stats.cacheHits,
            cacheMisses: stats.cacheMisses,
            hitRate: `${hitRate.toFixed(1)}%`,
            estimatedSavings: `$${stats.estimatedSavingsUSD.toFixed(4)}`
        },
        tokens: {
            totalInput: stats.totalInputTokens,
            totalOutput: stats.totalOutputTokens,
            cachedInput: stats.cachedInputTokens,
            avgPerCall: { input: avgInputTokens, output: avgOutputTokens }
        },
        byMode: stats.byMode,
        lastUpdated: stats.lastUpdated
    };
};

/**
 * 캐시 통계 리셋
 */
export const resetCacheStats = () => {
    localStorage.removeItem(CACHE_STATS_KEY);
    localStorage.removeItem(CACHE_HISTORY_KEY);
    console.log('🗑️ Cache stats reset');
};

/**
 * 호출 히스토리 조회
 */
export const getCacheHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(CACHE_HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
};

/**
 * 일별 통계 집계
 */
export const getDailyStats = () => {
    const history = getCacheHistory();
    const dailyMap = {};

    history.forEach(entry => {
        const date = entry.timestamp.split('T')[0];
        if (!dailyMap[date]) {
            dailyMap[date] = { calls: 0, hits: 0, tokens: 0 };
        }
        dailyMap[date].calls++;
        if (entry.isCacheHit) dailyMap[date].hits++;
        dailyMap[date].tokens += entry.inputTokens + entry.outputTokens;
    });

    return Object.entries(dailyMap).map(([date, data]) => ({
        date,
        ...data,
        hitRate: data.calls > 0 ? ((data.hits / data.calls) * 100).toFixed(1) : 0
    }));
};

/**
 * 개발자 콘솔용 리포트 출력
 */
export const printCacheReport = () => {
    const report = getCacheReport();

    console.log('\n📈 ═══════════════════════════════════════');
    console.log('   CLAUDE API CACHE ANALYTICS REPORT');
    console.log('═══════════════════════════════════════════\n');

    console.log('📊 Summary');
    console.table(report.summary);

    console.log('\n🔢 Token Usage');
    console.table(report.tokens);

    console.log('\n📱 By Mode');
    console.table(report.byMode);

    console.log('\n📅 Daily Stats');
    console.table(getDailyStats());

    console.log('\n═══════════════════════════════════════════\n');

    return report;
};

// 개발 환경에서 글로벌 접근 가능하게
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
    window.cacheAnalytics = {
        getReport: getCacheReport,
        printReport: printCacheReport,
        getHistory: getCacheHistory,
        getDailyStats,
        reset: resetCacheStats
    };
    console.log('💡 Cache analytics available: window.cacheAnalytics.printReport()');
}
