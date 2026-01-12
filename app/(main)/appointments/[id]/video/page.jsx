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

export default function PatientVideoCallPage() { 
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
      
      console.log('👤 Loading video config for patient, appointment:', appointmentId);

      // Get Agora configuration
      const configResult = await getAgoraConfig(appointmentId);
      if (!configResult.success) {
        console.error('Config failed:', configResult.error);
        setError(configResult.error);
        toast.error(configResult.error);
        return;
      }

      console.log('✅ Config loaded:', {
        role: configResult.config.role,
        uid: configResult.config.agoraUid,
        appId: configResult.config.appId
      });

      // Generate token
      const tokenResult = await generateAgoraToken(
        appointmentId,
        configResult.config.agoraUid,
        configResult.config.role
      );

      if (!tokenResult.success) {
        console.error('Token generation failed:', tokenResult.error);
        setError(tokenResult.error);
        toast.error(tokenResult.error);
        return;
      }

      setConfig(configResult.config);
      setToken(tokenResult.token);
      
      console.log('🎬 Video ready for patient:', {
        role: configResult.config.role,
        channel: configResult.config.channelName,
        uid: configResult.config.agoraUid,
        tokenLength: tokenResult.token?.length,
        appId: tokenResult.appId
      });
      
      toast.success('Video consultation ready to join');
    } catch (err) {
      console.error('Failed to load video config:', err);
      setError('Failed to initialize video call. Please try again.');
      toast.error('Failed to initialize video call');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEnd = async (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    toast.success(`Call ended. Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    router.push(`/appointments/${appointmentId}`);
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
            <h3 className="text-xl font-semibold mb-2">Unable to Join Video Call</h3>
            <Alert variant="destructive" className="mb-6 text-left">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push(`/appointments/${appointmentId}`)}
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
            <Button onClick={() => router.push(`/appointments/${appointmentId}`)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header Info */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">
                Video Consultation
              </h1>
              <p className="text-gray-400 text-sm">
                With Dr. {config.counterpart?.name || 'Doctor'} • {config.counterpart?.speciality || 'Medical Specialist'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Channel: <span className="font-mono">{config.channelName}</span> • 
                Your UID: <span className="font-mono">{config.agoraUid}</span>
              </p>
            </div>
            <div className="px-3 py-1 bg-green-500/20 rounded-full">
              <span className="text-green-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Ready
              </span>
            </div>
          </div>
        </div> 
        
        {/* Video Call Component */}
        <div className="h-[90vh]">
          <VideoCall
            channelName={config.channelName}
            token={token}
            uid={config.agoraUid}
            role={config.role}
            appId={config.appId} // Pass appId from config
            onCallEnd={handleCallEnd}
            appointmentId={appointmentId}
            participantName={config.counterpart?.name || 'Doctor'}
            participantImage={config.counterpart?.imageUrl}
          />
        </div>
        
        {/* Info Alert */}
        <div className="mt-4">
          <Alert className="bg-gray-800 border-gray-700">
            <Video className="h-4 w-4 text-gray-400" />
            <AlertDescription className="text-gray-300">
              <strong>Important:</strong> Ensure you have a stable internet connection. 
              This consultation is being recorded for quality assurance. 
              If you experience any technical issues, please contact support immediately.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

