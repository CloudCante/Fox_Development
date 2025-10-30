// Import required libraries and modules
const express = require('express');
const router = express.Router();
// Import required controllers
const fixtureMaintenanceController = require('../controllers/fixtureMaintenanceController');

// Route endpoints to controller functions 
router.get('/', fixtureMaintenanceController.getAllMaintenances);
router.get('/getWithFixtureId', fixtureMaintenanceController.getWithFixtureId);
router.get('/:id', fixtureMaintenanceController.getMaintenanceById);
router.put('/putMaintenance/:id', fixtureMaintenanceController.putMaintenanceById);
router.post('/postMaintenance/:id', fixtureMaintenanceController.postMaintenanceById);
router.delete('/deleteMaintenance/:id', fixtureMaintenanceController.deleteMaintenanceById);

module.exports = router;