var express = require("express");
var router = express.Router({mergeParams: true});
var Book = require("../models/book");
var Feedback = require("../models/feedback");
var User = require("../models/user");
var middleWare = require("../middleware");

//New route - show the form for adding feedback
router.get("/", middleWare.isLoggedIn, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        res.render("feedback/new", {user: foundUser});
    });

});
//create route - add feedback to the database
router.post("/", middleWare.isLoggedIn, function (req, res) {
    //lookup user by id
    User.findById(req.params.id, function (err, foundUser) {
        if(err) {
            req.flash("error", "Error leaving feedback");
            res.redirect("/books");
        } else {
            Feedback.create(req.body.feedback, function (err, feedback) {
               if(err) {
                   req.flash("error", "Error leaving feedback");
                   res.redirect("/books");
               } else {
                   //add username and id to feedback
                   feedback.author._id = req.user._id;
                   feedback.author.username = req.user.username;
                   //save feedback
                   feedback.save();
                   //connect feedback to seller
                   foundUser.feedback.push(feedback);
                   foundUser.save();
                   //redirect back to current user's profile
                   req.flash("success", "Successfully added feedback");
                   res.redirect("/users/" + req.user._id);
               }
            });
        }
    });
});

//edit route - show form to edit feedback

//update route - update the feedback then redirect

//destroy route - delete the feedback

module.exports = router;