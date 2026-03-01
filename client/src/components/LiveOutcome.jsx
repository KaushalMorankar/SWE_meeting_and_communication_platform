import { Eye, Target, AlertTriangle, TrendingUp } from 'lucide-react';

export default function LiveOutcome() {
    return (
        <div className="live-outcome">
            <div className="section-header" style={{ borderTop: '1px solid var(--border-glass)' }}>
                <span className="section-title">🔮 Live Outcome Preview</span>
                <span className="chip chip-violet" style={{ fontSize: '10px' }}>DOPPELGANGER</span>
            </div>

            <div className="outcome-content">
                <div className="outcome-score">
                    <div className="score-circle">
                        <svg width="64" height="64" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            <circle
                                cx="32" cy="32" r="28" fill="none"
                                stroke="url(#scoreGrad)" strokeWidth="4"
                                strokeDasharray={`${0.72 * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                                strokeLinecap="round"
                                transform="rotate(-90 32 32)"
                                style={{ transition: 'stroke-dasharray 1s ease' }}
                            />
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop stopColor="#4F8EF7" />
                                    <stop offset="1" stopColor="#34D399" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="score-value">72%</span>
                    </div>
                    <div className="score-details">
                        <div className="score-label">Outcome Quality</div>
                        <div className="score-desc">Based on agenda coverage & decisions</div>
                    </div>
                </div>

                <div className="outcome-items">
                    <div className="outcome-item">
                        <Target size={14} style={{ color: 'var(--accent-emerald)' }} />
                        <span>2 of 5 agenda items addressed</span>
                    </div>
                    <div className="outcome-item">
                        <TrendingUp size={14} style={{ color: 'var(--accent-blue)' }} />
                        <span>3 action items extracted so far</span>
                    </div>
                    <div className="outcome-item">
                        <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} />
                        <span>3 topics still unaddressed</span>
                    </div>
                </div>
            </div>

            <style>{`
        .live-outcome {
          border-top: 1px solid var(--border-glass);
        }
        .outcome-content { padding: 12px 16px; }
        .outcome-score {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 12px;
        }
        .score-circle {
          position: relative; width: 64px; height: 64px; flex-shrink: 0;
        }
        .score-value {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700;
        }
        .score-label { font-size: 13px; font-weight: 600; }
        .score-desc { font-size: 11px; color: var(--text-muted); }
        .outcome-items { display: flex; flex-direction: column; gap: 6px; }
        .outcome-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: var(--text-secondary);
        }
      `}</style>
        </div>
    );
}
