'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Html } from '@react-three/drei';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

export type BlockData = {
  id: number;
  cpuUsage: number; // 0~100
  status: 'normal' | 'warning' | 'critical';
  connections: number[]; // RAC 연결된 블록 ID들
};

function getColorForStatus(cpuUsage: number, status: BlockData['status']): THREE.Color {
  // Figma 디자인 색상
  if (status === 'warning') return new THREE.Color('#fe9a00');  // Figma warning
  if (status === 'critical') return new THREE.Color('#fb2c36'); // Figma critical

  // Normal 상태 - Tailwind 팔레트
  if (cpuUsage <= 10) return new THREE.Color('#ffffff');  // white (0~10%)
  if (cpuUsage <= 25) return new THREE.Color('#38bdf8');  // sky-400 (11~25%)
  return new THREE.Color('#34d399');  // emerald-400 (26~100%)
}

// RAC 연결선 컴포넌트
interface ConnectionLinesProps {
  hoveredBlockId: number | null;
  selectedBlockId: number | null | undefined;
  blocks: BlockData[];
  getBlockPosition: (id: number) => [number, number, number];
}

// 점선을 따라 이동하는 sphere 애니메이션 컴포넌트
function AnimatedConnectionLine({ start, end, midPoint }: { start: THREE.Vector3; end: THREE.Vector3; midPoint: THREE.Vector3 }) {
  const spheresRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);
  const fadeRef = useRef(0); // 페이드 인 애니메이션용

  // 곡선 생성
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(start, midPoint, end), [start, midPoint, end]);

  // 점선 세그먼트 생성
  const dashSegments = useMemo(() => {
    const segments: THREE.Mesh[] = [];
    const curveLength = curve.getLength();
    const dashLength = 0.3;    // 점선 조각 길이
    const gapLength = 0.2;     // 간격 길이
    const patternLength = dashLength + gapLength;
    const numDashes = Math.ceil(curveLength / patternLength);

    for (let i = 0; i < numDashes; i++) {
      const dashStart = (i * patternLength) / curveLength;
      const dashEnd = Math.min((i * patternLength + dashLength) / curveLength, 1);
      
      if (dashStart < 1 && dashEnd > dashStart) {
        const startPoint = curve.getPoint(dashStart);
        const endPoint = curve.getPoint(dashEnd);
        const segmentCurve = new THREE.LineCurve3(startPoint, endPoint);
        const tubeGeometry = new THREE.TubeGeometry(segmentCurve, 2, 0.02, 8, false);
        const material = new THREE.MeshBasicMaterial({
          color: '#99A1AF',
          transparent: true,
          opacity: 0
        });
        const tube = new THREE.Mesh(tubeGeometry, material);
        segments.push(tube);
      }
    }
    
    return segments;
  }, [curve]);

  // 이동하는 sphere들 생성 (10개)
  const spheres = useMemo(() => {
    const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 8); // 더 작게
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: '#99A1AF', // gray-500
      transparent: true,
      opacity: 0
    });
    
    return Array.from({ length: 10 }, () => new THREE.Mesh(sphereGeometry, sphereMaterial.clone()));
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta * 0.22; // 더 천천히 이동
    
    // 페이드 인 애니메이션 (부드럽게)
    fadeRef.current = THREE.MathUtils.lerp(fadeRef.current, 1, 0.08);
    
    // 점선 세그먼트 opacity 업데이트
    dashSegments.forEach((segment) => {
      if (segment.material instanceof THREE.MeshBasicMaterial) {
        segment.material.opacity = fadeRef.current * 0.9;
      }
    });
    
    spheres.forEach((sphere, index) => {
      // 각 sphere마다 다른 시작 위치 (균등하게 분포)
      const offset = (timeRef.current + index * 0.2) % 1;
      const position = curve.getPoint(offset);
      sphere.position.copy(position);
      
      // 페이드 인/아웃 효과
      if (sphere.material instanceof THREE.MeshBasicMaterial) {
        // 시작과 끝 부분에서 페이드
        const fadeStart = 0.05;
        const fadeEnd = 0.95;
        let baseOpacity = 0.9;
        
        if (offset < fadeStart) {
          baseOpacity = offset / fadeStart * 0.9;
        } else if (offset > fadeEnd) {
          baseOpacity = (1 - offset) / (1 - fadeEnd) * 0.9;
        }
        
        // 전체 페이드 인 효과 적용
        sphere.material.opacity = baseOpacity * fadeRef.current;
      }
    });
  });

  return (
    <group>
      {dashSegments.map((segment, idx) => (
        <primitive key={`dash-${idx}`} object={segment} />
      ))}
      {spheres.map((sphere, idx) => (
        <primitive key={`sphere-${idx}`} object={sphere} />
      ))}
    </group>
  );
}

function ConnectionLines({ hoveredBlockId, selectedBlockId, blocks, getBlockPosition }: ConnectionLinesProps) {
  // hover 또는 선택된 블록이 있을 때 연결선 표시
  const activeBlockId = hoveredBlockId !== null ? hoveredBlockId : selectedBlockId;
  if (activeBlockId === null || activeBlockId === undefined) return null;

  const activeBlock = blocks.find(b => b.id === activeBlockId);
  if (!activeBlock) return null;

  // 블록의 높이 계산 (회색 블록은 0.18 고정)
  const getBlockHeight = (block: BlockData) => {
    if (block.status === 'normal' && block.cpuUsage <= 10) {
      return 0.18; // 회색 블록 고정 높이
    }
    return (block.cpuUsage / 100) * 4 + 1;
  };

  const startPos = getBlockPosition(activeBlockId);
  const startHeight = getBlockHeight(activeBlock);
  const start = new THREE.Vector3(startPos[0], startHeight, startPos[2]);

  return (
    <>
      {activeBlock.connections.map((targetId) => {
        const targetBlock = blocks.find(b => b.id === targetId);
        if (!targetBlock) return null;

        const endPos = getBlockPosition(targetId);
        const endHeight = getBlockHeight(targetBlock);
        const end = new THREE.Vector3(endPos[0], endHeight, endPos[2]);

        // 포물선의 중간점 (위로 더 높이 올림)
        const midPoint = new THREE.Vector3(
          (start.x + end.x) / 2,
          Math.max(start.y, end.y) + 12,
          (start.z + end.z) / 2
        );

        return (
          <AnimatedConnectionLine 
            key={targetId} 
            start={start} 
            end={end} 
            midPoint={midPoint}
          />
        );
      })}
    </>
  );
}

interface AnimatedBlockProps extends BlockData {
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
  onClick: () => void;
  isDimmed: boolean; // 선택되지 않은 블록인 경우
  showTooltip: boolean; // 선택되었거나 선택된 블록과 연결된 경우
}

function AnimatedBlock({ id, cpuUsage, status, isHovered, onHover, onUnhover, onClick, isDimmed, showTooltip }: AnimatedBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentHeight, setCurrentHeight] = useState(0.1);
  const [color] = useState(() => new THREE.Color('white'));

  // 회색 블록(0~10%)은 아주 얇게 통일
  const targetHeight = (status === 'normal' && cpuUsage <= 10) 
    ? 0.18  // 아주 얇은 높이로 고정
    : (cpuUsage / 100) * 4 + 1;
  const targetColor = getColorForStatus(cpuUsage, status);

  const getStatusLabel = (status: BlockData['status']) => {
    if (status === 'critical') return '이상 탐지';
    if (status === 'warning') return '이상 감지 중';
    return '정상';
  };

  const getStatusBadgeStyle = (status: BlockData['status']) => {
    if (status === 'critical') {
      return 'bg-[#FFE2E2] text-[#E7000B]'; // Figma red
    }
    if (status === 'warning') {
      return 'bg-[#FEF3C6] text-[#E17100]'; // Figma amber
    }
    return 'bg-[#DFF2FE] text-[#0084D1]'; // Figma sky
  };

  useFrame(() => {
    if (!meshRef.current) return;

    // 🔼 높이 변화 부드럽게
    if (currentHeight !== targetHeight) {
      const newHeight = THREE.MathUtils.lerp(currentHeight, targetHeight, 0.05);
      setCurrentHeight(newHeight);
      meshRef.current.scale.y = newHeight;
      meshRef.current.position.y = newHeight / 2;
    }

    // 🎨 색상 부드럽게 변화
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    
    // isDimmed 상태일 때 회색으로 변경
    const finalColor = isDimmed ? new THREE.Color('#f9fafb') : targetColor; // gray-50
    material.color.lerp(finalColor, 0.1);
    
    // isDimmed 상태일 때 opacity 50%
    const targetOpacity = isDimmed ? 0.5 : 1.0;
    material.transparent = true; // opacity를 사용하려면 항상 true여야 함
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.1);
    
    // 호버 시 밝게 빛나는 효과 (부드럽게)
    const targetEmissiveIntensity = isHovered ? 0.6 : 0;
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      targetEmissiveIntensity,
      0.08  // 더 부드러운 전환
    );
    material.emissive = finalColor;
  });

  return (
    <group>
      <RoundedBox
        ref={meshRef}
        args={[1, 1, 1]}
        radius={0.02}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover();
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onUnhover();
        }}
      >
        <meshStandardMaterial 
          color={color} 
          roughness={0.7}
          metalness={0.0}
          transparent={true}
          opacity={1.0}
        />
      </RoundedBox>

      {/* 호버 또는 선택 시 툴팁 - Figma 디자인 */}
      {(isHovered || showTooltip) && (
        <Html
          position={[0, targetHeight + 1.2, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="relative bg-white rounded-md shadow-[0px_0px_24px_0px_rgba(3,7,18,0.16)] px-2 py-1.5">
            {/* 툴팁 화살표 */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-2"
              style={{
                clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                backgroundColor: 'white',
              }}
            />
            
            {/* 서버명 + 배지 */}
            <div className="flex items-center gap-1.5 mb-1.5 whitespace-nowrap">
              <img 
                src="/logos/oracle-logo.svg" 
                alt="Oracle" 
                className="w-4 h-4 shrink-0"
              />
              <span className="font-medium text-[#030712] text-base leading-tight shrink-0">
                PROD{id}
              </span>
              <span className={`px-1 py-0.5 rounded-md text-xs font-medium shrink-0 inline-block ${getStatusBadgeStyle(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>
            
            {/* CPU 사용률 */}
            <div className="text-[#6a7282] text-xs font-medium text-center">
              CPU 사용률: {cpuUsage}%
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface Block3DProps {
  onBlocksChange?: (blocks: BlockData[]) => void;
  onBlockSelect?: (blockId: number | null) => void;
  selectedBlockId?: number | null;
}

export default function Block3D({ onBlocksChange, onBlockSelect, selectedBlockId }: Block3DProps) {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [hoveredBlockId, setHoveredBlockId] = useState<number | null>(null);
  const onBlocksChangeRef = useRef(onBlocksChange);
  const connectionsRef = useRef<Map<number, number[]>>(new Map()); // RAC 연결 정보 저장

  // 최신 콜백 참조 유지
  useEffect(() => {
    onBlocksChangeRef.current = onBlocksChange;
  }, [onBlocksChange]);

  useEffect(() => {
    // 초기 연결 정보 생성 (한 번만 실행)
    const initializeConnections = () => {
      const connectionsMap = new Map<number, number[]>();
      
      for (let i = 0; i < 256; i++) {
        const connectionCount = Math.floor(Math.random() * 3) + 3; // 3~5개
        const connections: number[] = [];
        
        while (connections.length < connectionCount) {
          const targetId = Math.floor(Math.random() * 256);
          // 자기 자신이 아니고, 중복되지 않은 연결만 추가
          if (targetId !== i && !connections.includes(targetId)) {
            connections.push(targetId);
          }
        }
        
        connectionsMap.set(i, connections);
      }
      
      connectionsRef.current = connectionsMap;
    };

    // 블록 데이터 생성 (CPU, status만 변경, connections는 유지)
    const generateBlocks = () => {
      // 최초 실행 시 연결 정보 초기화
      if (connectionsRef.current.size === 0) {
        initializeConnections();
      }

      const newBlocks: BlockData[] = Array.from({ length: 256 }, (_, i) => {
        // 92%는 낮은 CPU (0~30%), 8%는 높은 CPU (30~100%)
        const rand = Math.random();
        let cpuUsage: number;

        if (rand < 0.92) {
          // 92%가 0~30%: 회색 80%, 파란색 15%, 초록색 5%
          const subRand = Math.random();
          if (subRand < 0.8) {
            // 80%가 0~10% (회색)
            cpuUsage = Math.floor(Math.random() * 11); // 0~10
          } else if (subRand < 0.95) {
            // 15%가 11~25% (파란색)
            cpuUsage = Math.floor(Math.random() * 15) + 11; // 11~25
          } else {
            // 5%가 26~30% (초록색)
            cpuUsage = Math.floor(Math.random() * 5) + 26; // 26~30
          }
        } else {
          // 8%가 30~100%
          cpuUsage = Math.floor(Math.random() * 71) + 30; // 30~100
        }

        // 상태 확률 조정 (warning 4%, critical 3%)
        let status: BlockData['status'] = 'normal';
        const abnormalChance = Math.random();
        if (abnormalChance < 0.04) status = 'warning';      // 4%
        else if (abnormalChance < 0.07) status = 'critical'; // 3% (0.04~0.07)

        // 저장된 연결 정보 사용
        const connections = connectionsRef.current.get(i) || [];

        return { id: i, cpuUsage, status, connections };
      });

      setBlocks(newBlocks);
      onBlocksChangeRef.current?.(newBlocks);
    };

    generateBlocks(); // 최초 실행
    const interval = setInterval(generateBlocks, 3000); // ⏱️ 3초마다

    return () => clearInterval(interval);
  }, []);

  // 블록 ID로 위치 계산하는 함수
  const getBlockPosition = (id: number): [number, number, number] => {
    const col = id % 8;
    const row = Math.floor(id / 8);
    const x = col * 1.3 - (7 * 1.3) / 2;
    const z = row * 1.3 - (31 * 1.3) / 2;
    return [x, 0, z];
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas 
        orthographic 
        camera={{ position: [-32, 32, 32], zoom: 48 }}
        gl={{ 
          toneMappingExposure: 1.1
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[0, 15, 5]} intensity={4.0} />
        <directionalLight position={[0, 1, 0]} intensity={0.6} />
        
        {/* 배경 클릭 영역 (투명한 큰 plane, 뒤쪽에 배치) */}
        <mesh 
          position={[0, -5, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={() => onBlockSelect?.(null)}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <group position={[-5, 0, 0]}>
          {/* 입체 바닥판 */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[12, 0.2, 44]} />
            <meshStandardMaterial 
              color="#d1d5db"
              roughness={0.8}
              metalness={0.1}
              transparent={true}
              opacity={0.3}
            />
          </mesh>
        </group>

        <group position={[-5, 0, 0]}>
          {/* 블록 렌더링 */}
          {blocks.map((block, index) => {
            // 8x32 격자의 중심을 원점으로 이동
            const col = index % 8;
            const row = Math.floor(index / 8);
            const x = col * 1.3 - (7 * 1.3) / 2; // 중심을 0으로, 간격 조금 축소
            const z = row * 1.3 - (31 * 1.3) / 2; // 중심을 0으로, 간격 조금 축소
            
            // 선택된 블록이 있을 때, 선택된 블록과 연결된 블록들만 밝게 표시
            const selectedBlock = selectedBlockId !== null && selectedBlockId !== undefined 
              ? blocks.find(b => b.id === selectedBlockId) 
              : null;
            const isSelected = block.id === selectedBlockId;
            const isConnected = selectedBlock?.connections.includes(block.id) || false;
            const isDimmed = selectedBlock !== null && !isSelected && !isConnected;
            const showTooltip = selectedBlock !== null && (isSelected || isConnected);
            
            return (
              <group key={block.id} position={[x, 0, z]}>
                <AnimatedBlock
                  {...block}
                  isHovered={hoveredBlockId === block.id}
                  onHover={() => setHoveredBlockId(block.id)}
                  onUnhover={() => setHoveredBlockId(null)}
                  onClick={() => onBlockSelect?.(block.id)}
                  isDimmed={isDimmed}
                  showTooltip={showTooltip}
                />
              </group>
            );
          })}
          
          {/* RAC 연결선 */}
          <ConnectionLines 
            hoveredBlockId={hoveredBlockId}
            selectedBlockId={selectedBlockId}
            blocks={blocks}
            getBlockPosition={getBlockPosition}
          />
        </group>
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}
