import BaseModel from './BaseModel';

export interface INotification {
  id?: number;
  user_id: number;
  title: string;
  message: string;
  type?: 'system' | 'alert' | 'info';
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

class Notification extends BaseModel<INotification> {
  constructor() {
    super('notifications');
  }
}

export default new Notification();