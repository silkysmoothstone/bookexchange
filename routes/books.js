var express = require("express");
var router = express.Router();
var Book = require("../models/book");
var middleWare = require("../middleware");

var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'calubookexchange',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX Route - Show all books
router.get("/", function(req, res) {
    if(req.query.search) { //if they attempt to search for something
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Book.find({ "name": regex }, function(err, allBooks) { 
            if(err) {
                req.flash("error", "Error in search terms!"); //error caused by search terms
            } else {
                if(allBooks.length > 0) { //checks if we have books that match search results
                    res.render("books/index", {books: allBooks, currentUser: req.user, page: 'books'}); //shows all books by search results
                } else {
                    req.flash("error", "No books match that search"); //message if no books found by search results
                    res.redirect("/books"); //redirect to books page
                }
            }
        });
    } else {
        //get all books from DB
        Book.find({}, function (err, allBooks) {
            if(err) {
                console.log(err); //something wrong happened when trying to get listing from database
            } else {
                res.render("books/index", {books: allBooks, currentUser: req.user, page: 'books'}); //render the page with all the books
            }
        });
    }
});

//NEW - Show form to create new book
router.get("/new", middleWare.isLoggedIn, function(req, res) {
    res.render("books/new"); //renders create book page
});

//CREATE - add new book to database
router.post("/", middleWare.isLoggedIn, upload.single('image'), function(req, res) {
    //get data from form and add to books database
    cloudinary.v2.uploader.upload(req.file.path, {format: 'jpg', image_metadata: true}, function(err, result) {
        if(err) {
            req.flash("error", err.message); //display error message
            return res.redirect("back"); //goes back if error
        }
        // add cloudinary url for the image to the book object under image property
        req.body.book.image = result.secure_url;
        req.body.book.imageId = result.public_id;
        // add author to book
        req.body.book.author = {
            id: req.user._id,
            username: req.user.username
        }
        Book.create(req.body.book, function(err, book) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/books/' + book.id);
        });
    });
    // var name = req.body.name;
    // var price = req.body.price;
    // var image = req.body.image;
    // var desc = req.body.description;
    // var isbn = req.body.isbn;
    // var author = {
    //     id: req.user._id,
    //     username: req.user.username
    // };
    // var newBook = {name: name, price: price, image: image, description: desc, isbn: isbn, author: author};
    // //create a new book and save to database
    // Book.create(newBook, function(err, newlyCreated) {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         //redirect back to books
    //         res.redirect("/books");
    //     }
    // });
});

//SHOW - Shows more info about one book
router.get("/:id", middleWare.isLoggedIn, function(req, res) {
    //find the book of the id
    Book.findById(req.params.id, function(err, foundBook) {
        if(err) {
            console.log(err); //couldn't find book by id
        } else {
            res.render("books/show", {book: foundBook}); //found book and renders more info page
        }
    });
});

//Edit route - show form to edit a book
router.get("/:id/edit", middleWare.checkBookOwnerShip, function(req, res) {
    Book.findById(req.params.id, function(err, foundBook) { //search for book by id
        res.render("books/edit", {book: foundBook}); //renders editing listing page
    });
});

//Update route - update book, then redirect
router.put("/:id", middleWare.checkBookOwnerShip, upload.single('image'), function(req, res) {
    //find and update the correct book
    Book.findById(req.params.id, async function(err, book) {
        if(err) {
            req.flash("error", "Error finding the book!"); //could not find book
            res.redirect("/books"); //redirect back to books page
        } else {
            if(req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(book.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path, {format: 'jpg', image_metadata: true});
                    book.imageId = result.public_id;
                    book.image = result.secure_url;
                } catch (err) {
                    req.flash("error", err.message);
                    return res.redirect("/books");
                }
            }
            book.name = req.body.book.name;
            book.price = req.body.book.price;
            book.isbn = req.body.book.isbn;
            book.description = req.body.book.description;
            book.save();
            //redirect to show page
            req.flash("success", "Book has been updated!");
            res.redirect("/books/" + req.params.id);
        }
    });
});

//destroy route - delete a book
router.delete("/:id", middleWare.checkBookOwnerShip, function(req, res) {
    //find the book
    Book.findById(req.params.id, async function(err, book) {
        if(err) {
            req.flash("error", "Unable to delete the book");
            return res.redirect("/books");
        }
        try {
            //wait until the image is deleted before continuing
            await cloudinary.v2.uploader.destroy(book.imageId);
            book.remove(); //remove that book
            req.flash("success", "Book deleted"); //it worked display message
            res.redirect("/books");  //redirect to books
        } catch (err) {
            req.flash("error", "Unable to delete the book"); //error message if book could not be deleted
            return res.redirect("/books"); //redirect to books page
        }
    });
});



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
