import { useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  email: string;
}

const useTranscriptionCapture = (
  socket: Socket | null,
  meetingId: string | undefined,
  user: User | null
): void => {
  useEffect(() => {
    if (!socket || !meetingId || !user) return;

    // Set up WebRTC audio capture if needed
    const setupAudioCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Optionally emit the captured audio or transcription to the server
        socket.emit('transcription:start', { meetingId, userId: user.id });

        // Cleanup
        return () => {
          stream.getTracks().forEach(track => track.stop());
          socket.emit('transcription:stop', { meetingId, userId: user.id });
        };
      } catch (error) {
        console.error('Failed to access microphone:', error);
      }
    };

    setupAudioCapture();
  }, [socket, meetingId, user]);
};

export default useTranscriptionCapture;
