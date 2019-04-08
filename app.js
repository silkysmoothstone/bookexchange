var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/exchange_v2", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var bookSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Book = mongoose.model("Book", bookSchema);

//===================
//BEGINNING OF ROUTES
//===================
app.get("/", function (req, res) {
    res.render("landing", {title: "Home"});
});

//Index Route
app.get("/books", function (req, res) {
    //get all books
    Book.find({}, function (err, allBooks) {
       if(err) {
           console.log(err);
       } else {
           res.render("index", {title: "All Books", books: allBooks});
       }
    });
});

//New Route - Show form to create a new book
app.get("/books/new", function (req, res) {
   res.render("new", {title: "Add New Book"});
});

//Create Route - Add new book to the database
app.post("/books", function(req, res) {
    //get data from form and add to campgrounds database
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newBook = {name: name, image: image, description: desc};
    //create a new campground and save to database
    Book.create(newBook, function(err, book) {
        if(err) {
            console.log(err);
        } else {
            //redirect back to campgrounds
            res.redirect("/books");
        }
    });
});

//Show Route - Show information about 1 book
app.get("/books/:id", function (req, res) {
    //find the campground with provided id
    Book.findById(req.params.id, function (err, foundBook) {
        if(err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("show", {title: foundBook.name.toString(), book: foundBook});
        }
    });
});


//=============
//END OF ROUTES
//=============
app.listen(3000, function () {
    console.log("CalUBookExchange server running....");
});
