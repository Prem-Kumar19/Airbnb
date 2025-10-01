const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new schema({
    email:{
        type: String,
        required: true,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
});

userSchema.plugin(passportLocalMongoose); //adds username and password field to the schema and also adds some methods to the schema
//pbkdf2 is used to hash the password and store it in the database

module.exports = mongoose.model("User", userSchema);