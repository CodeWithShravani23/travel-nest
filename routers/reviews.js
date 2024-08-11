const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/list.js");

const validateReview = (req, res, err, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errmsg);
  }
  else {
    next();
  }

}
//reviews
//post route
router.post("/", validateReview, wrapAsync(async (req, res) => {
  const list = await Listing.findById(req.params.id);
  let newReviw = new Review(req.body.review);
  list.review.push(newReviw);
  await newReviw.save();
  list.save();
  req.flash("Success","Review added !");
  res.redirect(`/listings/${list._id}`);
}));

//Delete review route
router.delete("/reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("Success","Review deleted !");
  res.redirect(`/listings/${id}`);
}));
module.exports = router;