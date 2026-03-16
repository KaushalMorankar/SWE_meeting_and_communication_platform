import { FC, useState } from 'react';

interface PollVotingProps {
  meetingId: string;
  onClose: () => void;
}

const PollVoting: FC<PollVotingProps> = ({ meetingId, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const pollOptions = [
    { id: '1', text: 'Option 1', votes: 15 },
    { id: '2', text: 'Option 2', votes: 8 },
    { id: '3', text: 'Option 3', votes: 12 },
    { id: '4', text: 'Option 4', votes: 5 },
  ];

  const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = () => {
    if (selectedOption) {
      // Send vote to server
      console.log(`Voted for option ${selectedOption} in meeting ${meetingId}`);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ marginTop: 0 }}>Vote on Poll</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pollOptions.map((option) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="poll"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div>{option.text}</div>
                    <div style={{
                      height: '4px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: 'var(--accent-blue)',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {option.votes} votes ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleVote}
            disabled={!selectedOption}
          >
            Submit Vote
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollVoting;
