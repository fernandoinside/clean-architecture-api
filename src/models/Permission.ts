import BaseModel from './BaseModel';

export interface IPermission {
  id?: number;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class Permission extends BaseModel<IPermission> {
  constructor() {
    super('permissions');
  }
}

export default new Permission();