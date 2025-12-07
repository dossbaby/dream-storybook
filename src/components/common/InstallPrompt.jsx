import { useState, useEffect } from 'react';

/**
 * PWA 설치 프롬프트 (A2HS - Add to Home Screen)
 * 모바일에서 앱 설치 유도 배너
 */
const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // iOS 감지
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        // 이미 설치됐거나 닫은 적 있으면 표시 안함
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (dismissed || isStandalone) {
            return;
        }

        // iOS는 별도 처리 (beforeinstallprompt 미지원)
        if (isIOSDevice) {
            // iOS Safari에서만 표시
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if (isSafari) {
                setTimeout(() => setShowBanner(true), 3000);
            }
            return;
        }

        // Android/Chrome beforeinstallprompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setTimeout(() => setShowBanner(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
        }

        setDeferredPrompt(null);
        setShowBanner(false);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!showBanner) return null;

    return (
        <div className="install-prompt" style={{
            position: 'fixed',
            bottom: 'calc(60px + env(safe-area-inset-bottom))',
            left: '16px',
            right: '16px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(59, 130, 246, 0.95))',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '16px',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>🔮</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        점AI 앱 설치하기
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                        {isIOS
                            ? '공유 버튼 → "홈 화면에 추가"를 눌러주세요'
                            : '홈 화면에 추가하고 빠르게 접속하세요'
                        }
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                    onClick={handleDismiss}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    나중에
                </button>
                {!isIOS && (
                    <button
                        onClick={handleInstall}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#8b5cf6',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        설치하기
                    </button>
                )}
            </div>
        </div>
    );
};

export default InstallPrompt;
