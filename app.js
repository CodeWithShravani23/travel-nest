const express= require("express");
const app= express();
const mongoose=require("mongoose");
const Listing=require("./models/list.js");
const path= require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

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



/////index route////
app.get("/listings",async(req,res)=>{
  const allListings= await Listing.find({});
  console.log("data fetched");
  res.render("./listings/index.ejs",{allListings});
  
});
//new route
app.get("/listings/new",(req,res)=>{
  res.render("./listings/new.ejs");
});

//id route//
app.get("/listings/:id",async(req,res)=>{
  const {id} = req.params;
  const list= await Listing.findById(id);
  res.render("listings/show.ejs",{list});
});

//create route
app.post("/listings" ,async (req,res)=>{
let newlisting=req.body.Listing;
const newlist=new Listing(newlisting);
await newlist.save();
console.log(newlisting);
res.redirect("/listings");
});

//edit route
app.get("/listings/:id/edit",async(req,res)=>{
  const {id} = req.params;
  const list= await Listing.findById(id);
  res.render("listings/edit.ejs",{list});

});

///update route
app.put("/listings/:id",async(req,res)=>{
  const {id} = req.params;
  await Listing.findByIdAndUpdate(id,{ ...req.body.Listing});
  res.redirect(`/listings/${id}`);

});

///delete route
app.delete("/listings/:id", async (req,res)=>{
  const { id } = req.params;
  let deletedListing= await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");


})

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

main().then(()=>{
    console.log("connection sucessful");

})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  
}