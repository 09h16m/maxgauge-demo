"use client";

import { useCallback, useState } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  Position,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FlowDiagramCustomNode from './FlowDiagramCustomNode';
import FlowDiagramCustomEdge from './FlowDiagramCustomEdge';

// 아이콘 컴포넌트들
const InputIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M8 8H12M8 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ProcessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L15 7H12V13H8V7H5L10 2Z" fill="currentColor"/>
    <rect x="6" y="14" width="8" height="4" rx="1" fill="currentColor"/>
  </svg>
);

const ActionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3L15 8H12V16H8V8H5L10 3Z" fill="currentColor"/>
  </svg>
);

const nodeTypes: NodeTypes = {
  custom: FlowDiagramCustomNode,
};

const edgeTypes: EdgeTypes = {
  custom: FlowDiagramCustomEdge,
};

const initialNodes: Node[] = [
  // Layer 0 (x=0)
  {
    id: 'db-server-01',
    type: 'custom',
    sourcePosition: 'right' as Position,
    data: { label: 'DB-SERVER-01', icon: <InputIcon />, xPosition: 0, nodeType: 'important' },
    position: { x: 0, y: 36 },
  },
  // Layer 1 (x=375)
  {
    id: 'total-events',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'Total Events', icon: <NodeIcon />, xPosition: 375, nodeType: 'important', subLabel: '2025-11-06 04:45 1초 → 43초' },
    position: { x: 375, y: -30 },
  },
  {
    id: 'sql-elapsed-time',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'SQL Elapsed Time', icon: <NodeIcon />, xPosition: 375, nodeType: 'important', subLabel: '2025-11-06 04:45 13초 → 441초' },
    position: { x: 375, y: 114 },
  },
  // Layer 2 (x=750)
  {
    id: 'wait-event-analysis',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: '대기 Event 분석', icon: <ProcessIcon />, xPosition: 750, nodeType: 'important' },
    position: { x: 750, y: -30 },
  },
  {
    id: 'sql-performance',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'SQL 성능 분석', icon: <ProcessIcon />, xPosition: 750, nodeType: 'important' },
    position: { x: 750, y: 114 },
  },
  // Layer 3 (x=1125)
  {
    id: 'top-event-rate',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: '증감률 Top Event', icon: <ActionIcon />, xPosition: 1125, nodeType: 'important' },
    position: { x: 1125, y: -30 },
  },
  {
    id: 'sql-stat',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'SQL Stat', icon: <ActionIcon />, xPosition: 1125, nodeType: 'important' },
    position: { x: 1125, y: 114 },
  },
  {
    id: 'sql-plan',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'SQL Plan', icon: <ActionIcon />, xPosition: 1125, nodeType: 'important' },
    position: { x: 1125, y: 198 },
  },
  {
    id: 'full-scan',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'Full Scan', icon: <ActionIcon />, xPosition: 1125, nodeType: 'understated' },
    position: { x: 1125, y: 282 },
  },
  {
    id: 'execute-count',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'Execute Conut', icon: <ActionIcon />, xPosition: 1125, isLastNode: true, nodeType: 'understated' },
    position: { x: 1125, y: 366 },
  },
  // Layer 4 (x=1500)
  {
    id: 'event-detail-analysis',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: '이벤트 상세 분석', icon: <NodeIcon />, xPosition: 1500, isLastNode: true, nodeType: 'important' },
    position: { x: 1500, y: -30 },
  },
  {
    id: 'event',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'Event', icon: <NodeIcon />, xPosition: 1500, isLastNode: true, nodeType: 'important' },
    position: { x: 1500, y: 114 },
  },
  {
    id: 'suspicious-reason',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'Suspicious Reason', icon: <NodeIcon />, xPosition: 1500, isLastNode: true, nodeType: 'important' },
    position: { x: 1500, y: 198 },
  },
  {
    id: 'table',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'Table', icon: <NodeIcon />, xPosition: 1500, nodeType: 'understated' },
    position: { x: 1500, y: 282 },
  },
  // Layer 5 (x=1875)
  {
    id: 'object-info',
    type: 'custom',
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    data: { label: 'Object Info', icon: <ProcessIcon />, xPosition: 1875, isLastNode: true, nodeType: 'understated' },
    position: { x: 1875, y: 282 },
  },
];

const initialEdges: Edge[] = [
  // DB-SERVER-01 → Layer 1
  {
    id: 'e-db-sql-elapsed',
    source: 'db-server-01',
    type: 'custom',
    target: 'sql-elapsed-time',
    data: { sourceXPosition: 0 },
  },
  {
    id: 'e-db-total-events',
    source: 'db-server-01',
    type: 'custom',
    target: 'total-events',
    data: { sourceXPosition: 0 },
  },
  // Layer 1 → Layer 2
  {
    id: 'e-sql-elapsed-performance',
    source: 'sql-elapsed-time',
    type: 'custom',
    target: 'sql-performance',
    data: { sourceXPosition: 375 },
  },
  {
    id: 'e-total-events-wait',
    source: 'total-events',
    type: 'custom',
    target: 'wait-event-analysis',
    data: { sourceXPosition: 375 },
  },
  // SQL 성능 분석 → Layer 3
  {
    id: 'e-performance-stat',
    source: 'sql-performance',
    type: 'custom',
    target: 'sql-stat',
    data: { sourceXPosition: 750 },
  },
  {
    id: 'e-performance-plan',
    source: 'sql-performance',
    type: 'custom',
    target: 'sql-plan',
    data: { sourceXPosition: 750 },
  },
  {
    id: 'e-performance-scan',
    source: 'sql-performance',
    type: 'custom',
    target: 'full-scan',
    data: { sourceXPosition: 750 },
  },
  {
    id: 'e-performance-count',
    source: 'sql-performance',
    type: 'custom',
    target: 'execute-count',
    data: { sourceXPosition: 750 },
  },
  // 대기 Event 분석 → Layer 3
  {
    id: 'e-wait-top-event',
    source: 'wait-event-analysis',
    type: 'custom',
    target: 'top-event-rate',
    data: { sourceXPosition: 750 },
  },
  // Layer 3 → Layer 4
  {
    id: 'e-stat-event',
    source: 'sql-stat',
    type: 'custom',
    target: 'event',
    data: { sourceXPosition: 1125 },
  },
  {
    id: 'e-plan-suspicious',
    source: 'sql-plan',
    type: 'custom',
    target: 'suspicious-reason',
    data: { sourceXPosition: 1125 },
  },
  {
    id: 'e-scan-table',
    source: 'full-scan',
    type: 'custom',
    target: 'table',
    data: { sourceXPosition: 1125 },
  },
  {
    id: 'e-top-event-detail',
    source: 'top-event-rate',
    type: 'custom',
    target: 'event-detail-analysis',
    data: { sourceXPosition: 1125 },
  },
  // Layer 4 → Layer 5
  {
    id: 'e-table-object',
    source: 'table',
    type: 'custom',
    target: 'object-info',
    data: { sourceXPosition: 1500 },
  },
];


export default function FlowDiagram() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isViewportReady, setIsViewportReady] = useState(false);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  const onInit = useCallback((reactFlowInstance: any) => {
    // 초기화 시 즉시 fitView를 호출하여 뷰포트를 설정
    reactFlowInstance.fitView({ padding: 0.1, duration: 0 });
    // 뷰포트 설정 완료 후 표시
    requestAnimationFrame(() => {
      setIsViewportReady(true);
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }} className="bg-[#f3f4f6">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        style={{ 
          opacity: isViewportReady ? 1 : 0,
          transition: 'opacity 0.3s ease-in'
        }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

