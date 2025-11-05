"use client";

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  NodeChange,
  EdgeChange,
  Background,
  Controls,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 커스텀 노드 컴포넌트
const CustomNode = ({ data }: { data: { title: string; subtitle: string; icon: React.ReactNode; borderColor?: string; animationDelay?: number } }) => {
  const borderClass = data.borderColor || 'border-[#e5e7eb]';
  const delay = data.animationDelay || 0;
  
  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateX(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }
        .animated-node {
          animation: fadeInScale 0.5s ease-out both;
        }
      `}</style>
      <div
        className={`bg-white rounded-[8px] shadow-sm border-2 p-4 min-w-[180px] animated-node ${borderClass}`}
        style={{
          animationDelay: `${delay}s`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center text-[#1e2939] flex-shrink-0">
            {data.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-[#030712]">{data.title}</div>
            <div className="text-[12px] text-[#6a7282]">{data.subtitle}</div>
          </div>
        </div>
      </div>
    </>
  );
};

// 애니메이션 엣지 컴포넌트
const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const delay = (data as any)?.animationDelay || 0;
  // 베지어 곡선의 대략적인 길이 계산 (직선 거리 * 1.2)
  const pathLength = Math.hypot(targetX - sourceX, targetY - sourceY) * 1.2;

  return (
    <>
      <defs>
        <style>{`
          @keyframes drawPath-${id} {
            from {
              stroke-dashoffset: ${pathLength};
            }
            to {
              stroke-dashoffset: 0;
            }
          }
          .animated-edge-${id} {
            stroke-dasharray: ${pathLength};
            stroke-dashoffset: ${pathLength};
            animation: drawPath-${id} 0.8s ease-out forwards;
          }
        `}</style>
      </defs>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={2}
        markerEnd={markerEnd}
        className={`animated-edge-${id}`}
        style={{
          animationDelay: `${delay}s`,
        }}
      />
    </>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

// 아이콘 컴포넌트들
const TriggerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.5L12.5 7.5H17.5L14 11.25L15.5 17.5L10 14.25L4.5 17.5L6 11.25L2.5 7.5H7.5L10 2.5Z" fill="#155DFC" stroke="#155DFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 5L10 10L17.5 5M3.75 15H16.25C16.913 15 17.5489 14.7366 18.0237 14.2618C18.4985 13.787 18.75 13.1522 18.75 12.5V7.5C18.75 6.84783 18.4985 6.21304 18.0237 5.73826C17.5489 5.26348 16.913 5 16.25 5H3.75C3.08696 5 2.45217 5.26348 1.97739 5.73826C1.5026 6.21304 1.25 6.84783 1.25 7.5V12.5C1.25 13.1522 1.5026 13.787 1.97739 14.2618C2.45217 14.7366 3.08696 15 3.75 15Z" stroke="#1E2939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HttpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.75 5H16.25M3.75 10H16.25M3.75 15H16.25" stroke="#1E2939" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 3.75V6.25M15 3.75V6.25M5 13.75V16.25M15 13.75V16.25" stroke="#1E2939" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const WebhookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.5C10 2.5 13.75 5 13.75 10C13.75 15 10 17.5 10 17.5M10 2.5C10 2.5 6.25 5 6.25 10C6.25 15 10 17.5 10 17.5M10 2.5V7.5M10 17.5V12.5" stroke="#1E2939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="10" r="2.5" fill="#1E2939"/>
  </svg>
);

const LogicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 5H15M7.5 10H15M7.5 15H15M5 5V5.01M5 10V10.01M5 15V15.01" stroke="#1E2939" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function FlowDiagram() {
  const [animationKey, setAnimationKey] = useState(0);

  // 컴포넌트 마운트 시 애니메이션 키 증가
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, []);

  // 왼쪽에서 오른쪽으로 레이어별 배치
  const initialNodes: Node[] = [
    // Layer 1: Trigger (왼쪽)
    {
      id: 'trigger',
      type: 'custom',
      position: { x: 50, y: 140 },
      data: {
        title: 'Trigger',
        subtitle: 'Time-based Trigger',
        icon: <TriggerIcon />,
        borderColor: 'border-[#155DFC]',
        animationDelay: 0,
      },
    },
    // Layer 2: Send Email, HTTP Request
    {
      id: 'send-email',
      type: 'custom',
      position: { x: 330, y: 30 },
      data: {
        title: 'Send Email',
        subtitle: 'Send Email Action',
        icon: <EmailIcon />,
        animationDelay: 0.2,
      },
    },
    {
      id: 'http-request-2',
      type: 'custom',
      position: { x: 330, y: 250 },
      data: {
        title: 'HTTP Request',
        subtitle: 'HTTP Request Action',
        icon: <HttpIcon />,
        animationDelay: 0.25,
      },
    },
    // Layer 3: HTTP Request, WebHooks
    {
      id: 'http-request-1',
      type: 'custom',
      position: { x: 610, y: 0 },
      data: {
        title: 'HTTP Request',
        subtitle: 'HTTP Request Action',
        icon: <HttpIcon />,
        animationDelay: 0.6,
      },
    },
    {
      id: 'webhook-1',
      type: 'custom',
      position: { x: 610, y: 120 },
      data: {
        title: 'WebHook',
        subtitle: 'WebHook Action',
        icon: <WebhookIcon />,
        animationDelay: 0.65,
      },
    },
    {
      id: 'webhook-2',
      type: 'custom',
      position: { x: 610, y: 240 },
      data: {
        title: 'WebHook',
        subtitle: 'WebHook Action',
        icon: <WebhookIcon />,
        animationDelay: 0.7,
      },
    },
    // Layer 4: Logic (오른쪽)
    {
      id: 'logic',
      type: 'custom',
      position: { x: 890, y: 180 },
      data: {
        title: 'Logic',
        subtitle: 'Logic Function Action',
        icon: <LogicIcon />,
        animationDelay: 1.1,
      },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1', source: 'trigger', target: 'send-email', type: 'animated', data: { animationDelay: 0.1 } },
    { id: 'e2', source: 'trigger', target: 'http-request-2', type: 'animated', data: { animationDelay: 0.15 } },
    { id: 'e3', source: 'send-email', target: 'http-request-1', type: 'animated', data: { animationDelay: 0.4 } },
    { id: 'e4', source: 'send-email', target: 'webhook-1', type: 'animated', data: { animationDelay: 0.45 } },
    { id: 'e5', source: 'http-request-2', target: 'webhook-2', type: 'animated', data: { animationDelay: 0.5 } },
    { id: 'e6', source: 'webhook-1', target: 'logic', type: 'animated', data: { animationDelay: 0.9 } },
    { id: 'e7', source: 'webhook-2', target: 'logic', type: 'animated', data: { animationDelay: 0.95 } },
  ];

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div key={animationKey} style={{ width: '100%', height: '400px' }} className="bg-[#f3f4f6]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ style: { stroke: '#94a3b8', strokeWidth: 2 } }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}

