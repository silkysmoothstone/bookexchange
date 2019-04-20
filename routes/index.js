var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Book = require("../models/book");
var middleWare = require("../middleware");

//root route
router.get("/", function(req, res) {
    res.render("landing");
});

//show register form
router.get("/register", function(req, res) {
    res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req, res) {
    if(!(req.body.password === req.body.password2)) {
        req.flash("error", "Passwords do not match! Please re-enter information");
        res.redirect("/register");
    } else {
        var pattern = new RegExp("^[a-zA-Z0-9._%+-]+@calu+\.edu$");
        if (pattern.test(req.body.username)) {
            var newUser = new User({
                username: req.body.username,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            });
            //correct adminCode supplied?
            if (req.body.adminCode === 'secretcode123') {
                newUser.isAdmin = true;
            }
            User.register(newUser, req.body.password, function (err, user) {
                if (err) {
                    return res.render("register", {"error": err.message});
                }
                passport.authenticate("local")(req, res, function () {
                    req.flash("success", "Welcome to CalU Book Exchange, " + user.username + "!");
                    res.redirect("/books");
                });
            });
        } else {
            req.flash("error", "You must register with a @calu.edu email address!");
            res.redirect("/register");
        }
    }
});

//show sign in form
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'});
});

//handle signin
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/books",
        failureRedirect: "/login"
    }), function(req, res) {

});

//logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You have successfully logged out!")
    res.redirect("/books");
});

//user profile route
router.get("/users/:id", middleWare.isLoggedIn, function(req, res) {
    User.findById(req.params.id).populate("transactions").populate("feedback").exec(function(err, foundUser) {
        if(err) {
            req.flash("error", "User profile does not exit.");
            res.redirect("/");
        } else {
            Book.find().where('author.id').equals(foundUser._id).exec(function (err, books) {
                if (err) {
                    req.flash("error", "User profile does not exit.");
                    res.redirect("/");
                } else {
                    res.render("users/show", {user: foundUser, books: books});
                }
            });
        }
    });
});

module.exports = router;