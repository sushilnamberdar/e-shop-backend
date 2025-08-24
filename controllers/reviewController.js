const Product = require('../models/Product');
const Review = require('../models/reviews');
const { cloudinary } = require('../config/cloudinary');

exports.addReview = async (req, res) => {
  const { rating, comment, images } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });


  // Check if the user already reviewed this product
  const existingReview = await Review.findOne({ Product: productId, user: req.user._id });
  console.log('exstingReview', existingReview);
  if (existingReview) {
    return res.status(400).json({ message: "You have already reviewed this product." });
  }


  // upload multiple images to cloudinary

  let uploadedImages = [];
  if (images && images.length > 0) {
    uploadedImages = await Promise.all(
      images.map(async (base64Image) => {
        const result = await cloudinary.uploader.upload(base64Image, {
          folder: 'reviews',
          allowed_formats: ['jpg', 'jpeg', 'png'],
        });
        return result.secure_url;
      })
    )
  }




  // create new review

  const review = await Review.create({
    Product: productId,
    user: req.user._id,
    rating,
    comment,
    images: uploadedImages,
  })

  // recalculate average rating & numer of reviews

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, numReviews: { $sum: 1 } } }
  ])

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats[0]?.avgRating || 0,
    numReviews: stats[0]?.numReviews || 0

  });

  res.status(201).json(review);
};

exports.getReviews = async (req, res) => {
  console.log('recive in getRewives');
  const productId = req.params.productId;

  const reviews = await Review.find({ Product: productId })
    .populate('user', 'name') // show username
    .sort({ createdAt: -1 }); // latest first
  console.log('reviews', reviews);

  res.json(reviews);
};


exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  // Only allow owner to delete
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await review.remove();

  // Recalculate product stats after deletion
  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, numReviews: { $sum: 1 } } }
  ]);

  await Product.findByIdAndUpdate(review.product, {
    averageRating: stats[0]?.avgRating || 0,
    numReviews: stats[0]?.numReviews || 0
  });

  res.json({ message: 'Review deleted' });
};

