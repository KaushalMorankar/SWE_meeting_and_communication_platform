import { Pin, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const sentimentConfig = {
    positive: { icon: ThumbsUp, class: 'sentiment-positive', label: 'Positive' },
    neutral: { icon: Minus, class: 'sentiment-neutral', label: 'Neutral' },
    negative: { icon: ThumbsDown, class: 'sentiment-negative', label: 'Negative' },
};

export default function TranscriptFeed({ transcripts }) {
    return (
        <div className="transcript-panel panel">
            <div className="section-header">
                <span className="section-title">📝 Live Transcript</span>
                <span className="chip chip-emerald" style={{ fontSize: '10px' }}>● LIVE</span>
            </div>

            <div className="transcript-list">
                {transcripts.map((entry, index) => {
                    const sentiment = sentimentConfig[entry.sentiment] || sentimentConfig.neutral;
                    const SentimentIcon = sentiment.icon;

                    return (
                        <div
                            key={entry.id}
                            className="transcript-entry animate-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                            id={`transcript-${entry.id}`}
                        >
                            <div className="transcript-header">
                                <div className="transcript-speaker-row">
                                    <div className="transcript-avatar">
                                        {entry.speaker.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="transcript-speaker">{entry.speaker}</span>
                                        <span className="transcript-time">{entry.timestamp}</span>
                                    </div>
                                </div>
                                <div className="transcript-badges">
                                    <span className={`chip ${sentiment.class}`} style={{ padding: '2px 8px' }}>
                                        <SentimentIcon size={10} />
                                        {sentiment.label}
                                    </span>
                                </div>
                            </div>

                            <p className="transcript-text">{entry.text}</p>

                            <div className="transcript-actions">
                                <button className="transcript-action-btn" id={`pin-${entry.id}`}>
                                    <Pin size={12} />
                                    Pin Resource
                                </button>
                            </div>
                        </div>
                    );
                })}

                {transcripts.length === 0 && (
                    <div className="empty-state">
                        <p style={{ fontSize: '14px' }}>No transcript yet</p>
                        <p style={{ fontSize: '12px' }}>Start recording to see live transcription here</p>
                    </div>
                )}
            </div>

            <style>{`
        .transcript-panel {
          background: rgba(17, 24, 39, 0.4);
          display: flex;
          flex-direction: column;
        }
        .transcript-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .transcript-entry {
          padding: 12px;
          border-radius: var(--radius-sm);
          margin-bottom: 4px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .transcript-entry:hover {
          background: var(--bg-glass-hover);
          border-color: var(--border-glass);
        }
        .transcript-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .transcript-speaker-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .transcript-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gradient-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        .transcript-speaker {
          font-size: 13px;
          font-weight: 600;
          display: block;
        }
        .transcript-time {
          font-size: 11px;
          color: var(--text-muted);
        }
        .transcript-text {
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-secondary);
          padding-left: 32px;
        }
        .transcript-actions {
          display: flex;
          gap: 8px;
          padding-left: 32px;
          margin-top: 8px;
        }
        .transcript-action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .transcript-action-btn:hover {
          color: var(--accent-blue);
          background: rgba(79, 142, 247, 0.08);
        }
      `}</style>
        </div>
    );
}
