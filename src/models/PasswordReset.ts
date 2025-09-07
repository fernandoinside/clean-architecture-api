import BaseModel from './BaseModel';

export interface IPasswordReset {
  id?: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used?: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

class PasswordReset extends BaseModel<IPasswordReset> {
  constructor() {
    super('password_resets');
  }
  
  /**
   * Busca um token de reset válido
   */
  async findValidToken(token: string, userId: number): Promise<IPasswordReset | undefined> {
    if (!token || !userId) return undefined;
    
    return this.db(this.tableName)
      .where({
        token,
        user_id: userId,
        used: false
      })
      .where('expires_at', '>', new Date())
      .whereNull('deleted_at')
      .first();
  }
  
  /**
   * Marca um token como usado
   */
  async markAsUsed(tokenId: number): Promise<boolean> {
    if (!tokenId) return false;
    
    const updated = await this.db(this.tableName)
      .where({ id: tokenId })
      .update({ 
        used: true,
        updated_at: new Date()
      });
      
    return updated > 0;
  }
  
  /**
   * Remove tokens expirados ou usados para um usuário
   */
  async cleanupTokensForUser(userId: number): Promise<number> {
    if (!userId) return 0;
    
    return this.db(this.tableName)
      .where({ user_id: userId })
      .del();
  }
}

export default new PasswordReset();