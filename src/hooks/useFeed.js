import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { getCached, setCache, CACHE_KEYS, CACHE_TTL } from '../utils/firebaseCache';

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
    const [tarotKeywords, setTarotKeywords] = useState([]);
    const [tarotTopicCounts, setTarotTopicCounts] = useState({});
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
            // 전체 꿈을 가져온 후 클라이언트에서 공개 필터링 (복합 인덱스 없이도 동작)
            const q = query(collection(db, 'dreams'), orderBy('createdAt', 'desc'), limit(200));
            console.log('[useFeed] Fetching dreams from Firebase...');
            const snapshot = await getDocs(q);
            console.log('[useFeed] Got', snapshot.docs.length, 'total dreams');
            // 공개된 꿈만 필터링
            let dreamsList = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(d => d.isPublic === true);
            console.log('[useFeed] Public dreams after filter:', dreamsList.length);
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

    // 타로 피드 로드 (캐싱 적용) + 키워드 추출
    const loadTarots = useCallback(async () => {
        try {
            // 캐시 확인
            const cached = getCached(CACHE_KEYS.TAROTS_FEED);
            if (cached) {
                console.log('[useFeed] Using cached tarots');
                setTarotReadings(cached);
                // 캐시된 데이터에서도 키워드 추출
                extractTarotKeywords(cached);
                return;
            }

            const q = query(collection(db, 'tarots'), orderBy('createdAt', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            const tarots = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(t => t.isPublic === true);
            console.log('[useFeed] Loaded', tarots.length, 'public tarots');

            // 캐시 저장
            setCache(CACHE_KEYS.TAROTS_FEED, tarots, CACHE_TTL.FEED);
            setTarotReadings(tarots);

            // 타로 키워드 추출
            extractTarotKeywords(tarots);
        } catch (e) {
            console.error('Failed to load tarots:', e);
            setTarotReadings([]);
        }
    }, []);

    // 타로 키워드 + 주제별 카운트 추출 함수
    const extractTarotKeywords = (tarots) => {
        const keywordData = {};
        const topicData = {};
        const currentTime = Date.now();

        tarots.forEach((t, idx) => {
            const tarotTime = t.createdAt?.toDate?.()?.getTime?.() || (currentTime - idx * 86400000);
            const recencyScore = Math.max(0, 1 - (currentTime - tarotTime) / (7 * 86400000));

            // 키워드 추출
            t.keywords?.forEach(k => {
                const word = k.word || k;
                if (!word) return;
                if (!keywordData[word]) {
                    keywordData[word] = { count: 0, recency: 0, lastSeen: 0 };
                }
                keywordData[word].count += 1;
                keywordData[word].recency += recencyScore;
                keywordData[word].lastSeen = Math.max(keywordData[word].lastSeen, tarotTime);
            });

            // 주제별 카운트 (topics 배열 또는 기존 topic 호환)
            const topics = t.topics || (t.topic ? [t.topic] : []);
            topics.forEach(topic => {
                if (!topic) return;
                topicData[topic] = (topicData[topic] || 0) + 1;
            });
        });

        const sortedKeywords = Object.entries(keywordData)
            .sort((a, b) => {
                const aRecent = a[1].recency > 0.1;
                const bRecent = b[1].recency > 0.1;
                if (aRecent !== bRecent) return bRecent - aRecent;
                return (b[1].count + b[1].recency * 2) - (a[1].count + a[1].recency * 2);
            })
            .slice(0, 12)
            .map(([word, data]) => ({ word, count: data.count, isRecent: data.recency > 0.1 }));

        setTarotKeywords(sortedKeywords);
        setTarotTopicCounts(topicData);
        console.log('[useFeed] Extracted', sortedKeywords.length, 'tarot keywords,', Object.keys(topicData).length, 'topic counts');
    };

    // 사주 피드 로드 (캐싱 적용)
    const loadSajus = useCallback(async () => {
        try {
            // 캐시 확인
            const cached = getCached(CACHE_KEYS.SAJUS_FEED);
            if (cached) {
                console.log('[useFeed] Using cached sajus');
                setFortuneReadings(cached);
                return;
            }

            const q = query(collection(db, 'sajus'), orderBy('createdAt', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            const sajus = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(f => f.isPublic === true);
            console.log('[useFeed] Loaded', sajus.length, 'public sajus');

            // 캐시 저장
            setCache(CACHE_KEYS.SAJUS_FEED, sajus, CACHE_TTL.FEED);
            setFortuneReadings(sajus);
        } catch (e) {
            console.error('Failed to load sajus:', e);
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
        // 5분마다 핫 랭킹 리프레시 (Firebase 비용 최적화)
        const interval = setInterval(loadHotDreams, 300000);
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
        // 3분마다 라이브 스토리 리프레시 (Firebase 비용 최적화)
        const interval = setInterval(loadLiveStories, 180000);
        return () => clearInterval(interval);
    }, []);

    // 온라인 카운트 시뮬레이션 (Firebase 사용 안함, 1분 간격)
    useEffect(() => {
        const updateOnline = () => setOnlineCount(Math.floor(Math.random() * 50) + 80);
        updateOnline();
        const interval = setInterval(updateOnline, 60000);
        return () => clearInterval(interval);
    }, []);

    // 초기 로드 플래그
    const initialLoadDone = useRef(false);

    // 초기 로드 시 모든 피드 로드
    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            loadDreams();
            loadTarots();
            loadSajus();
        }
    }, [loadDreams, loadTarots, loadSajus]);

    // 모드별 피드 리프레시 (모드 변경 시)
    const prevMode = useRef(mode);
    useEffect(() => {
        if (prevMode.current !== mode) {
            prevMode.current = mode;
            if (mode === 'dream') loadDreams();
            else if (mode === 'tarot') loadTarots();
            else if (mode === 'saju') loadSajus();
        }
    }, [mode, loadDreams, loadTarots, loadSajus]);

    // ref 업데이트
    loadDreamsRef.current = loadDreams;
    loadTarotsRef.current = loadTarots;
    loadFortunesRef.current = loadSajus;

    return {
        // 피드 데이터
        dreams,
        hotDreams,
        liveDreamStories,
        tarotReadings,
        fortuneReadings,
        popularKeywords,
        tarotKeywords,
        tarotTopicCounts,
        typeCounts,
        todayStats,
        onlineCount,
        loading,
        // 로드 함수
        loadDreams,
        loadTarots,
        loadSajus,
        // ref (콜백용)
        loadDreamsRef,
        loadTarotsRef,
        loadFortunesRef,
        loadMyDreamsRef
    };
};
