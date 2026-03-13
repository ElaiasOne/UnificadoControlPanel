const express = require('express');
const { loginController, perfilController } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', loginController);
router.get('/perfil', requireAuth, perfilController);

module.exports = router;