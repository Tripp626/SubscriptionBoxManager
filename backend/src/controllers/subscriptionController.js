const SubscriptionPlan = require('../models/SubscriptionPlan');
const CustomerSubscription = require('../models/CustomerSubscription');
const asyncHandler = require('../middleware/asyncHandler');

exports.createPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.create(req.body);
  res.status(201).json(plan);
});

exports.getPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true });
  res.json(plans);
});

exports.getAllPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find();
  res.json(plans);
});

exports.updatePlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json(plan);
});

exports.deletePlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json({ message: 'Plan deactivated' });
});

exports.subscribe = asyncHandler(async (req, res) => {
  const { planId, paymentMethod, autoRenew } = req.body;
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + plan.duration);
  const nextBillingDate = new Date(endDate);
  nextBillingDate.setDate(nextBillingDate.getDate() - 7);
  const subscription = await CustomerSubscription.create({
    user: req.user._id, plan: planId, startDate, endDate, nextBillingDate,
    paymentMethod: paymentMethod || 'stripe',
    autoRenew: autoRenew !== undefined ? autoRenew : true,
  });
  res.status(201).json(subscription);
});

exports.getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await CustomerSubscription.find({ user: req.user._id }).populate('plan');
  res.json(subscriptions);
});

exports.cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await CustomerSubscription.findOne({ _id: req.params.id, user: req.user._id });
  if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
  subscription.status = 'cancelled';
  subscription.autoRenew = false;
  await subscription.save();
  res.json({ message: 'Subscription cancelled', subscription });
});

exports.renewSubscription = asyncHandler(async (req, res) => {
  const subscription = await CustomerSubscription.findOne({ _id: req.params.id, user: req.user._id }).populate('plan');
  if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
  const plan = subscription.plan;
  const newEnd = new Date(subscription.endDate);
  newEnd.setMonth(newEnd.getMonth() + plan.duration);
  subscription.endDate = newEnd;
  subscription.nextBillingDate = new Date(newEnd);
  subscription.nextBillingDate.setDate(subscription.nextBillingDate.getDate() - 7);
  subscription.status = 'active';
  await subscription.save();
  res.json({ message: 'Subscription renewed', subscription });
});

exports.pauseSubscription = asyncHandler(async (req, res) => {
  const subscription = await CustomerSubscription.findOne({ _id: req.params.id, user: req.user._id });
  if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
  if (subscription.status !== 'active') return res.status(400).json({ message: 'Only active subscriptions can be paused' });
  subscription.status = 'paused';
  subscription.autoRenew = false;
  await subscription.save();
  res.json({ message: 'Subscription paused', subscription });
});

exports.resumeSubscription = asyncHandler(async (req, res) => {
  const subscription = await CustomerSubscription.findOne({ _id: req.params.id, user: req.user._id }).populate('plan');
  if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
  if (subscription.status !== 'paused') return res.status(400).json({ message: 'Only paused subscriptions can be resumed' });
  subscription.status = 'active';
  subscription.autoRenew = true;
  await subscription.save();
  res.json({ message: 'Subscription resumed', subscription });
});

exports.skipNextBilling = asyncHandler(async (req, res) => {
  const subscription = await CustomerSubscription.findOne({ _id: req.params.id, user: req.user._id }).populate('plan');
  if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
  if (subscription.status !== 'active') return res.status(400).json({ message: 'Only active subscriptions can skip a billing cycle' });
  const plan = subscription.plan;
  const newBilling = new Date(subscription.nextBillingDate);
  newBilling.setMonth(newBilling.getMonth() + plan.duration);
  subscription.nextBillingDate = newBilling;
  const newEnd = new Date(subscription.endDate);
  newEnd.setMonth(newEnd.getMonth() + plan.duration);
  subscription.endDate = newEnd;
  await subscription.save();
  res.json({ message: 'Next billing cycle skipped', subscription });
});

exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await CustomerSubscription.find().populate('user', 'firstName lastName email').populate('plan');
  res.json(subscriptions);
});
