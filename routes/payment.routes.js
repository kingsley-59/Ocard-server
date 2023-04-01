const { verifyTransaction, initiateTransfer } = require('../controllers/payment.controller');
const { transferSchema } = require('../middlewares/validator');
// const { jwtVerifyToken } = require('../middlewares/jwtVerify');
const validator = require('express-joi-validation').createValidator({});

const router = require('express').Router();


router.get('/verify/:reference', verifyTransaction);

router.post('/initiate-transfer', validator.body(transferSchema), initiateTransfer);

const PaymentRoutes = router;
module.exports = PaymentRoutes;