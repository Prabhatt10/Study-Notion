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