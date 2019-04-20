var mongoose = require("mongoose");

var transactionSchema = new mongoose.Schema({
    buyer: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    seller: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    book: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book"
        },
        name: String
    },
    feedbackExists: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);