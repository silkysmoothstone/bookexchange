var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
    name: String, //name of the book
    price: String, //the price listed
    image: String, //image of the book
    imageId: String, //image id
    description: String, //description
    isbn: String, //isbn
    sold: {
        type: Boolean, //boolean if sold
        default: false
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId, //object id referencing user
            ref: "User"
        },
        username: String //username in our case the user's email
    }
});

module.exports = mongoose.model("Book", bookSchema); //exports the model
