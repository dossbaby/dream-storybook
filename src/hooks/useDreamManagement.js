import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 꿈 관리 관련 액션 훅 (삭제, 공개/비공개 토글)
 */
export const useDreamManagement = ({
    user,
    result,
    savedDream,
    setSavedDreamField,
    selectedDream,
    setSelectedDream,
    setMyDreams,
    setView,
    setToast,
    loadDreams,
    loadMyDreams
}) => {
    // 자동 저장 후 공개 여부 토글
    const toggleSavedDreamVisibility = async () => {
        if (!savedDream.id) return;
        try {
            const newIsPublic = !savedDream.isPublic;
            await updateDoc(doc(db, 'dreams', savedDream.id), { isPublic: newIsPublic });
            setSavedDreamField('isPublic', newIsPublic);
            loadDreams();
            if (user) loadMyDreams(user.uid);
            const dreamTitle = result?.title || '꿈';
            setToast('live', {
                type: 'save',
                message: newIsPublic ? `"${dreamTitle}" 꿈을 공유했어요!` : `"${dreamTitle}" 비공개로 변경되었어요`
            });
            setTimeout(() => setToast('live', null), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    // 꿈 삭제
    const deleteDream = async (dreamId, dreamData) => {
        if (!user || dreamData.userId !== user.uid) return;
        if (!confirm('정말 이 꿈을 삭제할까요?')) return;

        try {
            await deleteDoc(doc(db, 'dreams', dreamId));
            setMyDreams(prev => prev.filter(d => d.id !== dreamId));
            loadDreams();
            if (selectedDream?.id === dreamId) {
                setSelectedDream(null);
                setView('feed');
            }
            alert('꿈이 삭제되었어요');
        } catch (err) {
            console.error(err);
            alert('삭제 실패: ' + err.message);
        }
    };

    // 공개/비공개 토글
    const toggleDreamVisibility = async (dreamId, currentIsPublic) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'dreams', dreamId), { isPublic: !currentIsPublic });
            setMyDreams(prev => prev.map(d =>
                d.id === dreamId ? { ...d, isPublic: !currentIsPublic } : d
            ));
            if (selectedDream?.id === dreamId) {
                setSelectedDream(prev => ({ ...prev, isPublic: !currentIsPublic }));
            }
            loadDreams();
        } catch (err) {
            console.error(err);
            alert('변경 실패');
        }
    };

    return {
        toggleSavedDreamVisibility,
        deleteDream,
        toggleDreamVisibility
    };
};
