const express = require('express');
const router = express.Router();
const fixturesController = require('../controllers/fixturesController');
const { allowReadUpdate, isSuperuser } = require('../middlewares/roleCheck');

// Superuser can CREATE and DELETE
router.post('/', isSuperuser, fixturesController.postFixture);
router.delete('/:id', isSuperuser, fixturesController.deleteFixture);

// All users can READ and UPDATE
router.get('/', allowReadUpdate, fixturesController.getAllFixtures);
router.get('/:id', allowReadUpdate, fixturesController.getFixtureById);
router.patch('/:id', allowReadUpdate, fixturesController.updateFixtures);

module.exports = router;
