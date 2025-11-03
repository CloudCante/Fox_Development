// Import required libraries and modules
const express = require('express');
const router = express.Router();
// Import required controllers
const fixturesController = require('../controllers/fixturesController');
const healthController = require('../controllers/healthController');
const usageController = require('../controllers/usageController');

<<<<<<< HEAD
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
=======
// Route endpoints to controller functions 
//Health routes
router.get('/health', healthController.getAllHealth);
router.get('/health/:id', healthController.getHealthById);
router.post('/health', healthController.postHealth);
router.patch('/health/:id', healthController.updateHealth);
router.delete('/health/:id', healthController.deleteHealth);

//Usage routes
>>>>>>> origin/main
router.get('/usage', usageController.getAllUsage);
router.get('/usage/:id', usageController.getUsageById);
router.post('/usage', usageController.postUsage);
router.patch('/usage/:id', usageController.updateUsage);
router.delete('/usage/:id', usageController.deleteUsage);

<<<<<<< HEAD
// FIXTURE ID routes (numeric validation happens inside controllers)
router.get('/:id', fixturesController.getFixtureById);
router.patch('/:id', fixturesController.updateFixture);
router.delete('/:id', fixturesController.deleteFixture);

// Export the router
=======
//Fixtures routes
router.get('/', fixturesController.getAllFixtures);
router.get('/:id', fixturesController.getFixtureById);
router.post('/', fixturesController.postFixture);
router.patch('/:id', fixturesController.updateFixtures);
router.delete('/:id', fixturesController.deleteFixture);

>>>>>>> origin/main

module.exports = router;