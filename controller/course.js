const COURSE = require("../model/course");
const TAGS = require("../model/category");
const USER = require("../model/user");
const {imageUploadToCloudinary} = require("../util/imageUploader");

// create course
exports.createCourse = async (req,res) => {
    try{
        // fetch all data
        const {courseName,courseDescription,whatYouWillLearn,price,tags} = req.body;
        // thumbnail
        const thumbnail = req.files.thumbnailImage;
        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tags){
            return res.status(400).json({
                success : false,
                message : 'Please enter all required data of course'
            });
        }
        // check for instructor
        const userID = req.user.id;
        const instructorDetails = await USER.findById(userID);
        console.log(instructorDetails);
        if(!userID){
            return res.status(404).json({
                success : false,
                message : 'Instructor Details not found'
            });
        }
        
        // check tag is valid or not
        const tagDetails = await TAGS.findById(tags);
        if(!tagDetails){
            return res.status(404).json({
                success : false,
                message : 'TAG Details not found'
            });
        }
        // upload image to cloudinary
        const thumbnailImage = await imageUploadToCloudinary(thumbnail, process.env.FOLDER_NAME);
        // create an entry for new course
        const newCourse = await COURSE.create({
            courseName,
            courseDescription,
            instructor : instructorDetails._id,
            whatYouWillLearn,
            price ,
            tags : tagDetails._id,
            thumbnail : thumbnailImage.secure_url
        });
        // update user by updating the course in user course list
        await USER.findByIdAndDelete(
            {_id : instructorDetails._id},
            {
                $push : {
                    courses : newCourse._id
                }
                
            },
            {new:true}
        );

        // update the tag schema
        await TAGS.findByIdAndUpdate(
            {_id : tagDetails._id},
            {
                $push : {
                    courses : newCourse._id
                }
            },
            {new : true}
        );


        // return response 
        return res.status(200).json({
            success : true,
            message : "Course Created Successfully"
        });
        
    }
    catch(error) {
        return res.status(500).json({
            success : false,
            essage : 'class annot be created'
        });
    }
}


// get all course
exports.getAllCourse = async (req,res) => {
    try{
        const allCourses = await COURSE.find({},{courseName:true,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReview,
                                                studentsEnrolled
                                            }).populste("instructor");
    
        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully'
        });
    }
    catch(error) {
        return res.status(500).json({
            success : false,
            essage : 'cannot get all courses, Please try again'
        });
    }
}