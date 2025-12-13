import { useState, useRef, useEffect, useCallback } from 'react';
import { HISTORY_LIMITS } from '../../utils/aiConfig';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import OptimizedImage from '../common/OptimizedImage';

// 카테고리별 이모지
const TOPIC_EMOJI = {
    '사랑': '💕',
    '관계': '🙌',
    '돈': '💰',
    '성장': '🌱',
    '건강': '💪',
    '선택': '⚖️',
    '일반': '💬',
};

// 카테고리 정규화
const VALID_TOPICS = ['사랑', '관계', '돈', '성장', '건강', '선택', '일반'];
const CATEGORY_MAP = {
    '금전': '돈', '재물': '돈', '직장': '성장', '커리어': '성장',
    '취업': '성장', '시험': '성장', '연애': '사랑', '이별': '사랑',
    '결혼': '사랑', '가족': '관계', '친구': '관계', '대인관계': '관계',
    '운세': '일반', '기타': '일반',
};
const normalizeCategory = (topic) => {
    if (!topic) return '일반';
    if (VALID_TOPICS.includes(topic)) return topic;
    return CATEGORY_MAP[topic] || '일반';
};

// 시간 포맷팅
const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

// 리딩 액션 모달 (공개 설정, 삭제, 프로필 사진 설정)
const ReadingActionModal = ({ isOpen, onClose, item, type, onUpdate, onDelete, onSetProfilePhoto }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [toast, setToast] = useState(null);
    const initialVisibility = item?.visibility || (item?.isPublic ? 'public' : 'private');
    const [selectedVisibility, setSelectedVisibility] = useState(initialVisibility);

    // 프로필 사진 선택 관련 state
    const [showPhotoPicker, setShowPhotoPicker] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 }); // % 기준
    const [zoom, setZoom] = useState(1); // 1 = 100%, 범위: 1~5
    const [isDragging, setIsDragging] = useState(false);
    const cropperRef = useRef(null);

    // item이 변경되면 초기화
    useEffect(() => {
        if (item) {
            setSelectedVisibility(item.visibility || (item.isPublic ? 'public' : 'private'));
            setShowPhotoPicker(false);
            setSelectedPhoto(null);
            setCropPosition({ x: 50, y: 50 });
            setZoom(1);
        }
    }, [item]);

    // 리딩에서 이미지 추출
    const getReadingImages = () => {
        if (!item) return [];
        const images = [];

        // 타로
        if (item.heroImage) images.push({ url: item.heroImage, label: '대표' });
        if (item.card1Image) images.push({ url: item.card1Image, label: '카드1' });
        if (item.card2Image) images.push({ url: item.card2Image, label: '카드2' });
        if (item.card3Image) images.push({ url: item.card3Image, label: '카드3' });
        if (item.conclusionImage) images.push({ url: item.conclusionImage, label: '결론' });

        // 꿈 (dreamImage)
        if (item.dreamImage) images.push({ url: item.dreamImage, label: '꿈' });

        // 사주 (morningImage 등)
        if (item.morningImage) images.push({ url: item.morningImage, label: '오전' });
        if (item.afternoonImage) images.push({ url: item.afternoonImage, label: '오후' });
        if (item.eveningImage) images.push({ url: item.eveningImage, label: '저녁' });

        return images;
    };

    // 드래그 핸들러 (상대적 이동)
    const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });

    const handleDragStart = (e) => {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartRef.current = {
            x: clientX,
            y: clientY,
            cropX: cropPosition.x,
            cropY: cropPosition.y
        };
        setIsDragging(true);
    };

    const handleDragMove = (e) => {
        if (!isDragging || !cropperRef.current) return;

        const rect = cropperRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // 드래그 시작점에서 얼마나 이동했는지 계산 (% 단위)
        const deltaX = ((clientX - dragStartRef.current.x) / rect.width) * 100;
        const deltaY = ((clientY - dragStartRef.current.y) / rect.height) * 100;

        // 드래그 방향과 반대로 이미지 이동 (자연스러운 패닝)
        let x = dragStartRef.current.cropX - deltaX;
        let y = dragStartRef.current.cropY - deltaY;

        // 0~100 범위로 제한
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        setCropPosition({ x, y });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // 프로필 사진 저장
    const handleSaveProfilePhoto = async () => {
        if (selectedPhoto && onSetProfilePhoto) {
            await onSetProfilePhoto(selectedPhoto.url, { ...cropPosition, zoom });
            setToast('프로필 사진이 설정되었어요');
            setTimeout(() => {
                setToast(null);
                setShowPhotoPicker(false);
                setSelectedPhoto(null);
                setZoom(1);
            }, 1500);
        }
    };

    if (!isOpen || !item) return null;

    const handleVisibilitySelect = (newVisibility) => {
        setSelectedVisibility(newVisibility);

        // 링크 공유 선택 시 클립보드에 URL 복사
        if (newVisibility === 'link') {
            const baseUrl = window.location.origin;
            const path = type === 'tarot' ? 'tarot' : type === 'dream' ? 'dream' : 'fortune';
            const url = `${baseUrl}/${path}/${item.id}`;

            try {
                navigator.clipboard.writeText(url);
                setToast('링크가 복사 되었어요');
                setTimeout(() => setToast(null), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    const handleSave = async () => {
        // visibility 업데이트
        await onUpdate?.(type, item.id, selectedVisibility);
        onClose();
    };

    const handleDelete = async () => {
        await onDelete?.(type, item.id, item);
        setShowDeleteConfirm(false);
        onClose();
    };

    const getTypeLabel = () => {
        if (type === 'tarot') return '타로 리딩';
        if (type === 'dream') return '꿈 해몽';
        if (type === 'fortune') return '사주';
        return '리딩';
    };

    return (
        <div className="reading-action-modal-overlay" onClick={onClose}>
            <div className="reading-action-modal" onClick={e => e.stopPropagation()}>
                <header className="reading-action-modal-header">
                    <h2>리딩 설정</h2>
                    <button className="reading-action-modal-close" onClick={onClose}>×</button>
                </header>

                <div className="reading-action-modal-body">
                    {/* 프로필 사진 설정 섹션 */}
                    <section className="action-group">
                        <h3 className="action-group-title">프로필 사진 설정</h3>
                        {!showPhotoPicker ? (
                            <button
                                className="visibility-option profile-photo-option"
                                onClick={() => setShowPhotoPicker(true)}
                            >
                                <span className="option-icon">📷</span>
                                <div className="option-info">
                                    <span className="option-label">프로필 사진 변경</span>
                                    <span className="option-desc">리딩 이미지를 프로필 사진으로 쓰기</span>
                                </div>
                            </button>
                        ) : (
                            <div className="profile-photo-picker">
                                <div className="photo-picker-header">
                                    <span>이미지 선택</span>
                                    <button className="picker-close" onClick={() => {
                                        setShowPhotoPicker(false);
                                        setSelectedPhoto(null);
                                    }}>×</button>
                                </div>

                                {/* 이미지 썸네일 목록 */}
                                <div className="photo-thumbnails">
                                    {getReadingImages().map((img, idx) => (
                                        <button
                                            key={idx}
                                            className={`photo-thumb ${selectedPhoto?.url === img.url ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedPhoto(img);
                                                setCropPosition({ x: 50, y: 50 });
                                                setZoom(1);
                                            }}
                                        >
                                            <OptimizedImage src={img.url} size="medium" alt={img.label} loading="lazy" />
                                        </button>
                                    ))}
                                </div>

                                {/* Crop 영역 */}
                                {selectedPhoto && (
                                    <div className="photo-crop-container">
                                        <p className="crop-instruction">드래그로 위치, 슬라이더로 확대/축소</p>
                                        <div
                                            ref={cropperRef}
                                            className="photo-cropper"
                                            onMouseDown={handleDragStart}
                                            onMouseMove={handleDragMove}
                                            onMouseUp={handleDragEnd}
                                            onMouseLeave={handleDragEnd}
                                            onTouchStart={handleDragStart}
                                            onTouchMove={handleDragMove}
                                            onTouchEnd={handleDragEnd}
                                            style={{
                                                backgroundImage: `url(${getOptimizedImageUrl(selectedPhoto.url, { size: 'medium' })})`,
                                                backgroundPosition: `${cropPosition.x}% ${cropPosition.y}%`,
                                                backgroundSize: `${zoom * 177.78}% auto`
                                            }}
                                        >
                                            <div className="crop-circle-center" />
                                        </div>

                                        {/* Zoom 슬라이더 */}
                                        <div className="zoom-slider-container">
                                            <span className="zoom-label">🔍</span>
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                step="0.1"
                                                value={zoom}
                                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                                className="zoom-slider"
                                            />
                                            <span className="zoom-value">{Math.round(zoom * 100)}%</span>
                                        </div>

                                        {/* 미리보기 */}
                                        <div className="crop-preview">
                                            <span className="preview-label">미리보기</span>
                                            <div
                                                className="preview-avatar"
                                                style={{
                                                    backgroundImage: `url(${getOptimizedImageUrl(selectedPhoto.url, { size: 'medium' })})`,
                                                    backgroundPosition: `${cropPosition.x}% ${cropPosition.y}%`,
                                                    backgroundSize: `${zoom * 177.78}% auto`
                                                }}
                                            />
                                        </div>

                                        <button
                                            className="btn-set-profile"
                                            onClick={handleSaveProfilePhoto}
                                        >
                                            프로필 사진 설정
                                        </button>
                                    </div>
                                )}

                                {/* 토스트 */}
                                {toast && (
                                    <div className="action-toast photo-toast">
                                        {toast}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 공개 설정 섹션 */}
                    <section className="action-group">
                        <h3 className="action-group-title">공개 설정</h3>
                        <div className="visibility-options">
                            <button
                                className={`visibility-option ${selectedVisibility === 'public' ? 'active' : ''}`}
                                onClick={() => handleVisibilitySelect('public')}
                            >
                                <span className="option-icon">🌐</span>
                                <div className="option-info">
                                    <span className="option-label">전체 공개</span>
                                    <span className="option-desc">모든 사용자가 볼 수 있어요</span>
                                </div>
                                {selectedVisibility === 'public' && <span className="option-check">✓</span>}
                            </button>
                            <div className="visibility-option-wrapper">
                                <button
                                    className={`visibility-option ${selectedVisibility === 'link' ? 'active' : ''}`}
                                    onClick={() => handleVisibilitySelect('link')}
                                >
                                    <span className="option-icon">🔗</span>
                                    <div className="option-info">
                                        <span className="option-label">링크 공유</span>
                                        <span className="option-desc">링크가 있는 사람만 볼 수 있어요</span>
                                    </div>
                                    {selectedVisibility === 'link' && <span className="option-check">✓</span>}
                                </button>
                                {/* 토스트 - 링크 공유 버튼 아래에 표시 */}
                                {toast && (
                                    <div className="action-toast">
                                        {toast}
                                    </div>
                                )}
                            </div>
                            <button
                                className={`visibility-option ${selectedVisibility === 'private' ? 'active' : ''}`}
                                onClick={() => handleVisibilitySelect('private')}
                            >
                                <span className="option-icon">🔒</span>
                                <div className="option-info">
                                    <span className="option-label">비공개</span>
                                    <span className="option-desc">나만 볼 수 있어요</span>
                                </div>
                                {selectedVisibility === 'private' && <span className="option-check">✓</span>}
                            </button>

                            {/* 삭제 옵션 */}
                            {!showDeleteConfirm ? (
                                <button
                                    className="visibility-option delete-option"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <span className="option-icon">🗑️</span>
                                    <div className="option-info">
                                        <span className="option-label delete-label">삭제하기</span>
                                        <span className="option-desc">이 {getTypeLabel()}을 삭제해요</span>
                                    </div>
                                </button>
                            ) : (
                                <div className="delete-confirm-inline">
                                    <p>정말 삭제하시겠어요?</p>
                                    <div className="delete-confirm-actions">
                                        <button className="confirm-cancel" onClick={() => setShowDeleteConfirm(false)}>취소</button>
                                        <button className="confirm-delete" onClick={handleDelete}>삭제</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 푸터 - 저장 버튼 */}
                <footer className="reading-action-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>취소</button>
                    <button className="btn-save" onClick={handleSave}>저장</button>
                </footer>
            </div>
        </div>
    );
};

// 더보기 버튼 (...) - 클릭 시 액션 모달 열기
const MoreButton = ({ onClick }) => {
    return (
        <button
            className="more-btn"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            ⋯
        </button>
    );
};

const MyReadingsView = ({
    user,
    myDreams = [],
    myTarots = [],
    myFortunes = [],
    dreamTypes = {},
    onOpenDreamDetail,
    onOpenTarotDetail,
    onOpenFortuneDetail,
    onUpdateVisibility,
    onDeleteDream,
    onDeleteTarot,
    onDeleteFortune,
    onSetProfilePhoto,
    tier = 'free',
    onOpenPremium,
    onCreateClick, // 시작하기 버튼 클릭 시
    onLogin // 로그인 모달 열기
}) => {
    const [category, setCategory] = useState('tarot');
    const [actionModal, setActionModal] = useState({ isOpen: false, item: null, type: null });
    const historyLimit = HISTORY_LIMITS[tier] || HISTORY_LIMITS.free;

    // 액션 모달 열기
    const openActionModal = (item, type) => {
        setActionModal({ isOpen: true, item, type });
    };

    // 액션 모달 닫기
    const closeActionModal = () => {
        setActionModal({ isOpen: false, item: null, type: null });
    };

    // 통합 삭제 핸들러
    const handleDelete = async (type, id, item) => {
        if (type === 'dream' && onDeleteDream) {
            await onDeleteDream(id, item);
        } else if (type === 'tarot' && onDeleteTarot) {
            await onDeleteTarot(id, item);
        } else if (type === 'fortune' && onDeleteFortune) {
            await onDeleteFortune(id, item);
        }
    };

    // 로그인 안됐으면 로그인 유도
    if (!user) {
        return (
            <div className="my-readings-view">
                <div className="feed-empty-state tarot-mode">
                    <div className="empty-illustration">
                        <span className="empty-emoji">💜</span>
                        <div className="empty-sparkles tarot-sparkles">
                            <span>✦</span>
                            <span>✧</span>
                            <span>✦</span>
                        </div>
                    </div>
                    <h3 className="empty-title">내 리딩을 모아보세요</h3>
                    <p className="empty-subtitle">로그인하면 리딩 기록을 저장하고 관리할 수 있어요</p>
                    <button
                        className="empty-action-btn tarot-btn"
                        onClick={onLogin}
                    >
                        <span>🔮</span>
                        <span>시작하기</span>
                    </button>
                </div>
            </div>
        );
    }

    // 타로 카드 렌더링 - FeedView compact 스타일 완전 동일
    const renderTarotCard = (tarot, index) => {
        const isLocked = index >= historyLimit;
        const rawTopics = tarot.topics || (tarot.topic ? [tarot.topic] : []);
        const mainTopic = normalizeCategory(rawTopics[0]);
        const topicEmoji = TOPIC_EMOJI[mainTopic] || '💬';
        const thumbSrc = tarot.heroImage || tarot.pastImage || tarot.card1Image;
        const question = tarot.question || '타로 리딩';
        const answer = tarot.title;

        if (isLocked) {
            return (
                <div key={tarot.id} className="feed-card-compact locked-card" onClick={onOpenPremium}>
                    <div className="compact-thumb">
                        <div className="compact-thumb-placeholder locked">🔒</div>
                    </div>
                    <div className="compact-content">
                        <p className="locked-text">프리미엄으로 확인</p>
                    </div>
                </div>
            );
        }

        return (
            <div
                key={tarot.id}
                className="feed-card-compact tarot-card"
                onClick={() => onOpenTarotDetail?.(tarot)}
            >
                <div className="compact-thumb">
                    {thumbSrc ? (
                        <OptimizedImage src={thumbSrc} size="medium" alt="" loading="lazy" />
                    ) : (
                        <div className="compact-thumb-placeholder">🔮</div>
                    )}
                </div>
                <div className="compact-content">
                    <div className="compact-header">
                        <div className="compact-meta">
                            <span className="compact-topic">{topicEmoji} {mainTopic}</span>
                            <span className="compact-time">• {formatTime(tarot.createdAt)}</span>
                        </div>
                        <MoreButton onClick={() => openActionModal(tarot, 'tarot')} />
                    </div>
                    <h3 className="compact-title compact-question">{question}</h3>
                    {answer && <p className="compact-answer">{answer}</p>}
                </div>
            </div>
        );
    };

    // 꿈 카드 렌더링 - FeedView compact 스타일 완전 동일
    const renderDreamCard = (dream, index) => {
        const isLocked = index >= historyLimit;
        const dreamType = dreamTypes[dream.dreamType];

        if (isLocked) {
            return (
                <div key={dream.id} className="feed-card-compact locked-card" onClick={onOpenPremium}>
                    <div className="compact-thumb">
                        <div className="compact-thumb-placeholder locked">🔒</div>
                    </div>
                    <div className="compact-content">
                        <p className="locked-text">프리미엄으로 확인</p>
                    </div>
                </div>
            );
        }

        return (
            <div
                key={dream.id}
                className="feed-card-compact dream-card"
                onClick={() => onOpenDreamDetail?.(dream)}
            >
                <div className="compact-thumb">
                    {dream.dreamImage ? (
                        <OptimizedImage src={dream.dreamImage} size="medium" alt="" loading="lazy" />
                    ) : (
                        <div className="compact-thumb-placeholder">{dreamType?.emoji || '🌙'}</div>
                    )}
                </div>
                <div className="compact-content">
                    <div className="compact-header">
                        <div className="compact-meta">
                            <span className="compact-topic">{dreamType?.emoji || '🌙'} {dreamType?.name || '꿈'}</span>
                            <span className="compact-time">• {formatTime(dream.createdAt)}</span>
                        </div>
                        <MoreButton onClick={() => openActionModal(dream, 'dream')} />
                    </div>
                    <h3 className="compact-title">{dream.title || '꿈 해몽'}</h3>
                </div>
            </div>
        );
    };

    // 사주 카드 렌더링 - FeedView compact 스타일 완전 동일
    const renderFortuneCard = (fortune, index) => {
        const isLocked = index >= historyLimit;
        const thumbImage = getOptimizedImageUrl(fortune.morningImage, { size: 'medium' });

        if (isLocked) {
            return (
                <div key={fortune.id} className="feed-card-compact locked-card" onClick={onOpenPremium}>
                    <div className="compact-thumb">
                        <div className="compact-thumb-placeholder locked">🔒</div>
                    </div>
                    <div className="compact-content">
                        <p className="locked-text">프리미엄으로 확인</p>
                    </div>
                </div>
            );
        }

        return (
            <div
                key={fortune.id}
                className="feed-card-compact fortune-card"
                onClick={() => onOpenFortuneDetail?.(fortune)}
            >
                <div className="compact-thumb">
                    {thumbImage ? (
                        <img src={thumbImage} alt="" loading="lazy" />
                    ) : (
                        <div className="compact-thumb-placeholder">☀️</div>
                    )}
                </div>
                <div className="compact-content">
                    <div className="compact-header">
                        <div className="compact-meta">
                            <span className="compact-topic">☀️ 사주</span>
                            <span className="compact-time">• {formatTime(fortune.createdAt)}</span>
                        </div>
                        <MoreButton onClick={() => openActionModal(fortune, 'fortune')} />
                    </div>
                    <h3 className="compact-title">{fortune.title || '오늘의 운세'}</h3>
                    {fortune.verdict && <p className="compact-answer">{fortune.verdict}</p>}
                </div>
            </div>
        );
    };

    // 빈 상태 - FeedView 스타일과 완전 동일
    const renderEmptyState = () => {
        const emptyStates = {
            tarot: {
                emoji: '🔮',
                title: '아직 타로 리딩이 없어요',
                subtitle: '카드가 당신을 기다리고 있어요',
                btnText: '타로 보기',
                btnEmoji: '🔮',
                btnClass: 'tarot-btn'
            },
            dream: {
                emoji: '🌙',
                title: '아직 꿈 해몽이 없어요',
                subtitle: '어젯밤 꿈을 풀어보세요!',
                btnText: '꿈 풀이 보기',
                btnEmoji: '🌙',
                btnClass: 'dream-btn'
            },
            fortune: {
                emoji: '🔮',
                title: '아직 사주가 없어요',
                subtitle: '오늘의 사주를 확인해보세요',
                btnText: '사주 보기',
                btnEmoji: '☀️',
                btnClass: 'fortune-btn'
            }
        };
        const state = emptyStates[category];

        return (
            <div className={`feed-empty-state ${category}-mode`}>
                <div className="empty-illustration">
                    <span className="empty-emoji">{state.emoji}</span>
                    <div className={`empty-sparkles ${category}-sparkles`}>
                        <span>✦</span>
                        <span>✧</span>
                        <span>✦</span>
                    </div>
                </div>
                <h3 className="empty-title">{state.title}</h3>
                <p className="empty-subtitle">{state.subtitle}</p>
                <button
                    className={`empty-action-btn ${state.btnClass || ''}`}
                    onClick={() => onCreateClick?.(category)}
                >
                    <span>{state.btnEmoji}</span>
                    <span>{state.btnText}</span>
                </button>
            </div>
        );
    };

    // 현재 카테고리의 데이터
    const getCurrentData = () => {
        switch (category) {
            case 'tarot': return myTarots;
            case 'dream': return myDreams;
            case 'fortune': return myFortunes;
            default: return [];
        }
    };

    const currentData = getCurrentData();

    return (
        <div className="my-readings-view">
            {/* 헤더 */}
            <div className="my-readings-header">
                <h1 className="my-readings-title">내 리딩</h1>
                <p className="my-readings-count">총 {myTarots.length + myDreams.length + myFortunes.length}개</p>
            </div>

            {/* 카테고리 탭 - 시작 페이지 스타일 */}
            <div className="my-readings-tabs">
                <button
                    className={`tab-btn ${category === 'tarot' ? 'active' : ''}`}
                    data-mode="tarot"
                    onClick={() => setCategory('tarot')}
                >
                    <span className="tab-emoji">🔮</span>
                    <span className="tab-label">타로</span>
                    <span className="tab-count">{myTarots.length}</span>
                </button>
                <button
                    className={`tab-btn ${category === 'dream' ? 'active' : ''}`}
                    data-mode="dream"
                    onClick={() => setCategory('dream')}
                >
                    <span className="tab-emoji">🌙</span>
                    <span className="tab-label">꿈</span>
                    <span className="tab-count">{myDreams.length}</span>
                </button>
                <button
                    className={`tab-btn ${category === 'fortune' ? 'active' : ''}`}
                    data-mode="fortune"
                    onClick={() => setCategory('fortune')}
                >
                    <span className="tab-emoji">☀️</span>
                    <span className="tab-label">사주</span>
                    <span className="tab-count">{myFortunes.length}</span>
                </button>
            </div>

            {/* 리딩 목록 - feed-compact 스타일 사용 */}
            <div className="feed-compact my-readings-list">
                {currentData.length === 0 ? (
                    renderEmptyState()
                ) : (
                    currentData.map((item, index) => {
                        if (category === 'tarot') return renderTarotCard(item, index);
                        if (category === 'dream') return renderDreamCard(item, index);
                        if (category === 'fortune') return renderFortuneCard(item, index);
                        return null;
                    })
                )}
            </div>

            {/* 액션 모달 */}
            <ReadingActionModal
                isOpen={actionModal.isOpen}
                onClose={closeActionModal}
                item={actionModal.item}
                type={actionModal.type}
                onUpdate={onUpdateVisibility}
                onDelete={handleDelete}
                onSetProfilePhoto={onSetProfilePhoto}
            />
        </div>
    );
};

export default MyReadingsView;
