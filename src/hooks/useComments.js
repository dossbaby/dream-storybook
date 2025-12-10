import { useState, useEffect, useCallback, useRef } from 'react';
import {
    collection, addDoc, getDocs, query, orderBy,
    updateDoc, doc, deleteDoc, Timestamp, getDoc, increment, setDoc
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

    // Firestore에서 최신 좋아요 카운트 가져오기
    const fetchLikeCount = useCallback(async () => {
        if (!selectedItem?.id) return;
        try {
            const docSnap = await getDoc(doc(db, collectionName, selectedItem.id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setLikeCount(data.likeCount || 0);
            }
        } catch (err) {
            console.error('Fetch like count error:', err);
        }
    }, [selectedItem?.id, collectionName]);

    // 컴포넌트 마운트 시 Firestore에서 최신 카운트 가져오기
    useEffect(() => {
        fetchLikeCount();
    }, [fetchLikeCount]);

    // 좋아요 토글
    const toggleLike = async () => {
        if (!selectedItem?.id) return;

        const likedItems = JSON.parse(localStorage.getItem(`liked_${collectionName}`) || '[]');
        const itemRef = doc(db, collectionName, selectedItem.id);

        try {
            if (isLiked) {
                // 좋아요 취소 - setDoc with merge로 문서 없어도 안전
                await setDoc(itemRef, { likeCount: increment(-1) }, { merge: true });
                const newLiked = likedItems.filter(id => id !== selectedItem.id);
                localStorage.setItem(`liked_${collectionName}`, JSON.stringify(newLiked));
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                // 좋아요 추가 - setDoc with merge로 문서 없어도 생성
                await setDoc(itemRef, { likeCount: increment(1) }, { merge: true });
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
            // setDoc with merge - 문서가 없어도 생성
            await setDoc(doc(db, collectionName, selectedItem.id), {
                commentCount: increment(1)
            }, { merge: true });
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
            await setDoc(doc(db, collectionName, selectedItem.id), {
                commentCount: increment(-1)
            }, { merge: true });
            loadComments(selectedItem.id);
        } catch (err) { console.error('Comment delete error:', err); }
    };

    // 댓글 좋아요 토글
    const toggleCommentLike = async (commentId) => {
        if (!selectedItem?.id || !commentId) return;

        const likedKey = `liked_comments_${collectionName}_${selectedItem.id}`;
        const likedComments = JSON.parse(localStorage.getItem(likedKey) || '[]');
        const isCommentLiked = likedComments.includes(commentId);
        const commentRef = doc(db, collectionName, selectedItem.id, 'comments', commentId);

        try {
            if (isCommentLiked) {
                await updateDoc(commentRef, { likeCount: increment(-1) });
                const newLiked = likedComments.filter(id => id !== commentId);
                localStorage.setItem(likedKey, JSON.stringify(newLiked));
            } else {
                await updateDoc(commentRef, { likeCount: increment(1) });
                likedComments.push(commentId);
                localStorage.setItem(likedKey, JSON.stringify(likedComments));
            }
            loadComments(selectedItem.id);
        } catch (err) {
            console.error('Comment like toggle error:', err);
        }
    };

    // 댓글 좋아요 여부 확인
    const isCommentLiked = (commentId) => {
        if (!selectedItem?.id || !commentId) return false;
        const likedKey = `liked_comments_${collectionName}_${selectedItem.id}`;
        const likedComments = JSON.parse(localStorage.getItem(likedKey) || '[]');
        return likedComments.includes(commentId);
    };

    // 대댓글 추가
    const addReply = async (parentCommentId, replyText) => {
        if (!user || !replyText?.trim() || !selectedItem?.id || !parentCommentId) return false;
        const displayName = userNickname || user.displayName || '익명';
        try {
            await addDoc(collection(db, collectionName, selectedItem.id, 'comments', parentCommentId, 'replies'), {
                userId: user.uid,
                userName: displayName,
                userPhoto: user.photoURL,
                text: replyText.trim(),
                createdAt: Timestamp.now(),
                likeCount: 0
            });
            loadComments(selectedItem.id);
            return true;
        } catch (err) {
            console.error('Add reply error:', err);
            return false;
        }
    };

    // 대댓글 로드 (개별 댓글용)
    const loadReplies = async (commentId) => {
        if (!selectedItem?.id || !commentId) return [];
        try {
            const q = query(
                collection(db, collectionName, selectedItem.id, 'comments', commentId, 'replies'),
                orderBy('createdAt', 'asc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, parentId: commentId, ...doc.data() }));
        } catch (err) {
            console.error('Load replies error:', err);
            return [];
        }
    };

    // 대댓글 삭제
    const deleteReply = async (commentId, replyId, replyUserId) => {
        if (!user || user.uid !== replyUserId) return;
        if (!confirm('대댓글을 삭제할까요?')) return;
        try {
            await deleteDoc(doc(db, collectionName, selectedItem.id, 'comments', commentId, 'replies', replyId));
            loadComments(selectedItem.id);
        } catch (err) { console.error('Reply delete error:', err); }
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
        // 댓글 좋아요
        toggleCommentLike,
        isCommentLiked,
        // 대댓글
        addReply,
        loadReplies,
        deleteReply,
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
