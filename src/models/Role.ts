import BaseModel from './BaseModel';

export interface IRole {
  id?: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

class Role extends BaseModel<IRole> {
  constructor() {
    super('roles');
  }
}

export default new Role();