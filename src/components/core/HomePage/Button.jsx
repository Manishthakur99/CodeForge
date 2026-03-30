import React from "react";
import { Link } from "react-router-dom";

const Button = ({ children, active, linkto }) => {
  return (
    <Link to={linkto}>
      <div
        className={`
          relative text-center text-[13px] sm:text-[16px]
          px-8 py-3 rounded-xl font-bold overflow-hidden
          transition-all duration-300
          ${
            active
              ? `bg-gradient-to-r from-[#FF6B00] via-[#FFD700] to-[#FF6B00]
                 bg-[length:400%_400%] animate-shimmer
                 text-black
                 shadow-[0_4px_24px_rgba(255,140,0,0.4)]
                 hover:shadow-[0_8px_36px_rgba(255,140,0,0.6)]
                 hover:-translate-y-1 hover:scale-105
                 active:scale-95`
              : `bg-white/[0.03] text-richblack-100
                 border border-white/[0.12]
                 hover:bg-[rgba(255,140,0,0.07)]
                 hover:border-[rgba(255,140,0,0.5)]
                 hover:text-[#FF8C00]
                 hover:shadow-[0_4px_20px_rgba(255,140,0,0.15)]
                 hover:-translate-y-1 hover:scale-105
                 active:scale-95`
          }
        `}
      >
        {/* Sweep shine — sirf active button pe */}
        {active && (
          <span className="absolute top-0 -left-3/4 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] animate-sweep pointer-events-none" />
        )}
        {children}
      </div>
    </Link>
  );
};

export default Button;