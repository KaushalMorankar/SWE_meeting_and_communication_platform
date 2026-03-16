import { FC } from 'react';
import Icon from './Icon';
import { PinIcon, ThumbsUpIcon, ThumbsDownIcon, MinusSignIcon } from '@hugeicons/core-free-icons';

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: string;
}

interface TranscriptFeedProps {
  transcripts: TranscriptEntry[];
}

const sentimentConfig: { [key: string]: any } = {
  positive: { icon: ThumbsUpIcon, class: 'sentiment-positive', label: 'Positive' },
  neutral: { icon: MinusSignIcon, class: 'sentiment-neutral', label: 'Neutral' },
  negative: { icon: ThumbsDownIcon, class: 'sentiment-negative', label: 'Negative' },
};

const TranscriptFeed: FC<TranscriptFeedProps> = ({ transcripts }) => {
  return (
    <div className="transcript-panel panel">
      <div className="section-header">
        <span className="section-title">📝 Live Transcript</span>
        <span className="chip chip-emerald" style={{ fontSize: '10px' }}>● LIVE</span>
      </div>

      <div className="transcript-list">
        {transcripts.map((entry, index) => {
          const sentiment = sentimentConfig[entry.sentiment] || sentimentConfig.neutral;

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
                    <Icon icon={sentiment.icon} size={10} />
                    {sentiment.label}
                  </span>
                </div>
              </div>

              <p className="transcript-text">{entry.text}</p>

              <div className="transcript-actions">
                <button className="transcript-action-btn" id={`pin-${entry.id}`}>
                  <Icon icon={PinIcon} size={12} />
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
};

export default TranscriptFeed;
