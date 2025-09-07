import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { ValidationError, ConflictError } from '../utils/errors';


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e Autorização
 */
class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Registra um novo usuário no sistema
   *     description: Cria uma nova conta de usuário e envia um email de verificação
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AuthRegister'
   *           examples:
   *             newUser:
   *               summary: Novo usuário
   *               value:
   *                 username: "joao123"
   *                 email: "joao@example.com"
   *                 password: "minhasenha123"
   *                 confirmPassword: "minhasenha123"
   *                 firstName: "João"
   *                 lastName: "Silva"
   *                 companyId: 1
   *     responses:
   *       201:
   *         description: Usuário registrado com sucesso. Email de verificação enviado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RegisterResponse'
   *             example:
   *               success: true
   *               message: "Usuário registrado com sucesso. Verifique seu email para ativar sua conta."
   *               data:
   *                 id: 1
   *                 username: "joao123"
   *                 email: "joao@example.com"
   *                 firstName: "João"
   *                 lastName: "Silva"
   *                 email_verified: false
   *                 is_active: true
   *       400:
   *         description: Dados inválidos ou usuário já existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               validation:
   *                 summary: Erro de validação
   *                 value:
   *                   success: false
   *                   message: "Todos os campos obrigatórios devem ser fornecidos"
   *               conflict:
   *                 summary: Email já cadastrado
   *                 value:
   *                   success: false
   *                   message: "E-mail já cadastrado no sistema"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, confirmPassword, firstName, lastName, companyId } = req.body;
      
      // Verificar se as senhas coincidem
      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'As senhas não coincidem',
          error: 'VALIDATION_ERROR'
        });
        return;
      }
      
      const user = await this.authService.register(
        username,
        email,
        password,
        firstName,
        lastName,
        companyId
      );
      
      // Mensagem personalizada com base na configuração de email
      const emailEnabled = process.env.EMAIL_ENABLED === 'true';
      const message = emailEnabled
        ? 'Usuário registrado com sucesso. Verifique seu e-mail para ativar sua conta.'
        : 'Usuário registrado com sucesso. O token de verificação foi registrado no log do sistema.';
      
      res.status(201).json({
        success: true,
        message,
        data: user
      });
    } catch (error) {
      // Tratar erros específicos
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
        return;
      }
      
      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONFLICT_ERROR'
        });
        return;
      }
      
      // Para outros erros, passar para o middleware de erro
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Autentica um usuário no sistema
   *     description: Realiza login com email/senha e retorna tokens JWT para acesso
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AuthLogin'
   *           examples:
   *             loginExample:
   *               summary: Login padrão
   *               value:
   *                 email: "admin@example.com"
   *                 password: "senha123"
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *             example:
   *               success: true
   *               data:
   *                 user:
   *                   id: 1
   *                   username: "admin"
   *                   email: "admin@example.com"
   *                   firstName: "Administrador"
   *                   email_verified: true
   *                   is_active: true
   *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       400:
   *         description: Dados de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "Email e senha são obrigatórios"
   *       401:
   *         description: Credenciais inválidas ou usuário inativo
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               invalidCredentials:
   *                 summary: Credenciais inválidas
   *                 value:
   *                   success: false
   *                   message: "Credenciais inválidas"
   *               inactiveUser:
   *                 summary: Usuário inativo
   *                 value:
   *                   success: false
   *                   message: "Usuário inativo"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      const { user, token, refreshToken } = await this.authService.login(email, password, ipAddress, userAgent);
      
      res.json({ 
        success: true, 
        data: { 
          user, 
          token, 
          refreshToken 
        } 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     summary: Renova o token de acesso usando refresh token
   *     description: Gera um novo token de acesso válido utilizando um refresh token ainda válido
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RefreshTokenRequest'
   *           example:
   *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     responses:
   *       200:
   *         description: Tokens renovados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RefreshTokenResponse'
   *             example:
   *               success: true
   *               data:
   *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       400:
   *         description: Refresh token não fornecido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "Refresh token é obrigatório"
   *       401:
   *         description: Refresh token inválido, expirado ou usuário inativo
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               invalidToken:
   *                 summary: Token inválido
   *                 value:
   *                   success: false
   *                   message: "Refresh token inválido ou expirado"
   *               inactiveUser:
   *                 summary: Usuário inativo
   *                 value:
   *                   success: false
   *                   message: "Usuário inativo"
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const { token, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);
      
      res.json({ 
        success: true, 
        data: { 
          token, 
          refreshToken: newRefreshToken 
        } 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Fazer logout e invalidar sessão atual
   *     description: Invalida a sessão atual baseada no token de acesso
   *     tags: [Auth]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Logout realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Logout realizado com sucesso"
   *       401:
   *         description: Token inválido ou não fornecido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token não fornecido'
        });
        return;
      }

      await this.authService.logout(token);
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/logout-all:
   *   post:
   *     summary: Fazer logout de todos os dispositivos
   *     description: Invalida todas as sessões ativas do usuário autenticado
   *     tags: [Auth]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Logout realizado com sucesso em todos os dispositivos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Logout realizado com sucesso em todos os dispositivos"
   *                 invalidatedSessions:
   *                   type: number
   *                   example: 3
   *       401:
   *         description: Token inválido ou não fornecido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const invalidatedCount = await this.authService.logoutAllDevices(userId);
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso em todos os dispositivos',
        invalidatedSessions: invalidatedCount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Solicita redefinição de senha via email
   *     description: Envia um link de recuperação de senha para o email informado (se existir no sistema)
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgotPasswordRequest'
   *           example:
   *             email: "usuario@example.com"
   *     responses:
   *       200:
   *         description: Solicitação processada (sempre retorna sucesso por segurança)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessageResponse'
   *             examples:
   *               success:
   *                 summary: Sucesso na solicitação
   *                 value:
   *                   success: true
   *                   message: "Se o email existir em nosso sistema, você receberá um link de recuperação"
   *               emailSent:
   *                 summary: Email enviado
   *                 value:
   *                   success: true
   *                   message: "Link de recuperação enviado para o email cadastrado"
   *       400:
   *         description: Email não fornecido ou inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "Email é obrigatório"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.authService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     summary: Redefine a senha do usuário com token de recuperação
   *     description: Permite ao usuário redefinir sua senha usando o token enviado por email
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ResetPasswordRequest'
   *           example:
   *             token: "550e8400-e29b-41d4-a716-446655440000"
   *             password: "novaSenha123"
   *             confirmPassword: "novaSenha123"
   *     responses:
   *       200:
   *         description: Senha redefinida com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessageResponse'
   *             example:
   *               success: true
   *               message: "Senha redefinida com sucesso"
   *       400:
   *         description: Token inválido, expirado, senhas não coincidem ou dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               invalidToken:
   *                 summary: Token inválido
   *                 value:
   *                   success: false
   *                   message: "Token inválido ou expirado"
   *               passwordMismatch:
   *                 summary: Senhas não coincidem
   *                 value:
   *                   success: false
   *                   message: "As senhas não coincidem"
   *               validation:
   *                 summary: Dados obrigatórios
   *                 value:
   *                   success: false
   *                   message: "Token, senha e confirmação são obrigatórios"
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password, confirmPassword } = req.body;
      const result = await this.authService.resetPassword(token, password, confirmPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/verify-email/{token}:
   *   get:
   *     summary: Verifica o email do usuário usando token
   *     description: Confirma o endereço de email do usuário usando o token enviado no email de cadastro
   *     tags: [Auth]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Token UUID de verificação enviado por email
   *         example: "550e8400-e29b-41d4-a716-446655440000"
   *     responses:
   *       200:
   *         description: Email verificado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessageResponse'
   *             examples:
   *               verified:
   *                 summary: Email verificado
   *                 value:
   *                   success: true
   *                   message: "Email verificado com sucesso! Você já pode fazer login"
   *               alreadyVerified:
   *                 summary: Já verificado
   *                 value:
   *                   success: true
   *                   message: "Email já foi verificado anteriormente"
   *       400:
   *         description: Token inválido, expirado ou não fornecido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               noToken:
   *                 summary: Token não fornecido
   *                 value:
   *                   success: false
   *                   message: "Token de verificação é obrigatório"
   *               invalidToken:
   *                 summary: Token inválido
   *                 value:
   *                   success: false
   *                   message: "Token de verificação inválido ou expirado"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }
      const result = await this.authService.verifyEmail(token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;

