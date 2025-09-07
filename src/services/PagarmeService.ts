import axios, { AxiosInstance } from 'axios';
import Setting from '../models/Setting';
import logger from '../config/logger';

interface PagarmeConfig {
  publicKey: string;
  secretKey: string;
  accountId: string;
  version: string;
}

interface Customer {
  name: string;
  email: string;
  document: string;
  type: 'individual' | 'company';
  phone?: {
    country_code: string;
    area_code: string;
    number: string;
  };
  address?: {
    street: string;
    street_number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}

interface PIXPaymentData {
  amount: number;
  customer: Customer;
  expires_in?: number; // segundos
  metadata?: Record<string, any>;
}

interface CardPaymentData {
  amount: number;
  customer: Customer;
  card: {
    number: string;
    holder_name: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
  };
  billing_address?: {
    street: string;
    street_number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  metadata?: Record<string, any>;
}

interface PagarmeTransaction {
  id: string;
  amount: number;
  status: 'processing' | 'authorized' | 'paid' | 'refunded' | 'waiting_payment' | 'pending_refund' | 'refused';
  gateway_id: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  charges: Array<{
    id: string;
    amount: number;
    status: string;
    payment_method: 'pix' | 'credit_card';
    paid_at?: string;
    created_at: string;
    last_transaction?: {
      pix_qr_code?: string;
      pix_qr_code_url?: string;
      pix_expires_at?: string;
      acquirer_response_code?: string;
      acquirer_message?: string;
    };
  }>;
  created_at: string;
  updated_at: string;
}

interface WebhookData {
  id: string;
  account: {
    id: string;
  };
  type: string;
  created_at: string;
  data: {
    id: string;
    status: string;
    amount: number;
    paid_amount?: number;
    refunded_amount?: number;
    customer: {
      id: string;
      name: string;
      email: string;
    };
    charges: Array<{
      id: string;
      status: string;
      amount: number;
      payment_method: string;
      paid_at?: string;
      last_transaction?: {
        pix_qr_code?: string;
        pix_qr_code_url?: string;
        acquirer_response_code?: string;
        acquirer_message?: string;
      };
    }>;
  };
}

class PagarmeService {
  private api: AxiosInstance;
  private config: PagarmeConfig | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.pagar.me/core/v5',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SRM-Gestao/1.0.0'
      },
      timeout: 30000
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor para autenticação
    this.api.interceptors.request.use(
      async (config) => {
        await this.loadConfig();
        if (this.config) {
          config.auth = {
            username: this.config.secretKey,
            password: ''
          };
        }
        return config;
      },
      (error) => {
        logger.error('Erro na requisição Pagar.me:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para logs
    this.api.interceptors.response.use(
      (response) => {
        logger.info('Resposta Pagar.me:', {
          url: response.config.url,
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('Erro na resposta Pagar.me:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  private async loadConfig(): Promise<void> {
    if (this.config) return;

    try {
      const [publicKey, secretKey, accountId, version] = await Promise.all([
        Setting.getValue('pagarme_chave_publica'),
        Setting.getValue('pagarme_chave_secreta'),
        Setting.getValue('pagarme_id'),
        Setting.getValue('pagarme_version', '5.0')
      ]);

      if (!publicKey || !secretKey || !accountId) {
        throw new Error('Configurações do Pagar.me não encontradas');
      }

      this.config = {
        publicKey,
        secretKey,
        accountId,
        version
      };

      logger.info('Configurações do Pagar.me carregadas com sucesso');
    } catch (error) {
      logger.error('Erro ao carregar configurações do Pagar.me:', error);
      throw error;
    }
  }

  async createCustomer(customerData: Customer): Promise<any> {
    try {
      const response = await this.api.post('/customers', customerData);
      return response.data;
    } catch (error: any) {
      logger.error('Erro ao criar cliente no Pagar.me:', error);
      throw new Error(`Erro ao criar cliente: ${error.response?.data?.message || error.message}`);
    }
  }

  async createPIXPayment(paymentData: PIXPaymentData): Promise<PagarmeTransaction> {
    try {
      // Criar cliente se não existir
      let customer;
      try {
        customer = await this.createCustomer(paymentData.customer);
      } catch (error) {
        // Cliente pode já existir, continuar
        customer = { id: paymentData.customer.email };
      }

      const transactionData = {
        amount: Math.round(paymentData.amount * 100), // Converter para centavos
        customer: {
          id: customer.id
        },
        charges: [{
          amount: Math.round(paymentData.amount * 100),
          payment_method: 'pix',
          pix: {
            expires_in: paymentData.expires_in || 3600, // 1 hora por padrão
            additional_information: [{
              name: 'Assinatura SRM Gestão',
              value: `R$ ${paymentData.amount.toFixed(2)}`
            }]
          }
        }],
        metadata: paymentData.metadata || {}
      };

      const response = await this.api.post('/orders', transactionData);
      return response.data;
    } catch (error: any) {
      logger.error('Erro ao criar pagamento PIX:', error);
      throw new Error(`Erro ao criar pagamento PIX: ${error.response?.data?.message || error.message}`);
    }
  }

  async createCardPayment(paymentData: CardPaymentData): Promise<PagarmeTransaction> {
    try {
      // Criar cliente se não existir
      let customer;
      try {
        customer = await this.createCustomer(paymentData.customer);
      } catch (error) {
        customer = { id: paymentData.customer.email };
      }

      const transactionData = {
        amount: Math.round(paymentData.amount * 100), // Converter para centavos
        customer: {
          id: customer.id
        },
        charges: [{
          amount: Math.round(paymentData.amount * 100),
          payment_method: 'credit_card',
          credit_card: {
            card: {
              number: paymentData.card.number.replace(/\s/g, ''),
              holder_name: paymentData.card.holder_name,
              exp_month: paymentData.card.exp_month,
              exp_year: paymentData.card.exp_year,
              cvv: paymentData.card.cvv
            },
            billing_address: paymentData.billing_address
          }
        }],
        metadata: paymentData.metadata || {}
      };

      const response = await this.api.post('/orders', transactionData);
      return response.data;
    } catch (error: any) {
      logger.error('Erro ao criar pagamento cartão:', error);
      throw new Error(`Erro ao criar pagamento cartão: ${error.response?.data?.message || error.message}`);
    }
  }

  async getTransaction(transactionId: string): Promise<PagarmeTransaction> {
    try {
      const response = await this.api.get(`/orders/${transactionId}`);
      return response.data;
    } catch (error: any) {
      logger.error('Erro ao buscar transação:', error);
      throw new Error(`Erro ao buscar transação: ${error.response?.data?.message || error.message}`);
    }
  }

  async cancelTransaction(transactionId: string): Promise<boolean> {
    try {
      await this.api.delete(`/orders/${transactionId}`);
      return true;
    } catch (error: any) {
      logger.error('Erro ao cancelar transação:', error);
      return false;
    }
  }

  async refundTransaction(transactionId: string, amount?: number): Promise<boolean> {
    try {
      const refundData = amount ? { amount: Math.round(amount * 100) } : {};
      await this.api.post(`/orders/${transactionId}/refunds`, refundData);
      return true;
    } catch (error: any) {
      logger.error('Erro ao estornar transação:', error);
      return false;
    }
  }

  validateWebhook(signature: string, body: string): boolean {
    try {
      if (!this.config) {
        throw new Error('Configurações não carregadas');
      }

      // Implementar validação de assinatura do webhook
      // Por enquanto, retornamos true para desenvolvimento
      return true;
    } catch (error) {
      logger.error('Erro ao validar webhook:', error);
      return false;
    }
  }

  processWebhook(webhookData: WebhookData): {
    transactionId: string;
    status: string;
    paymentMethod: string;
    amount: number;
    paidAmount?: number;
    chargeId?: string;
    pixData?: {
      qrCode?: string;
      qrCodeUrl?: string;
      expiresAt?: string;
    };
    cardData?: {
      lastDigits?: string;
      brand?: string;
      acquirerCode?: string;
      acquirerMessage?: string;
    };
  } | null {
    try {
      const { data } = webhookData;
      
      if (!data || !data.charges || data.charges.length === 0) {
        return null;
      }

      const charge = data.charges?.[0];
      if (!charge) {
        throw new Error('Nenhuma cobrança encontrada na transação');
      }
      
      const transaction = charge.last_transaction;

      const result: any = {
        transactionId: data.id,
        status: this.mapPagarmeStatus(data.status),
        paymentMethod: charge.payment_method,
        amount: data.amount / 100, // Converter de centavos
        paidAmount: data.paid_amount ? data.paid_amount / 100 : undefined,
        chargeId: charge.id
      };

      if (charge.payment_method === 'pix' && transaction) {
        result.pixData = {
          qrCode: transaction.pix_qr_code,
          qrCodeUrl: transaction.pix_qr_code_url,
          expiresAt: (transaction as any).pix_expires_at || (transaction as any).expires_at
        };
      }

      if (charge.payment_method === 'credit_card' && transaction) {
        result.cardData = {
          acquirerCode: transaction.acquirer_response_code,
          acquirerMessage: transaction.acquirer_message
        };
      }

      return result;
    } catch (error) {
      logger.error('Erro ao processar webhook:', error);
      return null;
    }
  }

  private mapPagarmeStatus(pagarmeStatus: string): 'pending' | 'completed' | 'failed' {
    const statusMap: Record<string, 'pending' | 'completed' | 'failed'> = {
      'processing': 'pending',
      'authorized': 'completed',
      'paid': 'completed',
      'waiting_payment': 'pending',
      'pending_refund': 'pending',
      'refused': 'failed',
      'refunded': 'failed'
    };

    return statusMap[pagarmeStatus] || 'pending';
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.loadConfig();
      // Fazer uma requisição simples para verificar se as credenciais estão válidas
      await this.api.get('/customers?page=1&size=1');
      return true;
    } catch (error) {
      logger.error('Health check Pagar.me falhou:', error);
      return false;
    }
  }

  getPublicKey(): string | null {
    return this.config?.publicKey || null;
  }
}

export default new PagarmeService();
export { Customer, PIXPaymentData, CardPaymentData, PagarmeTransaction, WebhookData };