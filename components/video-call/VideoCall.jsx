"use client";

import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

const VideoCall = ({ 
  channelName, 
  token, 
  uid, 
  role = 'host', // 'host' for doctor, 'audience' for patient
  onCallEnd,
  appointmentId 
}) => {
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [callTime, setCallTime] = useState(0);
  
  const client = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoContainer = useRef(null);
  const timerRef = useRef(null);

  // Initialize Agora client
  useEffect(() => {
    if (!appId) {
      console.error('Agora App ID is missing');
      return;
    }

    client.current = AgoraRTC.createClient({ 
      mode: 'rtc', 
      codec: 'vp8' 
    });

    // Handle user published/unpublished
    client.current.on('user-published', async (user, mediaType) => {
      await client.current.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        const remotePlayerContainer = document.createElement('div');
        remotePlayerContainer.className = 'remote-video';
        remotePlayerContainer.id = `user-${user.uid}`;
        remoteVideoContainer.current.appendChild(remotePlayerContainer);
        
        user.videoTrack.play(remotePlayerContainer);
      }
      
      if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    });

    client.current.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        const playerContainer = document.getElementById(`user-${user.uid}`);
        if (playerContainer) {
          playerContainer.remove();
        }
      }
    });

    client.current.on('user-left', (user) => {
      const playerContainer = document.getElementById(`user-${user.uid}`);
      if (playerContainer) {
        playerContainer.remove();
      }
    });

    return () => {
      if (client.current) {
        leaveChannel();
      }
    };
  }, []);

  // Join channel
  const joinChannel = async () => {
    try {
      if (!client.current) return;

      // Get local tracks
      const [microphoneTrack, cameraTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
      ]);

      setLocalTracks([microphoneTrack, cameraTrack]);

      // Play local video
      if (localVideoRef.current) {
        cameraTrack.play(localVideoRef.current);
      }

      // Set user role
      if (role === 'audience') {
        await client.current.setClientRole('audience');
      }

      // Join the channel
      await client.current.join(
        appId,
        channelName,
        token || null,
        uid || null
      );

      // Publish local tracks if host
      if (role === 'host') {
        await client.current.publish([microphoneTrack, cameraTrack]);
      }

      setJoined(true);
      startTimer();
      
      console.log('Joined channel successfully');
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  // Leave channel
  const leaveChannel = async () => {
    try {
      // Stop and cleanup local tracks
      localTracks.forEach(track => {
        track.stop();
        track.close();
      });

      // Leave the channel
      await client.current.leave();
      
      // Clear remote videos
      if (remoteVideoContainer.current) {
        remoteVideoContainer.current.innerHTML = '';
      }

      setJoined(false);
      setLocalTracks([]);
      stopTimer();
      
      if (onCallEnd) {
        onCallEnd(callTime);
      }
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localTracks[0]) {
      localTracks[0].setEnabled(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localTracks[1]) {
      localTracks[1].setEnabled(isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
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

  return (
    <div className="video-call-container">
      {/* Call Header */}
      <div className="call-header">
        <div className="call-info">
          <h3>Consultation Room: {channelName}</h3>
          <p>Duration: {formatTime(callTime)}</p>
          <p>Role: {role === 'host' ? 'Doctor (Host)' : 'Patient'}</p>
        </div>
        
        {!joined ? (
          <button 
            onClick={joinChannel}
            className="join-btn"
            disabled={!channelName}
          >
            Join Consultation
          </button>
        ) : (
          <button 
            onClick={leaveChannel}
            className="leave-btn"
          >
            End Consultation
          </button>
        )}
      </div>

      {/* Video Area */}
      <div className="video-area">
        {/* Remote Videos */}
        <div 
          ref={remoteVideoContainer} 
          className="remote-videos-container"
        >
          {remoteUsers.length === 0 && joined && (
            <div className="waiting-message">
              <p>Waiting for {role === 'host' ? 'patient' : 'doctor'} to join...</p>
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="local-video-container">
          <div ref={localVideoRef} className="local-video"></div>
          <div className="local-video-info">
            <span>{role === 'host' ? 'You (Doctor)' : 'You (Patient)'}</span>
            <span>
              {isAudioMuted ? '🔇' : '🎤'} 
              {isVideoMuted ? '📷❌' : '📷'}
            </span>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      {joined && (
        <div className="call-controls">
          <button 
            onClick={toggleAudio}
            className={`control-btn ${isAudioMuted ? 'muted' : ''}`}
          >
            {isAudioMuted ? 'Unmute' : 'Mute'}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`control-btn ${isVideoMuted ? 'muted' : ''}`}
          >
            {isVideoMuted ? 'Start Video' : 'Stop Video'}
          </button>
          
          <button 
            onClick={leaveChannel}
            className="control-btn end-call"
          >
            End Call
          </button>
        </div>
      )}

      {/* Connection Status */}
      <div className="connection-status">
        <span className={`status-dot ${joined ? 'connected' : 'disconnected'}`}></span>
        {joined ? 'Connected' : 'Disconnected'}
      </div>

      <style jsx>{`
        .video-call-container {
          width: 100%;
          height: 80vh;
          background: #1a1a1a;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .call-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #2a2a2a;
          border-bottom: 1px solid #444;
        }

        .call-info h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .call-info p {
          margin: 4px 0;
          color: #aaa;
          font-size: 14px;
        }

        .join-btn, .leave-btn {
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .join-btn {
          background: #0070f3;
          color: white;
        }

        .join-btn:hover:not(:disabled) {
          background: #0051b3;
        }

        .join-btn:disabled {
          background: #555;
          cursor: not-allowed;
        }

        .leave-btn {
          background: #ff4444;
          color: white;
        }

        .leave-btn:hover {
          background: #cc0000;
        }

        .video-area {
          flex: 1;
          display: flex;
          position: relative;
          padding: 20px;
        }

        .remote-videos-container {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-content: flex-start;
        }

        .remote-video {
          width: 300px;
          height: 225px;
          background: #333;
          border-radius: 8px;
          overflow: hidden;
        }

        .waiting-message {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          font-size: 18px;
        }

        .local-video-container {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 240px;
          height: 180px;
          background: #333;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #0070f3;
        }

        .local-video {
          width: 100%;
          height: 100%;
        }

        .local-video-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .call-controls {
          display: flex;
          justify-content: center;
          gap: 16px;
          padding: 20px;
          background: #2a2a2a;
          border-top: 1px solid #444;
        }

        .control-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          background: #444;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }

        .control-btn:hover {
          background: #555;
        }

        .control-btn.muted {
          background: #ff4444;
        }

        .control-btn.end-call {
          background: #ff4444;
        }

        .control-btn.end-call:hover {
          background: #cc0000;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #2a2a2a;
          border-top: 1px solid #444;
          font-size: 14px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-dot.connected {
          background: #4CAF50;
          animation: pulse 2s infinite;
        }

        .status-dot.disconnected {
          background: #ff4444;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VideoCall;

