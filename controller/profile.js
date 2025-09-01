const USER = require("../model/user");
const PROFILE = require("../model/profile");
const COURSE = require("../model/course");
const { Queue } = require("bullmq");
const { response } = require("express");
const deletionQueue = new Queue("account-deletion");

exports.updateProfile = async (req,res) => {
    try{
        // get data
        const {dateOfBirth="" , about="",contactNumber,gender} = req.body;
        // get user id
        const userID = req.user.id;
        // validation
        if(!contactNumber || !gender || !userID){
            return res.status(400).json({
                success : true,
                message : 'All fields are required'
            });
        }
        // find profile
        const userDetails = await USER.findById({userID});
        const profileID = userDetails.additionalDetail;
        const profileDetails = await PROFILE.findById({profileID});
        // update
        profileDetails.dateOfBirth = dateOfBirth,
        profileDetails.about= about,
        profileDetails.contactNumber = contactNumber,
        profileDetails.gender = gender

        await profileDetails.save();

        // return response
        return res.status(200).json({
            success : true,
            message : 'Profile Updated Successfully',
            profileDetails 
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Profile cannot be Updated'
        });
    }
}


exports.deleteProfile = async (req,res) => {
    try{
        // get id
        const userID = req.user.id;
        // validation
        const userDetails = await USER.findById(userID);
        if(!userDetails){
            return res.status(404).json({
                success : false,
                message : 'user not found'
            });
        }
        // delete profile
        await PROFILE.findByIdAndDelete({_id : userDetails.additionalDetail});
    
        // HW : unenrolled user from all courses
        for(const courseID of USER.courses){
            courseID,
            await COURSE.findByIdAndUpdate(
                {$pull : {studentsEnrolled : userID}},
                {new :true}
            )
        }

        // delete user
        // const deletedAfter = new Date(Date.now() + 5*24*60*60*1000);
        // await USER.updateOne(
        //     { _id: userID },
        //     { $set: { status: 'pending_delete', deleteAfter } }
        // );

        // await deletionQueue.add(
        //     'deleteAccount',
        //     { userId: userID },
        //     {
        //         delay: 5 * 24 * 60 * 60 * 1000,
        //         jobId: `delete:${userID}`,
        //         removeOnComplete: true,
        //         removeOnFail: 5000
        //     }
        // );

        await USER.findByIdAndDelete({_id : userID});
        // return response
        return req.status(200).json({
            success : true,
            message : 'Profile deleted successfully'
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Profile cannot be deleted, Please try again later'
        });
    }
}

// HW : How to schedule a request to delete account after 5 days

exports.getAllUserDetails = async (req,res) => {
    try{
        const userID = req.user.id;
        const userDetails = await USER.findById(id).populate("additionalDetail").exec();
        if(!userDetails){
            return res.status(404).json({
                success : false,
                message : 'user is empty'
            });
        }
        return res.status(200).json({
            success : true,
            message : 'successfully get All User Details'
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'All users cannot be get'
        });
    }
}