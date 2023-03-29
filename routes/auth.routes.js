const router = require('express').Router();
const { register, login, generateOtp, verifyOtp } = require('../controllers/auth.controller');
const { RegisterSchema, OTPGenerateSchema, LoginSchema } = require('../middlewares/validator');
require('dotenv').config();
const validator = require('express-joi-validation').createValidator({});


router.post('/generate-otp', validator.body(OTPGenerateSchema), generateOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', validator.body(RegisterSchema), register);
router.post('/login', validator.body(LoginSchema), login);

// router.post('/create-pin', jwtVerifyToken, validator.body(CreatePinSchema), setTransactionPin);
// router.put('/change-pin', jwtVerifyToken, validator.body(ChangePinSchema), changeTransactionPin);

const authRoutes = router;
module.exports = authRoutes;