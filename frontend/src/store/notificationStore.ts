import { create } from 'zustand';
import { NotificationType } from '../components/ui/Notification';

interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationStore {
  notifications: NotificationItem[];
  addNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (type, message) => {
    const id = Date.now().toString() + Math.random().toString(36);
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }],
    }));
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  
  success: (message) => {
    const id = Date.now().toString() + Math.random().toString(36);
    set((state) => ({
      notifications: [...state.notifications, { id, type: 'success', message }],
    }));
  },
  
  error: (message) => {
    const id = Date.now().toString() + Math.random().toString(36);
    set((state) => ({
      notifications: [...state.notifications, { id, type: 'error', message }],
    }));
  },
  
  warning: (message) => {
    const id = Date.now().toString() + Math.random().toString(36);
    set((state) => ({
      notifications: [...state.notifications, { id, type: 'warning', message }],
    }));
  },
  
  info: (message) => {
    const id = Date.now().toString() + Math.random().toString(36);
    set((state) => ({
      notifications: [...state.notifications, { id, type: 'info', message }],
    }));
  },
}));
