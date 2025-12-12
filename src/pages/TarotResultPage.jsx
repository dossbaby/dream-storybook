import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TarotResultView from '../components/tarot/TarotResultView';

/**
 * 타로 결과 공유 페이지 - /tarot/:id 라우트용
 * Firebase에서 데이터를 가져와 TarotResultView에 전달
 */
const TarotResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tarotResult, setTarotResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTarotResult = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'tarots', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };

                    // visibility 기반 접근 권한 체크
                    // public: 모두 접근 가능
                    // link (unlisted): 링크가 있으면 접근 가능
                    // private: 본인만 접근 가능 (링크 있어도 차단)
                    const visibility = data.visibility || (data.isPublic ? 'public' : 'private');

                    if (visibility === 'private') {
                        setError('비공개 콘텐츠입니다');
                        return;
                    }

                    setTarotResult(data);
                } else {
                    setError('타로 리딩을 찾을 수 없습니다');
                }
            } catch (err) {
                console.error('타로 결과 로드 실패:', err);
                setError('타로 결과를 불러오는데 실패했습니다');
            } finally {
                setLoading(false);
            }
        };

        fetchTarotResult();
    }, [id]);

    // 로딩 상태
    if (loading) {
        return (
            <div className="seo-page loading">
                <div className="loading-spinner">🔮</div>
                <p>타로 리딩 불러오는 중...</p>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="seo-page error">
                <h1>{error}</h1>
                <button onClick={() => navigate('/')} className="back-home">
                    홈으로 돌아가기
                </button>
            </div>
        );
    }

    // TarotResultView 렌더링
    return (
        <TarotResultView
            tarotResult={tarotResult}
            onBack={() => navigate('/')}
            onRestart={() => navigate('/')}
            // 공유 페이지에서는 일부 기능 비활성화
            user={null}
            userNickname={null}
            onLoginRequired={() => {}}
            onUpdateVisibility={null}
            showToast={() => {}}
        />
    );
};

export default TarotResultPage;
