import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { generateShareText } from '../utils/cardHelpers';

/**
 * 사용자 관련 액션 훅
 */
export const useUserActions = ({
    user,
    setUserNickname,
    setUserProfile,
    shareTarget,
    setShareTarget,
    dreamTypes,
    openModal,
    closeModal
}) => {
    // Google 로그인
    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error(err);
        }
    };

    // 로그아웃
    const handleLogout = async () => {
        await signOut(auth);
    };

    // 공유 모달 열기
    const openShareModal = (dream) => {
        setShareTarget(dream);
        openModal('share');
    };

    // 공유 텍스트 복사
    const copyShareText = () => {
        if (!shareTarget) return;
        const text = generateShareText(shareTarget, dreamTypes);
        navigator.clipboard.writeText(text);
        alert('복사되었어요!');
    };

    // 닉네임 저장
    const saveNickname = async (nickname) => {
        if (!user || !nickname) return;
        try {
            await setDoc(doc(db, 'users', user.uid), {
                nickname: nickname,
                email: user.email,
                updatedAt: Timestamp.now()
            }, { merge: true });
            setUserNickname(nickname);
            closeModal('nickname');
            alert('닉네임이 저장되었어요!');
        } catch (err) {
            console.error(err);
            alert('저장 실패');
        }
    };

    // 프로필 저장 (닉네임 + 프로필 정보)
    const saveProfile = async ({ nickname, profile }) => {
        if (!user) return;
        try {
            await setDoc(doc(db, 'users', user.uid), {
                nickname: nickname || '',
                profile: profile || {},
                email: user.email,
                updatedAt: Timestamp.now()
            }, { merge: true });
            if (nickname) setUserNickname(nickname);
            if (profile) setUserProfile(profile);
            closeModal('profile');
        } catch (err) {
            console.error(err);
            alert('저장 실패');
        }
    };

    // 프로필 사진 저장 (리딩 이미지 + crop 좌표 + zoom)
    const saveProfilePhoto = async (imageUrl, cropPosition) => {
        if (!user) return;
        try {
            const profilePhoto = {
                imageUrl,
                cropX: cropPosition.x,
                cropY: cropPosition.y,
                zoom: cropPosition.zoom || 1,
                updatedAt: Timestamp.now()
            };
            await setDoc(doc(db, 'users', user.uid), {
                profilePhoto,
                updatedAt: Timestamp.now()
            }, { merge: true });
            // userProfile에 profilePhoto 추가
            setUserProfile(prev => ({ ...prev, profilePhoto }));
        } catch (err) {
            console.error('프로필 사진 저장 실패:', err);
            throw err;
        }
    };

    return {
        handleGoogleLogin,
        handleLogout,
        openShareModal,
        copyShareText,
        saveNickname,
        saveProfile,
        saveProfilePhoto
    };
};
