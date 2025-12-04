import { useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * ‰‹ ≈pt∏ ≈ - <‹ l≈  presence heartbeat
 */
export const useLiveUpdates = (user, loadingFeed, setToast) => {
    // ‰‹ » <‹ l≈
    useEffect(() => {
        const dreamsRef = collection(db, 'dreams');
        const q = query(dreamsRef, orderBy('createdAt', 'desc'), limit(5));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && !loadingFeed) {
                    const newDream = change.doc.data();
                    if (newDream.isPublic && newDream.userId !== user?.uid) {
                        setToast('live', {
                            title: newDream.title,
                            type: newDream.dreamType,
                            userName: newDream.userName
                        });
                        setTimeout(() => setToast('live', null), 4000);
                    }
                }
            });
        });
        return () => unsubscribe();
    }, [user, loadingFeed, setToast]);

    // ¨©ê presence heartbeat
    useEffect(() => {
        if (!user) return;

        let heartbeatInterval;
        const presenceRef = doc(db, 'presence', user.uid);

        const setupPresence = async () => {
            try {
                await setDoc(presenceRef, {
                    userId: user.uid,
                    lastSeen: Timestamp.now(),
                    active: true
                });

                heartbeatInterval = setInterval(async () => {
                    try {
                        await setDoc(presenceRef, {
                            userId: user.uid,
                            lastSeen: Timestamp.now(),
                            active: true
                        });
                    } catch (e) { console.error(e); }
                }, 30000);
            } catch (e) { console.error(e); }
        };

        setupPresence();

        const handleUnload = async () => {
            try {
                await setDoc(presenceRef, { active: false, lastSeen: Timestamp.now() });
            } catch (e) {}
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [user]);
};
