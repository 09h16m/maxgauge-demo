"use client";

import { useEffect, useState, useRef } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

export default function FlowDiagramCustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.1,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  // 실제 SVG path의 길이를 정확히 측정
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [edgePath]);

  // 노드가 나타난 후 엣지가 그려지도록 딜레이 설정
  useEffect(() => {
    // source 노드의 x 좌표를 data에서 가져오기
    const edgeData = data as { sourceXPosition?: number } | undefined;
    const sourceXPosition = edgeData?.sourceXPosition ?? 0;
    
    // source 노드의 딜레이 계산
    let sourceNodeDelay = 0;
    if (sourceXPosition === 0) {
      sourceNodeDelay = 0;
    } else if (sourceXPosition === 375) {
      sourceNodeDelay = 0.45;
    } else if (sourceXPosition === 750) {
      sourceNodeDelay = 0.9;
    } else if (sourceXPosition === 1125) {
      sourceNodeDelay = 1.35;
    } else if (sourceXPosition === 1500) {
      sourceNodeDelay = 2.0;
    } else if (sourceXPosition === 1875) {
      sourceNodeDelay = 2.65;
    } else {
      sourceNodeDelay = (sourceXPosition / 150) * 0.1;
    }
    
    const nodeAnimationHalfTime = 0.2; // 노드 애니메이션의 50% (0.4초의 50%)
    
    // source 노드가 50% 완료될 때 엣지 그리기 시작
    const edgeStartDelay = sourceNodeDelay + nodeAnimationHalfTime + 0.1;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, edgeStartDelay * 1000);

    return () => clearTimeout(timer);
  }, [id, data]);

  const safeId = id.replace(/[^a-zA-Z0-9]/g, '_');

  return (
    <>
      <defs>
        {pathLength > 0 && (
          <style>{`
            @keyframes drawEdge-${safeId} {
              from {
                stroke-dashoffset: ${pathLength};
              }
              to {
                stroke-dashoffset: 0;
              }
            }
            .drawing-edge-${safeId} {
              stroke-dasharray: ${pathLength};
              stroke-dashoffset: ${pathLength};
              animation: drawEdge-${safeId} 0.3s ease-out forwards;
            }
          `}</style>
        )}
      </defs>
      <path
        ref={pathRef}
        id={id}
        d={edgePath}
        fill="none"
        stroke="#99A1AF"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={markerEnd}
        className={isVisible && pathLength > 0 ? `drawing-edge-${safeId}` : ''}
        style={{
          opacity: isVisible ? 1 : 0,
          paintOrder: 'stroke',
          ...style,
        }}
      />
      {label && labelX && labelY && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[#64748b] text-xs font-medium"
          style={{
            opacity: isVisible ? 1 : 0,
            pointerEvents: 'none',
          }}
        >
          {label}
        </text>
      )}
    </>
  );
}
