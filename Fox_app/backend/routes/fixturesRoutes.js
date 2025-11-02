// Import required libraries and modules
const express = require('express');
const router = express.Router();
// Import required controllers
const fixturesController = require('../controllers/fixturesController');
const healthController = require('../controllers/healthController');
const usageController = require('../controllers/usageController');

// Route endpoints to FIXTURE controllers
router.get('/', fixturesController.getAllFixtures);
router.post('/', fixturesController.postFixture);

// Route endpoints to HEALTH controllers (register BEFORE the generic id route so
// literal paths like /health don't get captured as an :id value)
router.get('/health', healthController.getAllHealth);
router.get('/health/:fixture_id', healthController.getHealthById);
router.post('/health', healthController.postHealth);
router.patch('/health/:primary_key', healthController.updateHealth);
router.delete('/health/:primary_key', healthController.deleteHealth);

// Route endpoints to USAGE controllers
router.get('/usage', usageController.getAllUsage);
router.get('/usage/:id', usageController.getUsageById);
router.post('/usage', usageController.postUsage);
router.patch('/usage/:id', usageController.updateUsage);
router.delete('/usage/:id', usageController.deleteUsage);

// FIXTURE ID routes (numeric validation happens inside controllers)
router.get('/:id', fixturesController.getFixtureById);
router.patch('/:id', fixturesController.updateFixture);
router.delete('/:id', fixturesController.deleteFixture);

// Export the router

module.exports = router;