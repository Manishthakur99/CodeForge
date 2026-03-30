const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress")

const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    })
    await user.save()

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    console.log(id)
    const user = await User.findById({ _id: id })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // ✅ FIX — Agar Instructor hai to uske courses, sections, subsections delete karo
    if (user.accountType === "Instructor") {
      const Section = require("../models/Section")
      const SubSection = require("../models/SubSection")

      for (const courseId of user.courses) {
        const course = await Course.findById(courseId)
        if (course) {
          // Sections aur SubSections delete karo
          for (const sectionId of course.courseContent || []) {
            const section = await Section.findById(sectionId)
            if (section) {
              for (const subSectionId of section.subSection || []) {
                await SubSection.findByIdAndDelete(subSectionId)
              }
            }
            await Section.findByIdAndDelete(sectionId)
          }

          // Enrolled students ki courses list se remove karo
          await User.updateMany(
            { _id: { $in: course.studentsEnrolled || [] } },
            { $pull: { courses: courseId } }
          )
        }

        // ✅ Category se bhi course remove karo
          const Category = require("../models/Category")
          await Category.findByIdAndUpdate(
            course.category,
            { $pull: { courses: courseId } },
            { new: true }
          )

        // Course delete karo
        await Course.findByIdAndDelete(courseId)
      }
    }

    // ✅ Student hai to enrolled courses se remove karo
    if (user.accountType === "Student") {
      for (const courseId of user.courses) {
        await Course.findByIdAndUpdate(
          courseId,
          { $pull: { studentsEnrolled: id } },
          { new: true }
        )
      }
    }

    // Profile delete karo
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    })

    // CourseProgress delete karo
    await CourseProgress.deleteMany({ userId: id })

    // User delete karo
    await User.findByIdAndDelete({ _id: id })

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "User Cannot be deleted successfully",
    })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    console.log(userDetails)
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    // Sabse pehle req.user check kar lo
    if (!req.user || !req.user.id) {
      console.log("[instructorDashboard] req.user missing or no id");
      return res.status(401).json({
        success: false,
        message: "User not authenticated or ID missing",
      });
    }

    console.log("[instructorDashboard] Instructor ID:", req.user.id);

    const courseDetails = await Course.find({ instructor: req.user.id });

    console.log("[instructorDashboard] Found courses count:", courseDetails.length);

    const courseData = courseDetails.map((course) => {
      // Safe defaults
      const studentsEnroled = course.studentsEnroled || []; // agar field missing ho to empty array
      const price = Number(course.price) || 0; // price ko number banao, agar string/undefined ho to 0

      const totalStudentsEnrolled = studentsEnroled.length;
      const totalAmountGenerated = totalStudentsEnrolled * price;

      // Create safe object
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName || "Unnamed Course",
        courseDescription: course.courseDescription || "",
        totalStudentsEnrolled,
        totalAmountGenerated,
      };

      return courseDataWithStats;
    });

    console.log("[instructorDashboard] Sending courseData:", courseData);

    res.status(200).json({
      success: true,
      data: courseData,   // frontend mein instructorData yahi expect kar raha hai
    });
  } catch (error) {
    console.error("[instructorDashboard] ERROR:", error.stack || error);
    res.status(500).json({
      success: false,
      message: "Could not fetch instructor dashboard data",
      errorMessage: error.message,
    });
  }
};