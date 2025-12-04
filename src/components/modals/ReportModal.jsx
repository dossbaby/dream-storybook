const ReportModal = ({ isOpen, onClose, loading, report }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="report-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h3>🔮 AI 꿈 패턴 분석</h3>
                {loading ? (
                    <div className="report-loading">
                        <div className="report-spinner"></div>
                        <p>꿈을 분석하는 중...</p>
                    </div>
                ) : report && (
                    <div className="report-content">
                        <div className="report-section">
                            <h4>📋 전반적 분석</h4>
                            <p>{report.overall}</p>
                        </div>
                        <div className="report-section">
                            <h4>🔍 발견된 패턴</h4>
                            <ul>
                                {report.patterns?.map((p, i) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="report-section">
                            <h4>💭 감정 상태</h4>
                            <p>{report.emotionalState}</p>
                        </div>
                        <div className="report-section">
                            <h4>💡 조언</h4>
                            <p>{report.advice}</p>
                        </div>
                        {report.luckySymbol && (
                            <div className="report-lucky">
                                <span className="lucky-emoji">{report.luckySymbol.emoji}</span>
                                <div className="lucky-info">
                                    <span className="lucky-label">행운의 상징</span>
                                    <span className="lucky-name">{report.luckySymbol.name}</span>
                                    <span className="lucky-reason">{report.luckySymbol.reason}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
