import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import validate from '../middleware/validationMiddleware';
import authMiddleware from '../middleware/authMiddleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema
} from '../schemas/authSchemas';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     $ref: '#/paths/~1auth~1register/post'
 */
router.post('/register', validate(registerSchema), authController.register.bind(authController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     $ref: '#/paths/~1auth~1login/post'
 */
router.post('/login', validate(loginSchema), authController.login.bind(authController));

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     $ref: '#/paths/~1auth~1refresh-token/post'
 */
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken.bind(authController));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     $ref: '#/paths/~1auth~1forgot-password/post'
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     $ref: '#/paths/~1auth~1reset-password/post'
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     $ref: '#/paths/~1auth~1verify-email~1{token}/get'
 */
router.get('/verify-email/:token', authController.verifyEmail.bind(authController));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     $ref: '#/paths/~1auth~1logout/post'
 */
router.post('/logout', authMiddleware, authController.logout.bind(authController));

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     $ref: '#/paths/~1auth~1logout-all/post'
 */
router.post('/logout-all', authMiddleware, authController.logoutAll.bind(authController));

export default router;
