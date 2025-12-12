import React from "react";

interface ReconLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  withText?: boolean;
}

export function ReconLogo({ className, size = 32, withText = false, ...props }: ReconLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <defs>
          <linearGradient id="reconGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#A06BFF" />
            <stop offset="0.5" stopColor="#6F9DFF" />
            <stop offset="1" stopColor="#FF6FCE" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Outer Glass Shield/Hexagon */}
        <path 
          d="M50 5 L90 25 V65 L50 95 L10 65 V25 Z" 
          fill="url(#reconGrad)" 
          fillOpacity="0.15" 
          stroke="url(#reconGrad)" 
          strokeWidth="2"
        />
        
        {/* Inner Tech Ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="25" 
          stroke="url(#reconGrad)" 
          strokeWidth="2" 
          strokeDasharray="50 15" 
          opacity="0.8"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 50 50" 
            to="360 50 50" 
            dur="10s" 
            repeatCount="indefinite" 
          />
        </circle>
        
        {/* Flow/Wave Element */}
        <path 
          d="M35 50 C35 50 45 40 50 50 C55 60 65 50 65 50" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          filter="url(#glow)"
        />
        
        {/* Central Node */}
        <circle cx="50" cy="50" r="4" fill="white" filter="url(#glow)">
          <animate 
            attributeName="opacity" 
            values="0.5;1;0.5" 
            dur="2s" 
            repeatCount="indefinite" 
          />
        </circle>
      </svg>
      
      {withText && (
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white/70">
            ReconFlow
          </span>
        </div>
      )}
    </div>
  );
}
