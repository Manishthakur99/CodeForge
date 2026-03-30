
// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
  try {
    console.log("AUTH MIDDLEWARE HIT");
    console.log("HEADERS RECEIVED:", req.headers);

    // Better and safer token extraction
    let token = null;

    // Option 1: From Authorization header (most common for API)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Option 2: From cookies (if you use cookie-based auth somewhere)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // Option 3: From body (rare, but some old flows use it)
    if (!token && req.body?.token) {
      token = req.body.token;
    }

    console.log("TOKEN EXTRACTED:", token ? token.substring(0, 30) + '...' : 'MISSING');

    if (!token) {
      return res.status(401).json({ success: false, message: `Token Missing` });
    }

    // Verify
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED:", decode);

    req.user = decode;

    next();

  } catch (error) {
    console.log("JWT VERIFY ERROR:", error);  // log full error object
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};
exports.isStudent = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findById(req.user.id);

		console.log(userDetails);
		console.log(userDetails.accountType);

		if (userDetails.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}

		next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: `User Role Can't be Verified`,
		});
	}
};