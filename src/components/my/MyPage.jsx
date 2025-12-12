import { useState, useRef, useEffect } from 'react';

const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const MyPage = ({
    user,
    userNickname,
    userProfile = {},
    userBadges,
    BADGES,
    myStats,
    onBack,
    onOpenNicknameModal,
    onOpenProfileModal,
    onOpenFeedback,
    onOpenReferral,
    onLogout,
    // 프리미엄 관련
    isPremium = false,
    tier = 'free',
    onOpenPremium,
    // Admin 티어 변경
    onSetTier,
    // 사용량 요약
    usageSummary = null
}) => {
    // Admin 이메일 목록
    const ADMIN_EMAILS = ['dossbb@naver.com'];

    // 프로필 완성도 계산
    const calculateProfileCompletion = () => {
        const fields = ['name', 'birthDate', 'gender', 'mbti'];
        const filled = fields.filter(f => userProfile[f]).length;
        return Math.round((filled / fields.length) * 100);
    };

    const profileCompletion = calculateProfileCompletion();
    const hasProfile = profileCompletion > 0;

    // 나이 계산
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // 별자리 계산
    const getZodiacSign = (birthDate) => {
        if (!birthDate) return null;
        const date = new Date(birthDate);
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const signs = [
            { name: '물병자리', emoji: '♒', start: [1, 20], end: [2, 18] },
            { name: '물고기자리', emoji: '♓', start: [2, 19], end: [3, 20] },
            { name: '양자리', emoji: '♈', start: [3, 21], end: [4, 19] },
            { name: '황소자리', emoji: '♉', start: [4, 20], end: [5, 20] },
            { name: '쌍둥이자리', emoji: '♊', start: [5, 21], end: [6, 21] },
            { name: '게자리', emoji: '♋', start: [6, 22], end: [7, 22] },
            { name: '사자자리', emoji: '♌', start: [7, 23], end: [8, 22] },
            { name: '처녀자리', emoji: '♍', start: [8, 23], end: [9, 22] },
            { name: '천칭자리', emoji: '♎', start: [9, 23], end: [10, 23] },
            { name: '전갈자리', emoji: '♏', start: [10, 24], end: [11, 21] },
            { name: '사수자리', emoji: '♐', start: [11, 22], end: [12, 21] },
            { name: '염소자리', emoji: '♑', start: [12, 22], end: [1, 19] }
        ];

        for (const sign of signs) {
            const [startMonth, startDay] = sign.start;
            const [endMonth, endDay] = sign.end;

            if (startMonth === 12 && endMonth === 1) {
                if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
                    return sign;
                }
            } else if (
                (month === startMonth && day >= startDay) ||
                (month === endMonth && day <= endDay)
            ) {
                return sign;
            }
        }
        return null;
    };

    const age = calculateAge(userProfile.birthDate);
    const zodiac = getZodiacSign(userProfile.birthDate);

    return (
        <>
            <div className="my-page-content">
                {/* 프로필 섹션 */}
                <section className="my-section">
                    <div className="section-label">프로필</div>
                    <div className="my-profile-card">
                        <img src={user.photoURL || '/default-avatar.png'} alt="" className="my-avatar" />
                        <div className="my-profile-info">
                            <div className="profile-name-row">
                                <span className="profile-nickname-rainbow">{userNickname || '닉네임'}</span>
                                <span className="profile-name-divider">|</span>
                                <span className="profile-name-white">{userProfile.name || user.displayName || '사용자'}</span>
                            </div>
                            <p>{user.email}</p>
                        </div>
                        <div className="profile-actions">
                            <button className="profile-edit-btn" onClick={onOpenProfileModal || onOpenNicknameModal}>
                                설정
                            </button>
                            <button className="logout-btn" onClick={onLogout}>로그아웃</button>
                        </div>
                    </div>
                    {hasProfile ? (
                        <div className="profile-details-card">
                            <div className="profile-detail-row">
                                <span className="detail-label">생년월일</span>
                                <span className="detail-value">
                                    {userProfile.birthDate ? userProfile.birthDate.replace(/-/g, '.') : '—'}
                                    {age ? ` (${age}세)` : ''}
                                </span>
                            </div>
                            <div className="profile-detail-row">
                                <span className="detail-label">태어난 시간</span>
                                <span className="detail-value">{userProfile.birthTime || '—'}</span>
                            </div>
                            <div className="profile-detail-row">
                                <span className="detail-label">별자리</span>
                                <span className="detail-value">{zodiac ? `${zodiac.emoji} ${zodiac.name}` : '—'}</span>
                            </div>
                            <div className="profile-detail-row">
                                <span className="detail-label">성별</span>
                                <span className="detail-value">
                                    {userProfile.gender === 'female' ? '여성' : userProfile.gender === 'male' ? '남성' : '—'}
                                </span>
                            </div>
                            <div className="profile-detail-row">
                                <span className="detail-label">MBTI</span>
                                <span className="detail-value">{userProfile.mbti || '—'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-setup-banner" onClick={onOpenProfileModal || onOpenNicknameModal}>
                            <div className="banner-content">
                                <span className="banner-title">✨ 맞춤 리딩을 받아보세요</span>
                                <span className="banner-desc">프로필 설정 시 더 정확한 타로, 꿈해몽, 사주를 경험할 수 있어요</span>
                            </div>
                            <span className="banner-arrow">→</span>
                        </div>
                    )}
                </section>

                {/* 계정 섹션 */}
                <section className="my-section">
                    <div className="section-label">계정</div>
                    {!isPremium && usageSummary && (
                        <div className="usage-bar">
                            <span className="usage-title">무료 리딩</span>
                            <span className={`usage-chip ${!usageSummary.tarot.canUse ? 'depleted' : ''}`}>
                                🔮 {usageSummary.tarot.remaining}/{usageSummary.tarot.limit}
                            </span>
                            <span className={`usage-chip ${!usageSummary.dream.canUse ? 'depleted' : ''}`}>
                                🌙 {usageSummary.dream.remaining}/{usageSummary.dream.limit}
                            </span>
                            <span className={`usage-chip ${!usageSummary.saju.canUse ? 'depleted' : ''}`}>
                                🔮 {usageSummary.saju.remaining}/{usageSummary.saju.limit}
                            </span>
                        </div>
                    )}
                    <div className="my-quick-links">
                        <button onClick={onOpenReferral}>🎁 친구 초대</button>
                        <button onClick={onOpenFeedback}>💬 의견 보내기</button>
                    </div>
                </section>

                {/* Admin 티어 전환 패널 */}
                {ADMIN_EMAILS.includes(user?.email) && onSetTier && (
                    <div className="admin-tier-panel">
                        <div className="admin-panel-header">
                            <span className="admin-badge">DEV</span>
                            <span className="admin-title">티어 전환 (테스트용)</span>
                        </div>
                        <div className="admin-tier-buttons">
                            <button
                                className={`tier-btn ${tier === 'free' ? 'active' : ''}`}
                                onClick={() => onSetTier('free')}
                            >
                                무료
                            </button>
                            <button
                                className={`tier-btn premium ${tier === 'premium' ? 'active' : ''}`}
                                onClick={() => onSetTier('premium')}
                            >
                                프리미엄
                            </button>
                            <button
                                className={`tier-btn ultra ${tier === 'ultra' ? 'active' : ''}`}
                                onClick={() => onSetTier('ultra')}
                            >
                                울트라
                            </button>
                        </div>
                        <div className="admin-tier-info">
                            현재: <strong>{tier === 'free' ? '무료' : tier === 'premium' ? '프리미엄' : '울트라'}</strong>
                            {tier !== 'free' && ' (Firestore 미반영, 새로고침 시 리셋)'}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyPage;
