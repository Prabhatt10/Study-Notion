const USER = require("../model/user");
const mailSender = require("../util/mailSender");
const bcrypt = require('bcrypt');

// reset password token
exports.reserPasswordToken = async(req,res) => {
    try{
        // get email from req body
        const email = req.body;
        // check user for this email, email validation
        const user = await USER.findOne({email: email});
        if(!user){
            return res.status(403).json({
                success : false,
                message : 'Your Email is not registered with us'
            });
        }
        // generate token
        const token = crypto.randomUUID();
        // update user by adding token and expiration time
        const updatedDetails = await USER.findOneAndUpdate(
                                                {email :email},
                                                {
                                                    token :token,
                                                    resetPasswordExpires : Date.now()+5*60*1000
                                                },
                                                {
                                                new:true
                                                });
                                                                                       
        // create url
        const url = `http://localhost:3000/update-password/${token}` ;
        // send email containing the url
        await mailSender(email,"Password reset Link",
                            `Password Reset Link : ${url}`
                        );
        // return response
        return res.status(200).json({
            success : true,
            message : 'Password reset link sent successfully check email and change password'
        });
        
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Password reset link cannot sent, Please Try again'
        });
    }
}

// reset password

exports.resetPassword = async (req,res) => {
    try{
        // data fetch 
        const {token,password,confirmPassword} = req.body;
        // validation
        if(password != confirmPassword){
            return res.status(403).json({
                success : false,
                message : 'Password not matching'
            });
        }
        // get user detail form db using token
        const userDetails = await USER.findOne({token:token});
        // check user is present is not then invalid token
        if(!userDetails) {
            return res.status(403).json({
                success : false,
                message : 'Token is invalid'
            });
        }
        // is token is not present - token expired
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(403).json({
                success : false,
                message : 'URl is expired,Regenerate your token'
            });
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password,10)(
            {token:token},
            {password:hashedPassword},
            {new:true}
        );
        
        // return res
        return res.status(200).json({
                success : true,
                message : 'Password reset successful'
            });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Password cannot be reset, Please try again'
        });
    }
}