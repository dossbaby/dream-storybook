import { memo } from 'react';

const ToastNotifications = memo(({
    toasts,
    dopaminePopup
}) => {
    return (
        <>
            {/* 분석 과정 토스트 (라이브 공유 토스트 기능 삭제) */}
            {toasts.live?.type === 'analysis' && (
                <div className="live-toast analysis-toast">
                    <span className="toast-phase">{toasts.live.phase}/8</span>
                    <span className="toast-text">{toasts.live.message}</span>
                </div>
            )}

            {/* 새 꿈 유형 발견 토스트 */}
            {toasts.newType && (
                <div className="new-type-toast">
                    <div className="new-type-icon">{toasts.newType.emoji}</div>
                    <div className="new-type-info">
                        <span className="new-type-label">✨ 새로운 꿈 유형 발견!</span>
                        <span className="new-type-name">{toasts.newType.name}</span>
                        <span className="new-type-desc">{toasts.newType.desc}</span>
                    </div>
                </div>
            )}

            {/* 타로 카드 공개 토스트 */}
            {toasts.tarotReveal && (
                <div className="tarot-reveal-toast">
                    <div className="tarot-reveal-icon">🔮</div>
                    <div className="tarot-reveal-info">
                        <span className="tarot-reveal-label">당신의 타로 카드</span>
                        <span className="tarot-reveal-name">{toasts.tarotReveal.name}</span>
                        <span className="tarot-reveal-meaning">{toasts.tarotReveal.meaning}</span>
                    </div>
                </div>
            )}

            {/* 도파민 팝업은 AnalysisOverlay로 통합됨 */}

            {/* 뱃지 획득 토스트 */}
            {toasts.badge && (
                <div className="badge-toast">
                    <span className="badge-toast-emoji">{toasts.badge.emoji}</span>
                    <div className="badge-toast-info">
                        <span className="badge-toast-label">🎉 뱃지 획득!</span>
                        <span className="badge-toast-name">{toasts.badge.name}</span>
                        <span className="badge-toast-desc">{toasts.badge.desc}</span>
                    </div>
                </div>
            )}
        </>
    );
});

ToastNotifications.displayName = 'ToastNotifications';

export default ToastNotifications;
