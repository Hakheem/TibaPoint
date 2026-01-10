import { auth } from '@clerk/nextjs/server';
import NotificationService from '@/lib/services/notificationService';

export async function POST(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { targetUserId, message } = await req.json();

    // Send test notification via SSE
    await NotificationService.sendToUser(targetUserId || userId, {
      type: 'NEW_NOTIFICATION',
      notification: {
        id: `test-${Date.now()}`,
        title: 'Test Notification',
        message: message || 'This is a test notification from SSE!',
        type: 'SYSTEM',
        actionUrl: '/dashboard/notifications',
      },
      sound: true,
      showPopup: true,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

