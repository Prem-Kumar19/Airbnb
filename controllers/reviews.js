const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async(req,res)=>{
    const listing = await Listing.findById(req.params.id);
    const newreview = new Review(req.body.review);
    newreview.author = res.locals.currentUser._id;
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
     req.flash("success" , "Added a Review");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async(req,res)=>{
    const {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
     req.flash("success" , "Review Deleted");
    res.redirect(`/listings/${id}`);
};