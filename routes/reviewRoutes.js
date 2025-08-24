const express = require("express");
const { addReview, getReviews, deleteReview } = require("../controllers/reviewController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Multer storage

router.post("/:productId/reviews", authMiddleware,  addReview);

router.get("/:productId/reviews", getReviews);
router.delete("/reviews/:reviewId", authMiddleware, deleteReview);

module.exports = router;
