const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  setPreferences, getPreferences, getRecommendations,
} = require('../controllers/preferenceController');

router.get('/recommendations', protect, authorize('customer'), getRecommendations);
router.get('/', protect, authorize('customer'), getPreferences);
router.post('/', protect, authorize('customer'), setPreferences);

module.exports = router;
