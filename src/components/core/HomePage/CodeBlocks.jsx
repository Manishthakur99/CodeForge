import React from "react";
import CTAButton from "./Button";
import { TypeAnimation } from "react-type-animation";
import { FaArrowRight } from "react-icons/fa";

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  backgroundGradient,
  codeColor,
}) => {
  return (
    <div className={`flex ${position} my-20 justify-between flex-col lg:gap-10 gap-10`}>

      {/* Section 1 */}
      <div className="w-[100%] lg:w-[50%] flex flex-col gap-8">
        {heading}

        <div className="text-richblack-300 text-base font-bold w-[85%] -mt-3">
          {subheading}
        </div>

        <div className="flex gap-7 mt-7">
          <CTAButton active={ctabtn1.active} linkto={ctabtn1.link}>
            <div className="flex items-center gap-2">
              {ctabtn1.btnText}
              <FaArrowRight />
            </div>
          </CTAButton>
          <CTAButton active={ctabtn2.active} linkto={ctabtn2.link}>
            {ctabtn2.btnText}
          </CTAButton>
        </div>
      </div>

      {/* Section 2 — Glassy Code Block */}
      <div className="relative w-[100%] lg:w-[470px]">

        {/* Glow background */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[rgba(255,107,0,0.2)] via-[rgba(255,255,255,0.05)] to-[rgba(120,80,255,0.15)] blur-sm -z-10" />

        <div className="
          relative rounded-2xl overflow-hidden
          bg-[rgba(255,255,255,0.04)]
          backdrop-blur-xl
          border border-[rgba(255,255,255,0.10)]
          shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]
        ">
          {backgroundGradient}

          {/* Top bar — traffic lights */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.07)]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-auto text-[10px] tracking-widest text-richblack-400 uppercase font-mono">
              javascript
            </span>
          </div>

          {/* Code area */}
<div className="flex flex-row py-4 px-2 text-[10px] sm:text-sm font-mono">

  {/* Line numbers */}
  <div className="
    select-none text-richblack-500 text-xs
    flex flex-col
    w-[10%] min-w-[24px]
    text-right pr-3
    border-r border-[rgba(255,255,255,0.07)]
    leading-[1.8]
  ">
    {codeblock.split("\n").map((_, i) => (
      <span key={i}>{i + 1}</span>
    ))}
  </div>

  {/* Typed code */}
  <div className={`w-[90%] pl-4 font-bold font-mono ${codeColor}`}>
    <TypeAnimation
      sequence={[codeblock, 1000, ""]}
      cursor={true}
      repeat={Infinity}
      style={{
        whiteSpace: "pre-line",
        display: "block",
        lineHeight: "1.8",
      }}
      omitDeletionAnimation={true}
    />
  </div>

</div>

        </div>
      </div>

    </div>
  );
};

export default CodeBlocks;