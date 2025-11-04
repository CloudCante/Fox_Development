const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { allowReadUpdate, isSuperuser } = require('../middlewares/roleCheck');

// Superuser can CREATE and DELETE
router.post('/', isSuperuser, healthController.postHealth);
router.delete('/:id', isSuperuser, healthController.deleteHealth);

// All users can READ and UPDATE
router.get('/', allowReadUpdate, healthController.getAllHealth);
router.get('/:id', allowReadUpdate, healthController.getHealthById);
router.patch('/:id', allowReadUpdate, healthController.updateHealth);

module.exports = router;
