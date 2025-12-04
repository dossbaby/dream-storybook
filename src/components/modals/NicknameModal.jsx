import { useState, useEffect } from 'react';

const NicknameModal = ({ isOpen, onClose, onSave, initialValue = '' }) => {
    const [nickname, setNickname] = useState(initialValue);

    useEffect(() => {
        setNickname(initialValue);
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (nickname.trim()) {
            onSave(nickname.trim());
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>닉네임 설정</h3>
                <p>실명 대신 사용할 닉네임을 입력하세요</p>
                <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="닉네임 입력..."
                    maxLength={20}
                />
                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                    <button className="save-btn" onClick={handleSave}>저장</button>
                </div>
            </div>
        </div>
    );
};

export default NicknameModal;
