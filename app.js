const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routers/listings.js");
const reviews = require("./routers/reviews.js");
const userRouter = require("./routers/users.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User=require("./models/user.js");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
// app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions={secret:"mySecretsession",
  resave:false,
  saveUninitialized:true,
  Cookie:{
    expires:Date.now()+3*24*60*60*1000,
    maxAge:3*24*60*60*1000,
    httpOnly:true,
  }
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(express.static(path.join(__dirname, '/public')));

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})

app.use("/", userRouter); // Mount at the root to access /signup directly
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

app.listen(8080, () => {
  console.log("listening to the port 8080");
});
app.get("/", (req, res) => {
  res.send("hii iam root!");
});
app.all("*", (req, res, next) => { // include 'next' here
  next(new ExpressError(404, "Page not found")); // passing the error to next()
});
main().then(() => {
  console.log("connection sucessful");

})
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

}
app.use((err, req, res, next) => {


  let { status = 505, message = "Something went wrong" } = err;
  res.status(status).render("listings/error.ejs", { message });
})