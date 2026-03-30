import { toast } from "react-hot-toast";
import { setLoading, setUser } from "../../slices/profileSlice";
import { apiConnector } from "../apiconnecter";
import { profileEndpoints } from "../apis";
import { logout } from "./authAPI";

const { GET_USER_DETAILS_API, GET_USER_ENROLLED_COURSES_API, GET_INSTRUCTOR_DATA_API } = profileEndpoints;

// ------------------ GET USER DETAILS ------------------
export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const finalToken = token || localStorage.getItem("token");
      if (!finalToken) throw new Error("Token not found!");

      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, {
        Authorization: `Bearer ${finalToken}`,
      });

      console.log("GET_USER_DETAILS API RESPONSE............", response);

      if (!response.data.success) throw new Error(response.data.message);

      const userImage = response.data.data.image
        ? response.data.data.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.data.firstName} ${response.data.data.lastName}`;

      dispatch(setUser({ ...response.data.data, image: userImage }));

    } catch (error) {
      dispatch(logout(navigate));
      console.error("GET_USER_DETAILS API ERROR............", error);
      toast.error("Could Not Get User Details");
    }

    toast.dismiss(toastId);
    dispatch(setLoading(false));
  };
}

// ------------------ GET USER ENROLLED COURSES ------------------
export async function getUserEnrolledCourses(token) {
  const toastId = toast.loading("Loading enrolled courses...");
  let result = [];

  try {
    console.log("BEFORE Calling BACKEND API FOR ENROLLED COURSES");

    const finalToken = token || localStorage.getItem("token");
    if (!finalToken) throw new Error("Token not found!");

    const response = await apiConnector(
      "GET",
      GET_USER_ENROLLED_COURSES_API,
      null,
      { Authorization: `Bearer ${finalToken}` }
    );

    console.log("AFTER Calling BACKEND API FOR ENROLLED COURSES");

    if (!response.data.success) throw new Error(response.data.message);

    result = response.data.data;

  } catch (error) {
    console.error("GET_USER_ENROLLED_COURSES_API ERROR............", error);
    toast.error("Could Not Get Enrolled Courses");
  }

  toast.dismiss(toastId);
  return result;
}

// ------------------ GET INSTRUCTOR DATA ------------------
export async function getInstructorData(token) {
  const toastId = toast.loading("Loading instructor data...");
  let result = [];

  try {
    const finalToken = token || localStorage.getItem("token");
    if (!finalToken) throw new Error("Token not found!");

    const response = await apiConnector(
      "GET",
      GET_INSTRUCTOR_DATA_API,
      null,
      { Authorization: `Bearer ${finalToken}` }
    );

    console.log("GET_INSTRUCTOR_API_RESPONSE", response);
    result = response?.data?.courses || [];

  } catch (error) {
    console.error("GET_INSTRUCTOR_API ERROR", error);
    toast.error("Could Not Get Instructor Data");
  }

  toast.dismiss(toastId);
  return result;
}