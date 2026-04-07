import React from "react";

type ArrowIconProps = {
  rotated?: boolean;
  className?: string;
};

export const ArrowIcon: React.FC<ArrowIconProps> = ({
  rotated = false,
  className = "",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`transform transition-transform ${rotated ? "rotate-0" : "rotate-[180deg]"} ${className} size-4`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </svg>
);

export default ArrowIcon;
