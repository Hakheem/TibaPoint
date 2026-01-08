"use client";

import { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const VideoCall = ({ 
  channelName, 
  token, 
  uid, 
  role, // comes from backend: 'doctor' or 'patient'
  onCallEnd,
  appointmentId,
  participantName = 'Participant',
  participantImage = null
}) => {
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [agoraReady, setAgoraReady] = useState(false);
  const [error, setError] = useState(null);
  
  const client = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoContainer = useRef(null);
  const timerRef = useRef(null);
  const screenTrack = useRef(null);
  const AgoraRTC = useRef(null);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

  // Initialize Agora SDK (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeAgora = async () => {
      try {
        // Dynamically import Agora SDK
        const AgoraModule = await import('agora-rtc-sdk-ng');
        AgoraRTC.current = AgoraModule.default;
        
        if (!appId) {
          setError('Agora App ID is missing. Please check your environment variables.');
          console.error('NEXT_PUBLIC_AGORA_APP_ID is not set');
          return;
        }

        setAgoraReady(true);
      } catch (err) {
        console.error('Failed to load Agora SDK:', err);
        setError('Failed to load video SDK. Please refresh the page.');
      }
    };

    initializeAgora();
  }, [appId]);

  // Initialize Agora client
  useEffect(() => {
    if (!agoraReady || !AgoraRTC.current) return;

    client.current = AgoraRTC.current.createClient({ 
      mode: 'rtc', 
      codec: 'vp8' 
    });

    // Connection state changes
    client.current.on('connection-state-change', (curState) => {
      console.log('Connection state:', curState);
      setConnectionState(curState);
    });

    // Handle user published
    client.current.on('user-published', async (user, mediaType) => {
      try {
        await client.current.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          setRemoteUsers(prev => {
            const filtered = prev.filter(u => u.uid !== user.uid);
            return [...filtered, user];
          });
          
          // Play remote video
          setTimeout(() => {
            const remotePlayerContainer = document.getElementById(`user-${user.uid}`);
            if (remotePlayerContainer && user.videoTrack) {
              user.videoTrack.play(remotePlayerContainer);
            }
          }, 100);
        }
        
        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (err) {
        console.error('Error handling user published:', err);
      }
    });

    // Handle user unpublished
    client.current.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      }
    });

    // Handle user left
    client.current.on('user-left', (user) => {
      console.log('User left:', user.uid);
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    return () => {
      if (client.current) {
        leaveChannel();
      }
    };
  }, [agoraReady]);

  // Auto-join when component mounts and Agora is ready
  useEffect(() => {
    if (agoraReady && channelName && token && !joined && client.current) {
      joinChannel();
    }
  }, [agoraReady, channelName, token]);

  // Join channel
  const joinChannel = async () => {
    try {
      if (!client.current || !AgoraRTC.current) {
        setError('Video SDK not initialized');
        return;
      }

      console.log('Joining channel:', channelName);

      // Get local tracks
      const [microphoneTrack, cameraTrack] = await Promise.all([
        AgoraRTC.current.createMicrophoneAudioTrack(),
        AgoraRTC.current.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 30,
            bitrateMin: 600,
            bitrateMax: 1000,
          }
        })
      ]);

      setLocalTracks({ audio: microphoneTrack, video: cameraTrack });

      // Play local video
      if (localVideoRef.current && cameraTrack) {
        cameraTrack.play(localVideoRef.current);
      }

      // Join the channel
      await client.current.join(
        appId,
        channelName,
        token,
        uid
      );

      // Publish local tracks
      await client.current.publish([microphoneTrack, cameraTrack]);

      setJoined(true);
      startTimer();
      
      console.log('✅ Joined channel successfully');
    } catch (error) {
      console.error('❌ Failed to join channel:', error);
      setError(`Failed to join video call: ${error.message}`);
    }
  };

  // Leave channel
  const leaveChannel = async () => {
    try {
      // Stop screen sharing if active
      if (screenTrack.current) {
        screenTrack.current.close();
        screenTrack.current = null;
        setIsScreenSharing(false);
      }

      // Stop and cleanup local tracks
      if (localTracks.audio) {
        localTracks.audio.stop();
        localTracks.audio.close();
      }
      if (localTracks.video) {
        localTracks.video.stop();
        localTracks.video.close();
      }

      // Leave the channel
      if (client.current) {
        await client.current.leave();
      }

      setJoined(false);
      setLocalTracks({ audio: null, video: null });
      setRemoteUsers([]);
      stopTimer();
      
      if (onCallEnd) {
        onCallEnd(callTime);
      }
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  // Toggle audio
  const toggleAudio = async () => {
    if (localTracks.audio) {
      await localTracks.audio.setEnabled(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    if (localTracks.video) {
      await localTracks.video.setEnabled(isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Toggle screen sharing (doctor only)
  const toggleScreenShare = async () => {
    if (!AgoraRTC.current) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenVideoTrack = await AgoraRTC.current.createScreenVideoTrack({
          encoderConfig: "1080p_1"
        });

        // Unpublish camera
        if (localTracks.video) {
          await client.current.unpublish([localTracks.video]);
        }

        // Publish screen
        await client.current.publish([screenVideoTrack]);
        screenTrack.current = screenVideoTrack;

        // Play screen in local video container
        if (localVideoRef.current) {
          screenVideoTrack.play(localVideoRef.current);
        }

        setIsScreenSharing(true);

        // Handle screen share stopped
        screenVideoTrack.on('track-ended', () => {
          stopScreenShare();
        });
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error('Screen share error:', error);
      alert('Failed to share screen. Please try again.');
    }
  };

  const stopScreenShare = async () => {
    try {
      // Stop screen track
      if (screenTrack.current) {
        await client.current.unpublish([screenTrack.current]);
        screenTrack.current.close();
        screenTrack.current = null;
      }

      // Republish camera
      if (localTracks.video) {
        await client.current.publish([localTracks.video]);
        if (localVideoRef.current) {
          localTracks.video.play(localVideoRef.current);
        }
      }

      setIsScreenSharing(false);
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  // Timer functions
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state
  if (!agoraReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-white text-lg mb-4">Initializing video call...</div>
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 rounded-lg p-8">
        <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
        <div className="text-white text-center mb-6">{error}</div>
        <Button onClick={() => window.location.reload()} variant="default">
          Reload Page
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionState === 'CONNECTED' ? 'bg-green-500' : 
              connectionState === 'CONNECTING' ? 'bg-yellow-500' : 
              'bg-red-500'
            } animate-pulse`} />
            <span className="text-sm text-gray-300">
              {connectionState === 'CONNECTED' ? 'Connected' : 
               connectionState === 'CONNECTING' ? 'Connecting...' : 
               'Disconnected'}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-600" />
          <span className="text-white font-mono text-lg">{formatTime(callTime)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-white border-gray-600">
            {role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑‍💼 Patient'}
          </Badge>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative p-4">
        {/* Remote Video */}
        <div ref={remoteVideoContainer} className="w-full h-full flex items-center justify-center">
          {remoteUsers.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-8 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={participantImage} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-teal-500">
                  {participantName.charAt(0)}
                </AvatarFallback>
              </Avatar> 
              <h3 className="text-white text-lg font-semibold mb-2">{participantName}</h3>
              <p className="text-gray-400">Waiting to join...</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </Card>
          ) : (
            <div className="w-full h-full grid grid-cols-1 gap-4">
              {remoteUsers.map((user) => (
                <div key={user.uid} className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden">
                  <div id={`user-${user.uid}`} className="w-full h-full" />
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 rounded-full">
                    <span className="text-white text-sm">{participantName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Local Video (Picture in Picture) */}
        <div className="absolute bottom-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-500 shadow-xl">
          <div ref={localVideoRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-full flex items-center gap-2">
            <span className="text-white text-sm">You {isScreenSharing ? '(Sharing)' : ''}</span>
            {isAudioMuted && <MicOff className="w-3 h-3 text-red-400" />}
            {isVideoMuted && <VideoOff className="w-3 h-3 text-red-400" />}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <Button
            onClick={toggleAudio}
            variant={isAudioMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            onClick={toggleVideo}
            variant={isVideoMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>

          {/* Screen Share (Doctor only) */}
          {role === 'doctor' && (
            <Button
              onClick={toggleScreenShare}
              variant={isScreenSharing ? "default" : "secondary"}
              size="lg"
              className="rounded-full w-14 h-14"
            >
              {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>
          )}

          {/* End Call */}
          <Button
            onClick={leaveChannel}
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>

        {/* Control Labels */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="text-xs text-gray-400 w-14 text-center">
            {isAudioMuted ? 'Unmute' : 'Mute'}
          </span>
          <span className="text-xs text-gray-400 w-14 text-center">
            {isVideoMuted ? 'Camera' : 'Camera'}
          </span>
          {role === 'doctor' && (
            <span className="text-xs text-gray-400 w-14 text-center">
              {isScreenSharing ? 'Stop' : 'Share'}
            </span>
          )}
          <span className="text-xs text-gray-400 w-14 text-center">
            End
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

