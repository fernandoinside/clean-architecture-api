import BaseModel from './BaseModel';

export interface ISession {
  id?: number;
  user_id: number;
  token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  last_activity: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

class Session extends BaseModel<ISession> {
  constructor() {
    super('sessions');
  }

  async findByToken(token: string): Promise<ISession | undefined> {
    if (!token) return undefined;
    return this.db(this.tableName)
      .where({ token })
      .whereNull('deleted_at')
      .first();
  }

  async findByUserId(userId: number): Promise<ISession[]> {
    if (!userId) return [];
    return this.db(this.tableName)
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findActiveSessions(): Promise<ISession[]> {
    return this.db(this.tableName)
      .where({ is_active: true })
      .whereNull('deleted_at')
      .orderBy('last_activity', 'desc')
      .select('*');
  }

  async updateLastActivity(sessionId: number): Promise<boolean> {
    if (!sessionId) return false;
    const result = await this.db(this.tableName)
      .where({ id: sessionId })
      .whereNull('deleted_at')
      .update({
        last_activity: new Date(),
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async invalidateSession(sessionId: number): Promise<boolean> {
    if (!sessionId) return false;
    const result = await this.db(this.tableName)
      .where({ id: sessionId })
      .whereNull('deleted_at')
      .update({
        is_active: false,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async invalidateAllUserSessions(userId: number): Promise<number> {
    if (!userId) return 0;
    return this.db(this.tableName)
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .update({
        is_active: false,
        updated_at: new Date()
      });
  }

  async cleanupExpiredSessions(): Promise<number> {
    // Remove sessões inativas há mais de 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.db(this.tableName)
      .where('last_activity', '<', thirtyDaysAgo)
      .orWhere('is_active', false)
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      });
  }

  async findExpiredSessions(): Promise<ISession[]> {
    // Sessões inativas há mais de 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    return this.db(this.tableName)
      .where('last_activity', '<', twentyFourHoursAgo)
      .where('is_active', true)
      .whereNull('deleted_at')
      .select('*');
  }

  async getActiveSessionsCount(userId: number): Promise<number> {
    if (!userId) return 0;
    const result = await this.db(this.tableName)
      .where({ user_id: userId, is_active: true })
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    
    return Number(result?.count || 0);
  }

  async getSessionWithUser(sessionId: number): Promise<(ISession & { user?: any }) | undefined> {
    if (!sessionId) return undefined;
    return this.db(this.tableName)
      .leftJoin('users', 'sessions.user_id', 'users.id')
      .where('sessions.id', sessionId)
      .whereNull('sessions.deleted_at')
      .first({
        'sessions.*': {},
        'users.name as user_name': 'user.name',
        'users.email as user_email': 'user.email'
      });
  }

  async findByTokenAndUpdate(token: string): Promise<ISession | undefined> {
    if (!token) return undefined;
    
    const session = await this.findByToken(token);
    if (session && session.id) {
      await this.updateLastActivity(session.id);
      return { ...session, last_activity: new Date().toISOString() };
    }
    
    return undefined;
  }

  async getSessionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
  }> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const total = await this.db(this.tableName)
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const active = await this.db(this.tableName)
      .where('is_active', true)
      .where('last_activity', '>', twentyFourHoursAgo)
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const expired = await this.db(this.tableName)
      .where('last_activity', '<', twentyFourHoursAgo)
      .where('is_active', true)
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    return {
      total: Number(total?.count || 0),
      active: Number(active?.count || 0),
      expired: Number(expired?.count || 0)
    };
  }
}

export default new Session();