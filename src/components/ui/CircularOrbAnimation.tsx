"use client";

import { BackgroundGradientAnimation } from "./background-gradient-animation";

interface CircularOrbAnimationProps {
  size?: number;
  children?: React.ReactNode;
}

export default function CircularOrbAnimation({ 
  size = 200,
  children 
}: CircularOrbAnimationProps) {
  return (
    <div 
      className="relative" 
      style={{ 
        width: size, 
        height: size,
        filter: 'drop-shadow(0 0 20px rgba(62,154,255,0.3)) drop-shadow(0 0 30px rgba(96, 170, 255, 0.4)) drop-shadow(0 0 40px rgba(179,159,255,0.3))'
      }}
    >
      {/* Animated Glow Layer behind orb */}
      <div className="absolute inset-0 rounded-full pointer-events-none">
        {/* Glow 1 - 파란색 회전 */}
        <div
          className="absolute inset-0 rounded-full animate-second"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(45, 230, 255, 0.4) 0%, rgba(106, 255, 245, 0.2) 45%, transparent 60%)',
            transformOrigin: 'calc(50% - 28px)',
            mixBlendMode: 'screen',
            filter: 'blur(12px)',
            width: '90%',
            height: '90%',
            left: '5%',
            top: '5%'
          }}
        />
        
        {/* Glow 2 - 핑크색 반대 방향 */}
        <div
          className="absolute inset-0 rounded-full animate-third"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(182, 148, 255, 0.35) 0%, rgba(163, 155, 255, 0.18) 45%, transparent 60%)',
            transformOrigin: 'calc(50% + 32px)',
            mixBlendMode: 'screen',
            filter: 'blur(14px)',
            width: '88%',
            height: '88%',
            left: '6%',
            top: '6%'
          }}
        />
        
        {/* Glow 3 - 보라색 중심 */}
        <div
          className="absolute inset-0 rounded-full animate-fifth"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(179,159,255,0.3) 0%, rgba(179,159,255,0.15) 45%, transparent 60%)',
            transformOrigin: 'center',
            mixBlendMode: 'screen',
            filter: 'blur(16px)',
            width: '86%',
            height: '86%',
            left: '7%',
            top: '7%'
          }}
        />
      </div>
      
      {/* Inner Orb */}
      <div className="relative rounded-full overflow-hidden w-full h-full z-10">
        <BackgroundGradientAnimation
        // 배경 그라데이션 시작/끝 색상
        gradientBackgroundStart="rgb(187, 216, 255)"
        gradientBackgroundEnd="rgb(67, 108, 245)"
        // 오브 색상 (rgb 값만 입력)
        firstColor="188, 122, 255"
        secondColor="244, 159, 255"
        thirdColor="179, 159, 255"
        fourthColor="105, 211, 255"
        fifthColor="62, 154, 255"
        // 오브 크기와 블렌딩 모드
          size="120%"             // 살짝 더 크게 움직이도록
        blendingValue="hard-light"  // 경계 대비를 높여 더 또렷하게
        interactive={false}          // 마우스 따라다니는 오브 사용 여부
        containerClassName="relative rounded-full overflow-hidden"
        className="absolute inset-0 flex items-center justify-center z-10"
        >
          {children}
        </BackgroundGradientAnimation>
      </div>
    </div>
  );
}

