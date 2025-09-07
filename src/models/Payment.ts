import BaseModel from './BaseModel';

export interface IPayment {
  id?: number;
  customerId: number;
  planId: number;
  amount: number;
  currency: string;
  status?: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId: string;
  // Campos específicos do Pagar.me
  pagarme_transaction_id?: string | null;
  pagarme_charge_id?: string | null;
  pix_qr_code?: string | null;
  pix_qr_code_url?: string | null;
  pix_expires_at?: string | null;
  card_last_digits?: string | null;
  card_brand?: string | null;
  card_holder_name?: string | null;
  pagarme_metadata?: any;
  fee_amount?: number;
  acquirer_response_code?: string | null;
  acquirer_message?: string | null;
  payment_type?: 'pix' | 'credit_card' | null;
  created_at?: string;
  updated_at?: string;
}

class Payment extends BaseModel<IPayment> {
  constructor() {
    super('payments');
  }

  async findByCustomerId(customerId: number): Promise<IPayment[]> {
    if (!customerId) return [];
    return this.db(this.tableName)
      .where({ customer_id: customerId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByPlanId(planId: number): Promise<IPayment[]> {
    if (!planId) return [];
    return this.db(this.tableName)
      .where({ plan_id: planId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByStatus(status: 'pending' | 'completed' | 'failed'): Promise<IPayment[]> {
    return this.db(this.tableName)
      .where({ status })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByTransactionId(transactionId: string): Promise<IPayment | undefined> {
    if (!transactionId) return undefined;
    return this.db(this.tableName)
      .where({ transaction_id: transactionId })
      .whereNull('deleted_at')
      .first();
  }

  async updatePaymentStatus(id: number, status: 'pending' | 'completed' | 'failed'): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        status,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async getPaymentsByDateRange(start: Date, end: Date): Promise<IPayment[]> {
    return this.db(this.tableName)
      .whereNull('deleted_at')
      .whereBetween('created_at', [start, end])
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getRevenueByPeriod(start: Date, end: Date): Promise<{ total: number; count: number }> {
    const result = await this.db(this.tableName)
      .whereNull('deleted_at')
      .where('status', 'completed')
      .whereBetween('created_at', [start, end])
      .sum('amount as total')
      .count('* as count')
      .first();
    
    return {
      total: Number(result?.total || 0),
      count: Number(result?.count || 0)
    };
  }

  async findFailedPayments(): Promise<IPayment[]> {
    return this.findByStatus('failed');
  }

  async retryFailedPayment(id: number): Promise<boolean> {
    return this.updatePaymentStatus(id, 'pending');
  }

  async getCustomerPaymentHistory(customerId: number, limit = 10): Promise<IPayment[]> {
    if (!customerId) return [];
    return this.db(this.tableName)
      .where({ customer_id: customerId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('*');
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.db(this.tableName)
      .whereNull('deleted_at')
      .where('status', 'completed')
      .sum('amount as total')
      .first();
    
    return Number(result?.total || 0);
  }

  // Métodos específicos do Pagar.me
  async findByPagarmeTransactionId(pagarmeTransactionId: string): Promise<IPayment | undefined> {
    if (!pagarmeTransactionId) return undefined;
    return this.db(this.tableName)
      .where({ pagarme_transaction_id: pagarmeTransactionId })
      .whereNull('deleted_at')
      .first();
  }

  async findByPagarmeChargeId(pagarmeChargeId: string): Promise<IPayment | undefined> {
    if (!pagarmeChargeId) return undefined;
    return this.db(this.tableName)
      .where({ pagarme_charge_id: pagarmeChargeId })
      .whereNull('deleted_at')
      .first();
  }

  async updatePagarmeData(id: number, data: {
    pagarme_transaction_id?: string;
    pagarme_charge_id?: string;
    pix_qr_code?: string;
    pix_qr_code_url?: string;
    pix_expires_at?: string;
    card_last_digits?: string;
    card_brand?: string;
    card_holder_name?: string;
    pagarme_metadata?: any;
    fee_amount?: number;
    acquirer_response_code?: string;
    acquirer_message?: string;
    payment_type?: 'pix' | 'credit_card';
    status?: 'pending' | 'completed' | 'failed';
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

  async findByPaymentType(paymentType: 'pix' | 'credit_card'): Promise<IPayment[]> {
    return this.db(this.tableName)
      .where({ payment_type: paymentType })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findPendingPIXPayments(): Promise<IPayment[]> {
    return this.db(this.tableName)
      .where({ 
        payment_type: 'pix',
        status: 'pending'
      })
      .whereNull('deleted_at')
      .where('pix_expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findExpiredPIXPayments(): Promise<IPayment[]> {
    return this.db(this.tableName)
      .where({ 
        payment_type: 'pix',
        status: 'pending'
      })
      .whereNull('deleted_at')
      .where('pix_expires_at', '<', new Date())
      .orderBy('pix_expires_at', 'asc')
      .select('*');
  }

  async getPaymentStatsByType(): Promise<{
    pix: { count: number; amount: number };
    credit_card: { count: number; amount: number };
    total: { count: number; amount: number };
  }> {
    const pixStats = await this.db(this.tableName)
      .where({ payment_type: 'pix', status: 'completed' })
      .whereNull('deleted_at')
      .count('* as count')
      .sum('amount as amount')
      .first();

    const cardStats = await this.db(this.tableName)
      .where({ payment_type: 'credit_card', status: 'completed' })
      .whereNull('deleted_at')
      .count('* as count')
      .sum('amount as amount')
      .first();

    const totalStats = await this.db(this.tableName)
      .where({ status: 'completed' })
      .whereNull('deleted_at')
      .count('* as count')
      .sum('amount as amount')
      .first();

    return {
      pix: {
        count: Number(pixStats?.count || 0),
        amount: Number(pixStats?.amount || 0)
      },
      credit_card: {
        count: Number(cardStats?.count || 0),
        amount: Number(cardStats?.amount || 0)
      },
      total: {
        count: Number(totalStats?.count || 0),
        amount: Number(totalStats?.amount || 0)
      }
    };
  }

  async getTotalFees(): Promise<number> {
    const result = await this.db(this.tableName)
      .whereNull('deleted_at')
      .where('status', 'completed')
      .sum('fee_amount as total')
      .first();
    
    return Number(result?.total || 0);
  }

  async createPagarmePayment(data: Partial<IPayment>): Promise<IPayment | undefined> {
    // Garantir que campos obrigatórios estejam definidos
    if (!data.customerId || !data.planId || data.amount === undefined) {
      throw new Error('Campos obrigatórios não foram fornecidos');
    }
    
    return this.create({
      ...data,
      customerId: data.customerId!,
      planId: data.planId!,
      amount: data.amount!,
      pagarme_metadata: data.pagarme_metadata ? JSON.stringify(data.pagarme_metadata) : null
    } as Omit<IPayment, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>);
  }
}

export default new Payment();