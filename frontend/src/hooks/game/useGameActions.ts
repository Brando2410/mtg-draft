import { socket } from '../../services/socket';

export const useGameActions = (roomId: string, playerId: string) => {
  const passPriority = () => {
    socket.emit('pass_priority', { roomId, playerId });
  };

  const toggleFullControl = () => {
    socket.emit('toggle_full_control', { roomId, playerId });
  };

  const toggleStop = (step: string) => {
    socket.emit('toggle_stop', { roomId, playerId, step });
  };

  const resolveCombatOrdering = (order: string[]) => {
    socket.emit('resolve_combat_ordering', { roomId, playerId, order });
  };

  const tapPermanent = (cardId: string) => {
    socket.emit('tap_permanent', { roomId, playerId, cardId });
  };

  const clearAttackers = () => {
    socket.emit('clear_attackers', { roomId, playerId });
  };

  const clearBlockers = () => {
    socket.emit('clear_blockers', { roomId, playerId });
  };

  const resolveTarget = (targetId: string) => {
    socket.emit('resolve_target', { roomId, playerId, targetId });
  };

  const resolveChoice = (choiceIndex: number | string) => {
    socket.emit('resolve_choice', { roomId, playerId, choiceIndex });
  };

  const playCard = (cardInstanceId: string) => {
    socket.emit('play_card', { roomId, playerId, cardInstanceId });
  };

  const discardCard = (cardId: string) => {
    socket.emit('discard_card', { roomId, playerId, cardId });
  };

  const togglePassTurn = () => {
    socket.emit('toggle_pass_turn', { roomId, playerId });
  };



  const allAttack = (battlefield: any[], attackers: any[] = []) => {
    const creatures = battlefield.filter((obj: any) => {
      const isMyCreature = obj.controllerId === playerId && 
                          (obj.definition.types.includes('Creature') || (obj.definition.type_line || '').toLowerCase().includes('creature'));
      const alreadyAttacking = attackers.some((a: any) => a.attackerId === obj.id);
      const hasHaste = (obj.definition.keywords || []).includes('Haste') || (obj.effectiveStats?.keywords || []).includes('Haste');
      const canAttack = !obj.isTapped && (!obj.summoningSickness || hasHaste);
      return isMyCreature && !alreadyAttacking && canAttack;
    });

    creatures.forEach((c: any) => tapPermanent(c.id));
  };

  const concede = () => {
    socket.emit('concede', { roomId, playerId });
  };

  const requestMatchRestart = () => {
    socket.emit('request_match_restart', { roomId, playerId });
  };

  const acceptMatchRestart = () => {
    socket.emit('accept_match_restart', { roomId, playerId });
  };

  const declineMatchRestart = () => {
    socket.emit('decline_match_restart', { roomId, playerId });
  };

  return {
    passPriority,
    toggleFullControl,
    toggleStop,
    resolveCombatOrdering,
    tapPermanent,
    clearAttackers,
    clearBlockers,
    resolveTarget,
    resolveChoice,
    playCard,
    discardCard,
    togglePassTurn,
    allAttack,
    concede,
    requestMatchRestart,
    acceptMatchRestart,
    declineMatchRestart,
    socket
  };
};
