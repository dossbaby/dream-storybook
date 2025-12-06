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
    setMyTarots,
    setMyFortunes,
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

    // 공개/비공개 토글 (레거시 - isPublic boolean)
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

    /**
     * 통합 visibility 업데이트 함수
     * @param {'dream'|'tarot'|'fortune'} type - 콘텐츠 타입
     * @param {string} id - 콘텐츠 ID
     * @param {'private'|'unlisted'|'public'} visibility - 새 visibility 값
     * @param {boolean} isAnonymous - 익명 공개 여부 (public일 때만 유효)
     */
    const updateVisibility = async (type, id, visibility, isAnonymous = false) => {
        if (!user) return;

        // 컬렉션명 매핑
        const collectionMap = {
            dream: 'dreams',
            tarot: 'tarots',
            fortune: 'sajus'
        };
        const collection = collectionMap[type];
        if (!collection) return;

        // isPublic 값 계산 (레거시 호환)
        const isPublic = visibility === 'public';

        try {
            await updateDoc(doc(db, collection, id), {
                visibility,
                isPublic,
                isAnonymous: isPublic ? isAnonymous : false
            });

            // 로컬 상태 업데이트
            const updateItem = (item) =>
                item.id === id
                    ? { ...item, visibility, isPublic, isAnonymous: isPublic ? isAnonymous : false }
                    : item;

            if (type === 'dream') {
                setMyDreams(prev => prev.map(updateItem));
                if (selectedDream?.id === id) {
                    setSelectedDream(prev => ({ ...prev, visibility, isPublic, isAnonymous: isPublic ? isAnonymous : false }));
                }
                loadDreams();
            } else if (type === 'tarot' && setMyTarots) {
                setMyTarots(prev => prev.map(updateItem));
            } else if (type === 'fortune' && setMyFortunes) {
                setMyFortunes(prev => prev.map(updateItem));
            }

            return true;
        } catch (err) {
            console.error('visibility 업데이트 실패:', err);
            alert('공개 설정 변경에 실패했습니다.');
            return false;
        }
    };

    return {
        toggleSavedDreamVisibility,
        deleteDream,
        toggleDreamVisibility,
        updateVisibility
    };
};
