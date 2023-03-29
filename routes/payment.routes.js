const { verifyTransaction } = require('../controllers/payment.controller');
const { jwtVerifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();


router.get('/verify/:reference', jwtVerifyToken, verifyTransaction);