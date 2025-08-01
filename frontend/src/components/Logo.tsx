import React from "react";
import Link from "next/link";
import { getFullPath } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

export default function Logo({
  className = "",
  showText = true,
  size = "md",
  clickable = true,
}: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const logoContent = (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Icon */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id="logoBgGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#667eea", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#764ba2", stopOpacity: 1 }}
              />
            </linearGradient>
            <linearGradient
              id="logoIconGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#ffffff", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#f0f0f0", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>

          {/* Background */}
          <circle
            cx="256"
            cy="256"
            r="240"
            fill="url(#logoBgGradient)"
            stroke="#4c5777"
            strokeWidth="4"
          />

          {/* Main eye icon representing "watched" */}
          <g transform="translate(256, 220)">
            {/* Eye outline */}
            <ellipse
              cx="0"
              cy="0"
              rx="80"
              ry="50"
              fill="url(#logoIconGradient)"
              stroke="#4c5777"
              strokeWidth="3"
            />
            {/* Pupil */}
            <circle cx="0" cy="0" r="25" fill="#4c5777" />
            {/* Highlight */}
            <circle cx="-8" cy="-8" r="8" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Checkmark indicating completion */}
          <g transform="translate(256, 320)">
            <circle
              cx="0"
              cy="0"
              r="30"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="4"
            />
            <path
              d="M-12,0 L-4,10 L12,-12"
              stroke="#ffffff"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className={`flex flex-col ${textSizeClasses[size]}`}>
          <div className="flex items-center">
            <span className="font-bold bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent">
              Watched
            </span>
            <span className="font-light text-green-500 ml-1">It</span>
          </div>
          {size === "lg" && (
            <span className="text-xs text-gray-500 mt-1">
              追蹤你的媒體觀看紀錄
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link
        href={getFullPath("/")}
        className="hover:opacity-80 transition-opacity"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
