import BaseModel from './BaseModel';

export interface IEmailTemplate {
  id?: number;
  name: string;
  subject: string;
  body: string;
  type: string;
  // Database column
  is_active?: boolean;
  // Incoming/outgoing API payload convenience (camelCase)
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

class EmailTemplate extends BaseModel<IEmailTemplate> {
  constructor() {
    super('email_templates');
  }
}

export default new EmailTemplate();