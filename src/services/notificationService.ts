export interface NotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission;
}

export class NotificationService {
  static getStatus(): NotificationStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { isSupported: false, permission: 'default' };
    }
    return {
      isSupported: true,
      permission: Notification.permission
    };
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  static sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission !== 'granted') {
      return false;
    }
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
      return true;
    } catch (e) {
      console.error('Failed to dispatch notification:', e);
      return false;
    }
  }

  static checkDailyReminders(params: {
    hasStudiedToday: boolean;
    currentStreak: number;
    dailyGoalMins: number;
    todayMins: number;
    notificationsEnabled: boolean;
  }): { message: string; type: 'streak' | 'goal' } | null {
    if (!params.notificationsEnabled) return null;

    if (!params.hasStudiedToday && params.currentStreak > 0) {
      return {
        message: `Keep your ${params.currentStreak}-day streak alive! Log today's study session before midnight.`,
        type: 'streak'
      };
    }

    if (params.todayMins < params.dailyGoalMins) {
      const rem = params.dailyGoalMins - params.todayMins;
      return {
        message: `You are ${rem} minutes away from reaching your daily target of ${params.dailyGoalMins} mins!`,
        type: 'goal'
      };
    }

    return null;
  }
}
