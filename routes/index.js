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
        req.flash("error", "Passwords do not match! Please re-enter information"); //password confirm does not match password
        res.redirect("/register"); //redirect tor registration page 
    } else {
        var pattern = new RegExp("^[a-zA-Z0-9._%+-]+@calu+\.edu$");
        if (pattern.test(req.body.username)) {
            var newUser = new User({ //new user template model calling user database model and to add the record of that new user
                username: req.body.username, //required username
                firstName: req.body.firstName, //required first name
                lastName: req.body.lastName //required last name
            });
            //correct adminCode supplied?
            if (req.body.adminCode === 'secretcode123') { //our secret code simple way for the scope of the project
                newUser.isAdmin = true; //sets user to be admin
            }
            User.register(newUser, req.body.password, function (err, user) {
                if (err) {
                    return res.render("register", {"error": err.message}); 
                }
                passport.authenticate("local")(req, res, function () { //authenticate
                    req.flash("success", "Welcome to CalU Book Exchange, " + user.username + "!"); //disp;lay message for newly registered account
                    res.redirect("/books"); //book redirect
                });
            });
        } else {
            req.flash("error", "You must register with a @calu.edu email address!"); //error if not given calu.edu email 
            res.redirect("/register"); //redirect to registration page
        }
    }
});

//show sign in form
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'}); //display login page
});

//handle signin
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/books", //if login works and passport auth passes
        failureRedirect: "/login" //if login fails wrong user/pass or auth err
    }), function(req, res) {

});

//logout route
router.get("/logout", function(req, res) {
    req.logout(); //request logout
    req.flash("success", "You have successfully logged out!") //successful logout message
    res.redirect("/books"); //redirect to books
});

//user profile route
router.get("/users/:id", middleWare.isLoggedIn, function(req, res) {
    User.findById(req.params.id).populate("transactions").populate("feedback").exec(function(err, foundUser) {
        if(err) {
            req.flash("error", "User profile does not exit."); //could not find user profile
            res.redirect("/");
        } else {
            Book.find().where('author.id').equals(foundUser._id).exec(function (err, books) {
                if (err) {
                    req.flash("error", "User profile does not exit."); //did not find user profile
                    res.redirect("/"); 
                } else {
                    res.render("users/show", {user: foundUser, books: books}); //shows user prof
                }
            });
        }
    });
});

module.exports = router;
