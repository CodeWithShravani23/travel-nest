const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user.js");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
router.get("/signup", (req, res) => {
    res.render("./users/signup.ejs");
});
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUSer = new User({ email, username });
        const registeredUSer = await User.register(newUSer, password);
        req.flash("success", "Welcome to Travel-nest!")
        res.redirect("/listings");

    }
    catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("./users/login.ejs");
});
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login", failureFlash: true,
}), async (req, res) => {
    req.flash("success", "Welcome back to Travel-nest");
    res.redirect("/listings");

});
module.exports = router;