import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// Public Authentication Endpoints
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/resend-verification', (req, res, next) => authController.resendVerification(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

export const authRoutes = router;
