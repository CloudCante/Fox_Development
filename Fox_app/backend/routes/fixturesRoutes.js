// Import required libraries and modules
const express = require('express');
const router = express.Router();
// Import required controllers
const fixturesController = require('../controllers/fixturesController');

// Route endpoints to controller functions 
router.get('/', fixturesController.getAllFixtures);
router.get('/:id', fixturesController.getFixtureById);
router.put('/putFixture/:id', fixturesController.putFixtureById);
router.post('/posFixture/:id', fixturesController.postFixtureById);
router.delete('/deleteFixture/:id', fixturesController.deleteFixtureById);

module.exports = router;