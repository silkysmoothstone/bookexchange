var express = require("express");
var router = express.Router();
var Book = require("../models/book");
var middleWare = require("../middleware");

//INDEX Route - Show all books
router.get("/", function(req, res) {
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Book.find({ "name": regex }, function(err, allBooks) {
            if(err) {
                req.flash("error", "Error in search terms!")
            } else {
                if(allBooks.length > 0) {
                    res.render("books/index", {books: allBooks, currentUser: req.user, page: 'books'});
                } else {
                    req.flash("error", "No books match that search");
                    res.redirect("back");
                }
            }
        });
    } else {
        //get all books from DB
        Book.find({}, function (err, allBooks) {
            if(err) {
                console.log(err);
            } else {
                res.render("books/index", {books: allBooks, currentUser: req.user, page: 'books'});
            }
        });
    }
});

//CREATE - add new book to database
router.post("/", middleWare.isLoggedIn, function(req, res) {
    //get data from form and add to campgrounds database
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var isbn = req.body.isbn;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newBook = {name: name, price: price, image: image, description: desc, isbn: isbn, author: author};
    //create a new book and save to database
    Book.create(newBook, function(err, newlyCreated) {
        if(err) {
            console.log(err);
        } else {
            //redirect back to books
            res.redirect("/books");
        }
    });
});

//NEW - Show form to create new book
router.get("/new", middleWare.isLoggedIn, function(req, res) {
    res.render("books/new");
});

//SHOW - Shows more info about one book
router.get("/:id", function(req, res) {
    //find the book of the id
    Book.findById(req.params.id, function(err, foundBook) {
        if(err) {
            console.log(err);
        } else {
            res.render("books/show", {book: foundBook});
        }
    });
});

//Edit route - show form to edit a book
router.get("/:id/edit", middleWare.checkBookOwnerShip, function(req, res) {
    Book.findById(req.params.id, function(err, foundBook) {
        res.render("books/edit", {book: foundBook});
    });
});

//Update route - update book, then redirect
router.put("/:id", middleWare.checkBookOwnerShip, function(req, res) {
    //find and update the correct book
    Book.findByIdAndUpdate(req.params.id, req.body.book, function(err, updatedBook) {
        if(err) {
            req.flash("error", "Error updating the book!");
            res.redirect("/books");
        } else {
            //redirect to show page
            req.flash("success", "Book has been updated!");
            res.redirect("/book/" + req.params.id);
        }
    });
});

//destroy route - delete a book
router.delete("/:id", middleWare.checkBookOwnerShip, function(req, res) {
    Book.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            req.flash("error", "Unable to delete the book");
            res.redirect("/book");
        }
        req.flash("success", "Book deleted");
        res.redirect("/book");
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;