import React from "react";

interface SettingsIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SettingsIcon({
  className = "",
  size = "md",
}: SettingsIconProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient
            id="settingsBgGradient"
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
            id="settingsIconGradient"
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
          fill="url(#settingsBgGradient)"
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
            fill="url(#settingsIconGradient)"
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
  );
}
