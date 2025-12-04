import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 피드 로딩 및 관리 훅
 * 꿈, 타로, 운세 피드를 관리하고 필터링/정렬 로직 처리
 */
export const useFeed = (user, myDreams, activeTab, filters, mode) => {
    const [dreams, setDreams] = useState([]);
    const [hotDreams, setHotDreams] = useState([]);
    const [liveDreamStories, setLiveDreamStories] = useState([]);
    const [tarotReadings, setTarotReadings] = useState([]);
    const [fortuneReadings, setFortuneReadings] = useState([]);
    const [popularKeywords, setPopularKeywords] = useState([]);
    const [typeCounts, setTypeCounts] = useState({});
    const [todayStats, setTodayStats] = useState({ total: 0, topType: null });
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // 콜백 ref (외부에서 참조용)
    const loadDreamsRef = useRef(null);
    const loadTarotsRef = useRef(null);
    const loadFortunesRef = useRef(null);
    const loadMyDreamsRef = useRef(null);

    // 꿈 피드 로드
    const loadDreams = useCallback(async () => {
        console.log('[useFeed] loadDreams called');
        setLoading(true);
        try {
            const q = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(100));
            console.log('[useFeed] Fetching dreams from Firebase...');
            const snapshot = await getDocs(q);
            console.log('[useFeed] Got', snapshot.docs.length, 'dreams');
            let dreamsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(d => d.isPublic);
            console.log('[useFeed] Public dreams:', dreamsList.length);
            console.log('[useFeed] activeTab:', activeTab);

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // 'today' 탭에서 오늘 꿈이 없으면 전체 꿈을 보여줌
            if (activeTab === 'today') {
                const todayDreamsList = dreamsList.filter(d => {
                    const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
                    return createdAt >= todayStart;
                });
                // 오늘 꿈이 없으면 최신순으로 전체 보여주기
                if (todayDreamsList.length === 0) {
                    console.log('[useFeed] No dreams today, showing all recent dreams');
                } else {
                    dreamsList = todayDreamsList;
                }
            } else if (activeTab === 'popular') {
                dreamsList = dreamsList.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
            } else if (activeTab === 'related' && user) {
                const myTypes = myDreams.map(d => d.dreamType);
                const myKeywords = myDreams.flatMap(d => d.keywords?.map(k => k.word) || []);
                dreamsList = dreamsList.filter(d => {
                    if (d.userId === user.uid) return false;
                    const typeMatch = myTypes.includes(d.dreamType);
                    const keywordMatch = d.keywords?.some(k => myKeywords.includes(k.word));
                    return typeMatch || keywordMatch;
                }).sort((a, b) => {
                    const aScore = (myTypes.filter(t => t === a.dreamType).length * 2) +
                        (a.keywords?.filter(k => myKeywords.includes(k.word)).length || 0);
                    const bScore = (myTypes.filter(t => t === b.dreamType).length * 2) +
                        (b.keywords?.filter(k => myKeywords.includes(k.word)).length || 0);
                    return bScore - aScore;
                });
            }

            if (filters.type) dreamsList = dreamsList.filter(d => d.dreamType === filters.type);
            if (filters.keyword) dreamsList = dreamsList.filter(d => d.keywords?.some(k => k.word === filters.keyword));

            // 인기 키워드 추출
            const keywordData = {};
            const currentTime = Date.now();
            dreamsList.forEach((d, idx) => {
                const dreamTime = d.createdAt?.toDate?.()?.getTime?.() || (currentTime - idx * 86400000);
                const recencyScore = Math.max(0, 1 - (currentTime - dreamTime) / (7 * 86400000));
                d.keywords?.forEach(k => {
                    if (!keywordData[k.word]) {
                        keywordData[k.word] = { count: 0, recency: 0, lastSeen: 0 };
                    }
                    keywordData[k.word].count += 1;
                    keywordData[k.word].recency += recencyScore;
                    keywordData[k.word].lastSeen = Math.max(keywordData[k.word].lastSeen, dreamTime);
                });
            });
            const sortedKeywords = Object.entries(keywordData)
                .sort((a, b) => {
                    const aRecent = a[1].recency > 0.1;
                    const bRecent = b[1].recency > 0.1;
                    if (aRecent !== bRecent) return bRecent - aRecent;
                    return (b[1].count + b[1].recency * 2) - (a[1].count + a[1].recency * 2);
                })
                .slice(0, 8)
                .map(([word]) => word);
            setPopularKeywords(sortedKeywords);

            // 유형별 카운트
            const counts = {};
            dreamsList.forEach(d => {
                counts[d.dreamType] = (counts[d.dreamType] || 0) + 1;
            });
            setTypeCounts(counts);

            // 오늘 통계
            const todayDreams = dreamsList.filter(d => {
                const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
                return createdAt >= todayStart;
            });
            const topType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            setTodayStats({
                total: todayDreams.length,
                topType: topType ? topType[0] : null
            });

            setDreams(dreamsList);
        } catch (e) {
            console.error('[useFeed] Failed to load dreams:', e);
            setDreams([]);
        } finally {
            console.log('[useFeed] loadDreams finished, setting loading to false');
            setLoading(false);
        }
    }, [activeTab, filters.type, filters.keyword, user, myDreams]);

    // 타로 피드 로드
    const loadTarots = useCallback(async () => {
        try {
            const q = query(collection(db, 'tarots'), where('isPublic', '==', true), orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            setTarotReadings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error('Failed to load tarots:', e);
            setTarotReadings([]);
        }
    }, []);

    // 운세 피드 로드
    const loadFortunes = useCallback(async () => {
        try {
            const q = query(collection(db, 'fortunes'), where('isPublic', '==', true), orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            setFortuneReadings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error('Failed to load fortunes:', e);
            setFortuneReadings([]);
        }
    }, []);

    // 핫 랭킹 로드
    useEffect(() => {
        const loadHotDreams = async () => {
            try {
                const q = query(collection(db, 'dreams'), orderBy('likeCount', 'desc'), limit(10));
                const snapshot = await getDocs(q);
                const hotList = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.isPublic).slice(0, 3);
                setHotDreams(hotList);
            } catch (e) { setHotDreams([]); }
        };
        loadHotDreams();
        const interval = setInterval(loadHotDreams, 30000);
        return () => clearInterval(interval);
    }, []);

    // 실시간 꿈 이야기 로드
    useEffect(() => {
        const loadLiveStories = async () => {
            try {
                const q = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(20));
                const snapshot = await getDocs(q);
                const stories = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(d => d.isPublic && d.originalDream)
                    .slice(0, 8);
                setLiveDreamStories(stories);
            } catch (e) {
                setLiveDreamStories([]);
            }
        };
        loadLiveStories();
        const interval = setInterval(loadLiveStories, 60000);
        return () => clearInterval(interval);
    }, []);

    // 온라인 카운트 시뮬레이션
    useEffect(() => {
        const updateOnline = () => setOnlineCount(Math.floor(Math.random() * 50) + 80);
        updateOnline();
        const interval = setInterval(updateOnline, 10000);
        return () => clearInterval(interval);
    }, []);

    // 초기 로드 플래그
    const initialLoadDone = useRef(false);

    // 초기 로드 시 꿈 피드는 항상 로드 (RightSidebar용)
    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            loadDreams();
        }
    }, [loadDreams]);

    // 모드별 피드 로드 (모드 변경 시에만)
    const prevMode = useRef(mode);
    useEffect(() => {
        if (prevMode.current !== mode) {
            prevMode.current = mode;
            if (mode === 'dream') loadDreams();
            else if (mode === 'tarot') loadTarots();
            else if (mode === 'fortune') loadFortunes();
        }
    }, [mode, loadDreams, loadTarots, loadFortunes]);

    // ref 업데이트
    loadDreamsRef.current = loadDreams;
    loadTarotsRef.current = loadTarots;
    loadFortunesRef.current = loadFortunes;

    return {
        // 피드 데이터
        dreams,
        hotDreams,
        liveDreamStories,
        tarotReadings,
        fortuneReadings,
        popularKeywords,
        typeCounts,
        todayStats,
        onlineCount,
        loading,
        // 로드 함수
        loadDreams,
        loadTarots,
        loadFortunes,
        // ref (콜백용)
        loadDreamsRef,
        loadTarotsRef,
        loadFortunesRef,
        loadMyDreamsRef
    };
};
