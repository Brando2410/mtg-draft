import { memo, useState, useEffect } from 'react';
import { type GameObject, type StackObject } from '@shared/engine_types';

interface TargetingArrowsProps {
  stack: StackObject[];
  battlefield: GameObject[];
  pendingAction?: any;
  hoveredCardId?: string;
}

export const TargetingArrows = memo(({ stack, battlefield, pendingAction, hoveredCardId }: TargetingArrowsProps) => {
  const [arrows, setArrows] = useState<{ x1: number, y1: number, x2: number, y2: number, id: string, color: string, isPending?: boolean, isHovered?: boolean }[]>([]);

  const colors = [
    '#6366f1', // Indigo 500
    '#10b981', // Emerald 500
    '#f43f5e', // Rose 500
    '#f59e0b', // Amber 500
    '#06b6d4', // Cyan 500
    '#d946ef', // Fuchsia 500
    '#8b5cf6', // Violet 500
  ];

  useEffect(() => {
    const update = () => {
      const bfCenter = document.getElementById('battlefield-center')?.getBoundingClientRect();
      if (!bfCenter) return;

      const newArrows: any[] = [];

      // 1. Existing spells/abilities on stack
      stack.forEach((sobj, sIdx) => {
        if (!sobj.targets || sobj.targets.length === 0) return;
        
        const sourceEl = document.getElementById(`stack-obj-${sobj.id}`);
        if (!sourceEl) return;
        const sourceRect = sourceEl.getBoundingClientRect();
        
        // Pick a color based on stack index to keep it consistent while on stack
        const spellColor = colors[sIdx % colors.length];
        const isHovered = hoveredCardId === sobj.id || hoveredCardId === sobj.card?.id;

        sobj.targets.forEach((targetId, idx) => {
          const targetEl = document.getElementById(`game-card-${targetId}`) || 
                          document.getElementById(`player-avatar-${targetId}`) ||
                          document.getElementById(`stack-obj-${targetId}`);
          
          if (!targetEl) return;
          
          const targetRect = targetEl.getBoundingClientRect();
          
          // CRITICAL: If the target element has no size (0 width/height), it's likely hidden or in a pile.
          // Don't draw arrows to invisible elements.
          if (targetRect.width === 0 || targetRect.height === 0) return;

          newArrows.push({
            id: `${sobj.id}-${targetId}-${idx}`,
            x1: sourceRect.left + sourceRect.width / 2 - bfCenter.left,
            y1: sourceRect.top + sourceRect.height / 2 - bfCenter.top,
            x2: targetRect.left + targetRect.width / 2 - bfCenter.left,
            y2: targetRect.top + targetRect.height / 2 - bfCenter.top,
            color: spellColor,
            isHovered
          });
        });
      });

      // 2. Currently selecting targets (Real-time feedback)
      if (pendingAction?.type === 'TARGETING' && pendingAction.data?.selectedTargets) {
          const sourceId = pendingAction.sourceId;
          const isOnBattlefield = battlefield.some(o => o.id === sourceId);
          const isOnStack = stack.some(s => s.id === sourceId);
          
          let sourceEl = null;
          if (isOnStack) {
              sourceEl = document.getElementById(`stack-obj-${sourceId}`);
          } else if (isOnBattlefield) {
              sourceEl = document.getElementById(`game-card-${sourceId}`);
          }
          
          // If not on stack or battlefield, it's likely in hand or just a player action - start from avatar
          if (!sourceEl) {
              sourceEl = document.getElementById(`player-avatar-${pendingAction.playerId}`);
          }
                            
          if (sourceEl) {
              const sourceRect = sourceEl.getBoundingClientRect();
              pendingAction.data.selectedTargets.forEach((targetId: string, idx: number) => {
                  const targetEl = document.getElementById(`game-card-${targetId}`) || 
                                  document.getElementById(`player-avatar-${targetId}`) ||
                                  document.getElementById(`stack-obj-${targetId}`);
                  if (!targetEl) return;
                  const targetRect = targetEl.getBoundingClientRect();
                  
                  // Don't draw arrows to invisible elements.
                  if (targetRect.width === 0 || targetRect.height === 0) return;
                  
                  newArrows.push({
                    id: `pending-${targetId}-${idx}`,
                    x1: sourceRect.left + sourceRect.width / 2 - bfCenter.left,
                    y1: sourceRect.top + sourceRect.height / 2 - bfCenter.top,
                    x2: targetRect.left + targetRect.width / 2 - bfCenter.left,
                    y2: targetRect.top + targetRect.height / 2 - bfCenter.top,
                    color: '#facc15', // Gold always for pending
                    isPending: true,
                    isHovered: hoveredCardId === sourceId
                  });
              });
          }
      }

      setArrows(newArrows);
    };

    update();
    const interval = setInterval(update, 100);
    window.addEventListener('resize', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', update);
    };
  }, [stack, battlefield, pendingAction, hoveredCardId]);

  return (
    <svg className="absolute inset-0 pointer-events-none z-[160]" style={{ width: '100%', height: '100%' }}>
      <style>
        {`
          @keyframes flow {
            from { stroke-dashoffset: 100; }
            to { stroke-dashoffset: 0; }
          }
          .animate-flow {
            animation: flow 2s linear infinite;
          }
          @keyframes dash {
            to { stroke-dashoffset: -12; }
          }
        `}
      </style>
      <defs>
        <filter id="targeting-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {arrows.map(arrow => (
          <linearGradient 
            key={`grad-${arrow.id}`} 
            id={`grad-${arrow.id}`} 
            gradientUnits="userSpaceOnUse"
            x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2}
          >
            <stop offset="0%" stopColor={arrow.color} stopOpacity="0.4">
                <animate attributeName="offset" values="-1; 1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="0%" stopColor="white" stopOpacity="0.8">
                <animate attributeName="offset" values="-0.5; 1.5" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor={arrow.color} stopOpacity="0.4">
                <animate attributeName="offset" values="0; 2" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        ))}
        
        <marker id="arrowhead-gold" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <path d="M0,0 L0,10 L10,5 Z" fill="#facc15" />
        </marker>
      </defs>

      {arrows.map((arrow: any) => {
        const dx = arrow.x2 - arrow.x1;
        const dy = arrow.y2 - arrow.y1;
        const midX = (arrow.x1 + arrow.x2) / 2;
        const midY = (arrow.y1 + arrow.y2) / 2;
        
        const curveAmount = 60;
        const cx = midX - dy * (curveAmount / 400);
        const cy = midY + dx * (curveAmount / 400);

        // Calculate the angle at the end of the curve for the arrowhead
        const angle = Math.atan2(arrow.y2 - cy, arrow.x2 - cx);
        
        // Pull the line back by the length of the arrowhead (18px)
        const shrinkAmount = 18;
        const nx2 = arrow.x2 - Math.cos(angle) * shrinkAmount;
        const ny2 = arrow.y2 - Math.sin(angle) * shrinkAmount;

        return (
          <g key={arrow.id} filter="url(#targeting-glow)">
            {/* The Line */}
            <path
              d={`M ${arrow.x1} ${arrow.y1} Q ${cx} ${cy} ${nx2} ${ny2}`}
              fill="none"
              stroke={arrow.color}
              strokeWidth={arrow.isHovered ? "4" : (arrow.isPending ? "4" : "3")}
              strokeDasharray={arrow.isPending ? "8,4" : "none"}
              opacity={arrow.isHovered ? "1" : (arrow.isPending ? "1" : "0.9")}
              className={arrow.isPending ? "animate-[dash_1s_linear_infinite]" : ""}
            />

            {/* The "Flowing" highlight on top when hovered */}
            {arrow.isHovered && (
                <path
                  d={`M ${arrow.x1} ${arrow.y1} Q ${cx} ${cy} ${nx2} ${ny2}`}
                  fill="none"
                  stroke={`url(#grad-${arrow.id})`}
                  strokeWidth="4"
                  pointerEvents="none"
                />
            )}
            
            {/* Manual Arrowhead for pixel-perfect placement */}
            <path 
              d="M -18,-9 L 0,0 L -18,9 Z"
              fill={arrow.color}
              transform={`translate(${arrow.x2}, ${arrow.y2}) rotate(${(angle * 180) / Math.PI})`}
              opacity={arrow.isHovered ? "1" : (arrow.isPending ? "1" : "0.9")}
            />

            {/* Subtler Inner core - only for non-hovered items to add glow depth */}
            {!arrow.isHovered && (
                <path
                  d={`M ${arrow.x1} ${arrow.y1} Q ${cx} ${cy} ${nx2} ${ny2}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="1.2"
                  opacity="0.3"
                  pointerEvents="none"
                />
            )}
          </g>
        );
      })}
      
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -12;
          }
        }
      `}</style>
    </svg>
  );
});
