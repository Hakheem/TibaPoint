import { db } from '@/lib/db';

class NotificationService {
  // Store connected clients
  static clients = new Map();

  // Add client to listeners
  static addClient(userId, response) {
    this.clients.set(userId, response);
  }

  // Remove client
  static removeClient(userId) {
    this.clients.delete(userId);
  }

  // Send notification to specific user
  static async sendToUser(userId, notification) {
    const client = this.clients.get(userId);
    if (client) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`data: ${JSON.stringify(notification)}\n\n`);
      client.enqueue(data);
    }
  }

  // Send notification to all users of a role
  static async sendToRole(role, notification) {
    const users = await db.user.findMany({
      where: { role },
      select: { id: true }
    });

    for (const user of users) {
      await this.sendToUser(user.id, notification);
    }
  }

  // Broadcast to all connected clients
  static broadcast(notification) {
    for (const [userId, response] of this.clients.entries()) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`data: ${JSON.stringify(notification)}\n\n`);
      response.enqueue(data);
    }
  }
}

export default NotificationService;

