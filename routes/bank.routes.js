const { getAllBanks, getBankDetails } = require('../controllers/bank.controller');

const router = require('express').Router();

router.get('/all', getAllBanks);
router.post('/resolve', getBankDetails
);


const BankRoutes = router;
module.exports = BankRoutes;