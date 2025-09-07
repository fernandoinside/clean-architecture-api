import BaseModel from './BaseModel';

export interface ISubscription {
  id?: number;
  company_id?: number | null;
  customer_id?: number | null;
  plan_id: number;
  // Campos Pagar.me
  pagarme_subscription_id?: string | null;
  pagarme_customer_id?: string | null;
  pagarme_card_id?: string | null;
  payment_method?: 'pix' | 'credit_card' | null;
  // Status e datas
  status: 'active' | 'inactive' | 'cancelled' | 'pending';
  current_period_start: string;
  current_period_end: string;
  canceled_at?: string | null;
  ended_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  auto_renew?: boolean;
  is_trial?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

class Subscription extends BaseModel<ISubscription> {
  constructor() {
    super('subscriptions');
  }

  async findActiveSubscriptions(): Promise<ISubscription[]> {
    return this.db(this.tableName)
      .where({ status: 'active' })
      .whereNull('deleted_at')
      .where('current_period_end', '>', new Date())
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByCompanyId(companyId: number): Promise<ISubscription[]> {
    if (!companyId) return [];
    return this.db(this.tableName)
      .where({ company_id: companyId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByCustomerId(customerId: number): Promise<ISubscription[]> {
    if (!customerId) return [];
    return this.db(this.tableName)
      .where({ customer_id: customerId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByPlanId(planId: number): Promise<ISubscription[]> {
    if (!planId) return [];
    return this.db(this.tableName)
      .where({ plan_id: planId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findExpiringSubscriptions(days: number = 7): Promise<ISubscription[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return this.db(this.tableName)
      .where({ status: 'active' })
      .whereNull('deleted_at')
      .whereBetween('current_period_end', [new Date(), targetDate])
      .orderBy('current_period_end', 'asc')
      .select('*');
  }

  async renewSubscription(id: number, endDate: string): Promise<boolean> {
    if (!id || !endDate) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        current_period_end: endDate,
        status: 'active',
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async cancelSubscription(id: number): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        status: 'cancelled',
        auto_renew: false,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async updateAutoRenew(id: number, autoRenew: boolean): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        auto_renew: autoRenew,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async getCurrentSubscription(companyId: number): Promise<ISubscription | undefined> {
    if (!companyId) return undefined;
    return this.db(this.tableName)
      .where({ company_id: companyId, status: 'active' })
      .whereNull('deleted_at')
      .where('current_period_end', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();
  }

  async getCurrentCustomerSubscription(customerId: number): Promise<ISubscription | undefined> {
    if (!customerId) return undefined;
    return this.db(this.tableName)
      .where({ customer_id: customerId, status: 'active' })
      .whereNull('deleted_at')
      .where('current_period_end', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();
  }

  async getSubscriptionHistory(companyId: number): Promise<ISubscription[]> {
    if (!companyId) return [];
    return this.db(this.tableName)
      .where({ company_id: companyId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getCustomerSubscriptionHistory(customerId: number): Promise<ISubscription[]> {
    if (!customerId) return [];
    return this.db(this.tableName)
      .where({ customer_id: customerId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getSubscriptionWithPlan(id: number): Promise<(ISubscription & { plan?: any }) | undefined> {
    if (!id) return undefined;
    return this.db(this.tableName)
      .leftJoin('plans', 'subscriptions.plan_id', 'plans.id')
      .where('subscriptions.id', id)
      .whereNull('subscriptions.deleted_at')
      .first({
        'subscriptions.*': {},
        'plans.name as plan_name': 'plan.name',
        'plans.price as plan_price': 'plan.price',
        'plans.interval as plan_interval': 'plan.interval'
      });
  }

  async expireSubscription(id: number): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        status: 'inactive',
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async activateSubscription(id: number): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        status: 'active',
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    expiring: number;
    cancelled: number;
  }> {
    const total = await this.db(this.tableName)
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const active = await this.db(this.tableName)
      .where({ status: 'active' })
      .whereNull('deleted_at')
      .where('current_period_end', '>', new Date())
      .count('* as count')
      .first();

    const expiring = await this.db(this.tableName)
      .where({ status: 'active' })
      .whereNull('deleted_at')
      .whereBetween('current_period_end', [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)])
      .count('* as count')
      .first();

    const cancelled = await this.db(this.tableName)
      .where({ status: 'cancelled' })
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    return {
      total: Number(total?.count || 0),
      active: Number(active?.count || 0),
      expiring: Number(expiring?.count || 0),
      cancelled: Number(cancelled?.count || 0)
    };
  }

  async findExpiredSubscriptions(): Promise<ISubscription[]> {
    return this.db(this.tableName)
      .where({ status: 'active' })
      .whereNull('deleted_at')
      .where('current_period_end', '<', new Date())
      .orderBy('current_period_end', 'asc')
      .select('*');
  }

  // Métodos específicos do Pagar.me
  async findByPagarmeCustomerId(pagarmeCustomerId: string): Promise<ISubscription[]> {
    if (!pagarmeCustomerId) return [];
    return this.db(this.tableName)
      .where({ pagarme_customer_id: pagarmeCustomerId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByPagarmeSubscriptionId(pagarmeSubscriptionId: string): Promise<ISubscription | undefined> {
    if (!pagarmeSubscriptionId) return undefined;
    return this.db(this.tableName)
      .where({ pagarme_subscription_id: pagarmeSubscriptionId })
      .whereNull('deleted_at')
      .first();
  }

  async updatePagarmeData(id: number, data: {
    pagarme_subscription_id?: string;
    pagarme_customer_id?: string;
    pagarme_card_id?: string;
    payment_method?: 'pix' | 'credit_card';
  }): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        ...data,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async findByPaymentMethod(paymentMethod: 'pix' | 'credit_card'): Promise<ISubscription[]> {
    return this.db(this.tableName)
      .where({ payment_method: paymentMethod })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getSubscriptionsByPaymentStats(): Promise<{
    pix: number;
    credit_card: number;
    total: number;
  }> {
    const pixCount = await this.db(this.tableName)
      .where({ payment_method: 'pix' })
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const cardCount = await this.db(this.tableName)
      .where({ payment_method: 'credit_card' })
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const total = await this.db(this.tableName)
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    return {
      pix: Number(pixCount?.count || 0),
      credit_card: Number(cardCount?.count || 0),
      total: Number(total?.count || 0)
    };
  }
}

export default new Subscription();