import { Router } from 'express';
import CheckoutController from '../controllers/CheckoutController';
import authMiddleware from '../middleware/authMiddleware';
import validationMiddleware from '../middleware/validationMiddleware';
import Joi from 'joi';

const router = Router();

// Schemas de validação
const customerDataSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  document: Joi.string().required(),
  phone: Joi.object({
    country_code: Joi.string().default('55'),
    area_code: Joi.string().required(),
    number: Joi.string().required()
  }).optional(),
  address: Joi.object({
    street: Joi.string().required(),
    street_number: Joi.string().required(),
    neighborhood: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip_code: Joi.string().required(),
    country: Joi.string().default('BR')
  }).optional()
});

const pixPaymentSchema = Joi.object({
  plan_id: Joi.number().integer().positive().required(),
  subscription_type: Joi.string().valid('company', 'customer').required(),
  company_id: Joi.number().integer().positive().when('subscription_type', {
    is: 'company',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  customer_id: Joi.number().integer().positive().when('subscription_type', {
    is: 'customer', 
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  customer_data: customerDataSchema.required(),
  expires_in: Joi.number().integer().min(300).max(86400).default(3600) // 5min a 24h
});

const cardDataSchema = Joi.object({
  number: Joi.string().creditCard().required(),
  holder_name: Joi.string().min(2).max(100).required(),
  exp_month: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).required(),
  exp_year: Joi.string().pattern(/^20\d{2}$/).required(),
  cvv: Joi.string().pattern(/^\d{3,4}$/).required()
});

const cardPaymentSchema = Joi.object({
  plan_id: Joi.number().integer().positive().required(),
  subscription_type: Joi.string().valid('company', 'customer').required(),
  company_id: Joi.number().integer().positive().when('subscription_type', {
    is: 'company',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  customer_id: Joi.number().integer().positive().when('subscription_type', {
    is: 'customer',
    then: Joi.required(), 
    otherwise: Joi.optional()
  }),
  customer_data: customerDataSchema.required(),
  card_data: cardDataSchema.required(),
  billing_address: Joi.object({
    street: Joi.string().required(),
    street_number: Joi.string().required(),
    neighborhood: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip_code: Joi.string().required(),
    country: Joi.string().default('BR')
  }).optional()
});

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Endpoints para processamento de pagamentos
 */

/**
 * @swagger
 * /api/checkout/pix:
 *   post:
 *     summary: Criar pagamento PIX para assinatura
 *     description: Gera um pagamento PIX para criação de assinatura
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutPIXRequest'
 *           example:
 *             plan_id: 1
 *             subscription_type: "company"
 *             company_id: 1
 *             customer_data:
 *               name: "João Silva"
 *               email: "joao@empresa.com"
 *               document: "12345678901"
 *               phone:
 *                 country_code: "55"
 *                 area_code: "11"
 *                 number: "999999999"
 *               address:
 *                 street: "Rua das Flores"
 *                 street_number: "123"
 *                 neighborhood: "Centro"
 *                 city: "São Paulo"
 *                 state: "SP"
 *                 zip_code: "01234567"
 *                 country: "BR"
 *             expires_in: 3600
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment_id:
 *                       type: number
 *                       example: 123
 *                     transaction_id:
 *                       type: string
 *                       example: "tran_abc123"
 *                     pix_qr_code:
 *                       type: string
 *                       example: "00020126580014br.gov.bcb.pix..."
 *                     pix_qr_code_url:
 *                       type: string
 *                       example: "https://pix.example.com/qr/abc123.png"
 *                     expires_at:
 *                       type: string
 *                       example: "2024-08-29T13:00:00Z"
 *                     amount:
 *                       type: number
 *                       example: 99.90
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Plano, empresa ou cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/pix', 
  authMiddleware,
  validationMiddleware(pixPaymentSchema),
  (req, res) => new CheckoutController().createPIXPayment(req, res)
);

/**
 * @swagger
 * /api/checkout/card:
 *   post:
 *     summary: Processar pagamento com cartão de crédito
 *     description: Processa pagamento com cartão e cria assinatura automaticamente se aprovado
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutCardRequest'
 *           example:
 *             plan_id: 1
 *             subscription_type: "customer"
 *             customer_id: 1
 *             customer_data:
 *               name: "Maria Santos"
 *               email: "maria@email.com"
 *               document: "12345678901"
 *               phone:
 *                 country_code: "55"
 *                 area_code: "21"
 *                 number: "988888888"
 *               address:
 *                 street: "Av. Paulista"
 *                 street_number: "1000"
 *                 neighborhood: "Bela Vista"
 *                 city: "São Paulo"
 *                 state: "SP"
 *                 zip_code: "01310100"
 *                 country: "BR"
 *             card_data:
 *               number: "4111111111111111"
 *               holder_name: "MARIA SANTOS"
 *               exp_month: "12"
 *               exp_year: "2025"
 *               cvv: "123"
 *     responses:
 *       200:
 *         description: Pagamento processado
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
 *                       enum: [approved, failed]
 *                     subscription_id:
 *                       type: number
 *                       nullable: true
 *                     message:
 *                       type: string
 */
router.post('/card',
  authMiddleware,
  validationMiddleware(cardPaymentSchema),
  (req, res) => new CheckoutController().createCardPayment(req, res)
);

/**
 * @swagger
 * /api/checkout/status/{transaction_id}:
 *   get:
 *     summary: Verificar status do pagamento
 *     description: Consulta o status atual de um pagamento específico
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         description: ID da transação no Pagar.me
 *         schema:
 *           type: string
 *           example: "tran_abc123"
 *     responses:
 *       200:
 *         description: Status do pagamento
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
 *                       enum: [pending, completed, failed]
 *                     amount:
 *                       type: number
 *                     payment_type:
 *                       type: string
 *                       enum: [pix, credit_card]
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                     pix_data:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         qr_code:
 *                           type: string
 *                         qr_code_url:
 *                           type: string
 *                         expires_at:
 *                           type: string
 *       404:
 *         description: Pagamento não encontrado
 */
router.get('/status/:transaction_id',
  authMiddleware,
  (req, res) => new CheckoutController().getPaymentStatus(req, res)
);

/**
 * @swagger
 * /api/checkout/config:
 *   get:
 *     summary: Obter configurações públicas do checkout
 *     description: Retorna configurações necessárias para o frontend (chave pública, métodos suportados)
 *     tags: [Checkout]
 *     responses:
 *       200:
 *         description: Configurações do checkout
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
 *                     public_key:
 *                       type: string
 *                       example: "pk_test_abc123"
 *                     supported_methods:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["pix", "credit_card"]
 */
router.get('/config',
  (req, res) => new CheckoutController().getConfig(req, res)
);

/**
 * @swagger
 * tags:
 *   name: Webhook
 *   description: Endpoints para webhooks de terceiros
 */

/**
 * @swagger
 * /api/webhook/pagarme:
 *   post:
 *     summary: Webhook do Pagar.me
 *     description: Recebe notificações de mudança de status dos pagamentos
 *     tags: [Webhook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Dados do webhook enviados pelo Pagar.me
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Assinatura do webhook inválida
 *       400:
 *         description: Dados do webhook inválidos
 */
router.post('/webhook/pagarme',
  (req, res) => new CheckoutController().handleWebhook(req, res)
);

export default router;