const mongoose = require("mongoose");
const mailSender = require("../util/mailSender");

const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    otp : {
        type : String,
        required : true,
    },
    createdAt : {
        type : Date,
        default : Date.now(),
        expires : 5*60
    }
});

// function to send mail
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Verification email from studyNotion",otp);
        console.log("EMail sent successfully");
    } catch(error){
        console.log("Error occured while Sending mail",error);
        throw error;
    }
}

otpSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email,this.otp);
});

module.exports = mongoose.model("otp",otpSchema);