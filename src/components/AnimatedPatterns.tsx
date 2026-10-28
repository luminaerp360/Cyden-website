import React from 'react';
import { motion } from 'motion/react';

/**
 * Detailed Vector Drink Components with Micro-Animations
 */

// 1. Frothing Cold Beer Pint with Rising Carbonation Bubbles
function AnimatedBeerPint({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="beer-liquid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#D97706" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#B45309" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="beer-glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="20%" stopColor="#3AA88C" stopOpacity="0.15" />
          <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Glass Outline / Base */}
      <path
        d="M24 32 L30 106 C30.5 112 37 114 50 114 C63 114 69.5 112 70 106 L76 32 Z"
        fill="url(#beer-glass-grad)"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.75"
      />

      {/* Glass Handle */}
      <path
        d="M74 44 C88 44 92 56 92 68 C92 80 86 92 71 94"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Golden Beer Liquid */}
      <path
        d="M27 46 L31 104 C31.5 109 37 111 50 111 C63 111 68.5 109 69 104 L73 46 Z"
        fill="url(#beer-liquid-grad)"
      />

      {/* Internal Rising Carbonation Bubbles */}
      {[
        { cx: 38, cy: 95, r: 1.5, delay: 0, dur: 3 },
        { cx: 50, cy: 98, r: 2, delay: 0.8, dur: 2.8 },
        { cx: 62, cy: 92, r: 1.2, delay: 1.5, dur: 3.2 },
        { cx: 44, cy: 80, r: 1.8, delay: 0.4, dur: 2.6 },
        { cx: 56, cy: 85, r: 1.4, delay: 1.2, dur: 3.1 },
      ].map((bubble, i) => (
        <motion.circle
          key={i}
          cx={bubble.cx}
          cy={bubble.cy}
          r={bubble.r}
          fill="#FEF08A"
          animate={{
            cy: [bubble.cy, 48],
            opacity: [0, 0.9, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: bubble.dur,
            repeat: Infinity,
            delay: bubble.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Frothy Foam Head with Micro-Wobble */}
      <motion.g
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M22 36 C20 30 26 24 33 26 C37 20 47 19 51 24 C56 19 66 21 69 26 C75 24 81 29 78 36 C80 43 72 45 68 43 C64 47 54 46 50 42 C45 46 36 46 32 42 C27 44 20 41 22 36 Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
          stroke="rgba(245, 158, 11, 0.3)"
          strokeWidth="1"
        />
        {/* Foam Drip */}
        <path
          d="M32 41 C32 46 35 48 36 46 C37 44 37 41 37 41"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
      </motion.g>

      {/* Glass Light Reflection Line */}
      <path
        d="M28 50 L32 100"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 2. Whisky on the Rocks Tumbler with Floating Ice Cubes
function AnimatedWhiskyGlass({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 110" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="whisky-amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#D97706" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#92400E" stopOpacity="0.98" />
        </linearGradient>
      </defs>

      {/* Heavy Heavy Glass Tumbler Base */}
      <path
        d="M22 25 L26 95 C26.5 102 33 105 50 105 C67 105 73.5 102 74 95 L78 25 Z"
        fill="rgba(255, 255, 255, 0.08)"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.75"
      />
      {/* Weighted Solid Base Section */}
      <path
        d="M25 84 L26 95 C26.5 102 33 104 50 104 C67 104 73.5 102 74 95 L75 84 Z"
        fill="rgba(255, 255, 255, 0.25)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
      />

      {/* Amber Scotch Liquid */}
      <path
        d="M24 45 L25 84 C25 84 35 86 50 86 C65 86 75 84 75 84 L76 45 C70 48 58 48 50 48 C42 48 30 48 24 45 Z"
        fill="url(#whisky-amber)"
      />

      {/* Floating Ice Cube 1 */}
      <motion.g
        animate={{
          y: [0, -3, 0],
          rotate: [0, 4, 0],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect
          x="35"
          y="42"
          width="16"
          height="16"
          rx="2"
          fill="rgba(255, 255, 255, 0.5)"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.2"
          transform="rotate(12 43 50)"
        />
        <line
          x1="38"
          y1="46"
          x2="46"
          y2="54"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="0.8"
        />
      </motion.g>

      {/* Floating Ice Cube 2 */}
      <motion.g
        animate={{
          y: [0, 3, 0],
          rotate: [0, -5, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      >
        <rect
          x="50"
          y="48"
          width="15"
          height="15"
          rx="2"
          fill="rgba(255, 255, 255, 0.45)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1.2"
          transform="rotate(-15 57 55)"
        />
      </motion.g>

      {/* Ambient Liquid Glow Line */}
      <ellipse cx="50" cy="46" rx="25" ry="3" stroke="#FDE68A" strokeWidth="1" opacity="0.75" />

      {/* Glass Facet Shimmer */}
      <line x1="28" y1="30" x2="30" y2="80" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 3. Stemmed Bordeaux Wine Goblet with Liquid Swirl
function AnimatedWineGoblet({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wine-ruby" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BE123C" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#9F1239" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4C0519" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Goblet Bowl */}
      <path
        d="M28 20 C28 20 22 55 50 68 C78 55 72 20 72 20 Z"
        fill="rgba(255, 255, 255, 0.08)"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.75"
      />

      {/* Ruby Wine Liquid with Swirl Ripple */}
      <motion.path
        animate={{
          d: [
            'M30 38 C32 42 42 44 50 44 C58 44 68 42 70 38 C68 56 60 66 50 67 C40 66 32 56 30 38 Z',
            'M30 40 C32 37 42 42 50 43 C58 44 68 39 70 41 C68 56 60 66 50 67 C40 66 32 56 30 40 Z',
            'M30 38 C32 42 42 44 50 44 C58 44 68 42 70 38 C68 56 60 66 50 67 C40 66 32 56 30 38 Z',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        fill="url(#wine-ruby)"
      />

      {/* Wine Meniscus Highlight */}
      <ellipse cx="50" cy="38" rx="20" ry="3" stroke="rgba(251, 113, 133, 0.6)" strokeWidth="1" fill="none" />

      {/* Long Slender Stem */}
      <line x1="50" y1="68" x2="50" y2="114" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Flat Round Base */}
      <path
        d="M32 118 C32 115 40 114 50 114 C60 114 68 115 68 118 Z"
        fill="rgba(255, 255, 255, 0.2)"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="1.5"
      />

      {/* Glass Rim Reflection */}
      <path d="M30 25 C31 35 34 50 42 58" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 4. Cocktail Coupe / Martini with Botanical Gin/Tonic Garnish
function AnimatedCocktailGlass({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cocktail-teal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#3AA88C" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#115E59" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* V-Cone Coupe Bowl */}
      <path
        d="M20 22 L50 64 L80 22 Z"
        fill="rgba(255, 255, 255, 0.08)"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.75"
      />

      {/* Botanical Liquid */}
      <path
        d="M27 32 L50 62 L73 32 Z"
        fill="url(#cocktail-teal)"
      />

      {/* Lime Wheel / Garnish on Rim with Gentle Sway */}
      <motion.g
        animate={{ rotate: [-4, 6, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '76px 22px' }}
      >
        <circle cx="76" cy="22" r="9" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1.2" />
        <circle cx="76" cy="22" r="7" fill="#A3E635" fillOpacity="0.8" />
        <circle cx="76" cy="22" r="1.5" fill="#FFFFFF" />
        {/* Citrus segments */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1="76"
            y1="22"
            x2={76 + 6 * Math.cos((deg * Math.PI) / 180)}
            y2={22 + 6 * Math.sin((deg * Math.PI) / 180)}
            stroke="#4D7C0F"
            strokeWidth="0.75"
          />
        ))}
      </motion.g>

      {/* Thin Tall Stem */}
      <line x1="50" y1="64" x2="50" y2="108" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Wide Flat Base */}
      <ellipse cx="50" cy="110" rx="20" ry="3.5" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />

      {/* Surface Liquid Glow */}
      <line x1="27" y1="32" x2="73" y2="32" stroke="#A7F3D0" strokeWidth="1.2" opacity="0.8" />
    </svg>
  );
}

// 5. Champagne / Sparkling Cider Flute with Streams of Effervescence
function AnimatedChampagneFlute({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 140" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="champagne-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Slender Flute Body */}
      <path
        d="M32 18 L32 68 C32 82 40 88 40 88 C40 88 48 82 48 68 L48 18 Z"
        fill="rgba(255, 255, 255, 0.08)"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.75"
      />

      {/* Bubbly Gold Champagne Liquid */}
      <path
        d="M33 34 L33 68 C33 80 40 86 40 86 C40 86 47 80 47 68 L47 34 Z"
        fill="url(#champagne-gold)"
      />

      {/* Streaming Effervescent Bubbles */}
      {[
        { cx: 40, cy: 80, delay: 0, dur: 2.2 },
        { cx: 37, cy: 75, delay: 0.6, dur: 2.5 },
        { cx: 43, cy: 78, delay: 1.1, dur: 2.1 },
        { cx: 39, cy: 65, delay: 0.3, dur: 2.4 },
        { cx: 42, cy: 60, delay: 1.4, dur: 2.0 },
      ].map((b, i) => (
        <motion.circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={1.2}
          fill="#FFFFFF"
          animate={{
            cy: [b.cy, 34],
            opacity: [0, 0.95, 0],
            scale: [0.7, 1.3, 0.7],
          }}
          transition={{
            duration: b.dur,
            repeat: Infinity,
            delay: b.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Flute Stem */}
      <line x1="40" y1="88" x2="40" y2="124" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2.2" strokeLinecap="round" />

      {/* Round Base */}
      <ellipse cx="40" cy="126" rx="16" ry="3" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />

      {/* Rim Reflection */}
      <line x1="33" y1="24" x2="33" y2="50" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// 6. Premium Spirits / Whisky Bottle Silhouette with Foil Neck & Crest
function AnimatedBottle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 150" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bottle-liquid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#D97706" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Bottle Body */}
      <path
        d="M40 12 L50 12 L50 28 C50 36 64 42 64 54 L64 134 C64 140 60 144 50 144 L40 144 C30 144 26 140 26 134 L26 54 C26 42 40 36 40 28 Z"
        fill="rgba(255, 255, 255, 0.08)"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.75"
      />

      {/* Liquid Fill Inside Bottle */}
      <path
        d="M28 62 L62 62 L62 134 C62 138 58 142 50 142 L40 142 C32 142 28 138 28 134 Z"
        fill="url(#bottle-liquid)"
      />

      {/* Gold Foil Neck Capsule */}
      <path
        d="M39 12 L51 12 L51 26 L39 26 Z"
        fill="#F2A93B"
        stroke="#F59E0B"
        strokeWidth="1"
      />
      <rect x="37" y="9" width="16" height="4" rx="1.5" fill="#D97706" />

      {/* Premium Label Outline */}
      <rect
        x="32"
        y="75"
        width="26"
        height="42"
        rx="2"
        fill="rgba(255, 255, 255, 0.2)"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="1"
      />
      {/* Label Gold Emblem Badge */}
      <circle cx="45" cy="88" r="4.5" fill="#F2A93B" />
      <line x1="36" y1="98" x2="54" y2="98" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" />
      <line x1="38" y1="103" x2="52" y2="103" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.8" />

      {/* Glass Body Sheen Light Pass */}
      <motion.line
        x1="30"
        y1="55"
        x2="30"
        y2="135"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

/**
 * Animated Hero Patterns with Floating Animated Drinks
 * Combines:
 * 1. Animated drink silhouettes (Beer pint, Whisky on the rocks, Wine goblet, Cocktail coupe, Champagne flute, Spirits bottle)
 * 2. Rotating orbital concentric rings
 * 3. Effervescent rising micro-bubbles
 * 4. Flowing topographic wave ribbons
 * 5. Constellation glimmers
 */
export function HeroAnimatedPatterns() {
  // Floating animated drink nodes with gentle swaying loops and subtle luminous presence
  const floatingDrinks = [
    {
      id: 'drink-beer-left',
      component: <AnimatedBeerPint className="w-16 h-20 md:w-20 md:h-24 filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)]" />,
      top: '16%',
      left: '3%',
      duration: 7,
      yDelta: -26,
      xDelta: 12,
      rotateDelta: 5,
      delay: 0,
      opacity: [0.22, 0.42, 0.25],
    },
    {
      id: 'drink-whisky-bl',
      component: <AnimatedWhiskyGlass className="w-16 h-18 md:w-20 md:h-22 filter drop-shadow-[0_4px_16px_rgba(217,119,6,0.25)]" />,
      top: '64%',
      left: '7%',
      duration: 8.5,
      yDelta: -22,
      xDelta: -10,
      rotateDelta: -6,
      delay: 1.5,
      opacity: [0.18, 0.38, 0.22],
    },
    {
      id: 'drink-cocktail-mid',
      component: <AnimatedCocktailGlass className="w-16 h-20 md:w-18 md:h-22 filter drop-shadow-[0_4px_16px_rgba(58,168,140,0.3)]" />,
      top: '10%',
      left: '42%',
      duration: 9,
      yDelta: -28,
      xDelta: 14,
      rotateDelta: 7,
      delay: 2.2,
      opacity: [0.14, 0.32, 0.18],
    },
    {
      id: 'drink-bottle-midright',
      component: <AnimatedBottle className="w-14 h-24 md:w-18 md:h-28 filter drop-shadow-[0_4px_20px_rgba(242,169,59,0.3)]" />,
      top: '22%',
      left: '55%',
      duration: 8,
      yDelta: -30,
      xDelta: -12,
      rotateDelta: -4,
      delay: 0.8,
      opacity: [0.16, 0.35, 0.2],
    },
    {
      id: 'drink-champagne-tr',
      component: <AnimatedChampagneFlute className="w-14 h-22 md:w-16 md:h-26 filter drop-shadow-[0_4px_16px_rgba(253,230,138,0.3)]" />,
      top: '12%',
      right: '4%',
      duration: 7.5,
      yDelta: -24,
      xDelta: 10,
      rotateDelta: 6,
      delay: 2.8,
      opacity: [0.2, 0.4, 0.24],
    },
    {
      id: 'drink-wine-br',
      component: <AnimatedWineGoblet className="w-16 h-22 md:w-20 md:h-26 filter drop-shadow-[0_4px_18px_rgba(190,18,60,0.25)]" />,
      top: '68%',
      right: '6%',
      duration: 9.5,
      yDelta: -25,
      xDelta: -14,
      rotateDelta: -5,
      delay: 1.2,
      opacity: [0.18, 0.36, 0.22],
    },
    {
      id: 'drink-beer-bottom-center',
      component: <AnimatedBeerPint className="w-12 h-16 md:w-16 md:h-20 filter drop-shadow-[0_4px_14px_rgba(245,158,11,0.2)]" />,
      top: '78%',
      left: '46%',
      duration: 8.2,
      yDelta: -20,
      xDelta: 8,
      rotateDelta: 4,
      delay: 2.5,
      opacity: [0.12, 0.28, 0.15],
    },
  ];

  // Floating effervescent bubbles with randomized delays & durations
  const bubbles = [
    { id: 1, left: '8%', size: 6, duration: 9, delay: 0, color: 'bg-amber-300/30' },
    { id: 2, left: '16%', size: 4, duration: 11, delay: 2, color: 'bg-[#3AA88C]/35' },
    { id: 3, left: '27%', size: 8, duration: 14, delay: 1, color: 'bg-amber-400/25' },
    { id: 4, left: '42%', size: 5, duration: 10, delay: 3, color: 'bg-white/20' },
    { id: 5, left: '55%', size: 7, duration: 13, delay: 0.5, color: 'bg-[#3AA88C]/30' },
    { id: 6, left: '68%', size: 4, duration: 12, delay: 2.5, color: 'bg-amber-300/25' },
    { id: 7, left: '79%', size: 9, duration: 15, delay: 1.5, color: 'bg-amber-400/20' },
    { id: 8, left: '88%', size: 5, duration: 10, delay: 4, color: 'bg-[#3AA88C]/35' },
    { id: 9, left: '94%', size: 7, duration: 13, delay: 2, color: 'bg-white/25' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Animated Floating Drinks Collection */}
      {floatingDrinks.map((drink) => (
        <motion.div
          key={drink.id}
          style={{
            top: drink.top,
            left: drink.left,
            right: drink.right,
          }}
          animate={{
            y: [0, drink.yDelta, 0],
            x: [0, drink.xDelta, 0],
            rotate: [0, drink.rotateDelta, 0],
            opacity: drink.opacity,
          }}
          transition={{
            duration: drink.duration,
            repeat: Infinity,
            delay: drink.delay,
            ease: 'easeInOut',
          }}
          className="absolute transform-gpu"
        >
          {drink.component}
        </motion.div>
      ))}

      {/* 2. Concentric Rotating Heritage Rings (Top Right) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] opacity-[0.08] lg:opacity-[0.12]"
      >
        <svg viewBox="0 0 600 600" fill="none" className="w-full h-full text-[#3AA88C]">
          <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="300" cy="300" r="220" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="160" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="300" cy="300" r="100" stroke="currentColor" strokeWidth="2" />
          <path d="M300 10 L300 590 M10 300 L590 300" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
        </svg>
      </motion.div>

      {/* 3. Concentric Rotating Cask Rings (Bottom Left) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-48 -left-48 w-[700px] h-[700px] opacity-[0.06] lg:opacity-[0.1]"
      >
        <svg viewBox="0 0 700 700" fill="none" className="w-full h-full text-amber-400">
          <circle cx="350" cy="350" r="330" stroke="currentColor" strokeWidth="1" strokeDasharray="8 12" />
          <circle cx="350" cy="350" r="260" stroke="currentColor" strokeWidth="1" />
          <circle cx="350" cy="350" r="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" />
          <circle cx="350" cy="350" r="110" stroke="currentColor" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* 4. Flowing Liquid Topographic Wave Ribbons across the Hero */}
      <div className="absolute inset-x-0 bottom-0 h-96 opacity-15 overflow-hidden">
        <svg
          viewBox="0 0 1440 320"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full text-white"
        >
          <motion.path
            initial={{ d: 'M0,192L60,176C120,160,240,128,360,138.7C480,149,600,203,720,202.7C840,203,960,149,1080,133.3C1200,117,1320,139,1380,149.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z' }}
            animate={{
              d: [
                'M0,192L60,176C120,160,240,128,360,138.7C480,149,600,203,720,202.7C840,203,960,149,1080,133.3C1200,117,1320,139,1380,149.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z',
                'M0,160L60,181.3C120,203,240,245,360,240C480,235,600,181,720,165.3C840,149,960,171,1080,186.7C1200,203,1320,213,1380,218.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z',
                'M0,192L60,176C120,160,240,128,360,138.7C480,149,600,203,720,202.7C840,203,960,149,1080,133.3C1200,117,1320,139,1380,149.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z',
              ],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            stroke="#3AA88C"
            strokeWidth="1.5"
            fill="none"
          />
          <motion.path
            initial={{ d: 'M0,128L60,144C120,160,240,192,360,186.7C480,181,600,139,720,133.3C840,128,960,160,1080,176C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z' }}
            animate={{
              d: [
                'M0,128L60,144C120,160,240,192,360,186.7C480,181,600,139,720,133.3C840,128,960,160,1080,176C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z',
                'M0,160L60,149.3C120,139,240,117,360,122.7C480,128,600,160,720,181.3C840,203,960,213,1080,197.3C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z',
                'M0,128L60,144C120,160,240,192,360,186.7C480,181,600,139,720,133.3C840,128,960,160,1080,176C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z',
              ],
            }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            stroke="#F2A93B"
            strokeWidth="1"
            strokeDasharray="4 6"
            fill="none"
          />
        </svg>
      </div>

      {/* 5. Effervescent Floating Rising Bubbles */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            bottom: '-20px',
          }}
          animate={{
            y: [0, -850],
            x: [0, Math.sin(b.id) * 35, 0],
            opacity: [0, 0.75, 0.9, 0],
            scale: [0.8, 1.2, 0.9],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: 'easeInOut',
          }}
          className={`absolute rounded-full backdrop-blur-xs ${b.color} shadow-xs`}
        />
      ))}

      {/* 6. Subtle Constellation Glimmers */}
      {[
        { top: '22%', left: '18%', delay: 0 },
        { top: '35%', left: '48%', delay: 2 },
        { top: '15%', left: '72%', delay: 1 },
        { top: '68%', left: '85%', delay: 3 },
      ].map((pos, idx) => (
        <motion.div
          key={idx}
          style={{ top: pos.top, left: pos.left }}
          animate={{
            scale: [0.7, 1.3, 0.7],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: pos.delay,
            ease: 'easeInOut',
          }}
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-200"
        />
      ))}
    </div>
  );
}

/**
 * Geometric Heritage Guilloche & Concentric Rings Pattern
 * For the "Excellence in Distribution Since 2013" card and premium banners.
 */
export function HeritageGuillochePattern({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Slow counter-rotating rosette */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-24 -bottom-24 w-96 h-96 opacity-15"
      >
        <svg viewBox="0 0 400 400" fill="none" className="w-full h-full text-amber-300">
          <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
          <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="2" />
          {/* Starburst rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="200"
              y1="20"
              x2="200"
              y2="380"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeOpacity="0.4"
              transform={`rotate(${deg} 200 200)`}
            />
          ))}
        </svg>
      </motion.div>

      {/* Subtle floating gold sparkle dots */}
      <motion.div
        animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 right-1/3 w-2 h-2 rounded-full bg-amber-400"
      />
      <motion.div
        animate={{ y: [0, 14, 0], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-12 left-1/4 w-1.5 h-1.5 rounded-full bg-[#3AA88C]"
      />
    </div>
  );
}

/**
 * Animated Dot Grid / Subtle Constellation Wave for Light Sections
 * Gently pulses with a traveling opacity wave without harsh rectangular lines.
 */
export function AnimatedDotPattern({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none opacity-40 ${className}`}>
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(#1B3E6F 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}

/**
 * Animated Flowing Ribbon for the Commercial CTA Banner
 */
export function AnimatedBannerRibbon() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1000 300"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-full opacity-15"
      >
        <motion.path
          animate={{
            d: [
              'M0,150 C300,50 600,250 1000,120 L1000,300 L0,300 Z',
              'M0,120 C300,220 600,80 1000,180 L1000,300 L0,300 Z',
              'M0,150 C300,50 600,250 1000,120 L1000,300 L0,300 Z',
            ],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          fill="url(#cta-gradient)"
        />
        <defs>
          <linearGradient id="cta-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#F2A93B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3AA88C" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Subtle Animated Watermark Pattern for Cards
 */
export function CardWatermarkPattern({ color = '#1B3E6F' }: { color?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      className="absolute -bottom-10 -right-10 w-44 h-44 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none"
    >
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color }}>
        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="18" stroke="currentColor" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}
