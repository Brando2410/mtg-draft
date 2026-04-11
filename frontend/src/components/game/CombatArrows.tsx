import { memo, useState, useEffect } from 'react';
import { type GameObject } from '@shared/engine_types';

interface CombatArrowsProps {
  combat: any;
  battlefield: GameObject[];
  planningArrow?: { x1: number, y1: number, x2: number, y2: number } | null;
}

export const CombatArrows = memo(({ combat, battlefield, planningArrow }: CombatArrowsProps) => {
  const [coords, setCoords] = useState<{ x1: number, y1: number, x2: number, y2: number, color: string, isPlanning?: boolean }[]>([]);

  useEffect(() => {
    const update = () => {
      const bf = document.getElementById('battlefield-center')?.getBoundingClientRect();
      if (!bf || !combat) {
        setCoords([]);
        return;
      }

      const newCoords: any[] = [];
      
      // Attackers -> Target (Direct to Player or Planeswalker)
      combat.attackers.forEach((a: { attackerId: string, targetId: string }) => {
        const el = document.getElementById(`card-${a.attackerId}`);
        // First try to find card element (for PW targets), then fall back to player life element
        const targetEl = document.getElementById(`card-${a.targetId}`) || document.getElementById(`player-HP-${a.targetId}`); 
        
        if (el) {
          const r = el.getBoundingClientRect();
          let x2 = 60; 
          let y2 = bf.height / 4;

          if (targetEl) {
            const tr = targetEl.getBoundingClientRect();
            x2 = tr.left + tr.width/2 - bf.left;
            y2 = tr.top + tr.height/2 - bf.top;
          }

          newCoords.push({
            x1: r.left + r.width/2 - bf.left,
            y1: r.top + r.height/2 - bf.top,
            x2, 
            y2, 
            color: '#ef4444' 
          });
        }
      });

      // Blockers -> Attackers
      combat.blockers.forEach((b: { blockerId: string, attackerId: string }) => {
        const elB = document.getElementById(`card-${b.blockerId}`);
        const elA = document.getElementById(`card-${b.attackerId}`);
        if (elB && elA) {
          const rB = elB.getBoundingClientRect();
          const rA = elA.getBoundingClientRect();
          newCoords.push({
            x1: rB.left + rB.width/2 - bf.left,
            y1: rB.top + rB.height/2 - bf.top,
            x2: rA.left + rA.width/2 - bf.left,
            y2: rA.top + rA.height/2 - bf.top,
            color: '#fbbf24'
          });
        }
      });

      if (planningArrow) {
          newCoords.push({
              ...planningArrow,
              color: '#facc15', // Vibrant Gold for planning
              isPlanning: true
          });
      }

      setCoords(newCoords);
    };

    update();
    const interval = setInterval(update, 200);
    window.addEventListener('resize', update);
    return () => { clearInterval(interval); window.removeEventListener('resize', update); };
  }, [combat, battlefield]);

  return (
    <svg className="absolute inset-0 pointer-events-none z-[60]" style={{ width: '100%', height: '100%' }}>
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <marker id="head-red" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <path d="M0,0 L0,10 L10,5 Z" fill="#ef4444" />
        </marker>
        <marker id="head-yellow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <path d="M0,0 L0,10 L10,5 Z" fill="#facc15" />
        </marker>
      </defs>
      {coords.map((c, i) => (
        <g key={i} filter="url(#glow)">
            <line
                x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                stroke={c.color}
                strokeWidth={c.isPlanning ? "5" : "4"}
                strokeLinecap="round"
                markerEnd={c.color === '#ef4444' ? 'url(#head-red)' : 'url(#head-yellow)'}
                opacity={c.isPlanning ? "0.9" : "0.7"}
            />
            {/* Inner bright core */}
            <line
                x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
            />
        </g>
      ))}
    </svg>
  );
});
