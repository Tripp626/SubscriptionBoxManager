const Shipment = require('../models/Shipment');
const asyncHandler = require('../middleware/asyncHandler');

exports.getShipmentByOrder = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findOne({ order: req.params.orderId }).populate('deliveryPersonnel', 'firstName lastName phone');
  if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
  res.json(shipment);
});

exports.getMyShipments = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find().populate({
    path: 'order',
    match: { user: req.user._id },
    populate: { path: 'products.product', select: 'name' },
  });
  const filtered = shipments.filter(s => s.order);
  res.json(filtered);
});

exports.updateShipmentStatus = asyncHandler(async (req, res) => {
  const { status, location, note, trackingNumber, carrier, estimatedDeliveryDate } = req.body;
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
  if (status) shipment.status = status;
  if (trackingNumber) shipment.trackingNumber = trackingNumber;
  if (carrier) shipment.carrier = carrier;
  if (estimatedDeliveryDate) shipment.estimatedDeliveryDate = estimatedDeliveryDate;
  if (status === 'delivered') shipment.actualDeliveryDate = new Date();
  if (status || location || note) {
    shipment.trackingUpdates.push({ status: shipment.status, location, note });
  }
  await shipment.save();
  res.json(shipment);
});

exports.assignDeliveryPersonnel = asyncHandler(async (req, res) => {
  const { personnelId } = req.body;
  const shipment = await Shipment.findByIdAndUpdate(req.params.id, { deliveryPersonnel: personnelId }, { new: true });
  if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
  res.json(shipment);
});

exports.getAllShipments = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find()
    .populate('order', 'user totalAmount status')
    .populate('deliveryPersonnel', 'firstName lastName');
  res.json(shipments);
});
