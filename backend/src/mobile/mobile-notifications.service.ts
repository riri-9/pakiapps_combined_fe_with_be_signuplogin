import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../common/auth/authenticated-user.js';
import { SupabaseService } from '../supabase/supabase.service.js';

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean | null;
  created_at: string | null;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string | null;
  isRead: boolean;
}

function mapNotification(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    time: row.created_at,
    isRead: Boolean(row.is_read),
  };
}

@Injectable()
export class MobileNotificationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async list(user: AuthenticatedUser): Promise<{
    notifications: NotificationItem[];
    unreadCount: number;
  }> {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('customer_notifications')
      .select('id, type, title, message, is_read, created_at')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .returns<NotificationRow[]>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load notifications.');
    }

    const notifications = (result.data ?? []).map(mapNotification);
    return {
      notifications,
      unreadCount: notifications.filter((item) => !item.isRead).length,
    };
  }

  async markOneRead(
    user: AuthenticatedUser,
    notificationId: string,
  ): Promise<{ notification: NotificationItem; message: string }> {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('customer_notifications')
      .update({ is_read: true })
      .eq('user_id', user.userId)
      .eq('id', notificationId)
      .select('id, type, title, message, is_read, created_at')
      .maybeSingle<NotificationRow>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to update notification.');
    }

    if (!result.data) {
      throw new NotFoundException('Notification not found.');
    }

    return {
      notification: mapNotification(result.data),
      message: 'Notification marked as read.',
    };
  }

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
  ): Promise<void> {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase.from('customer_notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      is_read: false,
    });

    if (result.error) {
      throw new InternalServerErrorException('Unable to create notification.');
    }
  }
}
