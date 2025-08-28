const mongoose = require("mongoose");

const ratingAndReviewsSchema = new mongoose.Schema ({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "user"
    },
    rating : {
        type : Number,
        reuired : true
    },
    review : {
        type : String,
        required : true
    }
});

module.exports = mongoose.model("ratingAndReviews",ratingAndReviewsSchema);