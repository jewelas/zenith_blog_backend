import express from 'express';
import { register, login,verifyAdmin, forgotPassword, resetPassword } from '../controllers/adminAuthController';
const router = express.Router();

/* GET users listing. */
router.post('/register', register);
router.post('/login', login);
router.get('/verify/:secretToken', verifyAdmin);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword)

export default router;
