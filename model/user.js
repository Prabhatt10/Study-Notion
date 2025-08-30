const { ExplainVerbosity } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        require: true,
        trim : true
    },
    lastName : {
        type : String,
        require: true,
        trim : true
    },
    email : {
        type : String,
        require: true,
        trim : true
    },
    password : {
        type : String,
        require: true,
    },
    confirmPassword : {
        type : String,
        require: true,
    },
    accountType : {
        type : String,
        enum : ["Admin","Student","Instructor"],
        required : true
    },
    additionalDetail : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "profile"
    },
    courses :  [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "course"
        }
    ],
    Image : {
        type : String,
        required : true
    },
    token : {
        type : String
    },
    resetPasswordExpires : {
        type : Date
    },
    courseProgress : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "courseProgram"
        }
    ],
});

module.exports = mongoose.model("user",userSchema);