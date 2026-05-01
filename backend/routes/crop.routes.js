const express = require('express');
const { getCropRecommendation, getCropDetails } = require('../controllers/crop.controller');

const router = express.Router();

router.post('/recommend', getCropRecommendation);
router.get('/:cropName', getCropDetails);

module.exports = router;
