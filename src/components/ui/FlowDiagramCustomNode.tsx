"use client";

import { motion } from 'framer-motion';
import { NodeProps, Handle, Position } from '@xyflow/react';

interface CustomNodeData {
  label: string;
  icon?: React.ReactNode;
  xPosition?: number; // x 좌표를 data로 전달
  isLastNode?: boolean; // 마지막 노드 여부
  nodeType?: 'important' | 'understated'; // 노드 타입
  subLabel?: string; // 노드 아래 텍스트
}

export default function FlowDiagramCustomNode(props: NodeProps) {
  const { data, id } = props;
  
  const nodeData = data as unknown as CustomNodeData;

  // x 좌표를 기반으로 순차적인 딜레이 계산 (왼쪽에서 오른쪽으로)
  const getDelay = () => {
    const xPosition = nodeData.xPosition || 0;
    
    // 레이어별 딜레이 계산 - 오버랩으로 자연스럽게
    // 노드 애니메이션: 0.4초, 엣지 애니메이션: 0.3초
    // 엣지는 노드가 50% 완료될 때 시작, 다음 노드는 엣지가 50% 완료될 때 시작
    if (xPosition === 0) {
      return 0; // 첫 번째 노드: 0초 시작
    } else if (xPosition === 375) {
      // 이전 엣지 시작(0.3초) + 엣지의 50%(0.15초) = 0.45초
      return 0.45;
    } else if (xPosition === 750) {
      // 이전 엣지 시작(0.75초) + 엣지의 50%(0.15초) = 0.9초
      return 0.9;
    } else if (xPosition === 1125) {
      // 이전 엣지 시작(1.2초) + 엣지의 50%(0.15초) = 1.35초
      return 1.35;
    } else if (xPosition === 1500) {
      // 이전 레이어(1125) 엣지 완료 후 시작
      // 1125 레이어 시작(1.35초) + 노드 애니메이션 50%(0.2초) + 엣지 애니메이션(0.3초) + 엣지 50%(0.15초) = 2.0초
      return 2.0;
    } else if (xPosition === 1875) {
      // 이전 레이어(1500) 엣지 완료 후 시작
      // 1500 레이어 시작(2.0초) + 노드 애니메이션 50%(0.2초) + 엣지 애니메이션(0.3초) + 엣지 50%(0.15초) = 2.65초
      return 2.65;
    }
    
    // 기본값: x 좌표 기반 계산
    return (xPosition / 150) * 0.1;
  };

  const animationDelay = getDelay();
  
  // 노드 애니메이션 완료 후 핸들이 나타나도록 딜레이 계산
  // 노드 애니메이션 duration: 0.4초
  const nodeAnimationDuration = 0.4;
  const targetHandleDelay = animationDelay + nodeAnimationDuration; // 왼쪽 핸들 (target)
  const sourceHandleDelay = animationDelay + nodeAnimationDuration + 0.1; // 오른쪽 핸들 (source) - 왼쪽보다 0.1초 늦게

  // nodeType에 따른 스타일 결정
  const isImportant = nodeData.nodeType === 'important';
  const getBorderStyle = () => {
    if (isImportant) {
      return 'border-[#3b82f6] hover:border-[#2563eb]'; // blue-500 and blue-600 on hover
    }
    return 'border-[#e5e7eb] hover:border-[#cbd5e1]'; // gray-200 and gray-300 on hover
  };

  return (
    <>
      {nodeData.xPosition !== 0 && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className={isImportant ? 'important-handle' : 'normal-handle'}
          style={{ 
            opacity: 0,
            animation: `fadeIn 0.3s ease-out ${targetHandleDelay}s forwards`,
            zIndex: 20
          }}
        />
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .react-flow__handle.important-handle {
          width: 16px !important;
          height: 16px !important;
          border-radius: 50% !important;
          border: 2px solid #ffffff !important;
          background: #3b82f6 !important;
        }
        .react-flow__handle.normal-handle {
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
          border: 3px solid #4A5565 !important;
          background: #ffffff !important;
        }
      `}</style>
      
      <div className="relative">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            duration: 0.4,
            ease: "easeOut",
            delay: animationDelay // 노드 ID 기반 순차적 딜레이
          }}
          className={`
            relative px-4 py-3 rounded-lg w-[230px]
            transition-colors duration-300
            bg-white text-[#030712] border-2 ${getBorderStyle()}
          `}
          style={{ 
            zIndex: 10,
            ...(isImportant ? { boxShadow: '0 0 0 6px rgba(43, 127, 255, 0.25)' } : {})
          }}
        >
          <div className="flex items-center justify-start gap-3">
            {nodeData.icon && (
              <div
                className="flex items-center justify-center w-8 h-8 rounded-md bg-[#f3f4f6]"
                style={{
                  color: isImportant ? '#60a5fa' : '#374151' // blue-400 for important, gray-700 for understated
                }}
              >
                {nodeData.icon}
              </div>
            )}
            
            <span
              className={`text-base ${isImportant ? 'font-semibold' : 'font-medium'} ${
                isImportant 
                  ? 'text-[#030712]' 
                  : 'text-[#6b7280]'
              }`}
            >
              {nodeData.label}
            </span>
          </div>

        </motion.div>
        
        {nodeData.subLabel && (
          <div
            className="absolute top-full left-0 mt-[12px] pl-2 text-[15px] text-gray-500 whitespace-nowrap"
            style={{
              animationDelay: `${animationDelay}s`,
              opacity: 0,
              animation: `fadeIn 0.3s ease-out ${animationDelay + 0.4}s forwards`
            }}
          >
            {nodeData.subLabel}
          </div>
        )}
      </div>

      {!nodeData.isLastNode && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className={isImportant ? 'important-handle' : 'normal-handle'}
          style={{ 
            opacity: 0,
            animation: `fadeIn 0.3s ease-out ${sourceHandleDelay}s forwards`,
            zIndex: 20
          }}
        />
      )}
    </>
  );
}
