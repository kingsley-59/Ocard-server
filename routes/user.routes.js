const { getUser, getUserCards } = require('../controllers/user.controller');
const { jwtVerifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();


router.get('/me', jwtVerifyToken, getUser);
router.get('/get-cards', jwtVerifyToken, getUserCards);

const UserRoutes = router;
module.exports = UserRoutes;