import Icon from './Icon';
import { Target01Icon, Alert01Icon, ChartIncreaseIcon } from '@hugeicons/core-free-icons';

export default function LiveOutcome() {
    return (
        <div className="live-outcome">
            <div className="section-header" style={{ borderTop: '0.0625rem solid var(--border)' }}>
                <span className="section-title">🔮 Live Outcome Preview</span>
                <span className="chip chip-violet" style={{ fontSize: '0.625rem' }}>DOPPELGANGER</span>
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
                        <Icon icon={Target01Icon} size={14} style={{ color: 'var(--accent-emerald)' }} />
                        <span>2 of 5 agenda items addressed</span>
                    </div>
                    <div className="outcome-item">
                        <Icon icon={ChartIncreaseIcon} size={14} style={{ color: 'var(--primary)' }} />
                        <span>3 action items extracted so far</span>
                    </div>
                    <div className="outcome-item">
                        <Icon icon={Alert01Icon} size={14} style={{ color: 'var(--accent-amber)' }} />
                        <span>3 topics still unaddressed</span>
                    </div>
                </div>
            </div>

            <style>{`
        .live-outcome {
          border-top: 0.0625rem solid var(--border);
        }
        .outcome-content { padding: 0.75rem 1rem; }
        .outcome-score {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .score-circle {
          position: relative; width: 4rem; height: 4rem; flex-shrink: 0;
        }
        .score-value {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 700;
        }
        .score-label { font-size: 0.8125rem; font-weight: 600; }
        .score-desc { font-size: 0.6875rem; color: var(--text-muted); }
        .outcome-items { display: flex; flex-direction: column; gap: 0.375rem; }
        .outcome-item {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.75rem; color: var(--text-secondary);
        }
      `}</style>
        </div>
    );
}
