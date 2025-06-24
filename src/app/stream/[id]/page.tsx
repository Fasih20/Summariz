//src/app/stream/[id]/page.tsx

'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Peer, { MediaConnection } from 'peerjs';
import StreamQualitySelector from '@/components/StreamQualitySelector';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import Transcripts from '@/components/Transcript';

export default function Viewer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { id: streamId } = useParams();
  const router = useRouter();
  const [connectionState, setConnectionState] = useState({
    status: 'connecting' as 'connecting' | 'connected' | 'error',
    error: null as string | null,
    quality: 'auto'
  });
  const [muted, setMuted] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const dummyStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!streamId) {
      setConnectionState({
        status: 'error',
        error: 'Invalid stream ID',
        quality: 'auto'
      });
      return;
    }

    const initializeConnection = async () => {
      try {
        // Create a dummy audio stream (no video needed)
        dummyStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: true
        });

        const peer = new Peer({
          host: process.env.NEXT_PUBLIC_PEER_HOST || window.location.hostname,
          port: Number(process.env.NEXT_PUBLIC_PEER_PORT || 9000),
          path: '/peer',
          secure: true,
          debug: 3,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          console.log('Viewer peer ID:', id);
          
          if (!dummyStreamRef.current) {
            throw new Error('Dummy stream not created');
          }

          // Call the broadcaster with the dummy audio stream
          const call = peer.call(streamId as string, dummyStreamRef.current);
          callRef.current = call;

          call.on('stream', (remoteStream) => {
            console.log('Received remote stream');
            if (videoRef.current) {
              videoRef.current.srcObject = remoteStream;
              videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(e => {
                  console.error("Autoplay failed:", e);
                  setConnectionState({
                    status: 'error',
                    error: "Click to play video",
                    quality: 'auto'
                  });
                });
              };
              setConnectionState({
                status: 'connected',
                error: null,
                quality: 'auto'
              });
            }
          });

          call.on('error', (err) => {
            console.error("Call error:", err);
            setConnectionState({
              status: 'error',
              error: `Stream error: ${err.message}`,
              quality: 'auto'
            });
          });

          call.on('close', () => {
            setConnectionState({
              status: 'error',
              error: 'Stream ended by broadcaster',
              quality: 'auto'
            });
          });
        });

        peer.on('error', (err) => {
          console.error("Peer error:", err);
          setConnectionState({
            status: 'error',
            error: `Connection failed: ${err.message}`,
            quality: 'auto'
          });
        });

      } catch (err) {
        console.error("Viewer setup error:", err);
        setConnectionState({
          status: 'error',
          error: err instanceof Error ? err.message : 'Connection failed',
          quality: 'auto'
        });
      }
    };

    initializeConnection();

    return () => {
      callRef.current?.close();
      peerRef.current?.destroy();
      dummyStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [streamId]);

  const handleQualityChange = (quality: string) => {
    setConnectionState(prev => ({ ...prev, quality }));
  };

  const toggleMute = () => {
    if (videoRef.current?.srcObject) {
      const audioTracks = (videoRef.current.srcObject as MediaStream).getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setMuted(!muted);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            {connectionState.status === 'connecting' ? '🟡 Connecting...' :
             connectionState.status === 'connected' ? '✅ Watching Stream' : '❌ Error'}
          </h1>
          <StreamQualitySelector
            quality={connectionState.quality}
            onChange={handleQualityChange}
          />
        </div>

        {connectionState.error && (
          <div className="p-4 bg-red-600 text-white rounded-lg flex items-center space-x-4">
            <span>{connectionState.error}</span>
            {connectionState.error.includes("Click") ? (
              <button 
                onClick={() => videoRef.current?.play().catch(console.error)} 
                className="bg-blue-500 px-4 py-2 rounded-lg">
                Play Video
              </button>
            ) : (
              <button 
                onClick={() => router.refresh()} 
                className="bg-yellow-500 px-4 py-2 rounded-lg">
                Retry
              </button>
            )}
          </div>
        )}

        <div className="relative">
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            controls
            onClick={() => videoRef.current?.play().catch(console.error)}
            className="w-full h-72 object-cover rounded-lg shadow-lg"
          />
          <button
            onClick={toggleMute}
            className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            {muted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
          </button>
        </div>

        <Transcripts 
          stream={videoRef.current?.srcObject as MediaStream || null} 
          autoTranscribe={true}
        />

        <div className="text-center text-sm text-gray-400 mt-4">
          <p>Watching Stream: {streamId}</p>
          <p>Connection Status: {connectionState.status.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}