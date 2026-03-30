import React from "react";

const HighlightText = ({ text }) => {
  return (
    <span
      className="
        bg-gradient-to-r
        from-[#FF8C00] via-white to-[#FF8C00]
        bg-[length:400%_400%]
        animate-shimmer
        text-transparent
        bg-clip-text
        font-extrabold
      "
    >
      {" "}
      {text}
    </span>
  );
};

export default HighlightText;