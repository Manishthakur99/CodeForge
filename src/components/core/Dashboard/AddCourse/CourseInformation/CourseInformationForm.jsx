import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { HiOutlineCurrencyRupee } from "react-icons/hi"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"

import {
  addCourseDetails,
  editCourseDetails,
  fetchCourseCategories,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse, setStep } from "../../../../../slices/courseSlice"
import { COURSE_STATUS } from "../../../../../utils/constants"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"
import ChipInput from "./ChipInput"
import RequirementsField from "./RequirementField"

export default function CourseInformationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { course, editCourse } = useSelector((state) => state.course)

  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [courseCategories, setCourseCategories] = useState([])

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      const categories = await fetchCourseCategories()
      if (categories.length > 0) {
        setCourseCategories(categories)
      }
      setLoading(false)
    }

    if (editCourse) {
      setValue("courseTitle", course.courseName)
      setValue("courseShortDesc", course.courseDescription)
      setValue("coursePrice", course.price)
      setValue("courseTags", course.tag)
      setValue("courseBenefits", course.whatYouWillLearn)
      setValue("courseCategory", course.category)
      setValue("courseRequirements", course.instructions)
      setValue("courseImage", course.thumbnail)
    }

    getCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCourse])

  // ==================== AI AUTO FILL FROM YOUTUBE ====================
  const handleAutoFillFromYouTube = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("YouTube Playlist URL daalo")
      return
    }

    setAiLoading(true)

    try {
      const res = await axios.post(
        "https://codeforge-fiuf.onrender.com/api/v1/course/generate-from-youtube",
        { playlistUrl: youtubeUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = res.data?.courseData

      if (!data) {
        toast.error("AI se data nahi mila")
        return
      }

      // Form fields auto-fill
      setValue("courseTitle", data.title || "")
      setValue("courseShortDesc", data.description || "")
      setValue("courseBenefits", data.whatYouWillLearn || [])
      setValue("coursePrice", data.price || 499)
      setValue("courseImage", data.thumbnail || "")

      const tags = Array.isArray(data.tags) ? data.tags : []
      setValue("courseTags", tags)

      const instructions = Array.isArray(data.instructions) ? data.instructions : []
      setValue("courseRequirements", instructions)

      // Category match karne ki koshish
      const trySetCategory = (cats, categoryName) => {
  if (!categoryName) return

  let match = cats.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  )

  if (!match) {
    match = cats.find(
      (cat) =>
        cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
        categoryName.toLowerCase().includes(cat.name.toLowerCase())
    )
  }

  if (!match && cats.length > 0) {
    match = cats[0]
  }

  if (match) {
    setValue("courseCategory", match._id)
  }
}

trySetCategory(courseCategories, data.category)

setTimeout(() => {
  trySetCategory(courseCategories, data.category)
}, 1000)

      // Course slice update (curriculum ke liye)
      dispatch(
  setCourse({
    ...course,
    courseName: data.title,
    courseDescription: data.description,
    whatYouWillLearn: data.whatYouWillLearn,
    price: data.price,
    tag: tags,                         
    instructions: instructions,         
    thumbnail: data.thumbnail,
    courseContent: data.curriculum || [],
  })
)

      toast.success("🎉 AI ne pura course details + curriculum fill kar diya!")
      setYoutubeUrl("")

    } catch (error) {
      console.error(error)
      toast.error("AI fill failed! URL check karo ya backend chal raha hai confirm karo.")
    } finally {
      setAiLoading(false)
    }
  }

  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.courseTitle !== course.courseName ||
      currentValues.courseShortDesc !== course.courseDescription ||
      currentValues.coursePrice !== course.price ||
      currentValues.courseTags.toString() !== course.tag.toString() ||
      currentValues.courseBenefits !== course.whatYouWillLearn ||
      currentValues.courseCategory._id !== course.category._id ||
      currentValues.courseRequirements.toString() !== course.instructions.toString() ||
      currentValues.courseImage !== course.thumbnail
    ) {
      return true
    }
    return false
  }

  const onSubmit = async (data) => {
    if (editCourse) {
      if (isFormUpdated()) {
        const currentValues = getValues()
        const formData = new FormData()
        formData.append("courseId", course._id)

        if (currentValues.courseTitle !== course.courseName) {
          formData.append("courseName", data.courseTitle)
        }
        if (currentValues.courseShortDesc !== course.courseDescription) {
          formData.append("courseDescription", data.courseShortDesc)
        }
        if (currentValues.coursePrice !== course.price) {
          formData.append("price", data.coursePrice)
        }
        if (currentValues.courseTags.toString() !== course.tag.toString()) {
          formData.append("tag", JSON.stringify(data.courseTags))
        }
        if (currentValues.courseBenefits !== course.whatYouWillLearn) {
          formData.append("whatYouWillLearn", data.courseBenefits)
        }
        if (currentValues.courseCategory._id !== course.category._id) {
          formData.append("category", data.courseCategory)
        }
        if (currentValues.courseRequirements.toString() !== course.instructions.toString()) {
          formData.append("instructions", JSON.stringify(data.courseRequirements))
        }
        if (currentValues.courseImage !== course.thumbnail) {
          formData.append("thumbnailImage", data.courseImage)
        }

        setLoading(true)
        const result = await editCourseDetails(formData, token)
        setLoading(false)
        if (result) {
          dispatch(setStep(2))
          dispatch(setCourse(result))
        }
      } else {
        toast.error("No changes made to the form")
      }
      return
    }

    // New Course
    const formData = new FormData()
    formData.append("courseName", data.courseTitle)
    formData.append("courseDescription", data.courseShortDesc)
    formData.append("price", data.coursePrice)
    formData.append("tag", JSON.stringify(data.courseTags))
    formData.append("whatYouWillLearn", data.courseBenefits)
    formData.append("category", data.courseCategory)
    formData.append("status", COURSE_STATUS.DRAFT)
    formData.append("instructions", JSON.stringify(data.courseRequirements))
    formData.append("thumbnailImage", data.courseImage)

    if (typeof data.courseImage === "string" && data.courseImage.startsWith("http")) {
  try {
    const response = await fetch(data.courseImage)
    const blob = await response.blob()
    const fileName = data.courseImage.split("/").pop() || "thumbnail.jpg"
    const file = new File([blob], fileName, { type: blob.type || "image/jpeg" })
    formData.append("thumbnailImage", file)
  } catch (err) {
    console.error("Thumbnail fetch error:", err)
    toast.error("Thumbnail upload failed! Manually upload karo.")
    setLoading(false)
    return
  }
} else {
  formData.append("thumbnailImage", data.courseImage)
}

    setLoading(true)
    const result = await addCourseDetails(formData, token)
    if (result) {
      dispatch(setStep(2))
      dispatch(setCourse(result))
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6"
    >
      {/* ===================== AI AUTO FILL BUTTON ===================== */}
      <div className="p-6 border border-dashed border-yellow-500 rounded-lg bg-richblack-700">
        <p className="text-xl font-semibold text-yellow-50 mb-4">
          Generate Course from Youtube playlist
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
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
            customClasses="bg-yellow-50 text-richblack-900 font-bold min-w-[240px]"
          />
        </div>

        <p className="text-xs text-richblack-400 mt-3">
          Note: Fill details in one click.
        </p>
      </div>

      {/* Course Title */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseTitle">
          Course Title <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="courseTitle"
          placeholder="Enter Course Title"
          {...register("courseTitle", { required: true })}
          className="form-style w-full"
        />
        {errors.courseTitle && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course title is required
          </span>
        )}
      </div>

      {/* Course Short Description */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseShortDesc">
          Course Short Description <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseShortDesc"
          placeholder="Enter Description"
          {...register("courseShortDesc", { required: true })}
          className="form-style resize-x-none min-h-[130px] w-full"
        />
        {errors.courseShortDesc && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course Description is required
          </span>
        )}
      </div>

      {/* Course Price */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="coursePrice">
          Course Price <sup className="text-pink-200">*</sup>
        </label>
        <div className="relative">
          <input
            id="coursePrice"
            placeholder="Enter Course Price"
            {...register("coursePrice", {
              required: true,
              valueAsNumber: true,
              pattern: { value: /^(0|[1-9]\d*)(\.\d+)?$/ },
            })}
            className="form-style w-full !pl-12"
          />
          <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 inline-block -translate-y-1/2 text-2xl text-richblack-400" />
        </div>
        {errors.coursePrice && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course Price is required
          </span>
        )}
      </div>

      {/* Course Category */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseCategory">
          Course Category <sup className="text-pink-200">*</sup>
        </label>
        <select
          {...register("courseCategory", { required: true })}
          defaultValue=""
          id="courseCategory"
          className="form-style w-full"
        >
          <option value="" disabled>Choose a Category</option>
          {!loading &&
            courseCategories?.map((category, indx) => (
              <option key={indx} value={category?._id}>
                {category?.name}
              </option>
            ))}
        </select>
        {errors.courseCategory && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course Category is required
          </span>
        )}
      </div>

      {/* Course Tags */}
      <ChipInput
        label="Tags"
        name="courseTags"
        placeholder="Enter Tags and press Enter"
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
      />

      {/* Course Thumbnail Image */}
      <Upload
          name="courseImage"
          label="Course Thumbnail"
          register={register}
          setValue={setValue}
          getValues={getValues}
          errors={errors}
          editData={editCourse ? course?.thumbnail : null}
        />

      {/* Benefits of the course */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseBenefits">
          Benefits of the course <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseBenefits"
          placeholder="Enter benefits of the course"
          {...register("courseBenefits", { required: true })}
          className="form-style resize-x-none min-h-[130px] w-full"
        />
        {errors.courseBenefits && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Benefits of the course is required
          </span>
        )}
      </div>

      {/* Requirements/Instructions */}
      <RequirementsField
        name="courseRequirements"
        label="Requirements/Instructions"
        register={register}
        setValue={setValue}
        errors={errors}
        getValues={getValues}
      />

      {/* Next Button */}
      <div className="flex justify-end gap-x-2">
        {editCourse && (
          <button
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
          >
            Continue Without Saving
          </button>
        )}
        <IconBtn
          disabled={loading}
          text={!editCourse ? "Next" : "Save Changes"}
        >
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  )
}