import nodemailer from 'nodemailer';
import logger from './logger';

// Verifica se o envio de email está habilitado
const emailEnabled = process.env.EMAIL_ENABLED === 'true';

// Cria um transporter fake para quando o envio de email estiver desabilitado
const createFakeTransporter = () => {
  logger.info('Criando transporter fake para emails (EMAIL_ENABLED=false)');
  return {
    sendMail: (mailOptions: any) => {
      logger.info('Email fake enviado:', {
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      return Promise.resolve({ messageId: 'fake-message-id' });
    },
    verify: (callback: any) => {
      callback(null, true);
    }
  };
};

// Configuração do transporter do Nodemailer apenas se o envio de email estiver habilitado
let transporter: any;

if (emailEnabled) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
    port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
    secure: (process.env.EMAIL_SECURE || process.env.SMTP_SECURE) === 'true',
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    }
  });

  // Verificar conexão com o servidor de email ao iniciar a aplicação
  transporter.verify((error: any) => {
    if (error) {
      logger.error('Erro na configuração do servidor de email:', error);
      // Em ambiente de desenvolvimento, criar um transporter fake para testes
      if (process.env.NODE_ENV === 'development') {
        logger.info('Usando transporter fake para ambiente de desenvolvimento');
        transporter = createFakeTransporter();
      }
    } else {
      logger.info('Servidor de email configurado com sucesso');
    }
  });
} else {
  // Se o envio de email estiver desabilitado, usa o transporter fake
  transporter = createFakeTransporter();
}

export default transporter;
