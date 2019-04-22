var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
    name: String, //book name
    price: String, //the listing price
    image: String, //image of the book
    imageId: String, //image's id
    description: String, //description given
    isbn: String, //isbn
    sold: {
        type: Boolean, //true or false to mark for removal from the website after being sold
        default: false //defaults to not sold so that users can see and buy it
    },
    author: { 
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String //sellers username
    }
});

module.exports = mongoose.model("Book", bookSchema); //exports the model
