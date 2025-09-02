const {instance} = require("../config/razorpay");
const USER = require("../model/user");
const COURSE = require("../model/course");
const mailSender = require("../util/mailSender");
const { default: mongoose } = require("mongoose");

exports.capturePayment = async (req,res) => {
    try{
        // get UserID and courseID
        const {courseID} = req.body;
        const userID = req.user.id;
        // validation
        // valid courseID
        if(!courseID){
            return res.status(404).json({
                success : false,
                message : 'Please provide valid course ID'
            });
        }
        // valid course Detail
        let courseDetail;
        try{
            course = await COURSE.findById(courseID);
            if(!course){
                return res.status(403).json({
                    success : false,
                    message : 'Could not find the course'
                });
            }
            // user already paid for same course
            const userObjID = new mongoose.Types.ObjectId(String(userID));
            if(course.studentEnrolled.includes(userObjID)){
                return res.status(400).json({
                    success : false,
                    message : 'Student is already enrolled'
                });
            }
        } catch(error){
            return res.status(500).json({
                success : false,
                message : 'could not fetch course'
            });
        }
        // order create
        const courseAmount = COURSE.price;
        const currency = "INR";

        const options = {
            courseAmount : courseAmount * 100,
            currency,
            receipt : Math.random(Date.now()).toString(),
            notes : {
                courseID : courseID,
                userID
            }
        }

        try{
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            return res.json({
                success : true,
                courseName : COURSE.courseName,
                courseDescription : COURSE.courseDescription,
                thumbnail : COURSE.thumbnail,
                orderID : paymentResponse.id,
                currency : paymentResponse.currency,
                courseAmount : paymentResponse.courseAmount
            });
        } catch(error){
            return res.json({
                success : false,
                message : 'error in creating order'
            });
        }

        // return response
        return res.status(200).json({
            success : true,
            message : 'PAYMENT SUCCESSFUL'
        });
    }
    catch(error){
        console.log(error);
        return res.status(200)({
            success : false,
            message : 'Payment cannot be dont right now, Please try again later'
        })
    }
};

exports.verifySignature = async (req,res) => {
    const webhookSecret = "123456789";

    const signature = req.headers("x-razorpay-signature");

    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));

    const digest = shasum.digest("hex");

    if(signature == digest) {
        console.log("Payment is authorized");

        const {courseID,userID} = req.body.payload.payment.notes ;

        try{
            // fulfill action
            const enrolledCourse = await COURSE.findOneAndUpdate (
                {_id : courseID},
                {$push : {studentEnrolled : userID}},
                {new : true}
            );
            // find course and enroll student in it
            if(!enrolledCourse){
                return res.status(500).json({
                    success : true,
                    message : 'Course not found'
                });
            }

            console.log(enrolledCourse);

            // find student and add course to list of enrolled courses
            const enrolledStudent = await USER.findOneAndUpdate(
                {_id : userID},
                {$push : {courses : courseID}},
                {new:true}
            );

            console.log(enrolledStudent);

            // confirmation mail send

            const emailResponder = await mailSender(
                enrolledStudent.email,
                "congratulations from Study-Notion",
                "Congratulation for the course",
            );

            console.log(emailResponder);
            return res.status(200).json({
                success : true,
                message : 'signature verified and course added'
            });

        } 
        catch(error){
            console.log(error);
            return res.status(500).json({
                success : false,
                message : 'signature and course cannot be added'
            });
        }
    }
    else{
        return res.status(400).json({
            success : false,
            message : 'Invalid request'
        });
    }
}