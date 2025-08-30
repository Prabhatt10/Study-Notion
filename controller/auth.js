const USER = require("../model/user");
const OTP = require("../model/otp");
const otpGenerator = require("otp-generator");
const profile = require("../model/profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();


// SendOtp

exports.sendOtp = async (req,res) => {
    // fetch email
    try{
        const {email} = req.body;

        const checkUserIsPresent = await USER.findOne({email});
        
        if(checkUserIsPresent){
            return res.status(401).json({
                success : false,
                message : 'User Already Present'
            });
        }

        // generate OTP
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialCharacter : false
        });

        console.log("OTP Generated : ", otp);

        // check uniqueness of OTP
        let result = await OTP.findOne({otp : otp});

        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialCharacter : false
            });
            result = await OTP.findOne({otp : otp});
        }

        const otpPayload = {email,otp} ;

        // create OTP in entry

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        return res.status(200).json({
            success : true,
            message : 'OTP sent successfully',
            otp
        });


    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message 
        });
    }
}

// signup

exports.signUp = async(req,res) => {
    try{
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        if(!firstName || !lastName || !email || !password || !confirmPassword){
            return res.status(403).json({
                success : false,
                message : 'all fields are required'
            });
        }

        // match both password are same
        if(password != confirmPassword){
            return res.status(403).json({
                success : false,
                message : "Password did't matched"
            });
        }

        const existingUser = await USER.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success : false,
                message : 'User is already registered'
            });
        }

        // find most recent OPT
        const recentOTP = await OTP.findOne({email}).sort({createdAt :-1}).limit(1);

        // validate otp
        if(recentOTP.length()==0){
            return res.status(400).json({
                success : false,
                message : 'OTP not found'
            });
        }

        console.log("recent OTP : ",recentOTP);

        if(otp != recentOTP){
            return res.status(400).json({
                success : false,
                message : "OTP did't matched"
            });
        }

        const hashedpassword = await bcrypt.hash(password,10);

        const profileDetails = await profile.create({
            gender : null,
            dateOfBirth : null,
            about : null,
            contactNumber : null
        });

        // create entry in DB
        const user = await UserActivation.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password : hashedpassword,
            accountType,
            additionalDetail : profileDetails._id,
            image : `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`
        });
   
        return res.status(200).json({
            success : true,
            message : 'User registered successfully',
            user
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'User cannot be registered, Please try again' 
        });
    }
}

// login

exports.login = async (req,res) => {
    try{
        const {email , password} = req.body ;

        if(!email || !password){
            return res.status(403).json({
                success : false,
                message : 'Enter corect details'
            });
        }

        const user = await USER.findOne({email}).populate("additionalDetail");

        if(!user){
            return res.status(400).json({
                success : false,
                message : 'Please SignUp first'
            });
        }

        if(await bcrypt.compare(password,user.password)){
            // create token by sign method
            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET ,{
                expiresIn : "24h"
            });

            user.token = token,
            user.password = undefined

            // generate cookies

            const options = {
                expiresIn : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly : true
            }

            res.cookie("token",token,options).status(200).json({
                success : true,
                token,
                user,
                message : 'Logged in successfully'
            });
        }
        else{
            return res.status(401).json({
                success : false,
                messagec : 'Password is inccorrect'
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            messagec : 'Login failed, Try Again'
        });
    }
}

// change password

exports.changePassword = async (req,res) => {
    try{
        //get data from body
        const userDetail = await USER.findById(req.user.id)
        // get oldPasword, newPassword, confirmPassword
        const {oldPassword, newPassword, confirmPassword} = req.body

        // validation
        const isPasswordSame = await bcrypt.compare(
            oldPassword,
            userDetail.password
        )
        if(!isPasswordSame){
            return res.status(403).json({
                success : false,
                message : 'Please enter same password'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        // update password in DP

        const encryptedPassword = await bcrypt.hash(newPassword,10);
        const updatedPassword = await USER.findByIdAndUpdate(
            req.user.id,
            {password : encryptedPassword} ,
            {new : true}
        )
        
        // send e-mail 
        try{
            const transporter = nodemailer.createTransport({
                host : process.env.MAIL_HOST,
                auth : {
                    user: process.env.MAIL_USER,
                    pass : process.env.MAIL_PASSWORD,
                },
            });

            const emailResult = await transporter.sendMail({
                from: `"Study-Notion" <${process.env.MAIL_USER}>`,
                to: updatedPassword.email,
                subject: 'PASSWORD UPDATED SUCCESSFULLY',
                html: `Password updated successfully for ${updatedPassword.firstName} ${updatedPassword.lastName}`
            });
            console.log("email sent : ", emailResult);
        }
        catch(error){
            console.log("Error occured in sending email");
            return res.status(500).json({
                success : false,
                message : "email cant send"
            });
        }

        // return response
        return res.status(200).json({
            success : true,
            message : 'Password Updated successfully'
        });

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false,
            message : "password can't be changed"
        })
    }
}