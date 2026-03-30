const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id
    // Get all required fields from request body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body
    // Get thumbnail image from request files
    const thumbnail = req.files.thumbnailImage
    // Convert the tag and instructions from stringified Array to Array
    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)
    console.log("tag", tag)
    console.log("instructions", instructions)
    // Check if any of the required fields are missing
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    if (!status || status === undefined) {
      status = "Draft"
    }
    // Check if the user is an instructor
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    })
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }
    // Check if the tag given is valid
    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }
    // Upload the Thumbnail to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    )
    console.log(thumbnailImage)
    // Create a new course with the given details
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions,
    })
    // Add the new course to the User Schema of the Instructor
    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    // Add the new course to the Categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    console.log("HEREEEEEEEE", categoryDetails2)
    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
  }
}
// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }
    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }
    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }
    await course.save()
    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec()
    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }
    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })
    console.log("courseProgressCount : ", courseProgressCount)
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }
    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const studentsEnrolled = course.studentsEnrolled || [];
    if (studentsEnrolled.length > 0) {
      await User.updateMany(
        { _id: { $in: studentsEnrolled } },
        { $pull: { courses: courseId } }
      );
    }
    const courseSections = course.courseContent || [];
    for (const sectionId of courseSections) {
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection || [];
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }
      await Section.findByIdAndDelete(sectionId);
    }
    await Course.findByIdAndDelete(courseId);
    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const axios = require('axios');

// ✅ FIXED: generateCourseFromYouTube — sections & lectures DB mein save hote hain
exports.generateCourseFromYouTube = async (req, res) => {
  try {
    const { playlistUrl, courseId } = req.body;  // ✅ courseId bhi lo

    if (!playlistUrl?.trim()) {
      return res.status(400).json({ success: false, message: "Playlist URL required" });
    }

    const url = new URL(playlistUrl);
    const playlistId = url.searchParams.get('list');
    if (!playlistId) {
      return res.status(400).json({ success: false, message: "Invalid YouTube Playlist URL" });
    }

    // YouTube Data fetch karo
    const [playlistRes, itemsRes] = await Promise.all([
      axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        params: { part: 'snippet', id: playlistId, key: process.env.YOUTUBE_API_KEY }
      }),
      axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: { part: 'snippet', playlistId: playlistId, maxResults: 20, key: process.env.YOUTUBE_API_KEY }
      })
    ]);

    const playlist = playlistRes.data.items[0].snippet;
    const videos = itemsRes.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.snippet.resourceId.videoId
    }));

    // ✅ Fixed Prompt — curriculum sahi format mein
    const prompt = `You are an expert online course creator.
Create a professional course from this YouTube playlist:
Playlist Title: ${playlist.title}
Description: ${playlist.description || "No description"}
Videos:
${videos.map((v, i) => `${i+1}. [${v.videoId}] ${v.title}`).join('\n')}
Return **ONLY** clean valid JSON. No extra text, no markdown.
{
  "title": "Short catchy professional course title",
  "description": "Good course description (200-350 words)",
  "whatYouWillLearn": "5 benefits as a single string separated by newlines",
  "price": 799,
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "instructions": ["Instruction 1", "Instruction 2", "Instruction 3"],
  "category": "DevOps OR Android",
  "curriculum": [
    {
      "sectionName": "Section Title",
      "lectures": [
        { "title": "Lecture Title", "description": "Short lecture description", "videoId": "EXACT_VIDEO_ID_FROM_LIST" }
      ]
    }
  ]
}
Group the ${videos.length} videos into 3-6 logical sections. Every video must appear as a lecture.`;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json"
        }
      }
    );

    let aiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    aiText = aiText.replace(/```json|```/g, '').trim();
    let courseData = JSON.parse(aiText);

    // Safety Fallbacks
    courseData.tags = Array.isArray(courseData.tags) ? courseData.tags : [];
    courseData.instructions = Array.isArray(courseData.instructions) ? courseData.instructions : [];
    courseData.thumbnail = playlist.thumbnails?.high?.url || "";

    // ✅ FIX — Agar courseId diya hai to sections & lectures DB mein create karo
    if (courseId && courseData.curriculum && courseData.curriculum.length > 0) {
      const createdSections = [];

      for (const section of courseData.curriculum) {
        // Section create karo
        const newSection = await Section.create({
          sectionName: section.sectionName,
          course: courseId,
        });

        const subSections = [];

        // Har lecture ke liye SubSection create karo
        for (const lecture of section.lectures || []) {
          const videoUrl = lecture.videoId
          ? `https://www.youtube.com/watch?v=${lecture.videoId}`
          : "";

          const newSubSection = await SubSection.create({
            title: lecture.title,
            description: lecture.description || "",
            timeDuration: "0",
            videoUrl: videoUrl,
            section: newSection._id,
          });
          subSections.push(newSubSection._id);
        }

        // Section mein subSections add karo
        newSection.subSection = subSections;
        await newSection.save();

        createdSections.push(newSection._id);
      }

      // Course mein sections add karo
      await Course.findByIdAndUpdate(courseId, {
        courseContent: createdSections,
      });

      // Updated course fetch karo with populated data
      const updatedCourse = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: { path: "subSection" },
        })
        .exec();

      courseData.savedCourse = updatedCourse;
    }

    res.json({ success: true, courseData });

  } catch (error) {
    console.error("Gemini Error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI se data generate nahi ho raha. Playlist chhoti try karo."
    });
  }
};