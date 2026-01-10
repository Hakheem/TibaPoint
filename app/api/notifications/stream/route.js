export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import NotificationService from '@/lib/services/notificationService';

export async function GET(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Add this client to the service
        NotificationService.addClient(userId, controller);
        
        const sendEvent = (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Send connection confirmation
        sendEvent({ type: 'connected', message: 'SSE connected', timestamp: Date.now() });

        // Keep connection alive
        const keepAlive = setInterval(() => {
          sendEvent({ type: 'ping', timestamp: Date.now() });
        }, 30000);

        // Clean up on disconnect
        req.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          NotificationService.removeClient(userId);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', 
      },
    });
  } catch (error) {
    console.error('SSE Route Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

