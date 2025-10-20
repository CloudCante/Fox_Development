// Import required libraries and modules
const express = require('express');
const router = express.Router();
// Import required controllers
const fixturesController = require('../controllers/fixturesController');
const healthController = require('../controllers/healthController');
const usageController = require('../controllers/usageController');

// Route endpoints to controller functions 
//Health routes
router.get('/health', healthController.getAllHealth);
router.get('/health/:id', healthController.getHealthById);
router.post('/health', healthController.postHealth);
router.patch('/health/:id', healthController.updateHealth);
router.delete('/health/:id', healthController.deleteHealth);

//Usage routes
router.get('/usage', usageController.getAllUsage);
router.get('/usage/:id', usageController.getUsageById);
router.post('/usage', usageController.postUsage);
router.patch('/usage/:id', usageController.updateUsage);
router.delete('/usage/:id', usageController.deleteUsage);

//Fixtures routes
router.get('/', fixturesController.getAllFixtures);
router.get('/:id', fixturesController.getFixtureById);
router.post('/', fixturesController.postFixture);
router.patch('/:id', fixturesController.updateFixtures);
router.delete('/:id', fixturesController.deleteFixture);


module.exports = router;