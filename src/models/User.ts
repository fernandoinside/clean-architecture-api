import BaseModel from './BaseModel';

export interface IUser {
  id?: number;
  company_id?: number | null;
  username: string;
  email: string;
  password?: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active?: boolean;
  email_verified?: boolean;
  email_verification_token?: string | null;
  role_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

class User extends BaseModel<IUser> {
  constructor() {
    super('users');
  }
  
  /**
   * Busca um usuário pelo email
   */
  async findByEmail(email: string): Promise<IUser | undefined> {
    if (!email) return undefined;
    
    return this.db(this.tableName)
      .where('email', email.toLowerCase().trim())
      .whereNull('deleted_at')
      .first();
  }
  
  /**
   * Busca um usuário pelo token de verificação de email
   */
  async findByVerificationToken(token: string): Promise<IUser | undefined> {
    if (!token) return undefined;
    
    return this.db(this.tableName)
      .where('email_verification_token', token)
      .whereNull('deleted_at')
      .first();
  }
  
  /**
   * Busca um usuário pelo username
   */
  async findByUsername(username: string): Promise<IUser | undefined> {
    if (!username) return undefined;
    
    return this.db(this.tableName)
      .where('username', username.toLowerCase().trim())
      .whereNull('deleted_at')
      .first();
  }
}

export default User;