const mongoose = require("mongoose");
const course = require("./course");

const tagsSection = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    course : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "course"
    }
});

module.exports = mongoose.model("tag",tagsSection);