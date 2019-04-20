var Book = require("../models/book");
var Feeback = require("../models/feedback");


//all the middleware goes here
var middlewareObj = {};

middlewareObj.checkBookOwnerShip = function(req, res, next) {
    if(req.isAuthenticated()) {
        //does user own book
        Book.findById(req.params.id, function(err, foundBook) {
            if(err) {
                res.redirect("back");
            } else {
                //does user own the book
                if(foundBook.author.id.equals(req.user._id) || req.user.isAdmin) {
                    //yes
                    //req.flash("success", "Book has been deleted!");
                    next();
                } else {
                    //no
                    req.flash("error", "You don't have permission do do that!");
                    res.redirect("/books");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkFeedbackOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        //does user own the feedback
        Feedback.findById(req.params.feedback_id, function(err, foundFeedback) {
            if(err) {
                req.flash("error", "Feedback not found!");
                res.redirect("back");
            } else {
                //does user own feedback
                if(foundFeedback.author.id.equals(req.user._id) || req.user.isAdmin) {
                    //yes
                    next();
                } else {
                    //no
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

module.exports = middlewareObj;