const jwt = require("jsonwebtoken");
require("dotenv").config();
const USER = require("../model/user");

// auth

exports.auth = async (req,res,next) => {
    try{
        const token = req.body.token || req.cookies.token || (req.header("Authorization") && req.header("Authorization").replace("Bearer ","").trim());
        
        // token is missing
        if(!token){
            return res.status(403).json({
                success : false,
                message : 'token is missing'
            });
        }

        // verifying
        try{
            const decode = await jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;

        } catch(error){
            return res.status(401).json({
                success : false,
                message : 'token is invalid'
            });
        }
        next();
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'something went wrong while validating the auth token'
        });
    }
}

// isStudent

exports.isStudent = async (req,res,next) => {
    try{
        if(req.user.accountType != "isStudent"){
            return res.status(401).json({
                success: true ,
                message : 'This is protected route for Student'
            });
        }
        next();
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Student role cannot be verified'
        });
    }
}

// isInstructor

exports.isInstructor = async (req,res,next) => {
    try{
        if(req.user.accountType != "Instructor"){
            return res.status(401).json({
                success: true ,
                message : 'Student role cannot be verified'
            });
        }
        next();
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Instructor role cannot be verified'
        });
    }
}


// isAdmin

exports.isAdmin = async (req,res,next) => {
    try{
        if(req.user.accountType != "Admin"){
            return res.status(401).json({
                success: true ,
                message : 'This is protected route for admin'
            });
        }
        next();
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Admin role cannot be verified'
        });
    }
}