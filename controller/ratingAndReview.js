const RATINGANDREVIEW = require("../model/ratingAndReviews");
const COURSE = require('../model/user');
const mongoose = require("mongoose");

// CREATE RATING
exports.createRating = async (req,res) => {
    try{
        // get user id
        const userID = req.user.id;
        // fetchdata from req body
        const {rating,review,courseID} = req.body;
        // check user is enrolled or not
        const courseDetail = await COURSE.findOne(
            {_id : courseID , studentsEnrolled : {$elematch : {$eq : userID}}},
        );
        // validation
        if(!courseDetail){
            return res.status(404).json({
                success : false,
                message : 'User is not enrolled in course'
            });
        }
        // check if user is not already enrolled the course
        const alreadyReviewed = await RATINGANDREVIEW.findOne({
            user:userID,
            course : courseID,
        });
        if(alreadyReviewed){
            return res.status(403).json({
                success : false,
                message : 'Course is already reviewed by the user'
            });
        }
        // create rating ad review
        const ratingReview = await RATINGANDREVIEW({
            rating,
            review,
            course :courseID,
            review : userID
        });

        // update course
        const updatedCourseDetails = await COURSE.findByIdAndUpdate({_id : courseID},
            {
                $push : {
                    ratingAndReviews : ratingReview._id,
                }
            },
            {new : true}
        );

        console.log(updatedCourseDetails);

        // return rsponse 
        return res.status(200).json({
            success : true,
            message : "Course reviewed successfully"
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Error while reviewing Course"
        });
    }
}

// GET AVERAGE RATING 
exports.averageRating = async (req,res) => {
    try{
        const courseID = req.body.courseID;
        const result = await RatingReview.aggregate([
            {
                $match : {
                    course : new mongoose.Types.ObjectId(String(courseID)),
                },
            },
            {
                $group : {
                    _id : null,
                    averageRating : {$avg : "rating"},
                },
            },

        ]);

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }


        // if no rating review exist
        return res.status(200).json({
            success : true,
            message : "No rating given till now",
            averageRating : 0
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Error while calculating average rating"
        });
    }
}


// GET ALL RATING
exports.getAllRating = async (req,res) => {
    try{
        const allReviews = await RATINGANDREVIEW.find({})
                                                .sort({rating: "desc"})
                                                .populate({
                                                    path : "user",
                                                    select : "firstName lastName email image"
                                                })
                                                .populate ({
                                                    path : "course",
                                                    select: "courseName"
                                                }).exec();
        
        return res.status(200).json({
            success : true,
            message : "All reviews fetched successfully",
            data : allReviews
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Error while fetching all reviews"
        });
    }
}