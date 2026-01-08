"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VideoCall from '@/components/video-call/VideoCall';
import { generateAgoraToken, getAgoraConfig } from '@/actions/appointments';
import { toast } from 'sonner';

export default function DoctorVideoCallPage() {
  const params = useParams();
  const router = useRouter(); 
  const appointmentId = params?.id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [token, setToken] = useState('');

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
        toast.error(configResult.error);
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
        toast.error(tokenResult.error);
        return;
      }

      setConfig(configResult.config);
      setToken(tokenResult.token);
      
      console.log('✅ Video config loaded:', {
        role: configResult.config.role,
        channel: configResult.config.channelName,
        uid: configResult.config.agoraUid
      });
    } catch (err) {
      console.error('Failed to load video config:', err);
      setError('Failed to initialize video call. Please try again.');
      toast.error('Failed to initialize video call');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEnd = async (duration) => {
    toast.success(`Call ended. Duration: ${Math.floor(duration / 60)} minutes`);
    router.push(`/dashboard/appointments/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">Loading Video Consultation...</h3>
              <p className="text-muted-foreground">
                Please wait while we prepare your consultation room.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Unable to Start Video Call</h3>
            <Alert variant="destructive" className="mb-6 text-left">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push(`/dashboard/appointments/${appointmentId}`)}
                className="w-full"
              >
                Go Back to Appointment
              </Button>
              <Button 
                variant="outline" 
                onClick={loadVideoConfig} 
                className="w-full"
              >
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Missing Configuration</h3>
            <p className="text-muted-foreground mb-6">
              Unable to initialize video call. Please contact support if this continues.
            </p>
            <Button onClick={() => router.push(`/dashboard/appointments/${appointmentId}`)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header Info */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">
                Video Consultation
              </h1>
              <p className="text-gray-400 text-sm">
                With {config.counterpart?.name} • You are the {config.role}
              </p>
            </div>
            <div className="px-3 py-1 bg-green-500/20 rounded-full">
              <span className="text-green-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </div>
        
        {/* Video Call Component */}
        <div className="h-[calc(100vh-180px)]">
          <VideoCall
            channelName={config.channelName}
            token={token}
            uid={config.agoraUid}
            role={config.role}
            onCallEnd={handleCallEnd}
            appointmentId={appointmentId}
            participantName={config.counterpart?.name}
            participantImage={config.counterpart?.imageUrl}
          />
        </div>
        
        {/* Info Alert */}
        <div className="mt-4">
          <Alert className="bg-gray-800 border-gray-700">
            <Video className="h-4 w-4 text-gray-400" />
            <AlertDescription className="text-gray-300">
              <strong>Doctor Notice:</strong> This consultation is being recorded for quality assurance. 
              You can share your screen to show medical documents or images to the patient. 
              Please ensure all medical advice is clearly documented in the appointment notes.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

