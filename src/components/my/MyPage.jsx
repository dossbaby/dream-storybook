import { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

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
    usageSummary = null,
    // 배너 shake 트리거 (시작 버튼 클릭 시)
    shakeTrigger = 0
}) => {
    // Admin 이메일 목록
    const ADMIN_EMAILS = ['dossbb@naver.com'];

    // 아바타 툴팁 표시 상태 (모바일 클릭용)
    const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);
    const avatarRef = useRef(null);
    const clickHandlerRef = useRef(null);

    // 클릭 후 자동 fade-out + 외부 클릭 시 닫기
    useEffect(() => {
        if (showAvatarTooltip) {
            const timer = setTimeout(() => {
                setShowAvatarTooltip(false);
            }, 3000);

            clickHandlerRef.current = (e) => {
                if (avatarRef.current && !avatarRef.current.contains(e.target)) {
                    setShowAvatarTooltip(false);
                }
            };
            // 다음 틱에 리스너 등록 (현재 클릭 이벤트 버블링 방지)
            const rafId = requestAnimationFrame(() => {
                document.addEventListener('click', clickHandlerRef.current);
            });

            return () => {
                clearTimeout(timer);
                cancelAnimationFrame(rafId);
                if (clickHandlerRef.current) {
                    document.removeEventListener('click', clickHandlerRef.current);
                }
            };
        }
    }, [showAvatarTooltip]);

    // 배너 shake 애니메이션 상태
    const [isShaking, setIsShaking] = useState(false);
    const bannerRef = useRef(null);

    // shakeTrigger가 변경되면 shake 애니메이션 재실행
    useEffect(() => {
        if (shakeTrigger > 0) {
            // 이미 shaking 중이면 먼저 끄고 다시 켜기 (애니메이션 리셋)
            setIsShaking(false);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 800);
                });
            });
        }
    }, [shakeTrigger]);

    // 필수 필드 체크 (nickname, name, gender, birthDate)
    const requiredFields = ['name', 'gender', 'birthDate'];
    const hasRequiredProfile = requiredFields.every(f => userProfile[f]) && userNickname;

    // 프로필 완성도 계산 (기존 유지)
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
                {/* 필수 정보 미입력 배너 */}
                {!hasRequiredProfile && (
                    <div
                        ref={bannerRef}
                        className={`required-profile-banner ${isShaking ? 'shake' : ''}`}
                        onClick={onOpenProfileModal || onOpenNicknameModal}
                    >
                        <div className="banner-content">
                            <span className="banner-title">✨ 필수 정보를 입력해야 리딩을 볼 수 있어요</span>
                            <span className="banner-desc">프로필 설정을 완료해야 더 정확한 AI 맞춤 리딩을 받을 수 있어요!</span>
                        </div>
                        <span className="banner-arrow">→</span>
                    </div>
                )}

                {/* 프로필 섹션 */}
                <section className="my-section">
                    <div className="section-label">프로필</div>
                    <div className="my-profile-card">
                        <div
                            ref={avatarRef}
                            className={`my-avatar-wrapper ${showAvatarTooltip ? 'active' : ''}`}
                            onClick={() => setShowAvatarTooltip(true)}
                        >
                            {userProfile?.profilePhoto?.imageUrl ? (
                                <div
                                    className="my-avatar-crop"
                                    style={{
                                        backgroundImage: `url(${getOptimizedImageUrl(userProfile.profilePhoto.imageUrl, { size: 'medium' })})`,
                                        backgroundPosition: `${userProfile.profilePhoto.cropX}% ${userProfile.profilePhoto.cropY}%`,
                                        backgroundSize: `${(userProfile.profilePhoto.zoom || 1) * 177.78}% auto`
                                    }}
                                />
                            ) : user.photoURL ? (
                                <img src={user.photoURL} alt="" className="my-avatar" />
                            ) : (
                                <span className="my-avatar-emoji">👻</span>
                            )}
                            <span className="avatar-tooltip">💜 <span className="highlight">내 리딩</span>에서 아바타 사진을 바꿀 수 있어요!</span>
                        </div>
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
                    <div className="profile-details-card">
                        <div className="profile-detail-row">
                            <span className="detail-label">성별</span>
                            <span className="detail-value">
                                {userProfile.gender === 'female' ? '여성' : userProfile.gender === 'male' ? '남성' : '—'}
                            </span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="detail-label">생년월일</span>
                            <span className="detail-value">
                                {userProfile.birthDate ? userProfile.birthDate.replace(/-/g, '.') : '—'}
                                {age ? ` (${age}세)` : ''}
                            </span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="detail-label">별자리</span>
                            <span className="detail-value">{zodiac ? `${zodiac.emoji} ${zodiac.name}` : '—'}</span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="detail-label">태어난 시간</span>
                            <span className="detail-value">{userProfile.birthTime || '—'}</span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="detail-label">MBTI</span>
                            <span className="detail-value">{userProfile.mbti || '—'}</span>
                        </div>
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
