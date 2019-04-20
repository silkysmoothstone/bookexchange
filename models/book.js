var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    imageId: String,
    description: String,
    isbn: String,
    sold: {
        type: Boolean,
        default: false
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Book", bookSchema);