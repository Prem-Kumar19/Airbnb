const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {validateReview , isLoggedIn , isReviewAuthor} = require("../middleware.js");
const reviewControllers = require("../controllers/reviews.js");

//Review route (8th route) for adding reviews
//POST /listings/:id/reviews
router.post("/", isLoggedIn , validateReview, wrapAsync(reviewControllers.createReview));

//delete review route (9th route) for deleting reviews
router.delete("/:reviewId", isLoggedIn , isReviewAuthor , wrapAsync(reviewControllers.deleteReview));

//$pull operator removes from an existing array all instances of a value or values that match a specified condition.

module.exports = router;