import { useState, useEffect, useCallback, useRef } from 'react';
import {
    collection, addDoc, getDocs, query, orderBy,
    updateDoc, doc, deleteDoc, Timestamp, getDoc, increment
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 범용 댓글/좋아요 훅
 * @param {string} collectionName - 'dreams', 'tarotReadings', 'fortuneReadings'
 * @param {object} user - 현재 로그인 유저
 * @param {object} selectedItem - 선택된 아이템 (dream, tarot, fortune)
 * @param {string} userNickname - 사용자 닉네임
 */
export const useComments = (collectionName = 'dreams', user, selectedItem, userNickname) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentEdit, setCommentEdit] = useState({ id: null, text: '' });
    const [interpretations, setInterpretations] = useState([]);
    const [newInterpretation, setNewInterpretation] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const pollingRef = useRef(null);

    const setCommentEditField = (key, value) => setCommentEdit(prev => ({ ...prev, [key]: value }));

    // 좋아요 상태 초기화
    useEffect(() => {
        if (selectedItem) {
            setLikeCount(selectedItem.likeCount || 0);
            // 로컬 스토리지에서 좋아요 상태 확인
            const likedItems = JSON.parse(localStorage.getItem(`liked_${collectionName}`) || '[]');
            setIsLiked(likedItems.includes(selectedItem.id));
        }
    }, [selectedItem, collectionName]);

    // 댓글 로드 함수
    const loadComments = useCallback(async (itemId) => {
        if (!itemId) return;
        try {
            const q = query(collection(db, collectionName, itemId, 'comments'), orderBy('createdAt', 'asc'));
            const snapshot = await getDocs(q);
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
            console.error('Load comments error:', e);
        }
    }, [collectionName]);

    // 댓글 폴링 (30초마다) - onSnapshot 대체로 비용 절감
    useEffect(() => {
        if (!selectedItem?.id) {
            setComments([]);
            return;
        }

        // 초기 로드
        loadComments(selectedItem.id);

        // 30초마다 폴링 (실시간 대비 읽기 비용 절감)
        pollingRef.current = setInterval(() => {
            loadComments(selectedItem.id);
        }, 30000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [selectedItem?.id, loadComments]);

    // 좋아요 토글
    const toggleLike = async () => {
        if (!selectedItem?.id) return;

        const likedItems = JSON.parse(localStorage.getItem(`liked_${collectionName}`) || '[]');
        const itemRef = doc(db, collectionName, selectedItem.id);

        try {
            if (isLiked) {
                // 좋아요 취소
                await updateDoc(itemRef, { likeCount: increment(-1) });
                const newLiked = likedItems.filter(id => id !== selectedItem.id);
                localStorage.setItem(`liked_${collectionName}`, JSON.stringify(newLiked));
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                // 좋아요 추가
                await updateDoc(itemRef, { likeCount: increment(1) });
                likedItems.push(selectedItem.id);
                localStorage.setItem(`liked_${collectionName}`, JSON.stringify(likedItems));
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Like toggle error:', err);
        }
    };

    // 댓글 추가
    const addComment = async (text) => {
        const commentText = text || newComment;
        if (!user || !commentText.trim() || !selectedItem) return;
        const displayName = userNickname || user.displayName || '익명';
        try {
            await addDoc(collection(db, collectionName, selectedItem.id, 'comments'), {
                userId: user.uid, userName: displayName, userPhoto: user.photoURL,
                text: commentText.trim(), createdAt: Timestamp.now()
            });
            await updateDoc(doc(db, collectionName, selectedItem.id), {
                commentCount: increment(1)
            });
            setNewComment('');
            // 즉시 댓글 리로드
            loadComments(selectedItem.id);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    // 댓글 수정
    const startEditComment = (comment) => {
        setCommentEdit({ id: comment.id, text: comment.text });
    };

    const saveEditComment = async (commentId) => {
        if (!commentEdit.text.trim() || !selectedItem) return;
        try {
            await updateDoc(doc(db, collectionName, selectedItem.id, 'comments', commentId), {
                text: commentEdit.text.trim(),
                editedAt: Timestamp.now()
            });
            setCommentEditField('id', null);
            setCommentEditField('text', '');
            loadComments(selectedItem.id);
        } catch (err) { console.error(err); }
    };

    const cancelEditComment = () => {
        setCommentEditField('id', null);
        setCommentEditField('text', '');
    };

    // 댓글 삭제
    const deleteComment = async (commentId, commentUserId) => {
        if (!user || user.uid !== commentUserId) return;
        if (!confirm('댓글을 삭제할까요?')) return;
        try {
            await deleteDoc(doc(db, collectionName, selectedItem.id, 'comments', commentId));
            await updateDoc(doc(db, collectionName, selectedItem.id), {
                commentCount: increment(-1)
            });
            loadComments(selectedItem.id);
        } catch (err) { console.error('Comment delete error:', err); }
    };

    // 해석 로드 (꿈 해몽 전용)
    const loadInterpretations = async (itemId) => {
        if (collectionName !== 'dreams') return;
        try {
            const q = query(collection(db, collectionName, itemId, 'interpretations'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setInterpretations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { setInterpretations([]); }
    };

    // 해석 추가 (꿈 해몽 전용)
    const addInterpretation = async () => {
        if (collectionName !== 'dreams') return;
        if (!user || !newInterpretation.trim() || !selectedItem) return;
        const displayName = userNickname || user.displayName || '익명 해몽가';
        try {
            await addDoc(collection(db, collectionName, selectedItem.id, 'interpretations'), {
                userId: user.uid,
                userName: displayName,
                text: newInterpretation.trim(),
                createdAt: Timestamp.now(),
                helpful: 0
            });
            setNewInterpretation('');
            loadInterpretations(selectedItem.id);
        } catch (e) { console.error(e); }
    };

    // 도움됨 표시 (꿈 해몽 전용)
    const markHelpful = async (interpId) => {
        if (collectionName !== 'dreams' || !selectedItem) return;
        try {
            const interpRef = doc(db, collectionName, selectedItem.id, 'interpretations', interpId);
            const interpDoc = await getDoc(interpRef);
            if (interpDoc.exists()) {
                await updateDoc(interpRef, { helpful: (interpDoc.data().helpful || 0) + 1 });
                loadInterpretations(selectedItem.id);
            }
        } catch (e) { console.error(e); }
    };

    // 해석 삭제 (꿈 해몽 전용)
    const deleteInterpretation = async (interpId, interpUserId) => {
        if (collectionName !== 'dreams') return;
        if (!user || user.uid !== interpUserId) return;
        if (!confirm('해몽을 삭제할까요?')) return;
        try {
            await deleteDoc(doc(db, collectionName, selectedItem.id, 'interpretations', interpId));
            loadInterpretations(selectedItem.id);
        } catch (err) { console.error('Interpretation delete error:', err); }
    };

    return {
        // 좋아요
        isLiked,
        likeCount,
        toggleLike,
        // 댓글
        comments,
        newComment,
        setNewComment,
        commentEdit,
        setCommentEditField,
        addComment,
        startEditComment,
        saveEditComment,
        cancelEditComment,
        deleteComment,
        loadComments,
        // 해석 (꿈 해몽 전용)
        interpretations,
        newInterpretation,
        setNewInterpretation,
        loadInterpretations,
        addInterpretation,
        markHelpful,
        deleteInterpretation
    };
};
