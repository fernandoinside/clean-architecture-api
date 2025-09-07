import { Request, Response } from 'express';
import PagarmeService, { PIXPaymentData, CardPaymentData } from '../services/PagarmeService';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import Customer from '../models/Customer';
import Company from '../models/Company';
import logger from '../config/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutPIXRequest:
 *       type: object
 *       required:
 *         - plan_id
 *         - customer_data
 *         - subscription_type
 *       properties:
 *         plan_id:
 *           type: number
 *           description: ID do plano
 *         subscription_type:
 *           type: string
 *           enum: [company, customer]
 *           description: Tipo de assinatura
 *         company_id:
 *           type: number
 *           description: ID da empresa (obrigatório se subscription_type = company)
 *         customer_id:
 *           type: number
 *           description: ID do cliente (obrigatório se subscription_type = customer)
 *         customer_data:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             document:
 *               type: string
 *             phone:
 *               type: object
 *               properties:
 *                 country_code:
 *                   type: string
 *                 area_code:
 *                   type: string
 *                 number:
 *                   type: string
 *             address:
 *               type: object
 *               properties:
 *                 street:
 *                   type: string
 *                 street_number:
 *                   type: string
 *                 neighborhood:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 zip_code:
 *                   type: string
 *                 country:
 *                   type: string
 *         expires_in:
 *           type: number
 *           description: Tempo de expiração do PIX em segundos (padrão 3600)
 *     
 *     CheckoutCardRequest:
 *       type: object
 *       required:
 *         - plan_id
 *         - customer_data
 *         - card_data
 *         - subscription_type
 *       properties:
 *         plan_id:
 *           type: number
 *         subscription_type:
 *           type: string
 *           enum: [company, customer]
 *         company_id:
 *           type: number
 *         customer_id:
 *           type: number
 *         customer_data:
 *           $ref: '#/components/schemas/CheckoutPIXRequest/properties/customer_data'
 *         card_data:
 *           type: object
 *           properties:
 *             number:
 *               type: string
 *             holder_name:
 *               type: string
 *             exp_month:
 *               type: string
 *             exp_year:
 *               type: string
 *             cvv:
 *               type: string
 *         billing_address:
 *           $ref: '#/components/schemas/CheckoutPIXRequest/properties/customer_data/properties/address'
 */
class CheckoutController {
  
  private sendSuccess(res: Response, data: any, message?: string): void {
    res.json({
      success: true,
      message,
      data
    });
  }

  private sendError(res: Response, message: string, statusCode: number = 500): void {
    res.status(statusCode).json({
      success: false,
      message
    });
  }
  /**
   * @swagger
   * /api/checkout/pix:
   *   post:
   *     summary: Criar pagamento PIX
   *     tags: [Checkout]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CheckoutPIXRequest'
   *     responses:
   *       200:
   *         description: PIX criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     payment_id:
   *                       type: number
   *                     transaction_id:
   *                       type: string
   *                     pix_qr_code:
   *                       type: string
   *                     pix_qr_code_url:
   *                       type: string
   *                     expires_at:
   *                       type: string
   *                     amount:
   *                       type: number
   */
  async createPIXPayment(req: Request, res: Response): Promise<void> {
    try {
      const { 
        plan_id, 
        subscription_type, 
        company_id, 
        customer_id, 
        customer_data, 
        expires_in 
      } = req.body;

      // Validar dados obrigatórios
      if (!plan_id || !subscription_type || !customer_data) {
        this.sendError(res, 'Dados obrigatórios não fornecidos', 400);
        return;
      }

      if (subscription_type === 'company' && !company_id) {
        this.sendError(res, 'company_id é obrigatório quando subscription_type é company', 400);
        return;
      }

      if (subscription_type === 'customer' && !customer_id) {
        this.sendError(res, 'customer_id é obrigatório quando subscription_type é customer', 400);
        return;
      }

      // Buscar plano
      const plan = await Plan.findById(plan_id);
      if (!plan) {
        this.sendError(res, 'Plano não encontrado', 404);
        return;
      }

      // Validar entidade (company ou customer)
      let entity = null;
      if (subscription_type === 'company') {
        entity = await Company.findById(company_id);
        if (!entity) {
          this.sendError(res, 'Empresa não encontrada', 404);
          return;
        }
      } else {
        entity = await Customer.findById(customer_id);
        if (!entity) {
          this.sendError(res, 'Cliente não encontrado', 404);
          return;
        }
      }

      // Criar pagamento no banco local primeiro
      const payment = await Payment.create({
        customerId: subscription_type === 'customer' ? customer_id : company_id,
        planId: plan_id,
        amount: plan.price,
        currency: plan.currency || 'BRL',
        status: 'pending',
        paymentMethod: 'pix',
        transactionId: '', // Será atualizado após criar no Pagar.me
        payment_type: 'pix'
      });

      if (!payment) {
        this.sendError(res, 'Erro ao criar registro de pagamento', 500);
        return;
      }

      // Criar PIX no Pagar.me
      const pixData: PIXPaymentData = {
        amount: plan.price,
        customer: {
          ...customer_data,
          type: customer_data.document?.length === 11 ? 'individual' : 'company'
        },
        expires_in: expires_in || 3600,
        metadata: {
          payment_id: payment.id,
          plan_id: plan.id,
          subscription_type,
          entity_id: subscription_type === 'company' ? company_id : customer_id
        }
      };

      const pagarmeTransaction = await PagarmeService.createPIXPayment(pixData);
      
      // Extrair dados do PIX
      const charge = pagarmeTransaction.charges?.[0];
      if (!charge) {
        throw new Error('Nenhuma cobrança encontrada na transação');
      }
      
      const pixTransaction = charge.last_transaction;

      // Atualizar pagamento com dados do Pagar.me
      if (!payment.id) {
        throw new Error('ID do pagamento não encontrado');
      }
      
      await Payment.updatePagarmeData(payment.id, {
        pagarme_transaction_id: pagarmeTransaction.id,
        pagarme_charge_id: charge.id,
        pix_qr_code: pixTransaction?.pix_qr_code,
        pix_qr_code_url: pixTransaction?.pix_qr_code_url,
        pix_expires_at: pixTransaction?.pix_expires_at,
        pagarme_metadata: pixData.metadata,
        payment_type: 'pix'
      });

      // Atualizar transactionId
      await Payment.db('payments')
        .where({ id: payment.id })
        .update({ transactionId: pagarmeTransaction.id });

      this.sendSuccess(res, {
        payment_id: payment.id,
        transaction_id: pagarmeTransaction.id,
        pix_qr_code: pixTransaction?.pix_qr_code,
        pix_qr_code_url: pixTransaction?.pix_qr_code_url,
        expires_at: pixTransaction?.pix_expires_at,
        amount: plan.price,
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.price
        }
      });

    } catch (error: any) {
      logger.error('Erro ao criar pagamento PIX:', error);
      this.sendError(res, error.message || 'Erro interno do servidor', 500);
    }
  }

  /**
   * @swagger
   * /api/checkout/card:
   *   post:
   *     summary: Processar pagamento com cartão
   *     tags: [Checkout]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CheckoutCardRequest'
   *     responses:
   *       200:
   *         description: Pagamento processado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     payment_id:
   *                       type: number
   *                     transaction_id:
   *                       type: string
   *                     status:
   *                       type: string
   *                     subscription_id:
   *                       type: number
   */
  async createCardPayment(req: Request, res: Response): Promise<void> {
    try {
      const { 
        plan_id, 
        subscription_type, 
        company_id, 
        customer_id, 
        customer_data, 
        card_data,
        billing_address
      } = req.body;

      // Validar dados obrigatórios
      if (!plan_id || !subscription_type || !customer_data || !card_data) {
        this.sendError(res, 'Dados obrigatórios não fornecidos', 400);
        return;
      }

      if (subscription_type === 'company' && !company_id) {
        this.sendError(res, 'company_id é obrigatório quando subscription_type é company', 400);
        return;
      }

      if (subscription_type === 'customer' && !customer_id) {
        this.sendError(res, 'customer_id é obrigatório quando subscription_type é customer', 400);
        return;
      }

      // Buscar plano
      const plan = await Plan.findById(plan_id);
      if (!plan) {
        this.sendError(res, 'Plano não encontrado', 404);
        return;
      }

      // Validar entidade
      let entity = null;
      if (subscription_type === 'company') {
        entity = await Company.findById(company_id);
        if (!entity) {
          this.sendError(res, 'Empresa não encontrada', 404);
          return;
        }
      } else {
        entity = await Customer.findById(customer_id);
        if (!entity) {
          this.sendError(res, 'Cliente não encontrado', 404);
          return;
        }
      }

      // Criar pagamento no banco local primeiro
      const payment = await Payment.create({
        customerId: subscription_type === 'customer' ? customer_id : company_id,
        planId: plan_id,
        amount: plan.price,
        currency: plan.currency || 'BRL',
        status: 'pending',
        paymentMethod: 'credit_card',
        transactionId: '',
        payment_type: 'credit_card',
        card_holder_name: card_data.holder_name,
        card_last_digits: card_data.number.slice(-4)
      });

      if (!payment) {
        this.sendError(res, 'Erro ao criar registro de pagamento', 500);
        return;
      }

      // Processar cartão no Pagar.me
      const cardPaymentData: CardPaymentData = {
        amount: plan.price,
        customer: {
          ...customer_data,
          type: customer_data.document?.length === 11 ? 'individual' : 'company'
        },
        card: card_data,
        billing_address: billing_address || customer_data.address,
        metadata: {
          payment_id: payment.id,
          plan_id: plan.id,
          subscription_type,
          entity_id: subscription_type === 'company' ? company_id : customer_id
        }
      };

      const pagarmeTransaction = await PagarmeService.createCardPayment(cardPaymentData);
      
      const charge = pagarmeTransaction.charges?.[0];
      if (!charge) {
        throw new Error('Nenhuma cobrança encontrada na transação');
      }
      
      const cardTransaction = charge.last_transaction;
      const isApproved = charge.status === 'paid' || charge.status === 'authorized';

      // Atualizar pagamento com dados do Pagar.me
      if (!payment.id) {
        throw new Error('ID do pagamento não encontrado');
      }
      
      await Payment.updatePagarmeData(payment.id, {
        pagarme_transaction_id: pagarmeTransaction.id,
        pagarme_charge_id: charge.id,
        acquirer_response_code: cardTransaction?.acquirer_response_code,
        acquirer_message: cardTransaction?.acquirer_message,
        pagarme_metadata: cardPaymentData.metadata,
        payment_type: 'credit_card',
        status: isApproved ? 'completed' : 'failed'
      });

      // Atualizar transactionId
      await Payment.db('payments')
        .where({ id: payment.id })
        .update({ transactionId: pagarmeTransaction.id });

      let subscription = null;

      // Se pagamento aprovado, criar assinatura
      if (isApproved) {
        const periodStart = new Date();
        const periodEnd = new Date();
        
        if (plan.interval === 'monthly') {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        subscription = await Subscription.create({
          company_id: subscription_type === 'company' ? company_id : null,
          customer_id: subscription_type === 'customer' ? customer_id : null,
          plan_id: plan_id,
          pagarme_customer_id: pagarmeTransaction.customer.id,
          payment_method: 'credit_card',
          status: 'active',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          auto_renew: true,
          is_trial: false
        });
      }

      this.sendSuccess(res, {
        payment_id: payment.id,
        transaction_id: pagarmeTransaction.id,
        status: isApproved ? 'approved' : 'failed',
        subscription_id: subscription?.id || null,
        message: isApproved ? 'Pagamento aprovado com sucesso' : 'Pagamento recusado',
        acquirer_message: cardTransaction?.acquirer_message
      });

    } catch (error: any) {
      logger.error('Erro ao processar pagamento cartão:', error);
      this.sendError(res, error.message || 'Erro interno do servidor', 500);
    }
  }

  /**
   * @swagger
   * /api/checkout/status/{transaction_id}:
   *   get:
   *     summary: Verificar status do pagamento
   *     tags: [Checkout]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: transaction_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Status do pagamento
   */
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { transaction_id } = req.params;

      if (!transaction_id) {
        this.sendError(res, 'ID da transação é obrigatório', 400);
        return;
      }

      // Buscar no banco local
      const payment = await Payment.findByPagarmeTransactionId(transaction_id);
      if (!payment) {
        this.sendError(res, 'Pagamento não encontrado', 404);
        return;
      }

      // Buscar status atual no Pagar.me
      const pagarmeTransaction = await PagarmeService.getTransaction(transaction_id);
      const charge = pagarmeTransaction.charges?.[0];
      
      if (!charge) {
        throw new Error('Nenhuma cobrança encontrada na transação');
      }
      
      // Atualizar status local se necessário
      const newStatus = charge.status === 'paid' || charge.status === 'authorized' 
        ? 'completed' : charge.status === 'refused' ? 'failed' : 'pending';
      
      if (payment.status !== newStatus) {
        if (!payment.id) {
          throw new Error('ID do pagamento não encontrado');
        }
        await Payment.updatePagarmeData(payment.id, { status: newStatus });
      }

      this.sendSuccess(res, {
        payment_id: payment.id,
        transaction_id: transaction_id,
        status: newStatus,
        amount: payment.amount,
        payment_type: payment.payment_type,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        pix_data: payment.payment_type === 'pix' ? {
          qr_code: payment.pix_qr_code,
          qr_code_url: payment.pix_qr_code_url,
          expires_at: payment.pix_expires_at
        } : null
      });

    } catch (error: any) {
      logger.error('Erro ao verificar status do pagamento:', error);
      this.sendError(res, error.message || 'Erro interno do servidor', 500);
    }
  }

  /**
   * @swagger
   * /api/webhook/pagarme:
   *   post:
   *     summary: Webhook do Pagar.me
   *     tags: [Webhook]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook processado com sucesso
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData = req.body;
      const signature = req.headers['x-hub-signature-256'] as string;

      // Validar assinatura do webhook
      const isValid = PagarmeService.validateWebhook(signature, JSON.stringify(req.body));
      if (!isValid) {
        this.sendError(res, 'Assinatura do webhook inválida', 401);
        return;
      }

      // Processar webhook
      const processedData = PagarmeService.processWebhook(webhookData);
      if (!processedData) {
        this.sendError(res, 'Dados do webhook inválidos', 400);
        return;
      }

      // Encontrar pagamento local
      const payment = await Payment.findByPagarmeTransactionId(processedData.transactionId);
      if (!payment) {
        logger.warn('Pagamento não encontrado para transação:', processedData.transactionId);
        this.sendSuccess(res, { message: 'Webhook recebido mas pagamento não encontrado' });
        return;
      }

      // Atualizar dados do pagamento
      const updateData: any = {
        status: processedData.status
      };

      if (processedData.pixData) {
        updateData.pix_qr_code = processedData.pixData.qrCode;
        updateData.pix_qr_code_url = processedData.pixData.qrCodeUrl;
        updateData.pix_expires_at = processedData.pixData.expiresAt;
      }

      if (processedData.cardData) {
        updateData.acquirer_response_code = processedData.cardData.acquirerCode;
        updateData.acquirer_message = processedData.cardData.acquirerMessage;
      }

      if (!payment.id) {
        throw new Error('ID do pagamento não encontrado');
      }
      
      await Payment.updatePagarmeData(payment.id, updateData);

      // Se pagamento foi aprovado, ativar/criar assinatura
      if (processedData.status === 'completed') {
        await this.activateSubscription(payment);
      }

      this.sendSuccess(res, { message: 'Webhook processado com sucesso' });

    } catch (error: any) {
      logger.error('Erro ao processar webhook:', error);
      this.sendError(res, 'Erro ao processar webhook', 500);
    }
  }

  private async activateSubscription(payment: any): Promise<void> {
    try {
      // Verificar se já existe assinatura para este pagamento
      const existingSubscription = await Subscription.db('subscriptions')
        .where({ plan_id: payment.planId })
        .where(function() {
          if (payment.customer_id) {
            this.where({ customer_id: payment.customerId });
          } else {
            this.where({ company_id: payment.customerId });
          }
        })
        .whereIn('status', ['active', 'pending'])
        .first();

      if (existingSubscription) {
        // Atualizar assinatura existente
        await Subscription.db('subscriptions')
          .where({ id: existingSubscription.id })
          .update({
            status: 'active',
            updated_at: new Date()
          });
      } else {
        // Criar nova assinatura
        const plan = await Plan.findById(payment.planId);
        if (!plan) return;

        const periodStart = new Date();
        const periodEnd = new Date();
        
        if (plan.interval === 'monthly') {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        await Subscription.create({
          company_id: payment.customer_id ? null : payment.customerId,
          customer_id: payment.customer_id ? payment.customerId : null,
          plan_id: payment.planId,
          payment_method: payment.payment_type,
          status: 'active',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          auto_renew: true,
          is_trial: false
        });
      }

    } catch (error) {
      logger.error('Erro ao ativar assinatura:', error);
    }
  }

  /**
   * @swagger
   * /api/checkout/config:
   *   get:
   *     summary: Obter configurações públicas do checkout
   *     tags: [Checkout]
   *     responses:
   *       200:
   *         description: Configurações do checkout
   */
  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const publicKey = PagarmeService.getPublicKey();
      
      this.sendSuccess(res, {
        public_key: publicKey,
        supported_methods: ['pix', 'credit_card']
      });

    } catch (error: any) {
      logger.error('Erro ao obter configurações:', error);
      this.sendError(res, 'Erro interno do servidor', 500);
    }
  }
}

export default CheckoutController;