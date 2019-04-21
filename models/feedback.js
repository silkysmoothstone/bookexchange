var mongoose = require("mongoose");

var feedbackSchema = new mongoose.Schema({
    text: String, //the text of the feedback
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId, //object id for feedback
            ref: "User" //references user who left feedback
        },
        username: String 
    }
});

module.exports = mongoose.model("Feedback", feedbackSchema); //export it
