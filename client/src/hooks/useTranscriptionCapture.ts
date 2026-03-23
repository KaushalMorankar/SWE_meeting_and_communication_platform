import { useEffect } from 'react';

/** Live transcription is disabled; hook kept so callers (e.g. VideoArea) stay unchanged. */
export default function useTranscriptionCapture(
    _socket: unknown,
    _meetingId: string | null,
    _localStream: MediaStream | null
) {
    useEffect(() => {}, []);
    return { active: false, stopCapture: () => {} };
}
