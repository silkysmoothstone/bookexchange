var express = require("express");
var router = express.Router();
var Book = require("../models/book");
var User = require("../models/user");
var Transaction = require("../models/transaction");
var middleWare = require("../middleware");
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'calubookex@gmail.com',
        pass: 'bookitwithcal'
    }
});
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
              seller.transactions.push(transaction); //pushes seller
              seller.save(); //saves it
           });
       }
    });
    //email seller of transaction
    const mailOptions = {
  from: 'calubookex@gmail.com', // just a email address to use
  to: 'seller.username', // reciever name may need changed idk if this will work and can't test it without you
  subject: 'DONOTREPLY Your book has sold', // subject to seller
  html: '<p>Your html here</p>'// idk if we really need anything here if not marked for deletion
    };   
    //confirmation messages
    transporter.sendMail(mailOptions, function (err) {
   if(err)
     req.flash("Error", "Problem sending email!");
     res.redirect("/books");
   else
     req.flash("success", "Thank you for your purchase. Check your email!");
    res.redirect("/books");
    });
    
});

module.exports = router;
