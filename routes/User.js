import express from 'express';
import {
  register,
  verify,
  login,
  logout,
  getMyProfile,
  updateProfile,
  updatePassword,
  forgetPassword,
  resetPassword
} from '../controllers/User.js';
import {isAuthenticated} from '../middlewares/auth.js';
const router = express.Router();

router.route('/register').post(register);
router.route('/verify').post(isAuthenticated, verify);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/me').get(isAuthenticated, getMyProfile);
router.route('/updateProfile').put(isAuthenticated, updateProfile);
router.route('/updatePassword').put(isAuthenticated, updatePassword);
router.route('/forgotPassword').post(forgetPassword)
router.route('/reset-password').put( resetPassword);

export default router;
