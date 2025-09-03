const category = require("../model/category");
const CATEGORY = require("../model/category");

// create CATEGORY  handler function

exports.createCategory = async (req,res) => {
    try {
        // fetch data
        const {name,description} = req.body;
        // validation
        if(!name || !description){
            return res.status(403).json({
                success : false,
                message : 'All fields are required'
            });
        }
        // create entry in DB
        const categoryDetails = await CATEGORY.create({
            name : name,
            description : description
        });
        // return response
        return res.status(200).json({
            success : true,
            message : 'CATEGORY created Successfully'
        });
        
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Error in creating CATEGORY'
        });
    }
}

// get all CATEGORY handler function
exports.getAllCategory = async (req,res) => {
    try{
        const allTags = await TAG.find({} , {name:true,description:true});
        return res.status(200).json({
            success : true,
            message : 'All CATEGORY returned successfully'
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Error in getting all CATEGORY'
        });
    }
}

exports.categoryPageDetails = async (req,res) => {
    try{
        // get category id
        const {categoryID} = req.body;
        // get courses for specified category ID
        const selectedCategory = await CATEGORY.findById(categoryID)
                                                        .populate("courses")
                                                        .exec()
        // validation
        if(!selectedCategory){
            return res.status(403).json({
                success : false,
                message : 'selected category is not present'
            });
        }

        // get courses from different Category
        const differentCategory = await CATEGORY.find({
            _id : {$ne : categoryID }
        }).populate("courses").exec();

        // get top selling course
        const allCategories = await CATEGORY.find()
                                            .populate({
                                                path : "course",
                                                match :{status : "published"},
                                                populate : {
                                                    path : "instructor",
                                                },
                                            }) .exec()
        
        const allCourse = allCategories.flatMap((category) => CATEGORY.course)
        const mostSelling = allCourse
                                    .sort((a,b) => b.sold - a.sold)
                                    .slice(0,10)

        // return response
        return res.status(200).json({
            success : true,
            data : {
                selectedCategory,
                differentCategory
            }
        });

         
    } catch (error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Error in getting CATEGORY page details'
        });
    }
}