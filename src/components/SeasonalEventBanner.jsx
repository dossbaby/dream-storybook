/**
 * 시즌 이벤트 배너 컴포넌트
 *
 * 기능:
 * - 현재 진행 중인 이벤트 표시
 * - 이벤트 보너스 클레임
 * - 애니메이션 효과
 */

import React, { useState, useEffect } from 'react';
import {
    getCurrentEvent,
    getEventThemeStyles,
    canClaimEventBonus,
    markEventBonusClaimed
} from '../utils/seasonalEvents';
import { useAuth } from '../hooks/useAuth';

const SeasonalEventBanner = ({ onClaimBonus, compact = false }) => {
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [canClaim, setCanClaim] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const currentEvent = getCurrentEvent();
        setEvent(currentEvent);

        if (currentEvent && user?.uid) {
            setCanClaim(canClaimEventBonus(user.uid, currentEvent.id));
        }
    }, [user?.uid]);

    const handleClaim = async () => {
        if (!event || !canClaim || !user?.uid) return;

        try {
            // 보너스 적용 콜백 호출
            if (onClaimBonus) {
                await onClaimBonus(event.bonus);
            }

            // 클레임 기록
            markEventBonusClaimed(user.uid, event.id);
            setClaimed(true);
            setCanClaim(false);
        } catch (error) {
            console.error('이벤트 보너스 클레임 실패:', error);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!event || !isVisible) return null;

    const themeStyles = getEventThemeStyles(event);

    // 컴팩트 모드 (사이드바용)
    if (compact) {
        return (
            <div
                className="event-banner-compact"
                style={themeStyles}
            >
                <div className="event-compact-content">
                    <span className="event-emoji">{event.emoji}</span>
                    <div className="event-compact-info">
                        <span className="event-name">{event.name}</span>
                        {canClaim && (
                            <button
                                className="event-claim-btn-small"
                                onClick={handleClaim}
                            >
                                보너스 받기
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 풀 배너 모드
    return (
        <div
            className={`event-banner ${event.theme} ${claimed ? 'claimed' : ''}`}
            style={themeStyles}
        >
            <button
                className="event-dismiss"
                onClick={handleDismiss}
                aria-label="닫기"
            >
                ×
            </button>

            <div className="event-banner-content">
                <div className="event-visual">
                    <span className="event-emoji-large">{event.emoji}</span>
                    <div className="event-sparkles">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className="sparkle" />
                        ))}
                    </div>
                </div>

                <div className="event-info">
                    <h3 className="event-title">{event.name}</h3>
                    <p className="event-description">{event.description}</p>

                    {event.bonus && (
                        <div className="event-bonus-info">
                            <span className="bonus-icon">🎁</span>
                            <span className="bonus-text">{event.bonus.message}</span>
                        </div>
                    )}
                </div>

                {canClaim && !claimed && (
                    <button
                        className="event-claim-btn"
                        onClick={handleClaim}
                    >
                        <span className="claim-text">선물 받기</span>
                        <span className="claim-icon">→</span>
                    </button>
                )}

                {claimed && (
                    <div className="event-claimed-badge">
                        <span className="check-icon">✓</span>
                        <span>선물을 받았어요!</span>
                    </div>
                )}
            </div>

            {/* 배경 장식 */}
            <div className="event-decoration">
                {event.theme === 'christmas' && (
                    <>
                        <span className="deco deco-1">❄️</span>
                        <span className="deco deco-2">⭐</span>
                        <span className="deco deco-3">🎅</span>
                    </>
                )}
                {event.theme === 'lunar' && (
                    <>
                        <span className="deco deco-1">🧧</span>
                        <span className="deco deco-2">🏮</span>
                        <span className="deco deco-3">🎊</span>
                    </>
                )}
                {event.theme === 'valentine' && (
                    <>
                        <span className="deco deco-1">💖</span>
                        <span className="deco deco-2">💝</span>
                        <span className="deco deco-3">💗</span>
                    </>
                )}
                {event.theme === 'halloween' && (
                    <>
                        <span className="deco deco-1">👻</span>
                        <span className="deco deco-2">🦇</span>
                        <span className="deco deco-3">🕷️</span>
                    </>
                )}
                {event.theme === 'chuseok' && (
                    <>
                        <span className="deco deco-1">🌾</span>
                        <span className="deco deco-2">🎑</span>
                        <span className="deco deco-3">🥮</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default SeasonalEventBanner;
