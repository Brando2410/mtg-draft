import { memo, useState, useEffect } from 'react';
import { type GameObject } from '@shared/engine_types';

interface CombatArrowsProps {
  combat: any;
  battlefield: GameObject[];
  planningArrow?: { x1: number, y1: number, x2: number, y2: number } | null;
}

export const CombatArrows = memo(({ combat, battlefield, planningArrow }: CombatArrowsProps) => {
  const [arrows, setArrows] = useState<{ x1: number, y1: number, x2: number, y2: number, id: string, color: string, isPlanning?: boolean }[]>([]);

  useEffect(() => {
    const update = () => {
      const bfCenter = document.getElementById('battlefield-center')?.getBoundingClientRect();
      if (!bfCenter || !combat) {
        setArrows([]);
        return;
      }

      const newArrows: any[] = [];
      
      // Attackers -> Target (Direct to Player or Planeswalker)
      combat.attackers.forEach((a: { attackerId: string, targetId: string }) => {
        const sourceEl = document.getElementById(`game-card-${a.attackerId}`);
        // First try to find card element (for PW targets), then fall back to player avatar
        const targetEl = document.getElementById(`game-card-${a.targetId}`) || document.getElementById(`player-avatar-${a.targetId}`); 
        
        if (sourceEl && targetEl) {
          const sRect = sourceEl.getBoundingClientRect();
          const tRect = targetEl.getBoundingClientRect();

          newArrows.push({
            id: `atk-${a.attackerId}-${a.targetId}`,
            x1: sRect.left + sRect.width / 2 - bfCenter.left,
            y1: sRect.top + sRect.height / 2 - bfCenter.top,
            x2: tRect.left + tRect.width / 2 - bfCenter.left,
            y2: tRect.top + tRect.height / 2 - bfCenter.top,
            color: '#ef4444' // Aggressive Red
          });
        }
      });

      // Blockers -> Attackers
      combat.blockers.forEach((b: { blockerId: string, attackerId: string }) => {
        const elB = document.getElementById(`game-card-${b.blockerId}`);
        const elA = document.getElementById(`game-card-${b.attackerId}`);
        if (elB && elA) {
          const rB = elB.getBoundingClientRect();
          const rA = elA.getBoundingClientRect();
          newArrows.push({
            id: `blk-${b.blockerId}-${b.attackerId}`,
            x1: rB.left + rB.width / 2 - bfCenter.left,
            y1: rB.top + rB.height / 2 - bfCenter.top,
            x2: rA.left + rA.width / 2 - bfCenter.left,
            y2: rA.top + rA.height / 2 - bfCenter.top,
            color: '#fbbf24' // Warning Gold
          });
        }
      });

      if (planningArrow) {
          newArrows.push({
              id: 'planning',
              ...planningArrow,
              color: '#facc15', // Vibrant Gold
              isPlanning: true
          });
      }

      setArrows(newArrows);
    };

    update();
    const interval = setInterval(update, 100);
    window.addEventListener('resize', update);
    return () => { clearInterval(interval); window.removeEventListener('resize', update); };
  }, [combat, battlefield, planningArrow]);

  return (
    <svg className="absolute inset-0 pointer-events-none z-[60]" style={{ width: '100%', height: '100%' }}>
      <defs>
        <filter id="combat-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {arrows.map((arrow) => {
        const dx = arrow.x2 - arrow.x1;
        const dy = arrow.y2 - arrow.y1;
        const midX = (arrow.x1 + arrow.x2) / 2;
        const midY = (arrow.y1 + arrow.y2) / 2;
        
        // Dynamic curve based on distance
        const distance = Math.sqrt(dx*dx + dy*dy);
        const curveAmount = Math.min(distance * 0.2, 80);
        
        // Offset the control point perpendicular to the line
        const cx = midX - dy * (curveAmount / distance || 0);
        const cy = midY + dx * (curveAmount / distance || 0);

        const angle = Math.atan2(arrow.y2 - cy, arrow.x2 - cx);
        const shrinkAmount = 18;
        const nx2 = arrow.x2 - Math.cos(angle) * shrinkAmount;
        const ny2 = arrow.y2 - Math.sin(angle) * shrinkAmount;

        return (
          <g key={arrow.id} filter="url(#combat-glow)">
            {/* Background Glow Line */}
            <path
              d={`M ${arrow.x1} ${arrow.y1} Q ${cx} ${cy} ${nx2} ${ny2}`}
              fill="none"
              stroke={arrow.color}
              strokeWidth={arrow.isPlanning ? "6" : "5"}
              strokeLinecap="round"
              opacity="0.2"
            />
            
            {/* Main Path */}
            <path
              d={`M ${arrow.x1} ${arrow.y1} Q ${cx} ${cy} ${nx2} ${ny2}`}
              fill="none"
              stroke={arrow.color}
              strokeWidth={arrow.isPlanning ? "3" : "2.5"}
              strokeLinecap="round"
              strokeDasharray={arrow.isPlanning ? "8,4" : "none"}
              opacity="0.8"
            />

            {/* Manual Arrowhead */}
            <path 
              d="M -16,-8 L 0,0 L -16,8 Z"
              fill={arrow.color}
              transform={`translate(${arrow.x2}, ${arrow.y2}) rotate(${(angle * 180) / Math.PI})`}
              opacity="0.9"
            />

            {/* Inner bright core */}
            <path
              d={`M ${arrow.x1} ${arrow.y1} Q ${cx} ${cy} ${nx2} ${ny2}`}
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.3"
            />
          </g>
        );
      })}
    </svg>
  );
});
