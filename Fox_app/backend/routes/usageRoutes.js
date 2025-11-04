const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usageController');
const { allowReadUpdate, isSuperuser } = require('../middlewares/roleCheck');

// Superuser can CREATE and DELETE
router.post('/', isSuperuser, usageController.postUsage);
router.delete('/:id', isSuperuser, usageController.deleteUsage);

// All users can READ and UPDATE
router.get('/', allowReadUpdate, usageController.getAllUsage);
router.get('/:id', allowReadUpdate, usageController.getUsageById);
router.patch('/:id', allowReadUpdate, usageController.updateUsage);

module.exports = router;
