import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import db from '../config/db';
import transporter from '../config/email';
import logger from '../config/logger';
import PasswordReset from '../models/PasswordReset';
import User, { IUser } from '../models/User';
import Session from '../models/Session';
import { SessionService } from './SessionService';
import notificationService from './NotificationService';
import { ConflictError, DatabaseError, NotFoundError, ValidationError } from '../utils/errors';

class AuthService {
  private userModel: User;
  private sessionService: SessionService;

  constructor() {
    this.userModel = new User();
    this.sessionService = new SessionService();
  }

  async register(username: string, email: string, password: string, first_name: string, last_name: string, companyId?: number): Promise<IUser> {
    // Validações
    if (!username || !email || !password || !first_name || !last_name) {
      throw new ValidationError('Todos os campos obrigatórios devem ser fornecidos');
    }
    
    try {
      // Verificar se já existe usuário com esse email
      const existingUserByEmail = await this.userModel.findByEmail(email);
      if (existingUserByEmail) {
        throw new ConflictError('E-mail já cadastrado no sistema');
      }
      
      // Verificar se já existe usuário com esse username
      const existingUserByUsername = await this.userModel.findByUsername(username);
      if (existingUserByUsername) {
        throw new ConflictError('Nome de usuário já está em uso');
      }

      // Determinar companyId final (default para 1) e validar existência
      const finalCompanyId = companyId ?? 1;
      const companyExists = await db('companies')
        .where({ id: finalCompanyId, deleted_at: null })
        .first();
      if (!companyExists) {
        throw new ValidationError('Empresa não encontrada ou inativa');
      }
      
      // Gerar hash da senha e token de verificação
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const emailVerificationToken = randomUUID();
      
      // Criar usuário: role_id padrão = 3 (perfil "user") para maior segurança
      const userData: Omit<IUser, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> = {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        company_id: finalCompanyId,
        email_verification_token: emailVerificationToken,
        email_verified: false,
        is_active: true,
        role_id: 3 // padrão: usuário comum
      };
      
      // Criar o usuário no banco de dados
      const user = await this.userModel.create(userData);
      
      if (!user) {
        throw new DatabaseError('Erro ao criar usuário');
      }
      
      logger.info(`Usuário registrado: ${user.email}`);
      
      // Enviar email de verificação
      await this.sendVerificationEmail(user.email, emailVerificationToken);
      
      // Remover senha do retorno
      const { password: _, ...userWithoutPassword } = user;
      logger.info(`Usuário registrado com sucesso: ${user.email}`);
      return userWithoutPassword as IUser;
      
    } catch (error) {
      logger.error('Erro ao registrar usuário:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      // Se for um erro de banco de dados, tentar fornecer mais detalhes
      if (error instanceof Error) {
        logger.error(`Detalhes do erro: ${error.message}`);
        throw new DatabaseError(`Erro interno ao registrar usuário: ${error.message}`);
      }
      throw new DatabaseError('Erro interno ao registrar usuário');
    }
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    if (!email || !password) {
      throw new ValidationError('Email e senha são obrigatórios');
    }
    
    try {
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        logger.warn(`Tentativa de login com email não cadastrado: ${email}`);
        throw new ValidationError('Credenciais inválidas');
      }
      
      // Verificar se usuário está ativo
      if (!user.is_active) {
        throw new ValidationError('Usuário inativo');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password || '');
      if (!isPasswordValid) {
        logger.warn(`Tentativa de login com senha inválida para o email: ${email}`);
        throw new ValidationError('Credenciais inválidas');
      }

      // Verificar limite de sessões ativas baseado no plano da empresa
      if (user.id && user.company_id) {
        await this.checkSessionLimits(user.id, user.company_id);
      }
      
      // Gerar tokens
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'supersecret',
        { expiresIn: '24h' }
      );
      
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || 'refreshsecret',
        { expiresIn: '7d' }
      );

      // Criar sessão no banco de dados
      try {
        await this.sessionService.create({
          user_id: user.id!,
          token: token,
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
          last_activity: new Date().toISOString(),
          is_active: true
        });

        // Verificar e criar notificações de segurança
        if (user.id) {
          await this.checkAndCreateSecurityNotifications(user.id, ipAddress, userAgent);
        }
      } catch (sessionError) {
        logger.error('Erro ao criar sessão:', sessionError);
        // Não bloquear o login se houver erro na sessão, apenas logar
      }
      
      logger.info(`Usuário logado com sucesso: ${user.email} - IP: ${ipAddress}`);
      
      // Remover senha do retorno
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token,
        refreshToken
      };
      
    } catch (error) {
      logger.error('Erro no login:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Erro interno durante login');
    }
  }

  private async checkSessionLimits(userId: number, companyId: number | null): Promise<void> {
    if (!companyId) return;

    try {
      // Buscar informações do usuário para verificar se é admin
      const user = await this.userModel.findById(userId);
      
      // Admins (role_id = 1) e company_admins (role_id = 2) não têm limite de sessões
      if (user && (user.role_id === 1 || user.role_id === 2)) {
        logger.info(`Usuário admin (role_id: ${user.role_id}) não tem limite de sessões - ID: ${userId}`);
        return;
      }

      // Buscar plano ativo da empresa
      const activeSubscription = await db('subscriptions')
        .join('plans', 'subscriptions.plan_id', 'plans.id')
        .where({
          'subscriptions.company_id': companyId,
          'subscriptions.status': 'active'
        })
        .whereNull('subscriptions.deleted_at')
        .whereNull('plans.deleted_at')
        .select('plans.*', 'subscriptions.id as subscription_id')
        .first();

      if (!activeSubscription) {
        // Sem plano ativo - permitir apenas 1 sessão
        const activeSessionsCount = await this.sessionService.getActiveSessionsCount(userId);
        if (activeSessionsCount >= 1) {
          throw new ValidationError('Limite de sessões atingido. Upgrade seu plano para mais acesso simultâneo.');
        }
        return;
      }

      // Verificar limite baseado no plano
      const planLimits = this.getPlanSessionLimits(activeSubscription.name);
      const activeSessionsCount = await this.sessionService.getActiveSessionsCount(userId);
      
      if (activeSessionsCount >= planLimits.maxSessions) {
        // Se atingiu o limite, invalidar a sessão mais antiga
        if (planLimits.allowReplace) {
          await this.sessionService.invalidateOldestSession(userId);
          logger.info(`Sessão mais antiga invalidada para usuário ${userId} devido ao limite do plano`);
        } else {
          throw new ValidationError(`Limite de ${planLimits.maxSessions} sessão(ões) simultânea(s) atingido. Upgrade seu plano para mais acesso.`);
        }
      }

    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Erro ao verificar limites de sessão:', error);
      // Em caso de erro, permitir o login (fail-safe)
    }
  }

  private getPlanSessionLimits(planName: string): { maxSessions: number; allowReplace: boolean } {
    const limits = {
      'Básico': { maxSessions: 2, allowReplace: true },
      'Profissional': { maxSessions: 5, allowReplace: true },
      'Empresarial': { maxSessions: 20, allowReplace: true },
      'Premium': { maxSessions: 50, allowReplace: true }
    } as Record<string, { maxSessions: number; allowReplace: boolean }>;

    return limits[planName] || { maxSessions: 1, allowReplace: false };
  }

  async logout(token: string): Promise<void> {
    try {
      // Invalidar sessão baseada no token
      await this.sessionService.invalidateByToken(token);
      logger.info('Logout realizado com sucesso');
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
      throw new DatabaseError('Erro interno durante logout');
    }
  }

  async logoutAllDevices(userId: number): Promise<number> {
    try {
      // Invalidar todas as sessões do usuário
      const invalidatedCount = await this.sessionService.invalidateAllUserSessions(userId);
      logger.info(`${invalidatedCount} sessões invalidadas para usuário ${userId}`);
      return invalidatedCount;
    } catch (error) {
      logger.error('Erro ao fazer logout de todos os dispositivos:', error);
      throw new DatabaseError('Erro interno durante logout');
    }
  }

  async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new ValidationError('Refresh token é obrigatório');
    }
    
    try {
      const decoded: any = jwt.verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET || 'refreshsecret'
      );
      
      const user = await this.userModel.findById(decoded.id);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }
      
      if (!user.is_active) {
        throw new ValidationError('Usuário inativo');
      }
      
      const newToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'supersecret',
        { expiresIn: '24h' }
      );
      
      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || 'refreshsecret',
        { expiresIn: '7d' }
      );
      
      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
      
    } catch (error) {
      logger.error('Erro ao renovar token:', error);
      if ((error as any).name === 'JsonWebTokenError' || (error as any).name === 'TokenExpiredError') {
        throw new ValidationError('Refresh token inválido ou expirado');
      }
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro interno ao renovar token');
    }
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new ValidationError('Email é obrigatório');
    }
    
    try {
      const user = await this.userModel.findByEmail(email);
      
      // Sempre retorna sucesso para não revelar se o email existe
      if (!user) {
        logger.info(`Tentativa de reset de senha para email não registrado: ${email}`);
        return {
          success: true,
          message: 'Se o email existir em nosso sistema, você receberá um link de recuperação'
        };
      }
      
      if (!user.is_active) {
        logger.warn(`Tentativa de reset para usuário inativo: ${email}`);
        return {
          success: true,
          message: 'Se o email existir em nosso sistema, você receberá um link de recuperação'
        };
      }
      
      // Limpar tokens antigos
      await PasswordReset.cleanupTokensForUser(user.id!);
      
      // Gerar novo token
      const resetToken = randomUUID();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora
      
      // Criar registro de reset
      await PasswordReset.create({
        user_id: user.id!,
        token: resetToken,
        expires_at: expiresAt,
        used: false
      });
      
      // Tentar enviar email (não falha se não conseguir)
      try {
        await this.sendPasswordResetEmail(user.email, user.first_name || '', resetToken);
      } catch (emailError) {
        logger.warn(`Não foi possível enviar email de recuperação para ${email}: ${emailError}`);
        // Continua sem falhar - em ambiente de desenvolvimento é normal não ter SMTP
      }
      
      logger.info(`Link de recuperação gerado para: ${email}`);
      
      return {
        success: true,
        message: 'Link de recuperação enviado para o email cadastrado'
      };
      
    } catch (error) {
      logger.error('Erro ao processar esqueci minha senha:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Erro interno ao processar solicitação');
    }
  }

  async resetPassword(token: string, password: string, confirmPassword: string) {
    if (!token || !password || !confirmPassword) {
      throw new ValidationError('Token, senha e confirmação são obrigatórios');
    }
    
    if (password !== confirmPassword) {
      throw new ValidationError('As senhas não coincidem');
    }
    
    if (password.length < 6) {
      throw new ValidationError('A senha deve ter pelo menos 6 caracteres');
    }
    
    try {
      // Buscar token válido
      const passwordResetRecord = await db('password_resets')
        .where({
          token,
          used: false
        })
        .where('expires_at', '>', new Date())
        .whereNull('deleted_at')
        .first();
        
      if (!passwordResetRecord) {
        throw new ValidationError('Token inválido ou expirado');
      }
      
      // Verificar se o usuário existe e está ativo
      const user = await this.userModel.findById(passwordResetRecord.user_id);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }
      
      if (!user.is_active) {
        throw new ValidationError('Usuário inativo');
      }
      
      // Atualizar senha em transação
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.transaction(async (trx) => {
        // Atualizar senha do usuário
        await trx('users')
          .where({ id: passwordResetRecord.user_id })
          .update({
            password: hashedPassword,
            updated_at: new Date()
          });
        
        // Marcar token como usado
        await trx('password_resets')
          .where({ id: passwordResetRecord.id })
          .update({
            used: true,
            updated_at: new Date()
          });
      });
      
      logger.info(`Senha redefinida com sucesso para usuário ID: ${passwordResetRecord.user_id}`);
      
      return {
        success: true,
        message: 'Senha redefinida com sucesso'
      };
      
    } catch (error) {
      logger.error('Erro ao redefinir senha:', error);
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro interno ao redefinir senha');
    }
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new ValidationError('Token de verificação é obrigatório');
    }
    
    try {
      const user = await this.userModel.findByVerificationToken(token);
      
      if (!user) {
        throw new ValidationError('Token de verificação inválido ou expirado');
      }
      
      if (user.email_verified) {
        return {
          success: true,
          message: 'Email já foi verificado anteriormente'
        };
      }
      
      // Verificar e atualizar usuário
      await this.userModel.update(user.id!, {
        email_verified: true,
        email_verification_token: null
      });
      
      logger.info(`Email verificado com sucesso para usuário: ${user.email}`);
      
      return {
        success: true,
        message: 'Email verificado com sucesso! Você já pode fazer login'
      };
      
    } catch (error) {
      logger.error('Erro ao verificar email:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Erro interno ao verificar email');
    }
  }
  
  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Verifica se o envio de email está habilitado
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    
    // Sempre loga o token para facilitar testes
    logger.info(`TOKEN DE VERIFICAÇÃO PARA TESTES (${email}): ${token}`);
    
    // Se o envio de email estiver desabilitado, retorna sem enviar
    if (!emailEnabled) {
      logger.info(`Envio de email desabilitado. Pulando envio para: ${email}`);
      return;
    }
    
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email/${token}`;
    const fromEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@srmgestao.com';
    const fromName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'SRM Gestão';
    
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Verifique seu e-mail - SRM Gestão',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Bem-vindo ao SRM Gestão!</h2>
            <p>Olá!</p>
            <p>Obrigado por se cadastrar em nosso sistema! Para completar seu registro, é necessário verificar seu endereço de e-mail.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar E-mail</a>
            </div>
            <p><small>Se o botão não funcionar, copie e cole este link no seu navegador:</small></p>
            <p><small>${verificationLink}</small></p>
            <p><small><strong>TOKEN PARA TESTES:</strong> ${token}</small></p>
            <hr style="margin: 30px 0; border: 1px solid #eee;">
            <p><small>Se você não criou uma conta conosco, pode ignorar este e-mail.</small></p>
          </div>
        `
      });
      logger.info(`Email de verificação enviado para: ${email}`);
    } catch (error) {
      logger.error(`Erro ao enviar email de verificação para ${email}:`, error);
      // Não lançamos erro para não falhar o registro
    }
  }
  
  private async sendPasswordResetEmail(email: string, first_name: string, token: string): Promise<void> {
    // Verifica se o envio de email está habilitado
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    
    // Sempre loga o token para facilitar testes
    logger.info(`TOKEN DE REDEFINIÇÃO DE SENHA PARA TESTES (${email}): ${token}`);
    
    // Se o envio de email estiver desabilitado, retorna sem enviar
    if (!emailEnabled) {
      logger.info(`Envio de email desabilitado. Pulando envio de redefinição de senha para: ${email}`);
      return;
    }
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${token}`;
    const fromEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@srmgestao.com';
    const fromName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'SRM Gestão';
    
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Redefinição de Senha - SRM Gestão',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Redefinição de Senha</h2>
            <p>Olá ${first_name},</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no SRM Gestão.</p>
            <p>Clique no botão abaixo para redefinir sua senha (este link é válido por apenas 1 hora):</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Senha</a>
            </div>
            <p><small>Se o botão não funcionar, copie e cole este link no seu navegador:</small></p>
            <p><small>${resetLink}</small></p>
            <p><small><strong>TOKEN PARA TESTES:</strong> ${token}</small></p>
            <hr style="margin: 30px 0; border: 1px solid #eee;">
            <p><small><strong>Se você não solicitou esta alteração, ignore este e-mail.</strong> Sua senha permanecerá inalterada.</small></p>
          </div>
        `
      });
      logger.info(`Email de redefinição enviado para: ${email}`);
    } catch (error) {
      logger.error(`Erro ao enviar email de redefinição para ${email}:`, error);
      // Em ambiente de desenvolvimento, apenas loga o token para testes
      logger.info(`TOKEN DE RESET PARA TESTES (${email}): ${token}`);
      throw error;
    }
  }

  /**
   * Verifica logins suspeitos e cria notificações de segurança
   * @param userId ID do usuário
   * @param ipAddress Endereço IP do login
   * @param userAgent User agent do login
   */
  private async checkAndCreateSecurityNotifications(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Buscar sessões recentes do usuário para comparar
      const recentSessions = await this.sessionService.findByUserId(userId);
      
      // Se é o primeiro login, criar notificação de boas-vindas
      if (recentSessions.length <= 1) {
        await notificationService.create({
          user_id: userId,
          title: 'Primeiro acesso realizado',
          message: 'Bem-vindo! Seu primeiro acesso foi realizado com sucesso.',
          type: 'info',
          is_read: false
        });
        return;
      }

      const shouldNotify = await this.detectSuspiciousActivity(userId, ipAddress, userAgent, recentSessions);
      
      if (shouldNotify.isNewIP) {
        await notificationService.create({
          user_id: userId,
          title: 'Novo acesso detectado',
          message: `Detectamos um acesso de um novo endereço IP: ${ipAddress || 'desconhecido'}. Se não foi você, verifique suas sessões ativas.`,
          type: 'alert',
          is_read: false
        });
      }

      if (shouldNotify.isNewDevice) {
        await notificationService.create({
          user_id: userId,
          title: 'Novo dispositivo detectado',
          message: `Detectamos um acesso de um novo dispositivo. Se não foi você, verifique suas sessões ativas e altere sua senha.`,
          type: 'alert',
          is_read: false
        });
      }

      if (shouldNotify.multipleLogins) {
        await notificationService.create({
          user_id: userId,
          title: 'Múltiplos acessos simultâneos',
          message: `Detectamos múltiplas sessões ativas. Verifique se todos os acessos são seus.`,
          type: 'alert',
          is_read: false
        });
      }
    } catch (error) {
      logger.error('Erro ao criar notificações de segurança:', error);
      // Não bloquear o processo de login por erro nas notificações
    }
  }

  /**
   * Detecta atividade suspeita baseada nas sessões do usuário
   * @param userId ID do usuário
   * @param ipAddress Endereço IP atual
   * @param userAgent User agent atual
   * @param recentSessions Sessões recentes do usuário
   */
  private async detectSuspiciousActivity(
    userId: number, 
    ipAddress?: string, 
    userAgent?: string, 
    recentSessions: any[] = []
  ): Promise<{
    isNewIP: boolean;
    isNewDevice: boolean;
    multipleLogins: boolean;
  }> {
    const activeSessions = recentSessions.filter(s => s.is_active);
    
    // Verificar se é um novo IP
    const knownIPs = recentSessions
      .filter(s => s.ip_address)
      .map(s => s.ip_address);
    const isNewIP = ipAddress && !knownIPs.includes(ipAddress);

    // Verificar se é um novo dispositivo (baseado no user agent)
    const knownUserAgents = recentSessions
      .filter(s => s.user_agent)
      .map(s => this.extractDeviceInfo(s.user_agent));
    const currentDeviceInfo = userAgent ? this.extractDeviceInfo(userAgent) : '';
    const isNewDevice = currentDeviceInfo && !knownUserAgents.some(known => 
      this.isSimilarDevice(known, currentDeviceInfo)
    );

    // Verificar múltiplas sessões ativas (mais de 3 sessões simultâneas)
    const multipleLogins = activeSessions.length > 3;

    return {
      isNewIP: !!isNewIP,
      isNewDevice: !!isNewDevice,
      multipleLogins
    };
  }

  /**
   * Extrai informações básicas do dispositivo do user agent
   * @param userAgent String do user agent
   */
  private extractDeviceInfo(userAgent: string): string {
    if (!userAgent) return '';
    
    // Extrair informações básicas: OS e Browser
    let os = 'Unknown';
    let browser = 'Unknown';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'Mac';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return `${os}-${browser}`;
  }

  /**
   * Compara se dois dispositivos são similares
   * @param device1 Informações do primeiro dispositivo
   * @param device2 Informações do segundo dispositivo
   */
  private isSimilarDevice(device1: string, device2: string): boolean {
    return device1 === device2;
  }
}

export default AuthService;