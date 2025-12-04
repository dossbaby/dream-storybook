const LoadingOverlay = ({ isVisible, phase, progress }) => {
    if (!isVisible) return null;

    const getPhaseIcon = () => {
        if (phase <= 3) return '🔮';
        if (phase <= 4) return '📖';
        if (phase <= 5) return '🎨';
        if (phase <= 6) return '🃏';
        return '✨';
    };

    return (
        <div className="analysis-animation">
            <div className="analysis-circle">
                <div className={`analysis-ring ${phase >= 1 ? 'active' : ''}`}></div>
                <div className={`analysis-ring ring-2 ${phase >= 2 ? 'active' : ''}`}></div>
                <div className={`analysis-ring ring-3 ${phase >= 3 ? 'active' : ''}`}></div>
                <div className="analysis-core">
                    {getPhaseIcon()}
                </div>
            </div>
            <div className="analysis-text">{progress}</div>
            <div className="analysis-phases">
                {[1, 2, 3, 4, 5, 6, 7].map(p => (
                    <div key={p} className={`phase-dot ${phase >= p ? 'active' : ''} ${phase === p ? 'current' : ''}`} />
                ))}
            </div>
        </div>
    );
};

export default LoadingOverlay;
