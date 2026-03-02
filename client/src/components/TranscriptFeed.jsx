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
        </div>
    );
}
