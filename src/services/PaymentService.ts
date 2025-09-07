import Payment, { IPayment } from '../models/Payment';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class PaymentService extends BaseService<IPayment> {
  constructor() {
    super(Payment);
  }

  /**
   * Cria um novo pagamento com validações adicionais
   * @param data Dados do pagamento
   * @returns Pagamento criado
   */
  async create(data: Omit<IPayment, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IPayment> {
    if (!data || !data.customerId || !data.planId || !data.amount || !data.currency || !data.paymentMethod || !data.transactionId) {
      throw new ValidationError('ID do cliente, ID do plano, valor, moeda, método de pagamento e ID da transação são obrigatórios');
    }

    try {
      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar pagamento');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar pagamento', error as Error);
    }
  }

  /**
   * Atualiza um pagamento existente
   * @param id ID do pagamento
   * @param data Dados para atualização
   * @returns Pagamento atualizado
   */
  async update(id: number, data: Partial<Omit<IPayment, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IPayment> {
    if (!id) {
      throw new ValidationError('ID do pagamento não fornecido');
    }

    try {
      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar pagamento');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar pagamento', error as Error);
    }
  }

  /**
   * Busca um pagamento pelo ID
   * @param id ID do pagamento
   * @returns Pagamento encontrado
   */
  async findById(id: number): Promise<IPayment> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Pagamento não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar pagamento', error as Error);
    }
  }

  /**
   * Remove um pagamento (soft delete)
   * @param id ID do pagamento
   * @returns true se o pagamento foi removido com sucesso
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await super.delete(id);
      if (result) {
        await this.invalidateCache();
        return true;
      }
      return false;
    } catch (error) {
      throw new DatabaseError('Erro ao remover pagamento', error as Error);
    }
  }

  /**
   * Busca pagamentos com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de pagamentos
   */
  async search(filters: { customerId?: number; planId?: number; status?: 'pending' | 'completed' | 'failed'; paymentMethod?: string; transactionId?: string; startDate?: Date; endDate?: Date }, page = 1, limit = 10) {
    try {
      const { customerId, planId, status, paymentMethod, transactionId, startDate, endDate } = filters;
      
      // Usar métodos específicos do model quando possível
      if (customerId && !planId && !status && !paymentMethod && !transactionId && !startDate && !endDate) {
        const data = await (this.model as any).findByCustomerId(customerId);
        return {
          data: data.slice((page - 1) * limit, page * limit),
          pagination: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
          }
        };
      }

      if (planId && !customerId && !status && !paymentMethod && !transactionId && !startDate && !endDate) {
        const data = await (this.model as any).findByPlanId(planId);
        return {
          data: data.slice((page - 1) * limit, page * limit),
          pagination: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
          }
        };
      }

      if (status && !customerId && !planId && !paymentMethod && !transactionId && !startDate && !endDate) {
        const data = await (this.model as any).findByStatus(status);
        return {
          data: data.slice((page - 1) * limit, page * limit),
          pagination: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
          }
        };
      }

      if (transactionId && !customerId && !planId && !status && !paymentMethod && !startDate && !endDate) {
        const payment = await (this.model as any).findByTransactionId(transactionId);
        return {
          data: payment ? [payment] : [],
          pagination: {
            total: payment ? 1 : 0,
            page,
            limit,
            totalPages: payment ? 1 : 0
          }
        };
      }

      if (startDate && endDate && !customerId && !planId && !status && !paymentMethod && !transactionId) {
        const data = await (this.model as any).getPaymentsByDateRange(startDate, endDate);
        return {
          data: data.slice((page - 1) * limit, page * limit),
          pagination: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
          }
        };
      }

      // Para queries mais complexas, usar query builder
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (customerId) {
        query.where('customer_id', customerId);
      }
      if (planId) {
        query.where('plan_id', planId);
      }
      if (status) {
        query.where('status', status);
      }
      if (paymentMethod) {
        query.where('payment_method', 'ilike', `%${paymentMethod}%`);
      }
      if (transactionId) {
        query.where('transaction_id', 'ilike', `%${transactionId}%`);
      }
      if (startDate) {
        query.where('created_at', '>=', startDate);
      }
      if (endDate) {
        query.where('created_at', '<=', endDate);
      }

      const offset = (page - 1) * limit;

      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('created_at', 'desc');

      const [data, total] = await Promise.all([dataQuery, countQuery]);
      const totalCount = Number(total?.count) || 0;

      return {
        data,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError('Erro ao buscar pagamentos', error as Error);
    }
  }

  /**
   * Busca pagamentos por cliente
   * @param customerId ID do cliente
   * @param limit Limite de resultados
   * @returns Lista de pagamentos do cliente
   */
  async getPaymentsByCustomer(customerId: number, limit?: number): Promise<IPayment[]> {
    try {
      if (limit) {
        return await (this.model as any).getCustomerPaymentHistory(customerId, limit);
      }
      return await (this.model as any).findByCustomerId(customerId);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar pagamentos do cliente', error as Error);
    }
  }

  /**
   * Busca pagamentos por plano
   * @param planId ID do plano
   * @returns Lista de pagamentos do plano
   */
  async getPaymentsByPlan(planId: number): Promise<IPayment[]> {
    try {
      return await (this.model as any).findByPlanId(planId);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar pagamentos do plano', error as Error);
    }
  }

  /**
   * Busca pagamentos por status
   * @param status Status do pagamento
   * @returns Lista de pagamentos com o status especificado
   */
  async getPaymentsByStatus(status: 'pending' | 'completed' | 'failed'): Promise<IPayment[]> {
    try {
      return await (this.model as any).findByStatus(status);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar pagamentos por status', error as Error);
    }
  }

  /**
   * Busca pagamento por ID da transação
   * @param transactionId ID da transação
   * @returns Pagamento encontrado
   */
  async getPaymentByTransactionId(transactionId: string): Promise<IPayment | null> {
    try {
      const payment = await (this.model as any).findByTransactionId(transactionId);
      return payment || null;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar pagamento por ID da transação', error as Error);
    }
  }

  /**
   * Atualiza status do pagamento
   * @param id ID do pagamento
   * @param status Novo status
   * @returns true se atualizado com sucesso
   */
  async updatePaymentStatus(id: number, status: 'pending' | 'completed' | 'failed'): Promise<boolean> {
    try {
      const success = await (this.model as any).updatePaymentStatus(id, status);
      if (success) {
        await this.invalidateCache();
      }
      return success;
    } catch (error) {
      throw new DatabaseError('Erro ao atualizar status do pagamento', error as Error);
    }
  }

  /**
   * Busca pagamentos falhados
   * @returns Lista de pagamentos falhados
   */
  async getFailedPayments(): Promise<IPayment[]> {
    try {
      return await (this.model as any).findFailedPayments();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar pagamentos falhados', error as Error);
    }
  }

  /**
   * Tenta novamente um pagamento falhado
   * @param id ID do pagamento
   * @returns true se status foi alterado para pending
   */
  async retryPayment(id: number): Promise<boolean> {
    try {
      const success = await (this.model as any).retryFailedPayment(id);
      if (success) {
        await this.invalidateCache();
      }
      return success;
    } catch (error) {
      throw new DatabaseError('Erro ao tentar novamente o pagamento', error as Error);
    }
  }

  /**
   * Obtém receita por período
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Total de receita e quantidade de pagamentos
   */
  async getRevenueByPeriod(startDate: Date, endDate: Date): Promise<{ total: number; count: number }> {
    try {
      return await (this.model as any).getRevenueByPeriod(startDate, endDate);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar receita por período', error as Error);
    }
  }

  /**
   * Obtém receita total
   * @returns Receita total de todos os pagamentos completados
   */
  async getTotalRevenue(): Promise<number> {
    try {
      return await (this.model as any).getTotalRevenue();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar receita total', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { PaymentService };

// Exporta uma instância padrão para uso comum
const paymentServiceInstance = new PaymentService();
export default paymentServiceInstance;