import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdNavigateNext } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI";
import {
  setCourse,
  setEditCourse,
  setStep,
} from "../../../../../slices/courseSlice";
import IconBtn from "../../../../common/IconBtn";
import NestedView from "./NestedView";

export default function CourseBuilderForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [editSectionName, setEditSectionName] = useState(null);

  const dispatch = useDispatch();

  // ==================== FIXED AI AUTO FILL ====================
  const handleAutoFillFromYouTube = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("YouTube Playlist URL daalo");
      return;
    }

    setAiLoading(true);

    try {
      const res = await axios.post(
  "https://your-render-url.onrender.com/api/v1/course/generate-from-youtube",
  { 
    playlistUrl: youtubeUrl,
    courseId: course._id
  },
  { headers: { Authorization: `Bearer ${token}` } }
);

      const data = res.data?.courseData || res.data;

      if (!data) {
        toast.error("AI se data nahi mila");
        return;
      }

      // Safety Check for curriculum
      const curriculum = data.curriculum || data.courseContent || [];

      if (curriculum.length === 0) {
        toast.error("AI se sections aur lectures nahi mile. Dobara try karo.");
        return;
      }

      // Safe Dispatch
      const savedCourse = data.savedCourse;

dispatch(
  setCourse(
    savedCourse
      ? savedCourse  // DB se aaya populated course use karo
      : {
          ...course,
          courseName: data.title || course.courseName,
          courseDescription: data.description || course.courseDescription,
          whatYouWillLearn: data.whatYouWillLearn || course.whatYouWillLearn,
          price: data.price || course.price,
          tag: Array.isArray(data.tags) ? data.tags : course.tag || [],
          instructions: Array.isArray(data.instructions) ? data.instructions : course.instructions || [],
          thumbnail: data.thumbnail || course.thumbnail,
          courseContent: curriculum,
        }
  )
);

      toast.success(`🎉 AI ne ${curriculum.length} Sections + Lectures successfully fill kar diye!`);

      setYoutubeUrl("");
    } catch (error) {
      console.error("AI Auto Fill Error:", error);
      toast.error("AI fill failed! Backend server check karo.");
    } finally {
      setAiLoading(false);
    }
  };

  // Rest of the code same rakha hai
  const onSubmit = async (data) => {
    setLoading(true);
    let result;

    if (editSectionName) {
      result = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course._id,
        },
        token
      );
    } else {
      result = await createSection(
        {
          sectionName: data.sectionName,
          courseId: course._id,
        },
        token
      );
    }

    if (result) {
      dispatch(setCourse(result));
      setEditSectionName(null);
      setValue("sectionName", "");
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditSectionName(null);
    setValue("sectionName", "");
  };

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit();
      return;
    }
    setEditSectionName(sectionId);
    setValue("sectionName", sectionName);
  };

  const goToNext = () => {
    if (!course.courseContent || course.courseContent.length === 0) {
      toast.error("Please add atleast one section");
      return;
    }
    if (course.courseContent.some((section) => !section.subSection || section.subSection.length === 0)) {
      toast.error("Please add atleast one lecture in each section");
      return;
    }
    dispatch(setStep(3));
  };

  const goBack = () => {
    dispatch(setStep(1));
    dispatch(setEditCourse(true));
  };

  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>

      {/* AI Section */}
      <div className="p-5 border border-dashed border-yellow-500 rounded-lg bg-richblack-700">
        <p className="text-lg font-semibold text-yellow-50 mb-3">
          Generate from Youtube Playlist
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxx"
            className="form-style flex-1 py-3"
          />
          <IconBtn
            type="button"
            onclick={handleAutoFillFromYouTube}
            disabled={aiLoading || !youtubeUrl.trim()}
            text={aiLoading ? "Generating..." : "Generate Now"}
            customClasses="bg-yellow-50 text-richblack-900 font-bold"
          />
        </div>
        <p className="text-xs text-richblack-400 mt-2">
          Note: Fill data from youtube 
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="sectionName">
            Section Name <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading}
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: true })}
            className="form-style w-full"
          />
          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
        </div>

        <div className="flex items-end gap-x-4">
          <IconBtn
            type="submit"
            disabled={loading}
            text={editSectionName ? "Edit Section Name" : "Create Section"}
            outline={true}
          >
            <IoAddCircleOutline size={20} className="text-yellow-50" />
          </IconBtn>

          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-richblack-300 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Safe NestedView Render */}
      {course.courseContent && course.courseContent.length > 0 && (
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      )}

      {/* Next Prev Button */}
      <div className="flex justify-end gap-x-3">
        <button
          onClick={goBack}
          className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
        >
          Back
        </button>
        <IconBtn disabled={loading} text="Next" onclick={goToNext}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </div>
  );
}