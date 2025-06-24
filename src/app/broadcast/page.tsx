// 'use client';
// import { useCallback, useEffect, useRef, useState } from 'react';
// import Peer from 'peerjs';
// import { generateShareableLink, generateStreamId } from '@/lib/utils';
// import { FaCopy, FaStop, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop } from 'react-icons/fa';
// import { toast } from 'react-toastify';
// import ViewersPanel from '@/components/ViewersPanel';
// import StreamControls from '@/components/StreamControls';
// import Transcripts from '@/components/Transcript';
// import StatsPanel from '@/components/StatsPanel';
// import { UserButton, useUser } from "@clerk/nextjs";
// import { Button } from '@/components/ui/button';
// import { api } from '../../../convex/_generated/api';
// import { useMutation } from 'convex/react';
// import { useRouter } from 'next/navigation';


// export default function Broadcast() {
//   const createLecture = useMutation(api.lecture.createLecture);
//   const { user } = useUser();
//   const router = useRouter();
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [hostname, setHostname] = useState('');
//   const [streamQuality, setStreamQuality] = useState<'hd' | 'sd'>('hd');
//   const [isMicMuted, setIsMicMuted] = useState(false);
//   const [isCameraOff, setIsCameraOff] = useState(false);
//   const [notes, setNotes] = useState('');
//   const [stats, setStats] = useState({
//     bitrate: 0,
//     resolution: '0x0',
//     fps: 0
//   });

//   const [streamInfo, setStreamInfo] = useState({
//     status: 'idle' as 'idle' | 'ready' | 'error',
//     viewers: 0,
//     error: null as string | null,
//     streamId: '',
//     shareLink: ''
//   });

//   const peerRef = useRef<Peer | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const activeConnections = useRef<Set<string>>(new Set());
//   const statsIntervalRef = useRef<NodeJS.Timeout| null>(null);

//   useEffect(() => {
//     setHostname(window.location.hostname);
//     const newId = generateStreamId();
//     setStreamInfo((prev) => ({
//       ...prev,
//       streamId: newId,
//       shareLink: generateShareableLink(newId)
//     }));
//   }, []);

//   const handleEndStream = async () => {
//     try {
//       if (!user?.primaryEmailAddress?.emailAddress) {
//         toast.error('User email not available.');
//         return;
//       }
//       await createLecture({
//         email: user?.primaryEmailAddress?.emailAddress,
//         summary: notes,
//         createdAt: Date.now(),
//       });
//       router.push('/dashboard');
//     } catch (err) {
//       console.error('Failed to end stream and save lecture:', err);
//       toast.error('Could not save lecture. Please try again.');
//     }
//   };
  
//   const updateStats = (stream: MediaStream) => {
//     if (stream.getVideoTracks().length > 0) {
//       const videoTrack = stream.getVideoTracks()[0];
//       const settings = videoTrack.getSettings();
      
//       setStats({
//         bitrate: 2000, // Placeholder - actual calculation needs WebRTC stats
//         resolution: `${settings.width || 0}x${settings.height || 0}`,
//         fps: settings.frameRate || 0
//       });
//     }
//   };

//   const startBroadcast = useCallback(async () => {
//     try {
//       const constraints = {
//         video: {
//           width: { ideal: streamQuality === 'hd' ? 1280 : 640 },
//           height: { ideal: streamQuality === 'hd' ? 720 : 480 },
//           frameRate: { ideal: 30 },
//           facingMode: 'user'
//         },
//         audio: true
//       };

//       if (!navigator.mediaDevices?.getUserMedia) {
//         throw new Error('getUserMedia is not supported in this environment. Use HTTPS or localhost.');
//       }

//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       streamRef.current = stream;

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.onloadedmetadata = () => {
//           videoRef.current?.play().catch((e) => {
//             console.error('Autoplay failed:', e);
//             setStreamInfo((prev) => ({
//               ...prev,
//               error: 'Click the video to start playback'
//             }));
//           });
//         };
//       }

//       // Start stats monitoring
//       statsIntervalRef.current = setInterval(() => updateStats(stream), 1000);

//       const peer = new Peer(streamInfo.streamId, {
//         host: process.env.NEXT_PUBLIC_PEER_HOST || hostname,
//         port: Number(process.env.NEXT_PUBLIC_PEER_PORT || 9000),
//         path: '/peer',
//         secure: true,
//         debug: 3,
//         config: {
//           iceServers: [
//             { urls: 'stun:stun.l.google.com:19302' },
//             { urls: 'stun:global.stun.twilio.com:3478' }
//           ]
//         }
//       });
//       peer.on('open', (id) => {
//         console.log('Broadcast peer connected with ID:', id);
      
//       peer.on('call', (call) => {
//         call.answer(stream);
//         activeConnections.current.add(call.peer);
//         updateViewerCount();

//         call.on('close', () => {
//           activeConnections.current.delete(call.peer);
//           updateViewerCount();
//         });
//       });

//       peer.on('error', (err) => {
//         console.error('Peer error:', err);
//         setStreamInfo((prev) => ({
//           ...prev,
//           status: 'error',
//           error: 'Connection error'
//         }));
//         toast.error('Connection error.');
//       });
//     });

//       peerRef.current = peer;
//       setStreamInfo((prev) => ({
//         ...prev,
//         status: 'ready'
//       }));
//     } catch (err) {
//       console.error('Stream setup error:', err);
//       setStreamInfo((prev) => ({
//         ...prev,
//         status: 'error',
//         error: err instanceof Error ? err.message : 'Failed to start stream'
//       }));
//       toast.error('Failed to start stream. Please try again.');
//     }
//   }, [streamInfo.streamId, hostname, streamQuality]);

//   const updateViewerCount = () => {
//     setStreamInfo((prev) => ({
//       ...prev,
//       viewers: activeConnections.current.size
//     }));
//   };

//   const toggleMic = () => {
//     if (streamRef.current) {
//       const audioTracks = streamRef.current.getAudioTracks();
//       audioTracks.forEach(track => track.enabled = !track.enabled);
//       setIsMicMuted(!isMicMuted);
//     }
//   };

//   const toggleCamera = () => {
//     if (streamRef.current) {
//       const videoTracks = streamRef.current.getVideoTracks();
//       videoTracks.forEach(track => track.enabled = !track.enabled);
//       setIsCameraOff(!isCameraOff);
//     }
//   };

//   const startScreenShare = async () => {
//     try {
//       const screenStream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//         audio: true
//       });

//       if (streamRef.current) {
//         // Replace video track
//         const videoTrack = screenStream.getVideoTracks()[0];
//         const currentStream = streamRef.current;
//         const currentVideoTrack = currentStream.getVideoTracks()[0];
        
//         currentStream.removeTrack(currentVideoTrack);
//         currentStream.addTrack(videoTrack);
        
//         // Update all peer connections
//         activeConnections.current.forEach(peerId => {
//           const call = peerRef.current?.call(peerId, currentStream);
//           call?.on('stream', () => {
//             // Track replaced successfully
//           });
//         });

//         // Handle when screen sharing stops
//         videoTrack.onended = () => {
//           // Switch back to camera
//           startBroadcast();
//         };
//       }
//     } catch (err) {
//       console.error('Screen share error:', err);
//       toast.error('Failed to start screen sharing');
//     }
//   };

//   useEffect(() => {
//     if (!streamInfo.streamId || !hostname) return;

//     const peer = peerRef.current;
//     startBroadcast();

//     return () => {
//       if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
//       peer?.destroy();
//       streamRef.current?.getTracks().forEach((track) => track.stop());
//     };
//   }, [streamInfo.streamId, streamQuality, hostname, startBroadcast]);

//   return (
//     <div className="min-h-screen flex flex-col items-center bg-gray-800 text-white">
//       <div className="w-full max-w-screen-lg p-4 space-y-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-3xl font-semibold">
//             {streamInfo.status === 'ready' ? '🔴 LIVE' : '🟡 Setting Up'} | Viewers: {streamInfo.viewers}
//           </h1>
//           <StreamControls 
//             quality={streamQuality} 
//             onQualityChange={(quality: string) => setStreamQuality(quality as 'hd' | 'sd')} 
//           />
//           <UserButton/>
//         </div>

//         {streamInfo.error && (
//           <div className="p-4 bg-red-600 text-white rounded-md flex items-center space-x-3">
//             <FaStop />
//             <span>{streamInfo.error}</span>
//             <button
//               onClick={() => videoRef.current?.play().catch(console.error)}
//               className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
//             >
//               Play Video
//             </button>
//           </div>
//         )}

//         <div className="relative w-full h-96">
//           <video
//             ref={videoRef}
//             autoPlay
//             muted
//             playsInline
//             onClick={() => videoRef.current?.play().catch(console.error)}
//             className="w-full h-full object-cover rounded-lg shadow-lg"
//           />
          
//           <div className="absolute bottom-4 left-4 flex gap-2">
//             <button
//               onClick={toggleMic}
//               className={`p-2 rounded-full ${isMicMuted ? 'bg-red-600' : 'bg-gray-800/80'}`}
//               title={isMicMuted ? 'Unmute mic' : 'Mute mic'}
//             >
//               {isMicMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
//             </button>
//             <button
//               onClick={toggleCamera}
//               className={`p-2 rounded-full ${isCameraOff ? 'bg-red-600' : 'bg-gray-800/80'}`}
//               title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
//             >
//               {isCameraOff ? <FaVideoSlash /> : <FaVideo />}
//             </button>
//             <button
//               onClick={startScreenShare}
//               className="p-2 rounded-full bg-gray-800/80"
//               title="Share screen"
//             >
//               <FaDesktop />
//             </button>
//           </div>
          
//           <ViewersPanel count={streamInfo.viewers} />
//           <StatsPanel stats={stats} />
//         </div>

//         <p className='m-12'></p>
//         <Transcripts 
//           stream={videoRef.current?.srcObject as MediaStream || null} 
//           autoTranscribe={true}
//           onSummaryUpdate={(summary: string) => setNotes(summary)}
//         />

//         <div className="bg-gray-900 p-4 rounded-lg">
//           <div className="flex justify-between items-center mb-4">
//             <div className="flex flex-col">
//               <p className="font-medium">Share this link:</p>
//               <div className="flex items-center space-x-3">
//                 <input
//                   type="text"
//                   value={streamInfo.shareLink}
//                   readOnly
//                   className="px-3 py-2 rounded-md bg-gray-700 text-white flex-1"
//                   onClick={(e) => e.currentTarget.select()}
//                 />
//                 <button
//                   onClick={() => {
//                     if (navigator.clipboard && window.isSecureContext) {
//                       navigator.clipboard.writeText(streamInfo.shareLink)
//                         .then(() => toast.success('Copied!'))
//                         .catch(() => toast.error('Failed to copy'));
//                     } else {
//                       toast.error('Clipboard not supported in this environment.');
//                     }
//                   }}
//                   className="text-blue-500 hover:text-blue-700"
//                 >
//                   <FaCopy size={20} />
//                 </button>
//                 <Button
//                 variant={'destructive'}
//                 onClick={handleEndStream}>End Stream and Save Summary
//                 </Button>
//               </div>
//             </div>
//             <div className="text-sm text-gray-400">
//               <p>Stream ID: {streamInfo.streamId}</p>
//               <p>Server: {hostname}:9000</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { generateShareableLink, generateStreamId } from '@/lib/utils';
import { FaCopy, FaStop, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ViewersPanel from '@/components/ViewersPanel';
import StreamControls from '@/components/StreamControls';
import Transcripts from '@/components/Transcript';
import StatsPanel from '@/components/StatsPanel';
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from '@/components/ui/button';
import { api } from '../../../convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';


export default function Broadcast() {
  const createLecture = useMutation(api.lecture.createLecture);
  const { user } = useUser();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hostname, setHostname] = useState('');
  const [streamQuality, setStreamQuality] = useState<'hd' | 'sd'>('hd');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const dataConnections = useRef<Set<any>>(new Set());
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [notes, setNotes] = useState('');
  const [stats, setStats] = useState({
    bitrate: 0,
    resolution: '0x0',
    fps: 0
  });

  const [streamInfo, setStreamInfo] = useState({
    status: 'idle' as 'idle' | 'ready' | 'error',
    viewers: 0,
    error: null as string | null,
    streamId: '',
    shareLink: ''
  });

  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeConnections = useRef<Set<string>>(new Set());
  const statsIntervalRef = useRef<NodeJS.Timeout| null>(null);

  useEffect(() => {
    setHostname(window.location.hostname);
    const newId = generateStreamId();
    setStreamInfo((prev) => ({
      ...prev,
      streamId: newId,
      shareLink: generateShareableLink(newId)
    }));
  }, []);

  const handleEndStream = async () => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) {
        toast.error('User email not available.');
        return;
      }
      await createLecture({
        email: user?.primaryEmailAddress?.emailAddress,
        summary: notes,
        createdAt: Date.now(),
      });
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to end stream and save lecture:', err);
      toast.error('Could not save lecture. Please try again.');
    }
  };

  const broadcastTranscription = (text: string) => {
    dataConnections.current.forEach((conn) => {
      if (conn.open) {
        conn.send(text);
      }
    });
  };  
  
  const updateStats = (stream: MediaStream) => {
    if (stream.getVideoTracks().length > 0) {
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      setStats({
        bitrate: 2000, // Placeholder - actual calculation needs WebRTC stats
        resolution: `${settings.width || 0}x${settings.height || 0}`,
        fps: settings.frameRate || 0
      });
    }
  };

  const startBroadcast = useCallback(async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: streamQuality === 'hd' ? 1280 : 640 },
          height: { ideal: streamQuality === 'hd' ? 720 : 480 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        },
        audio: true
      };

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported in this environment. Use HTTPS or localhost.');
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => {
            console.error('Autoplay failed:', e);
            setStreamInfo((prev) => ({
              ...prev,
              error: 'Click the video to start playback'
            }));
          });
        };
      }

      // Start stats monitoring
      statsIntervalRef.current = setInterval(() => updateStats(stream), 1000);

      const peer = new Peer(streamInfo.streamId, {
        host: process.env.NEXT_PUBLIC_PEER_HOST || hostname,
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
      peer.on('open', (id) => {
        console.log('Broadcast peer connected with ID:', id);
      
      peer.on('call', (call) => {
        call.answer(stream);
        activeConnections.current.add(call.peer);
        updateViewerCount();

        call.on('close', () => {
          activeConnections.current.delete(call.peer);
          updateViewerCount();
        });
      });

      peer.on('connection', (dataConnection) => {
        dataConnections.current.add(dataConnection);
        
        dataConnection.on('open', () => {
          console.log('Data connection established with viewer');
        });
      
        dataConnection.on('close', () => {
          dataConnections.current.delete(dataConnection);
        });
      
        dataConnection.on('error', (err: any) => {
          console.error('Data connection error:', err);
          dataConnections.current.delete(dataConnection);
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setStreamInfo((prev) => ({
          ...prev,
          status: 'error',
          error: 'Connection error'
        }));
        toast.error('Connection error.');
      });
    });

      peerRef.current = peer;
      setStreamInfo((prev) => ({
        ...prev,
        status: 'ready'
      }));
    } catch (err) {
      console.error('Stream setup error:', err);
      setStreamInfo((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to start stream'
      }));
      toast.error('Failed to start stream. Please try again.');
    }
  }, [streamInfo.streamId, hostname, streamQuality]);

  const updateViewerCount = () => {
    setStreamInfo((prev) => ({
      ...prev,
      viewers: activeConnections.current.size
    }));
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => track.enabled = !track.enabled);
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => track.enabled = !track.enabled);
      setIsCameraOff(!isCameraOff);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (streamRef.current) {
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const currentStream = streamRef.current;
        const currentVideoTrack = currentStream.getVideoTracks()[0];
        
        currentStream.removeTrack(currentVideoTrack);
        currentStream.addTrack(videoTrack);
        
        // Update all peer connections
        activeConnections.current.forEach(peerId => {
          const call = peerRef.current?.call(peerId, currentStream);
          call?.on('stream', () => {
            // Track replaced successfully
          });
        });

        // Handle when screen sharing stops
        videoTrack.onended = () => {
          // Switch back to camera
          startBroadcast();
        };
      }
    } catch (err) {
      console.error('Screen share error:', err);
      toast.error('Failed to start screen sharing');
    }
  };

  useEffect(() => {
    if (!streamInfo.streamId || !hostname) return;

    const peer = peerRef.current;
    startBroadcast();

    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      peer?.destroy();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [streamInfo.streamId, streamQuality, hostname, startBroadcast]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-800 text-white">
      <div className="w-full max-w-screen-lg p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">
            {streamInfo.status === 'ready' ? '🔴 LIVE' : '🟡 Setting Up'} | Viewers: {streamInfo.viewers}
          </h1>
          <StreamControls 
            quality={streamQuality} 
            onQualityChange={(quality: string) => setStreamQuality(quality as 'hd' | 'sd')} 
          />
          <UserButton/>
        </div>

        {streamInfo.error && (
          <div className="p-4 bg-red-600 text-white rounded-md flex items-center space-x-3">
            <FaStop />
            <span>{streamInfo.error}</span>
            <button
              onClick={() => videoRef.current?.play().catch(console.error)}
              className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Play Video
            </button>
          </div>
        )}

        <div className="relative w-full h-96">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onClick={() => videoRef.current?.play().catch(console.error)}
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
          
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              onClick={toggleMic}
              className={`p-2 rounded-full ${isMicMuted ? 'bg-red-600' : 'bg-gray-800/80'}`}
              title={isMicMuted ? 'Unmute mic' : 'Mute mic'}
            >
              {isMicMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <button
              onClick={toggleCamera}
              className={`p-2 rounded-full ${isCameraOff ? 'bg-red-600' : 'bg-gray-800/80'}`}
              title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isCameraOff ? <FaVideoSlash /> : <FaVideo />}
            </button>
            <button
              onClick={startScreenShare}
              className="p-2 rounded-full bg-gray-800/80"
              title="Share screen"
            >
              <FaDesktop />
            </button>
          </div>
          
          <ViewersPanel count={streamInfo.viewers} />
          <StatsPanel stats={stats} />
        </div>

        <p className='m-12'></p>
        <Transcripts 
          stream={videoRef.current?.srcObject as MediaStream || null} 
          autoTranscribe={true}
          onTranscriptionUpdate={broadcastTranscription}
          isBroadcaster={true}
        />

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <p className="font-medium">Share this link:</p>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={streamInfo.shareLink}
                  readOnly
                  className="px-3 py-2 rounded-md bg-gray-700 text-white flex-1"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={() => {
                    if (navigator.clipboard && window.isSecureContext) {
                      navigator.clipboard.writeText(streamInfo.shareLink)
                        .then(() => toast.success('Copied!'))
                        .catch(() => toast.error('Failed to copy'));
                    } else {
                      toast.error('Clipboard not supported in this environment.');
                    }
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaCopy size={20} />
                </button>
                <Button
                variant={'destructive'}
                onClick={handleEndStream}>End Stream and Save Summary
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <p>Stream ID: {streamInfo.streamId}</p>
              <p>Server: {hostname}:9000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}