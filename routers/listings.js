const express = require("express");
const router = express.Router();
const Listing = require("../models/list.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

const validateListing = (req, res, err, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errmsg);
  }
  else {
    next();
  }

}

/////index route////
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  console.log("data fetched");
  if(!allListings){
    req.flash("error","This listing does not exist now");
    res.redirect("/listings");

  }
  res.render("./listings/index.ejs", { allListings });
}));

//new route
router.get("/new", (req, res) => {
  res.render("./listings/new.ejs");
});

//id route//
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id).populate("review");
  res.render("listings/show.ejs", { list });
}));

//create route
router.post("/", validateListing,
  wrapAsync(async (req, res, next) => {

    let newlisting = req.body.Listing;
    const newlist = new Listing(newlisting);
    await newlist.save();
    console.log(newlisting);
    req.flash("success","New listing Created");
    res.redirect("/listings");


  }));

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id);
  res.render("listings/edit.ejs", { list});
 
}));

//Update Route
router.put("/:id",validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success","listings Updated !");

  res.redirect(`/listings/${id}`);
}));

///delete route
router.delete("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","listings deleted !");
  res.redirect("/listings");

}));
module.exports = router;