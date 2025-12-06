import { useState, useEffect } from 'react';

const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const ProfileSettingsModal = ({
    isOpen,
    onClose,
    currentProfile = {},
    currentNickname = '',
    onSave
}) => {
    const [formData, setFormData] = useState({
        nickname: '',
        name: '',
        birthDate: '',
        birthTime: '',
        gender: '',
        mbti: ''
    });

    // 모달 열릴 때 현재 프로필 데이터로 초기화
    useEffect(() => {
        if (isOpen) {
            setFormData({
                nickname: currentNickname || '',
                name: currentProfile.name || '',
                birthDate: currentProfile.birthDate || '2000-01-01',
                birthTime: currentProfile.birthTime || '',
                gender: currentProfile.gender || '',
                mbti: currentProfile.mbti || ''
            });
        }
    }, [isOpen, currentProfile, currentNickname]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave({
            nickname: formData.nickname,
            profile: {
                name: formData.name,
                birthDate: formData.birthDate,
                birthTime: formData.birthTime,
                gender: formData.gender,
                mbti: formData.mbti
            }
        });
        onClose();
    };

    return (
        <div className="profile-settings-modal" onClick={onClose}>
            <div className="profile-settings-content" onClick={e => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="profile-settings-header">
                    <h3>
                        <span>✨</span> 프로필 설정
                    </h3>
                    <button className="profile-settings-close" onClick={onClose}>✕</button>
                </div>

                {/* 본문 */}
                <div className="profile-settings-body">
                    {/* 혜택 안내 */}
                    <div className="profile-benefits">
                        <div className="profile-benefits-title">
                            <span>🎁</span> 프로필 설정 시 혜택
                        </div>
                        <ul className="profile-benefits-list">
                            <li>타로, 꿈해몽, 사주가 당신에게 맞춤으로!</li>
                            <li>이미지에 당신의 모습이 반영돼요</li>
                            <li>별자리 기반 분석 제공</li>
                            <li>MBTI 성향 맞춤 해석</li>
                            <li><strong>만세력 자동 생성 & 저장 ⭐ NEW</strong></li>
                            <li>사주 볼 때 내 정보 자동 입력</li>
                        </ul>
                    </div>

                    {/* 닉네임 */}
                    <div className="profile-field">
                        <label>
                            <span className="field-emoji">📝</span>
                            닉네임 (피드에 표시)
                        </label>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={e => handleChange('nickname', e.target.value)}
                            placeholder="닉네임을 입력하세요"
                            maxLength={12}
                        />
                    </div>

                    {/* 이름 */}
                    <div className="profile-field">
                        <label>
                            <span className="field-emoji">👤</span>
                            이름 (리딩에 활용)
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="이름 또는 별명"
                            maxLength={20}
                        />
                    </div>

                    {/* 생년월일 */}
                    <div className="profile-field">
                        <label>
                            <span className="field-emoji">🎂</span>
                            생년월일 (별자리 & 사주)
                        </label>
                        <input
                            type="date"
                            value={formData.birthDate}
                            onChange={e => handleChange('birthDate', e.target.value)}
                            min="1920-01-01"
                            max="2015-12-31"
                        />
                    </div>

                    {/* 태어난 시간 */}
                    <div className="profile-field">
                        <label>
                            <span className="field-emoji">🕐</span>
                            태어난 시간 (사주 시주 계산)
                        </label>
                        <input
                            type="time"
                            value={formData.birthTime}
                            onChange={e => handleChange('birthTime', e.target.value)}
                            placeholder="예: 14:30"
                        />
                        <span className="field-hint">모르면 비워두세요 (시주 제외 계산)</span>
                    </div>

                    {/* 성별 */}
                    <div className="profile-field">
                        <label>
                            <span className="field-emoji">🪪</span>
                            성별 (이미지 생성 & 사주 계산)
                        </label>
                        <div className="gender-options">
                            <button
                                type="button"
                                className={`gender-option ${formData.gender === 'female' ? 'selected' : ''}`}
                                onClick={() => handleChange('gender', formData.gender === 'female' ? '' : 'female')}
                            >
                                <span className="gender-emoji">👧🏻</span>
                                <span>여성</span>
                            </button>
                            <button
                                type="button"
                                className={`gender-option ${formData.gender === 'male' ? 'selected' : ''}`}
                                onClick={() => handleChange('gender', formData.gender === 'male' ? '' : 'male')}
                            >
                                <span className="gender-emoji">🧒🏻</span>
                                <span>남성</span>
                            </button>
                        </div>
                    </div>

                    {/* MBTI */}
                    <div className="profile-field">
                        <label>
                            <span className="field-emoji">🧠</span>
                            MBTI (성향 맞춤 해석)
                        </label>
                        <div className="mbti-grid">
                            {MBTI_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`mbti-option ${formData.mbti === type ? 'selected' : ''}`}
                                    onClick={() => handleChange('mbti', formData.mbti === type ? '' : type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="profile-settings-footer">
                    <button className="profile-cancel-btn" onClick={onClose}>취소</button>
                    <button className="profile-save-btn" onClick={handleSave}>저장하기</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
