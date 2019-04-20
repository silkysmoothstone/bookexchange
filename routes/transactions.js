var express = require("express");
var router = express.Router();
var Book = require("../models/book");
var User = require("../models/user");
var Transaction = require("../models/transaction");
var middleWare = require("../middleware");


//buy book route
router.post("/:id/buy", middleWare.isLoggedIn, function (req, res) {
    //update book to sold
    Book.findById(req.params.id, function (err, foundBook) {
       if(err) {
           req.flash("error", "Cannot find the book you're trying to buy");
           res.redirect("/books");
       } else {
           //mark book as sold
           foundBook.sold = true;
           foundBook.save();
           console.log(foundBook);
           //create the new transaction
           var transaction = new Transaction ({
               buyer: {
                   id: req.user._id,
                   username: req.user.username
               },
               seller: {
                   id: foundBook.author.id,
                   username: foundBook.author.username
               },
               book: {
                   id: foundBook._id,
                   name: foundBook.name
               }
           });
           transaction.save();
           // add book to buyer
           User.findById(req.user._id, function (err, buyer) {
               if(err) {
                   req.flash("error", "Error finding user during transaction");
                   return res.redirect("/books");
               }
               buyer.transactions.push(transaction);
               buyer.save();
           });
           //and seller transactions
           User.findById(foundBook.author.id, function (err, seller) {
              if(err) {
                  req.flash("error", "Error finding user during transaction");
                  return res.redirect("/books");
              }
              seller.transactions.push(transaction);
              seller.save();
           });
       }
    });
    //email both users about transaction

    //redirect back to /books
    req.flash("success", "Thank you for your purchase. Check your email!");
    res.redirect("/books");
});

module.exports = router;