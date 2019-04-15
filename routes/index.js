var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Book = require("../models/book");

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
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });
    //correct adminCode supplied?
    if(req.body.adminCode === 'secretcode123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome to CalU Book Exchange, " + user.username + "!");
            res.redirect("/books");
        });
    });
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
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            req.flash("error", "User profile does not exit.");
            res.redirect("/");
        }
        Book.find().where('author.id').equals(foundUser._id).exec(function(err, books) {
            if(err) {
                req.flash("error", "User profile does not exit.");
                res.redirect("/");
            }
            res.render("users/show", {user: foundUser, books: books});
        });
    });
});

module.exports = router;