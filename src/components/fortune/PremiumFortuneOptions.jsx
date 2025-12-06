import { useState } from 'react';

/**
 * 프리미엄 전용 사주 기능
 * - 궁합 분석: 두 사람의 사주 비교
 * - 연간운세: 월별 상세 운세
 */
const PremiumFortuneOptions = ({
    isPremium = false,
    tier = 'free',
    birthdate,
    onOpenPremium,
    onGenerateCompatibility,
    onGenerateYearlyFortune,
    loading = false
}) => {
    const [showCompatibility, setShowCompatibility] = useState(false);
    const [partnerBirthdate, setPartnerBirthdate] = useState('');
    const [partnerBirthTime, setPartnerBirthTime] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear, currentYear + 1];

    const handleCompatibilityClick = () => {
        if (!isPremium) {
            onOpenPremium?.('compatibility');
            return;
        }
        setShowCompatibility(!showCompatibility);
    };

    const handleYearlyFortuneClick = () => {
        if (!isPremium) {
            onOpenPremium?.('yearly_fortune');
            return;
        }
        onGenerateYearlyFortune?.(selectedYear);
    };

    const handleGenerateCompatibility = () => {
        if (!partnerBirthdate) return;
        onGenerateCompatibility?.({
            myBirthdate: birthdate,
            partnerBirthdate,
            partnerBirthTime
        });
    };

    return (
        <div className="premium-fortune-options">
            <div className="premium-options-header">
                <span className="header-icon">✨</span>
                <span className="header-title">프리미엄 사주</span>
                {!isPremium && <span className="premium-tag">👑 PRO</span>}
            </div>

            <div className="premium-options-grid">
                {/* 궁합 분석 */}
                <div
                    className={`premium-option-card ${!isPremium ? 'locked' : ''}`}
                    onClick={handleCompatibilityClick}
                >
                    <div className="option-icon">💕</div>
                    <div className="option-content">
                        <h4>사주 궁합</h4>
                        <p>두 사람의 천생연분, 궁합 점수를 확인해보세요</p>
                    </div>
                    {!isPremium ? (
                        <span className="lock-badge">🔒</span>
                    ) : (
                        <span className="arrow">→</span>
                    )}
                </div>

                {/* 연간운세 */}
                <div
                    className={`premium-option-card ${!isPremium ? 'locked' : ''}`}
                    onClick={handleYearlyFortuneClick}
                >
                    <div className="option-icon">📅</div>
                    <div className="option-content">
                        <h4>{selectedYear}년 연간운세</h4>
                        <p>월별 상세 운세와 연간 흐름을 분석합니다</p>
                    </div>
                    {!isPremium ? (
                        <span className="lock-badge">🔒</span>
                    ) : (
                        <span className="arrow">→</span>
                    )}
                </div>
            </div>

            {/* 궁합 입력 폼 (프리미엄 + 펼침 시) */}
            {isPremium && showCompatibility && (
                <div className="compatibility-form">
                    <h5>상대방 정보 입력</h5>
                    <div className="form-row">
                        <div className="form-field">
                            <label>생년월일</label>
                            <input
                                type="date"
                                value={partnerBirthdate}
                                onChange={(e) => setPartnerBirthdate(e.target.value)}
                                className="birthdate-input"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-field">
                            <label>태어난 시간 (선택)</label>
                            <input
                                type="time"
                                value={partnerBirthTime}
                                onChange={(e) => setPartnerBirthTime(e.target.value)}
                                className="birthtime-input"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <button
                        className="compatibility-submit"
                        onClick={handleGenerateCompatibility}
                        disabled={!partnerBirthdate || loading}
                    >
                        {loading ? '분석 중...' : '💕 궁합 분석하기'}
                    </button>
                </div>
            )}

            {/* 무료 사용자 프리미엄 유도 */}
            {!isPremium && (
                <div className="premium-upsell-banner">
                    <div className="upsell-content">
                        <span className="upsell-emoji">🔮</span>
                        <div className="upsell-text">
                            <strong>더 깊은 운세가 궁금하다면?</strong>
                            <p>궁합 분석, 연간운세로 미래를 상세히 살펴보세요</p>
                        </div>
                    </div>
                    <button className="upsell-btn" onClick={() => onOpenPremium?.('fortune_premium')}>
                        👑 프리미엄 시작
                    </button>
                </div>
            )}
        </div>
    );
};

export default PremiumFortuneOptions;
