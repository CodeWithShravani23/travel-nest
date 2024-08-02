const express= require("express");
const app= express();
const mongoose=require("mongoose");
const Listing=require("./models/list.js");
const path= require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
// app.use(express.static(path.join(__dirname,"/public")));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '/public')));

// Route to render the boilerplate.ejs with a sample body content

app.listen(8080,()=>{
    console.log("listening to the port 8080");
});
app.get("/",(req,res)=>{
   res.send("hii iam root!");
});

const validateListing=(req,res,err,next)=>{
  let {error}=listingSchema.validate(req.body);
  if(error){
    let errmsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(404,errmsg);
  }
  else{
    next();
  }

}
const validateReview=(req,res,err,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if(error){
    let errmsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(404,errmsg);
  }
  else{
    next();
  }

}



/////index route////
app.get("/listings", wrapAsync(async(req,res)=>{
  const allListings= await Listing.find({});
  console.log("data fetched");
  res.render("./listings/index.ejs",{allListings});
  
}));
//new route
app.get("/listings/new",(req,res)=>{
  res.render("./listings/new.ejs");
});

//id route//
app.get("/listings/:id", wrapAsync(async(req,res)=>{
  const {id} = req.params;
  const list= await Listing.findById(id).populate("review");
  res.render("listings/show.ejs",{list});
}));

//create route
app.post("/listings",validateListing,
  wrapAsync(async(req,res,next)=>{
  
  let newlisting=req.body.Listing;
    const newlist=new Listing(newlisting);
    await newlist.save();
    console.log(newlisting);
    res.redirect("/listings");

  
}));

//edit route
app.get("/listings/:id/edit", wrapAsync(async(req,res)=>{
  const {id} = req.params;
  const list= await Listing.findById(id);
  res.render("listings/edit.ejs",{list});

}));

///update route
app.put("/listings/:id",validateListing, wrapAsync(async(req,res)=>{
 
  const {id} = req.params;
  await Listing.findByIdAndUpdate(id,{ ...req.body.Listing});
  res.redirect(`/listings/${id}`);

}));

///delete route
app.delete("/listings/:id",  wrapAsync(async (req,res)=>{
  const { id } = req.params;
  let deletedListing= await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");

}));


//reviews
//post route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
  const list= await Listing.findById(req.params.id);
  let newReviw=new Review(req.body.review);
  list.review.push(newReviw);
  await newReviw.save();
  list.save();
  res.redirect(`/listings/${list._id}`);
}));

//Delete review route
app.delete("listings/:id/reviews/reviewId",wrapAsync(async(req,res)=>{
  let{id,reviewId}= req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}))

//new routeconst
//  app.get("/testlisting",async(req,res)=>{
// let samplelisting=new listing({
//   title:"my new villa",
//   description:"by the beach",
//    price:1200,
//    location:"calangute,Goa",
//    country:"india",
//  });
//  await samplelisting.save();
// res.send("successful testing");
//  });
app.all("*",(req,res,err)=>{
  next(new ExpressError(404,"Page not found"));
})

main().then(()=>{
    console.log("connection sucessful");

})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  
}
app.use((err,req,res,next)=>{

 
  let{status=505,message="Something went wrong"}=err;
  res.status(status).render("listings/error.ejs",{message});

// res.status(status).send(message);

})