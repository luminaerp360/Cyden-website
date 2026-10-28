import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export default function Logo({
  className = '',
  size = 'md',
  variant = 'light',
  showSubtitle = true,
}: LogoProps) {
  const badgeSizes = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-11 h-11 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Exact Circular Badge Logo */}
      <div className={`relative ${badgeSizes[size]} flex-shrink-0 flex items-center justify-center transition-transform hover:scale-105`}>
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. Outer Ring & Teal Inner Circle */}
          {/* Outer Coral-Red ring */}
          <circle cx="250" cy="250" r="236" fill="#FFFFFF" stroke="#E8582F" strokeWidth="14" />
          {/* White spacer ring */}
          <circle cx="250" cy="250" r="226" fill="#FFFFFF" />
          {/* Main Teal Circle Background */}
          <circle cx="250" cy="250" r="214" fill="#3AA88C" />

          {/* 2. Dual-Color Droplet / Flame Background Graphic */}
          <g id="flame-droplet">
            {/* Yellow Upper Flame (Left/Top) */}
            <path
              d="M 215 68
                 C 215 68, 175 130, 160 190
                 C 145 250, 165 310, 195 350
                 C 210 320, 218 280, 222 240
                 C 226 195, 235 130, 215 68 Z"
              fill="#F2A93B"
            />

            {/* Green Lower Flame (Right/Bottom) */}
            <path
              d="M 215 68
                 C 225 120, 235 180, 220 235
                 C 205 285, 185 330, 205 370
                 C 230 420, 275 425, 305 390
                 C 335 355, 345 300, 335 245
                 C 325 190, 280 135, 215 68 Z"
              fill="#7DBE3C"
              opacity="0.95"
            />

            {/* White curved contour accent along the green droplet edge */}
            <path
              d="M 185 340
                 C 215 410, 270 428, 305 395
                 C 335 365, 345 315, 338 265
                 C 330 220, 305 180, 275 145"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>

          {/* 3. Overlaid Monogram Letters (C, G, E) */}
          {/* White outline for 'C' (rendered underneath) */}
          <path
            d="M 292 148
               A 120 120 0 1 0 292 352
               L 272 312
               A 75 75 0 1 1 272 188
               Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="26"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Navy Blue 'C' Body */}
          <path
            d="M 292 148
               A 120 120 0 1 0 292 352
               L 272 312
               A 75 75 0 1 1 272 188
               Z"
            fill="#154284"
          />

          {/* White outline for 'G' (rendered underneath 'G') */}
          <path
            d="M 288 185
               C 245 185, 210 220, 210 270
               C 210 320, 245 355, 295 355
               C 330 355, 350 335, 350 310
               L 350 252
               L 275 252
               L 275 285
               L 315 285
               L 315 315
               C 310 322, 298 326, 288 326
               C 260 326, 242 302, 242 270
               C 242 238, 260 215, 288 215
               C 305 215, 320 224, 328 236
               L 352 210
               C 338 194, 315 185, 288 185 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="24"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Coral-Red 'G' Body */}
          <path
            d="M 288 185
               C 245 185, 210 220, 210 270
               C 210 320, 245 355, 295 355
               C 330 355, 350 335, 350 310
               L 350 252
               L 275 252
               L 275 285
               L 315 285
               L 315 315
               C 310 322, 298 326, 288 326
               C 260 326, 242 302, 242 270
               C 242 238, 260 215, 288 215
               C 305 215, 320 224, 328 236
               L 352 210
               C 338 194, 315 185, 288 185 Z"
            fill="#E8582F"
          />

          {/* Small Navy 'E' in the interior notch */}
          <text
            x="256"
            y="272"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="28"
            fontWeight="900"
            fill="#154284"
            textAnchor="middle"
            dominantBaseline="central"
          >E</text>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight ${size === 'lg' || size === 'xl' ? 'text-xl sm:text-2xl' : size === 'sm' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} ${isDark ? 'text-white' : 'text-[#1B3E6F]'}`}>
            CYDEN
          </span>
          <span className={`font-medium tracking-wider text-[10px] sm:text-xs uppercase px-1 sm:px-1.5 py-0.5 rounded ${isDark ? 'bg-[#3AA88C] text-white' : 'bg-[#1B3E6F] text-[#F8F7F4]'}`}>
            DISTRIBUTORS
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
            <span className={`text-[9px] sm:text-[10px] font-bold tracking-wide ${isDark ? 'text-[#F2A93B]' : 'text-[#E8582F]'}`}>
              EABL Gold Distributor
            </span>
            <span className={`text-[8px] sm:text-[9px] hidden sm:inline ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
              • Eldoret, Kenya
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
