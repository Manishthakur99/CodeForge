const Razorpay = require("razorpay");

console.log("Razorpay Key:", process.env.RAZORPAY_KEY ? "Found" : "MISSING");
console.log("Razorpay Secret:", process.env.RAZORPAY_SECRET ? "Found" : "MISSING");

exports.instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});