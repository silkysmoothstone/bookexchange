var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String, //username == email
    password: String, //their password to their account
    firstName: String, //user's first name
    lastName: String, //user's last name
    isAdmin: { 
        type: Boolean, //are they an admin set by admin code during creation
        default: false //we don't wanna give out power to everyone do we?
    },
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId, //id for transactions
            ref: "Transaction"
        }
    ],
    feedback: [
        {
            type: mongoose.Schema.Types.ObjectId, //id for feedback
            ref: "Feedback"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose); //passport for auth
module.exports = mongoose.model("User", UserSchema); //export it
