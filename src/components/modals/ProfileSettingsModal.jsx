import { useState, useEffect } from 'react';

const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

// MBTI 그룹 분류
const getMbtiGroup = (type) => {
    const ntTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP']; // 분석가
    const nfTypes = ['INFJ', 'INFP', 'ENFJ', 'ENFP']; // 외교관
    const sjTypes = ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ']; // 관리자
    const spTypes = ['ISTP', 'ISFP', 'ESTP', 'ESFP']; // 탐험가

    if (ntTypes.includes(type)) return 'nt-group';
    if (nfTypes.includes(type)) return 'nf-group';
    if (sjTypes.includes(type)) return 'sj-group';
    if (spTypes.includes(type)) return 'sp-group';
    return '';
};

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
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <header className="profile-modal-header">
                    <h2>프로필 설정</h2>
                    <button className="profile-modal-close" onClick={onClose}>×</button>
                </header>

                <div className="profile-modal-body">
                    {/* 기본 정보 */}
                    <section className="profile-group">
                        <h3 className="profile-group-title">기본 정보</h3>
                        <div className="profile-field-row">
                            <div className="profile-field">
                                <label>닉네임</label>
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={e => handleChange('nickname', e.target.value)}
                                    placeholder="피드에 표시될 이름"
                                    maxLength={12}
                                />
                            </div>
                            <div className="profile-field">
                                <label>이름</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    placeholder="리딩에 활용"
                                    maxLength={20}
                                />
                            </div>
                        </div>
                        <div className="profile-field">
                            <label>성별</label>
                            <div className="gender-toggle">
                                <button
                                    type="button"
                                    className={`female ${formData.gender === 'female' ? 'active' : ''}`}
                                    onClick={() => handleChange('gender', formData.gender === 'female' ? '' : 'female')}
                                >
                                    여성
                                </button>
                                <button
                                    type="button"
                                    className={`male ${formData.gender === 'male' ? 'active' : ''}`}
                                    onClick={() => handleChange('gender', formData.gender === 'male' ? '' : 'male')}
                                >
                                    남성
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 생년월일 & 시간 */}
                    <section className="profile-group">
                        <h3 className="profile-group-title">생년월일</h3>
                        <div className="profile-field-row">
                            <div className="profile-field">
                                <label>날짜</label>
                                <input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={e => handleChange('birthDate', e.target.value)}
                                    min="1920-01-01"
                                    max="2015-12-31"
                                />
                            </div>
                            <div className="profile-field">
                                <label>시간 <span className="optional">(선택)</span></label>
                                <input
                                    type="time"
                                    value={formData.birthTime}
                                    onChange={e => handleChange('birthTime', e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="profile-hint">사주 계산과 별자리 분석에 사용돼요</p>
                    </section>

                    {/* MBTI */}
                    <section className="profile-group">
                        <h3 className="profile-group-title">MBTI <span className="optional">(선택)</span></h3>
                        <div className="mbti-selector">
                            {MBTI_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`${getMbtiGroup(type)} ${formData.mbti === type ? 'active' : ''}`}
                                    onClick={() => handleChange('mbti', formData.mbti === type ? '' : type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <footer className="profile-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>취소</button>
                    <button className="btn-save" onClick={handleSave}>저장</button>
                </footer>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
