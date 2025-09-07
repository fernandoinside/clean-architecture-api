import BaseModel from './BaseModel';

export interface IPlan {
  id?: number;
  name: string;
  description?: string | null;
  price: number;
  currency?: string;
  interval?: 'monthly' | 'yearly';
  features?: string[];
  is_active?: boolean;
  max_users?: number;
  max_storage_gb?: number;
  created_at?: string;
  updated_at?: string;
}

class Plan extends BaseModel<IPlan> {
  constructor() {
    super('plans');
  }

  async findById(id: number): Promise<IPlan | undefined> {
    if (!id) return undefined;
    return this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  async findActivePlans(): Promise<IPlan[]> {
    return this.db(this.tableName)
      .where({ is_active: true })
      .whereNull('deleted_at')
      .orderBy('price', 'asc')
      .select('*');
  }

  async findByPriceRange(min: number, max: number): Promise<IPlan[]> {
    return this.db(this.tableName)
      .whereBetween('price', [min, max])
      .whereNull('deleted_at')
      .orderBy('price', 'asc')
      .select('*');
  }

  async findByInterval(interval: 'monthly' | 'yearly'): Promise<IPlan[]> {
    return this.db(this.tableName)
      .where({ interval })
      .whereNull('deleted_at')
      .orderBy('price', 'asc')
      .select('*');
  }

  async findMostPopular(): Promise<IPlan | undefined> {
    // Busca o plano com mais assinaturas ativas
    return this.db(this.tableName)
      .leftJoin('subscriptions', 'plans.id', 'subscriptions.plan_id')
      .where('plans.is_active', true)
      .whereNull('plans.deleted_at')
      .groupBy('plans.id')
      .orderByRaw('COUNT(subscriptions.id) DESC')
      .first('plans.*');
  }

  async activatePlan(id: number): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        is_active: true,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async deactivatePlan(id: number): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        is_active: false,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async getPlanSubscriptionCount(planId: number): Promise<number> {
    if (!planId) return 0;
    const result = await this.db('subscriptions')
      .where({ plan_id: planId })
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    
    return Number(result?.count || 0);
  }

  async updatePlanFeatures(id: number, features: string[]): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        features: JSON.stringify(features),
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async getCheapestPlan(): Promise<IPlan | undefined> {
    return this.db(this.tableName)
      .where({ is_active: true })
      .whereNull('deleted_at')
      .orderBy('price', 'asc')
      .first();
  }

  async getMostExpensivePlan(): Promise<IPlan | undefined> {
    return this.db(this.tableName)
      .where({ is_active: true })
      .whereNull('deleted_at')
      .orderBy('price', 'desc')
      .first();
  }

  async findByName(name: string): Promise<IPlan | undefined> {
    if (!name) return undefined;
    return this.db(this.tableName)
      .where({ name })
      .whereNull('deleted_at')
      .first();
  }

  async getPlanStats(planId: number): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalRevenue: number;
  }> {
    if (!planId) return { totalSubscriptions: 0, activeSubscriptions: 0, totalRevenue: 0 };
    
    const totalSubs = await this.db('subscriptions')
      .where({ plan_id: planId })
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    
    const activeSubs = await this.db('subscriptions')
      .where({ plan_id: planId, status: 'active' })
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    
    const revenue = await this.db('payments')
      .where({ plan_id: planId, status: 'completed' })
      .whereNull('deleted_at')
      .sum('amount as total')
      .first();
    
    return {
      totalSubscriptions: Number(totalSubs?.count || 0),
      activeSubscriptions: Number(activeSubs?.count || 0),
      totalRevenue: Number(revenue?.total || 0)
    };
  }
}

export default new Plan();