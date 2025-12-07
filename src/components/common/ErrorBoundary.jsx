import { Component } from 'react';

/**
 * 에러 바운더리 컴포넌트
 * 자식 컴포넌트에서 발생한 에러를 잡아 친근한 UI로 표시
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        // 필요시 에러 로깅 서비스에 전송
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <div className="error-emoji">😵‍💫</div>
                        <h2 className="error-title">앗, 문제가 발생했어요</h2>
                        <p className="error-message">
                            일시적인 오류가 발생했습니다.<br/>
                            잠시 후 다시 시도해주세요.
                        </p>
                        <div className="error-actions">
                            <button className="error-retry" onClick={this.handleRetry}>
                                🔄 다시 시도
                            </button>
                            <button className="error-home" onClick={this.handleGoHome}>
                                🏠 홈으로
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>개발자 정보</summary>
                                <pre>{this.state.error?.toString()}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
