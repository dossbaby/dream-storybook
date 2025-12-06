import { useState, useMemo } from 'react';

/**
 * 패턴 분석 컴포넌트
 * - 무료: 기본 통계만 (상위 3개 키워드, 꿈 유형)
 * - 프리미엄: 상세 패턴 분석 (AI 기반 인사이트, 주기 분석, 연관성 분석)
 */
const PatternAnalysis = ({
    type = 'dream', // 'dream' | 'tarot' | 'fortune'
    data = [],      // 리딩 히스토리 데이터
    dreamTypes = {},
    isPremium = false,
    onOpenPremium,
    onGenerateAiInsight
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [aiInsight, setAiInsight] = useState(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    // 기본 통계 계산
    const stats = useMemo(() => {
        if (!data.length) return null;

        // 키워드/태그 빈도 분석
        const keywordCount = {};
        const typeCount = {};
        const weekdayCount = [0, 0, 0, 0, 0, 0, 0]; // 일~토
        const monthlyCount = {};

        data.forEach(item => {
            // 키워드 집계
            const keywords = item.keywords || item.tags || [];
            keywords.forEach(kw => {
                const key = typeof kw === 'string' ? kw : kw.name || kw.keyword;
                if (key) keywordCount[key] = (keywordCount[key] || 0) + 1;
            });

            // 꿈 유형 집계
            if (item.dreamType) {
                typeCount[item.dreamType] = (typeCount[item.dreamType] || 0) + 1;
            }

            // 요일별 집계
            const createdAt = item.createdAt?.toDate?.() || new Date(item.createdAt);
            if (!isNaN(createdAt)) {
                weekdayCount[createdAt.getDay()]++;
                const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
                monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
            }
        });

        // 상위 키워드 정렬
        const topKeywords = Object.entries(keywordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));

        // 상위 꿈 유형 정렬
        const topTypes = Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => ({ type, count, info: dreamTypes[type] }));

        // 가장 자주 기록하는 요일
        const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const mostActiveDay = weekdayCount.indexOf(Math.max(...weekdayCount));

        // 월별 트렌드
        const monthlyTrend = Object.entries(monthlyCount)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6);

        return {
            totalCount: data.length,
            topKeywords,
            topTypes,
            weekdayCount,
            mostActiveDay: weekdayNames[mostActiveDay],
            monthlyTrend,
            avgPerMonth: (data.length / Math.max(1, monthlyTrend.length)).toFixed(1)
        };
    }, [data, dreamTypes]);

    // AI 인사이트 생성 핸들러
    const handleGenerateInsight = async () => {
        if (!isPremium) {
            onOpenPremium?.('pattern_analysis');
            return;
        }

        setLoadingInsight(true);
        try {
            const insight = await onGenerateAiInsight?.(type, data);
            setAiInsight(insight);
        } catch (error) {
            console.error('AI 인사이트 생성 실패:', error);
        } finally {
            setLoadingInsight(false);
        }
    };

    if (!stats || data.length < 3) {
        return (
            <div className="pattern-analysis empty">
                <div className="pattern-empty-state">
                    <span className="empty-icon">📊</span>
                    <p>패턴 분석을 위해 최소 3개 이상의 기록이 필요해요</p>
                    <span className="empty-count">{data.length}/3 기록</span>
                </div>
            </div>
        );
    }

    const typeLabel = type === 'dream' ? '꿈' : type === 'tarot' ? '타로' : '사주';

    return (
        <div className="pattern-analysis">
            <div className="pattern-header">
                <div className="pattern-title">
                    <span className="pattern-icon">📊</span>
                    <h4>{typeLabel} 패턴 분석</h4>
                </div>
                <button
                    className="pattern-toggle"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? '접기 ▲' : '펼치기 ▼'}
                </button>
            </div>

            {/* 기본 통계 (모든 사용자) */}
            <div className="pattern-basic">
                <div className="pattern-stat-row">
                    <div className="pattern-stat">
                        <span className="stat-value">{stats.totalCount}</span>
                        <span className="stat-label">총 기록</span>
                    </div>
                    <div className="pattern-stat">
                        <span className="stat-value">{stats.avgPerMonth}</span>
                        <span className="stat-label">월 평균</span>
                    </div>
                    <div className="pattern-stat">
                        <span className="stat-value">{stats.mostActiveDay}요일</span>
                        <span className="stat-label">주로 기록</span>
                    </div>
                </div>

                {/* 상위 키워드 */}
                {stats.topKeywords.length > 0 && (
                    <div className="pattern-keywords">
                        <span className="section-label">자주 등장하는 상징</span>
                        <div className="keyword-chips">
                            {stats.topKeywords.slice(0, isPremium ? 10 : 3).map(({ keyword, count }) => (
                                <span key={keyword} className="keyword-chip">
                                    {keyword}
                                    <span className="chip-count">{count}</span>
                                </span>
                            ))}
                            {!isPremium && stats.topKeywords.length > 3 && (
                                <button className="more-chip locked" onClick={() => onOpenPremium?.('pattern_analysis')}>
                                    +{stats.topKeywords.length - 3}개 더보기 👑
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 상위 꿈 유형 */}
                {type === 'dream' && stats.topTypes.length > 0 && (
                    <div className="pattern-types">
                        <span className="section-label">자주 꾸는 꿈 유형</span>
                        <div className="type-bars">
                            {stats.topTypes.slice(0, isPremium ? 5 : 2).map(({ type, count, info }) => (
                                <div key={type} className="type-bar">
                                    <div className="type-info">
                                        <span className="type-emoji">{info?.emoji || '🌙'}</span>
                                        <span className="type-name">{info?.name || type}</span>
                                    </div>
                                    <div className="type-bar-fill" style={{
                                        width: `${(count / stats.totalCount) * 100}%`
                                    }}>
                                        <span className="type-count">{count}회</span>
                                    </div>
                                </div>
                            ))}
                            {!isPremium && stats.topTypes.length > 2 && (
                                <button className="more-types locked" onClick={() => onOpenPremium?.('pattern_analysis')}>
                                    👑 프리미엄으로 전체 유형 분석 보기
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 상세 분석 (펼치기) */}
            {showDetails && (
                <div className="pattern-details">
                    {/* 요일별 분포 */}
                    <div className="pattern-weekday">
                        <span className="section-label">요일별 기록 분포</span>
                        <div className="weekday-chart">
                            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => {
                                const count = stats.weekdayCount[i];
                                const maxCount = Math.max(...stats.weekdayCount);
                                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                return (
                                    <div key={day} className="weekday-bar">
                                        <div className="bar-fill" style={{ height: `${height}%` }}>
                                            {count > 0 && <span className="bar-count">{count}</span>}
                                        </div>
                                        <span className="bar-label">{day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 프리미엄 전용: AI 인사이트 */}
                    {isPremium ? (
                        <div className="pattern-ai-insight">
                            <div className="insight-header">
                                <span className="insight-icon">🔮</span>
                                <span className="insight-title">AI 심층 분석</span>
                                <span className="premium-tag">👑 프리미엄</span>
                            </div>
                            {aiInsight ? (
                                <div className="insight-content">
                                    <p>{aiInsight}</p>
                                </div>
                            ) : (
                                <button
                                    className="generate-insight-btn"
                                    onClick={handleGenerateInsight}
                                    disabled={loadingInsight}
                                >
                                    {loadingInsight ? '분석 중...' : '✨ AI 패턴 분석 생성'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="pattern-premium-upsell">
                            <div className="upsell-content">
                                <span className="upsell-icon">🔮</span>
                                <div className="upsell-text">
                                    <strong>AI가 발견한 당신만의 패턴</strong>
                                    <p>반복되는 상징의 의미, 시기별 변화, 숨겨진 연관성을 분석해드려요</p>
                                </div>
                                <button className="upsell-btn" onClick={() => onOpenPremium?.('pattern_analysis')}>
                                    👑 잠금해제
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatternAnalysis;
