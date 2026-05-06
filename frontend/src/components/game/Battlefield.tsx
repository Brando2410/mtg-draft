import { memo } from 'react';
import { type PlayerState, type GameObject, type StackObject } from '@shared/engine_types';

// Modular Components
import { CombatArrows } from './CombatArrows';
import { StackView } from './StackView';
import { TargetingArrows } from './TargetingArrows';
import { ChoiceModal } from './modals/ChoiceModal';
import { XSelectionModal } from './modals/XSelectionModal';
import { ZonePile } from './ZonePile';
import { Avatar } from './Avatar';
import { SubZone } from './battlefield/SubZone';
import { ActionPrompt } from './battlefield/ActionPrompt';
import { useBattlefieldLogic } from '../../hooks/game/useBattlefieldLogic';

interface BattlefieldProps {
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  battlefield: GameObject[];
  stack: StackObject[];
  combat: any;
  exile: any[];
  currentStep: string;
  currentPhase: string;
  onTapCard: (id: string) => void;
  onChoiceResolve: (payload: any) => void;
  hoveredCardId?: string;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
  pendingAction?: any;
  onInspectZone: (zone: { label: string, cards: GameObject[], type: 'graveyard' | 'exile', isMe: boolean }) => void;
  onToggleStop: (step: string) => void;
  onAvatarClick: (isOpponent: boolean) => void;
  scrySurveilResult?: any;
  activePlayerId: string;
  priorityPlayerId: string | null;
}

export const Battlefield = memo(({ 
  me, opponent, battlefield, stack, combat, exile, currentStep, currentPhase, pendingAction, onTapCard,
  onChoiceResolve,
  hoveredCardId,
  onHoverStart,
  onHoverEnd,
  onInspectZone,
  onToggleStop,
  onAvatarClick,
  scrySurveilResult,
  activePlayerId,
  priorityPlayerId
}: BattlefieldProps) => {
  const { setMousePos, planningArrow, targetableIds, zones } = useBattlefieldLogic(me, opponent, battlefield, pendingAction);

  return (
    <div className="flex-1 relative flex flex-col bg-transparent">
      
      <ChoiceModal 
        pendingAction={pendingAction} me={me} opponent={opponent} battlefield={battlefield}
        stack={stack} exile={exile} onTapCard={onTapCard} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} 
      />
      <XSelectionModal pendingAction={pendingAction} me={me} onResolve={onChoiceResolve} />

      <div 
        className="flex-1 flex flex-col relative" 
        id="battlefield-center"
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      >
        <CombatArrows battlefield={battlefield} combat={combat} planningArrow={planningArrow} />
        <TargetingArrows stack={stack} battlefield={battlefield} pendingAction={pendingAction} hoveredCardId={hoveredCardId} />
        
        {/* OPPONENT SIDE */}
        <div className="w-full h-1/2 flex flex-col relative">
           <div className="h-[30%] flex items-center justify-end px-[0.5vw] bg-black/40 border-b border-white/5 shrink-0 overflow-hidden">
                <div className="flex gap-[2vh] h-[85%] items-center">
                    {(exile || []).filter(o => o.ownerId === opponent?.id).length > 0 && (
                        <ZonePile label="exile" count={(exile || []).filter(o => o.ownerId === opponent?.id).length} cards={(exile || []).filter(o => o.ownerId === opponent?.id)} type="exile" onClick={() => onInspectZone({ label: "Enemy Exile", cards: (exile || []).filter(o => o.ownerId === opponent?.id), type: 'exile', isMe: false })} />
                    )}
                    <ZonePile label="grave" count={opponent?.graveyard.length || 0} cards={opponent?.graveyard} type="graveyard" onClick={() => onInspectZone({ label: "Enemy Graveyard", cards: opponent?.graveyard || [], type: 'graveyard', isMe: false })} />
                    <ZonePile label="lib" count={opponent?.library.length || 0} type="library" />
                </div>
           </div>

           <div className="h-[35%] grid grid-cols-[1fr,12vh,1fr] border-b border-white/5 bg-black/20 px-[0.5vw] relative shrink-0">
                <div className="h-full border-r border-white/5">
                    <SubZone cards={zones.opp.lands} allBattlefieldCards={battlefield} label="Lands" align="start" onTapCard={onTapCard} stackSameName={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
                </div>
                
                <div className="h-full flex items-center justify-center shrink-0 bg-black/10 z-10">
                    {opponent && (
                        <Avatar 
                            player={opponent} isOpponent isActive={opponent.id === activePlayerId} 
                            isPriority={opponent.id === priorityPlayerId || (pendingAction?.playerId === opponent.id)}
                            onToggleStop={onToggleStop} viewerStops={me?.stops} currentStep={currentStep as any}
                            currentPhase={currentPhase as any} scrySurveilResult={scrySurveilResult} onClick={() => onAvatarClick(true)}
                        />
                    )}
                </div>

                <div className="h-full border-l border-white/5">
                    <SubZone cards={zones.opp.nonCreatures} allBattlefieldCards={battlefield} label="Support" align="end" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
                </div>
           </div>

           <div className="h-[35%] relative shrink-0 px-[0.5vw]">
                <SubZone cards={zones.opp.creatures} allBattlefieldCards={battlefield} label="Opponent Creatures" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
           </div>
        </div>

        {/* MIDDLE DIVIDER GAP */}
        <div className="w-full h-[3vh] border-y border-white/5 bg-white/[0.01] relative z-10 flex items-center justify-center py-[0.5vh] shrink-0">
            <ActionPrompt pendingAction={pendingAction} isMe={pendingAction?.playerId === me?.id} />
        </div>

        {/* PLAYER SIDE */}
        <div className="w-full h-1/2 flex flex-col relative">
           <div className="h-[35%] border-b border-white/5 shrink-0 px-[0.5vw]">
                <SubZone cards={zones.me.creatures} allBattlefieldCards={battlefield} label="Your Creatures" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
           </div>

           <div className="h-[35%] grid grid-cols-[1fr,12vh,1fr] bg-black/20 border-b border-white/5 px-[0.5vw] relative shrink-0">
                <div className="h-full border-r border-white/5">
                    <SubZone cards={zones.me.lands} allBattlefieldCards={battlefield} label="Your Lands" align="start" onTapCard={onTapCard} stackSameName={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
                </div>

                <div className="h-full flex items-center justify-center shrink-0 bg-black/10 z-10">
                    {me && (
                        <Avatar 
                            player={me} isActive={me.id === activePlayerId}
                            isPriority={me.id === priorityPlayerId || (pendingAction?.playerId === me.id)}
                            onToggleStop={onToggleStop} viewerStops={me.stops} currentStep={currentStep as any}
                            currentPhase={currentPhase as any} scrySurveilResult={scrySurveilResult} onClick={() => onAvatarClick(false)}
                        />
                    )}
                </div>

                <div className="h-full border-l border-white/5">
                    <SubZone cards={zones.me.nonCreatures} allBattlefieldCards={battlefield} label="Your Support" align="end" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
                </div>
           </div>

           <div className="h-[30%] flex items-center justify-start px-[0.5vw] bg-black/40 shrink-0 overflow-hidden">
                <div className="flex gap-[2vh] h-[85%] items-center">
                    <ZonePile label="lib" count={me?.library.length || 0} type="library" />
                    <ZonePile label="grave" count={me?.graveyard.length || 0} cards={me?.graveyard} type="graveyard" onClick={() => onInspectZone({ label: "Your Graveyard", cards: me?.graveyard || [], type: 'graveyard', isMe: true })} />
                    {(exile || []).filter(o => o.ownerId === me?.id).length > 0 && (
                        <ZonePile label="exile" count={(exile || []).filter(o => o.ownerId === me?.id).length} cards={(exile || []).filter(o => o.ownerId === me?.id)} type="exile" onClick={() => onInspectZone({ label: "Your Exile", cards: (exile || []).filter(o => o.ownerId === me?.id), type: 'exile', isMe: true })} />
                    )}
                </div>
           </div>
        </div>

        {/* STACK OVERLAY */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-50 overflow-visible">
            <StackView 
                stack={stack} pendingAction={pendingAction} me={me} opponent={opponent} exile={exile} battlefield={battlefield}
                onTapCard={onTapCard} targetableIds={targetableIds}
                onHoverStart={onHoverStart} onHoverEnd={onHoverEnd}
            />
        </div>
      </div>
    </div>
  );
});
