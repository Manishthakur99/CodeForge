import React, { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "../../App.css";
import { FaStar } from "react-icons/fa";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import { apiConnector } from "../../services/apiconnecter";
import { ratingsEndpoints } from "../../services/apis";

function ReviewSlider() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        );
        if (data?.success) {
          setReviews(data?.data || []);
        }
      } catch (err) {
        console.error("Reviews fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="text-white">
      <div className="my-10 w-full overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-richblack-200 text-xl">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-richblack-200 text-xl">
            No reviews yet – be the first to share!
          </div>
        ) : reviews.length <= 3 ? (
          // ✅ Kam reviews — grid layout
          <div className={`grid gap-6 ${
            reviews.length === 1
              ? "grid-cols-1 max-w-md mx-auto"
              : reviews.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}>
            {reviews.map((review, i) => {
              const rating = Number(review?.rating) || 0;
              return (
                <div
                  key={i}
                  className="bg-richblack-800 rounded-xl p-6 flex flex-col gap-5 min-h-[280px] shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        review?.user?.image ||
                        `https://api.dicebear.com/9.x/initials/svg?seed=${
                          review?.user?.firstName || "User"
                        }`
                      }
                      alt="User"
                      className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-richblack-700"
                    />
                    <div className="flex flex-col">
                      <p className="font-semibold text-richblack-5 truncate">
                        {review?.user?.firstName} {review?.user?.lastName}
                      </p>
                      <p className="text-xs text-richblack-400 truncate max-w-[180px]">
                        {review?.course?.courseName || "Learner"}
                      </p>
                    </div>
                  </div>

                  <p className="text-richblack-25 text-sm leading-relaxed line-clamp-5 flex-grow overflow-hidden break-words">
                    {review?.review || "Great learning experience!"}
                  </p>

                  <div className="flex items-center gap-3 mt-auto">
                    <span className="font-bold text-yellow-100 text-xl">
                      {rating.toFixed(1)}
                    </span>
                    <ReactStars
                      count={5}
                      value={rating}
                      size={28}
                      edit={false}
                      activeColor="#ffd700"
                      isHalf={true}
                      emptyIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // ✅ 4+ reviews — Swiper slider
          <Swiper
            slidesPerView={1}
            spaceBetween={20}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 30 },
            }}
            loop={reviews.length >= 5}
            freeMode={true}
            autoplay={{
              delay: 2800,
              disableOnInteraction: false,
            }}
            modules={[FreeMode, Pagination, Autoplay]}
            className="w-full mySwiper"
          >
            {reviews.map((review, i) => {
              const rating = Number(review?.rating) || 0;
              return (
                <SwiperSlide key={i} className="h-auto">
                  <div className="bg-richblack-800 rounded-xl p-6 flex flex-col gap-5 min-h-[280px] shadow-md overflow-hidden w-full">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          review?.user?.image ||
                          `https://api.dicebear.com/9.x/initials/svg?seed=${
                            review?.user?.firstName || "User"
                          }`
                        }
                        alt="User"
                        className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-richblack-700"
                      />
                      <div className="flex flex-col">
                        <p className="font-semibold text-richblack-5 truncate">
                          {review?.user?.firstName} {review?.user?.lastName}
                        </p>
                        <p className="text-xs text-richblack-400 truncate">
                          {review?.course?.courseName || "Learner"}
                        </p>
                      </div>
                    </div>

                    <p className="text-richblack-25 text-sm leading-relaxed line-clamp-5 flex-grow overflow-hidden break-words">
                      {review?.review || "Great learning experience!"}
                    </p>

                    <div className="flex items-center gap-3 mt-auto">
                      <span className="font-bold text-yellow-100 text-xl">
                        {rating.toFixed(1)}
                      </span>
                      <ReactStars
                        count={5}
                        value={rating}
                        size={28}
                        edit={false}
                        activeColor="#ffd700"
                        isHalf={true}
                        emptyIcon={<FaStar />}
                        fullIcon={<FaStar />}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </div>
  );
}

export default ReviewSlider;