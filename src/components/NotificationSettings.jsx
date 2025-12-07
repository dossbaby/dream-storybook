/**
 * 알림 설정 컴포넌트
 *
 * 기능:
 * - 알림 권한 요청
 * - 아침/저녁 리마인더 설정
 * - 알림 시간 선택
 * - 테스트 알림 발송
 */

import React from 'react';
import useNotifications from '../hooks/useNotifications';

const NotificationSettings = ({ compact = false }) => {
    const {
        settings,
        permission,
        isSupported,
        isEnabled,
        requestPermission,
        updateSettings,
        disableNotifications,
        sendTestNotification,
        getNextNotificationTime,
    } = useNotifications();

    // 브라우저 미지원
    if (!isSupported) {
        return compact ? null : (
            <div className="notification-settings unsupported">
                <p className="notification-unsupported">
                    이 브라우저는 알림을 지원하지 않습니다.
                </p>
            </div>
        );
    }

    const nextNotification = getNextNotificationTime();

    // 컴팩트 모드 (마이페이지용)
    if (compact) {
        return (
            <div className="notification-compact">
                <div className="notification-row">
                    <div className="notification-info">
                        <span className="notification-icon">🔔</span>
                        <span className="notification-label">알림 설정</span>
                    </div>
                    {permission === 'granted' ? (
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.enabled}
                                onChange={(e) => updateSettings({ enabled: e.target.checked })}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    ) : (
                        <button
                            className="enable-btn"
                            onClick={requestPermission}
                        >
                            허용하기
                        </button>
                    )}
                </div>
                {isEnabled && nextNotification && (
                    <p className="next-notification">
                        다음 알림: {nextNotification.time.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
            </div>
        );
    }

    // 풀 모드 (설정 페이지용)
    return (
        <div className="notification-settings">
            <div className="notification-header">
                <h3>
                    <span className="icon">🔔</span>
                    알림 설정
                </h3>
                {permission === 'denied' && (
                    <p className="permission-denied">
                        알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.
                    </p>
                )}
            </div>

            {permission !== 'granted' ? (
                <div className="permission-request">
                    <div className="permission-icon">🔕</div>
                    <h4>알림을 받아보시겠어요?</h4>
                    <p>매일 아침 오늘의 운세와 저녁에 꿈 해몽 알림을 받을 수 있어요.</p>
                    <button
                        className="request-btn"
                        onClick={requestPermission}
                    >
                        알림 허용하기
                    </button>
                </div>
            ) : (
                <div className="notification-options">
                    {/* 전체 활성화 토글 */}
                    <div className="setting-item main-toggle">
                        <div className="setting-info">
                            <span className="setting-title">알림 받기</span>
                            <span className="setting-desc">알림을 켜고 끌 수 있어요</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.enabled}
                                onChange={(e) => updateSettings({ enabled: e.target.checked })}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {settings.enabled && (
                        <>
                            {/* 아침 운세 알림 */}
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-icon">☀️</span>
                                    <div>
                                        <span className="setting-title">아침 운세 알림</span>
                                        <span className="setting-desc">매일 아침 오늘의 운세를 알려드려요</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.morningReminder}
                                        onChange={(e) => updateSettings({ morningReminder: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {settings.morningReminder && (
                                <div className="time-picker">
                                    <label>아침 알림 시간</label>
                                    <input
                                        type="time"
                                        value={settings.morningTime}
                                        onChange={(e) => updateSettings({ morningTime: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* 저녁 꿈해몽 알림 */}
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-icon">🌙</span>
                                    <div>
                                        <span className="setting-title">저녁 꿈 알림</span>
                                        <span className="setting-desc">저녁에 꿈 일기를 기록하라고 알려드려요</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.eveningReminder}
                                        onChange={(e) => updateSettings({ eveningReminder: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {settings.eveningReminder && (
                                <div className="time-picker">
                                    <label>저녁 알림 시간</label>
                                    <input
                                        type="time"
                                        value={settings.eveningTime}
                                        onChange={(e) => updateSettings({ eveningTime: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* 새 기능 알림 */}
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-icon">✨</span>
                                    <div>
                                        <span className="setting-title">새 기능/이벤트 알림</span>
                                        <span className="setting-desc">새로운 기능이나 이벤트 소식을 알려드려요</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.newFeatures}
                                        onChange={(e) => updateSettings({ newFeatures: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {/* 다음 알림 표시 */}
                            {nextNotification && (
                                <div className="next-notification-box">
                                    <span className="next-icon">⏰</span>
                                    <span>
                                        다음 알림: {nextNotification.type === 'morning' ? '아침 운세' : '저녁 꿈'}{' '}
                                        ({nextNotification.time.toLocaleTimeString('ko-KR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })})
                                    </span>
                                </div>
                            )}

                            {/* 테스트 버튼 */}
                            <button
                                className="test-notification-btn"
                                onClick={sendTestNotification}
                            >
                                🔔 테스트 알림 보내기
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationSettings;
