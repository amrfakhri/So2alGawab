import React from 'react';
import Svg, { Path, ClipPath, Defs, G } from 'react-native-svg';

interface Props { size?: number }

export function GoogleIcon({ size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Defs>
        <ClipPath id="clip">
          <Path d="M0 0h22v22H0z" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip)">
        {/* Blue */}
        <Path
          d="M21.56 11.25c0-.78-.07-1.53-.19-2.25H11v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        {/* Green */}
        <Path
          d="M11 22c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.05-3.72 1.05-2.86 0-5.28-1.93-6.15-4.53H1.18v2.84C2.99 19.54 6.73 22 11 22z"
          fill="#34A853"
        />
        {/* Yellow */}
        <Path
          d="M4.85 13.1A6.6 6.6 0 0 1 4.5 11c0-.73.13-1.44.35-2.1V6.06H1.18A11 11 0 0 0 0 11c0 1.77.42 3.44 1.18 4.94l3.67-2.84z"
          fill="#FBBC05"
        />
        {/* Red */}
        <Path
          d="M11 4.38c1.62 0 3.06.56 4.2 1.65l3.15-3.15C16.46.98 13.97 0 11 0 6.73 0 2.99 2.46 1.18 6.06l3.67 2.84C5.72 6.31 8.14 4.38 11 4.38z"
          fill="#EA4335"
        />
      </G>
    </Svg>
  );
}
