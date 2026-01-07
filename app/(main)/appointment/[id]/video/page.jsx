// app/appointments/[id]/video/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoCall from '@/components/video-call/VideoCall';
import { 
  generateAgoraToken, 
  getAgoraConfig,
  startVideoSession,
  endVideoSession 
} from '@/actions/appointment';

const VideoCallPage = () => {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [token, setToken] = useState('');
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    loadVideoConfig();
  }, [appointmentId]);

  const loadVideoConfig = async () => {
    try {
      setLoading(true);
      
      // Get Agora configuration
      const configResult = await getAgoraConfig(appointmentId);
      if (!configResult.success) {
        setError(configResult.error);
        return;
      }

      // Generate token
      const tokenResult = await generateAgoraToken(
        appointmentId,
        configResult.config.agoraUid,
        configResult.config.role
      );

      if (!tokenResult.success) {
        setError(tokenResult.error);
        return;
      }

      setConfig(configResult.config);
      setToken(tokenResult.token);
      
      // If doctor, start the video session
      if (configResult.config.role === 'doctor' && !callStarted) {
        const startResult = await startVideoSession(appointmentId);
        if (startResult.success) {
          setCallStarted(true);
        }
      }
    } catch (err) {
      setError('Failed to load video configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallEnd = async (duration) => {
    try {
      // If doctor, end the session properly
      if (config?.role === 'doctor') {
        await endVideoSession(appointmentId);
      }
      
      // Redirect back to appointment details
      router.push(`/appointments/${appointmentId}`);
    } catch (err) {
      console.error('Failed to end call:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading video consultation...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 70vh;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0070f3;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Unable to Start Video Call</h2>
        <p>{error}</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  if (!config || !token) {
    return (
      <div className="error-container">
        <h2>Missing Configuration</h2>
        <p>Unable to initialize video call</p>
      </div>
    );
  }

  return (
    <div className="video-page">
      <VideoCall
        channelName={config.channelName}
        token={token}
        uid={config.agoraUid}
        role={config.role}
        onCallEnd={handleCallEnd}
        appointmentId={appointmentId}
      />
      
      <div className="participant-info">
        <div className="info-card">
          <h4>Consultation with {config.counterpart?.name}</h4>
          <p><strong>Role:</strong> {config.role === 'doctor' ? 'Doctor' : 'Patient'}</p>
          {config.counterpart?.speciality && (
            <p><strong>Speciality:</strong> {config.counterpart.speciality}</p>
          )}
          <p><strong>Appointment ID:</strong> {appointmentId}</p>
        </div>
      </div>

      <style jsx>{`
        .video-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .participant-info {
          margin-top: 24px;
        }
        
        .info-card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #0070f3;
        }
        
        .info-card h4 {
          margin: 0 0 12px 0;
          color: #333;
        }
        
        .info-card p {
          margin: 8px 0;
          color: #666;
        }
        
        .error-container {
          text-align: center;
          padding: 60px 20px;
        }
        
        .error-container h2 {
          color: #ff4444;
          margin-bottom: 16px;
        }
        
        .error-container button {
          margin-top: 20px;
          padding: 10px 24px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default VideoCallPage;
