const asyncHandler = require('../middleware/asyncHandler');
const Preference = require('../models/Preference');
const Product = require('../models/Product');

exports.setPreferences = asyncHandler(async (req, res) => {
  const { categories, interests, priceRange, dietaryRestrictions, preferredFrequency, dislikedProducts } = req.body;
  let preference = await Preference.findOne({ user: req.user._id });
  if (preference) {
    if (categories) preference.categories = categories;
    if (interests) preference.interests = interests;
    if (priceRange) preference.priceRange = priceRange;
    if (dietaryRestrictions) preference.dietaryRestrictions = dietaryRestrictions;
    if (preferredFrequency) preference.preferredFrequency = preferredFrequency;
    if (dislikedProducts) preference.dislikedProducts = dislikedProducts;
    await preference.save();
  } else {
    preference = await Preference.create({
      user: req.user._id,
      categories, interests, priceRange, dietaryRestrictions, preferredFrequency, dislikedProducts,
    });
  }
  res.json(preference);
});

exports.getPreferences = asyncHandler(async (req, res) => {
  const preference = await Preference.findOne({ user: req.user._id }).populate('dislikedProducts', 'name');
  res.json(preference || {});
});

exports.getRecommendations = asyncHandler(async (req, res) => {
  const preference = await Preference.findOne({ user: req.user._id });
  const filter = { isActive: true };
  if (preference) {
    if (preference.categories && preference.categories.length > 0) {
      filter.category = { $in: preference.categories };
    }
    if (preference.dislikedProducts && preference.dislikedProducts.length > 0) {
      filter._id = { $nin: preference.dislikedProducts };
    }
    if (preference.priceRange) {
      filter.price = { $gte: preference.priceRange.min, $lte: preference.priceRange.max };
    }
  }
  const products = await Product.find(filter).sort({ averageRating: -1 }).limit(10);
  res.json(products);
});
