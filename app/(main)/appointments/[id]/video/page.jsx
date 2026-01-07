// app/appointments/[id]/video/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, PhoneOff, Mic, MicOff, Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VideoCall from '@/components/video-call/VideoCall';
import { generateAgoraToken, getAgoraConfig, startVideoSession } from '@/actions/appointments';

export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter(); 
  const appointmentId = params?.id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [token, setToken] = useState('');
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      loadVideoConfig();
    }
  }, [appointmentId]);

  const loadVideoConfig = async () => {
    try {
      setLoading(true);
      setError('');
      
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
      console.error('Failed to load video config:', err);
      setError('Failed to initialize video call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEnd = async (duration) => {
    // Redirect back to appointment details
    router.push(`/appointments/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <div className="animate-pulse">
              <Video className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Loading Video Consultation...</h3>
              <p className="text-muted-foreground">Please wait while we prepare your consultation room.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Unable to Start Video Call</h3>
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button onClick={() => router.push(`/appointments/${appointmentId}`)}>
                Go Back to Appointment
              </Button>
              <Button variant="outline" onClick={loadVideoConfig} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!config || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Missing Configuration</h3>
            <p className="text-muted-foreground mb-6">
              Unable to initialize video call. Please contact support if this continues.
            </p>
            <Button onClick={() => router.push(`/appointments/${appointmentId}`)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Video Consultation</h1>
          <p className="text-gray-400">
            Appointment with {config.counterpart?.name} • {config.role === 'doctor' ? 'You are the doctor' : 'You are the patient'}
          </p>
        </div>
        
        <VideoCall
          channelName={config.channelName}
          token={token}
          uid={config.agoraUid}
          role={config.role}
          onCallEnd={handleCallEnd}
          appointmentId={appointmentId}
          participantName={config.counterpart?.name}
        />
        
        <div className="mt-6">
          <Alert className="bg-gray-800 border-gray-700">
            <Video className="h-4 w-4 text-gray-400" />
            <AlertDescription className="text-gray-300">
              <strong>Important:</strong> Ensure you have a stable internet connection. 
              The consultation will be recorded for quality assurance. 
              Please do not share any sensitive information via chat.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

