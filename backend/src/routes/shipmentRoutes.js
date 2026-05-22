const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getShipmentByOrder, getMyShipments, updateShipmentStatus, assignDeliveryPersonnel, getAllShipments,
} = require('../controllers/shipmentController');

// Customer: track their shipment
router.get('/order/:orderId', protect, getShipmentByOrder);
router.get('/my-shipments', protect, authorize('customer'), getMyShipments);

// Delivery personnel & admin
router.put('/:id/status', protect, authorize('admin', 'delivery'), updateShipmentStatus);
router.put('/:id/assign', protect, authorize('admin'), assignDeliveryPersonnel);
router.get('/', protect, authorize('admin'), getAllShipments);

module.exports = router;
