const SUBSECTION = require("../model/subSection");
const SECTION = require("../model/section");
const { videoUploadToCloudinary } = require("../util/imageUploader");


// create subsection
exports.createSubSection = async (req,res) => {
    try{
        // fetch data
        const {sectionID,title,timeDuraion,description} = req.body;
        // extract file/video
        const video = req.files.videoFile;
        // validate 
        if(!sectionID || !title || !timeDuraion || !description || video){
            return res.status(400).json({
                success : false,
                message : 'all fields are required'
            });
        }
        // upload video in cloudinary
        const uploadDetail = await videoUploadToCloudinary(video, process.env.FOLDER_NAME);
        // create subsection
        const updatedSubSection = await SUBSECTION.create({
            title : title,
            timeDuration : timeDuraion,
            description : description,
            videoUrl : uploadDetail.secure_url
        });
        // update subsection in section
        const updatedSection = await SECTION.findByIdAndUpdate(
            sectionID,
            {
                $push: {
                    subSection: updatedSubSection._id
                }
            },
            { new: true }
        ).populate ("subSection");

        // return response
        return res.status(200).json({
            success : true,
            message : 'subSection created successfully'
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Error in creating Subsection'
        });
    }
}

// update sub section
exports.updateSubSection = async (req,res) => {
    try{

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Error in updating Subsection'
        });
    }
}

// delete seb section
exports.deleteSubSection = async (req,res) => {
    try{

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Error in deleting Subsection'
        });
    }
}