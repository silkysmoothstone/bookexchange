var mongoose = require("mongoose");

var transactionSchema = new mongoose.Schema({
    buyer: {
        id: {
            type: mongoose.Schema.Types.ObjectId, //buyer id reference
            ref: "User" //buyer username
        },
        username: String
    },
    seller: {
        id: {
            type: mongoose.Schema.Types.ObjectId, //seller id reference
            ref: "User"
        },
        username: String //seller username
    },
    book: {
        id: {
            type: mongoose.Schema.Types.ObjectId, //book id reference
            ref: "Book"
        },
        name: String //name of the book
    },
    feedbackExists: {
        type: Boolean, //does it have feedback
        default: false //default is false because a transaction shouldn't have feedback before it is sold
    }
});

module.exports = mongoose.model("Transaction", transactionSchema); //export it
