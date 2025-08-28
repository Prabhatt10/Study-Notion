const mongoose = require("mongoose");
const subSection = require("./subSection");

const userSchema = new mongoose.Schema({
    name :{
        type : String
    },
    subSection : [
        {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : "subSection"
        }
    ]
});

module.exports = mongoose.model("section",sectionSchema);