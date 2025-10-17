// Import required libraries and modules
const express = require('express');
const router = express.Router();
// Import required controllers
const fixturesController = require('../controllers/fixturesController');
const healthController = require('../controllers/healthController');
const usageController = require('../controllers/usageController');

// Route endpoints to controller functions 
//GET read
router.get('/', fixturesController.getAllFixtures);
router.get('/health', healthController.getAllHealth);
router.get('/usage', usageController.getAllUsage);
router.get('/health/:id', healthController.getHealthById);
router.get('/usage/:id', usageController.getUsageById);

//POST create
router.post('/', fixturesController.postFixture);
router.post('/health', healthController.postHealth);
router.post('/usage', usageController.postUsage);

//PATCH update
router.patch('/health/:id', healthController.updateHealth);
router.patch('/usage/:id', usageController.updateUsage);

//DELETE delete
router.delete('/health/:id', healthController.deleteHealth);
router.delete('/usage/:id', usageController.deleteUsage);

//Has to be after the other routes to avoid conflicts
router.get('/:id', fixturesController.getFixtureById);
router.patch('/:id', fixturesController.updateFixtures);
router.delete('/:id', fixturesController.deleteFixture);


module.exports = router;