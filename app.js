require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOveride = require("method-override");
var Book = require("./models/book");
//var Comment = require("./models/comment");
var User = require("./models/user");
//var seedDB = require("./seeds");

//requiring routes
//var feedbackRoutes = require("./routes/feedback");
var bookRoutes = require("./routes/books");
var indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/exchange_final", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOveride("_method"));
app.use(flash());
//seedDB();

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "This is the biggest secret ever!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
//app.use("/books/:id/comments", feedbackRoutes);
app.use("/books", bookRoutes);

app.listen(3000, function () {
    console.log("The CalU Book Exchange server has started");
});