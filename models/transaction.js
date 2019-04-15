var mongoose = require("mongoose");

var feedbackSchema = new mongoose.Schema({
    text: String,
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
    }
});

module.exports = mongoose.model("Feedback", feedbackSchema);