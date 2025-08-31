const SECTION = require("../model/section");
const COURSE = require("../model/course");


// create section
exports.createSection = async (req,res) => {
    try{
        // data fetch
        const {sectionName , courseID} = req.body;
        // data validation
        if(!sectionName || !courseID){
            return res.status(400).json({
                success : false,
                message : 'All fileds are required'
            });
        }
        // create section
        const newSection = await SECTION.create({sectionName});
        // update course with section objectID
        const updatedCourseDetails = await COURSE.findByIdAndUpdate(
            courseID,
            {
                $push : {
                    courseContent : newSection._id,
                }
            },
            {new:true}
        ).populate({
            path : "courseContent",
            populate : {
                path : "subSection"
            }
        });

        res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Error in creating section"
        });
    }
}

// update section
exports.updateSection = async (req,res) => {
    try{
        // fetch data
        const {sectionName,sectionID} = req.body;
        // validate 
        if(!sectionID || !sectionName){
            return res.status(400).json({
                success : false,
                message : "all fields required"
            });
        }
        // update data
        const updatedSection = await SECTION.findByIdAndUpdate(
            sectionID,
            {sectionName},
            {new:true}
        )
        // return response
        res.status(200).json({
			success: true,
			message: "Section updated successfully",
			updatedCourse,
		});

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Error in updating section"
        });
    }
}

// delete section
exports.deleteSection = async (req,res) => {
    try {
        // get id
        const {sectionID} = req.params;
        // validation
        if(!sectionID){
            return res.status(400).json({
               success : false,
                message : 'All fileds are required'
            });
        }
        // find by id and delete
        await SECTION.findByIdAndDelete(sectionID);
        // return  res
        return res.status(200).json({
            succes : true,
            message : 'Section updated successfully'
        });

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Error in deleting section"
        });
    }
}

