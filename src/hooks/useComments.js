import { useState, useEffect } from 'react';
import {
    collection, addDoc, getDocs, query, orderBy,
    updateDoc, doc, deleteDoc, Timestamp, onSnapshot, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export const useComments = (user, selectedDream, userNickname) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentEdit, setCommentEdit] = useState({ id: null, text: '' });
    const [interpretations, setInterpretations] = useState([]);
    const [newInterpretation, setNewInterpretation] = useState('');

    const setCommentEditField = (key, value) => setCommentEdit(prev => ({ ...prev, [key]: value }));

    // 댓글 실시간 구독
    useEffect(() => {
        if (!selectedDream?.id) {
            setComments([]);
            return;
        }
        const q = query(collection(db, 'dreams', selectedDream.id, 'comments'), orderBy('createdAt', 'asc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, [selectedDream?.id]);

    // 댓글 추가
    const addComment = async () => {
        if (!user || !newComment.trim() || !selectedDream) return;
        const displayName = userNickname || user.displayName || '익명';
        try {
            await addDoc(collection(db, 'dreams', selectedDream.id, 'comments'), {
                userId: user.uid, userName: displayName, userPhoto: user.photoURL,
                text: newComment.trim(), createdAt: Timestamp.now()
            });
            await updateDoc(doc(db, 'dreams', selectedDream.id), { commentCount: (selectedDream.commentCount || 0) + 1 });
            setNewComment('');
        } catch (err) { console.error(err); }
    };

    // 댓글 수정
    const startEditComment = (comment) => {
        setCommentEdit({ id: comment.id, text: comment.text });
    };

    const saveEditComment = async (commentId) => {
        if (!commentEdit.text.trim() || !selectedDream) return;
        try {
            await updateDoc(doc(db, 'dreams', selectedDream.id, 'comments', commentId), {
                text: commentEdit.text.trim(),
                editedAt: Timestamp.now()
            });
            setCommentEditField('id', null);
            setCommentEditField('text', '');
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
            await deleteDoc(doc(db, 'dreams', selectedDream.id, 'comments', commentId));
            await updateDoc(doc(db, 'dreams', selectedDream.id), {
                commentCount: Math.max((selectedDream.commentCount || 1) - 1, 0)
            });
        } catch (err) { console.error('Comment delete error:', err); }
    };

    // 해석 로드
    const loadInterpretations = async (dreamId) => {
        try {
            const q = query(collection(db, 'dreams', dreamId, 'interpretations'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setInterpretations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { setInterpretations([]); }
    };

    // 해석 추가
    const addInterpretation = async () => {
        if (!user || !newInterpretation.trim() || !selectedDream) return;
        const displayName = userNickname || user.displayName || '익명 해몽가';
        try {
            await addDoc(collection(db, 'dreams', selectedDream.id, 'interpretations'), {
                userId: user.uid,
                userName: displayName,
                text: newInterpretation.trim(),
                createdAt: Timestamp.now(),
                helpful: 0
            });
            setNewInterpretation('');
            loadInterpretations(selectedDream.id);
        } catch (e) { console.error(e); }
    };

    // 도움됨 표시
    const markHelpful = async (interpId) => {
        if (!selectedDream) return;
        try {
            const interpRef = doc(db, 'dreams', selectedDream.id, 'interpretations', interpId);
            const interpDoc = await getDoc(interpRef);
            if (interpDoc.exists()) {
                await updateDoc(interpRef, { helpful: (interpDoc.data().helpful || 0) + 1 });
                loadInterpretations(selectedDream.id);
            }
        } catch (e) { console.error(e); }
    };

    // 해석 삭제
    const deleteInterpretation = async (interpId, interpUserId) => {
        if (!user || user.uid !== interpUserId) return;
        if (!confirm('해몽을 삭제할까요?')) return;
        try {
            await deleteDoc(doc(db, 'dreams', selectedDream.id, 'interpretations', interpId));
            loadInterpretations(selectedDream.id);
        } catch (err) { console.error('Interpretation delete error:', err); }
    };

    return {
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
        // 해석
        interpretations,
        newInterpretation,
        setNewInterpretation,
        loadInterpretations,
        addInterpretation,
        markHelpful,
        deleteInterpretation
    };
};
