const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema ({
    courseName : {
        type : String
    },
    courseDescription : {
        type : String
    },
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    whatYouWillLearn : {
        type : String
    },
    curseContent : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "section"
        }
    ],
    ratingAndReviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "ratingAndReview"
        }
    ],
    price : {
        type : Number
    },
    thumbnail : {
        type : String
    },
    tags : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "tags"
    },
    studentsEnrolled : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    }

});

module.exports = model("course",courseSchema);