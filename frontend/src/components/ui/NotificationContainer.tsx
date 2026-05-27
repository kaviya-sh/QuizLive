import { Notification, NotificationType } from './Notification';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContainerProps {
  notifications: NotificationItem[];
  onRemove: (id: string) => void;
}

export const NotificationContainer = ({ notifications, onRemove }: NotificationContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};
