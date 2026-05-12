import { GameState, PlayerId, ActionType, Zone } from '@shared/engine_types';
import { EngineContext } from '../../interfaces/EngineContext';
import { getProcessors } from '../ProcessorRegistry';
import { EngineLogger, LogCategory } from '../../utils/EngineLogger';

export class MulliganProcessor {
  public static initialize(state: GameState, engine: EngineContext) {
    state.mulliganState = {
      mulliganCounts: {},
      decisions: {},
      discardsComplete: {},
      isStartingPlayerSelected: false,
      isComplete: false
    };

    for (const playerId of state.playerOrder) {
      state.mulliganState.mulliganCounts[playerId] = 0;
      state.mulliganState.decisions[playerId] = 'none';
      state.mulliganState.discardsComplete[playerId] = false;
      engine.processors.action.shuffleLibrary(state, playerId);
    }

    // Step 1: Choose starting player
    this.promptStartingPlayerSelection(state, engine);
  }

  public static promptStartingPlayerSelection(state: GameState, engine: EngineContext) {
    const hostId = state.playerOrder[0]; // Simple default: host chooses
    state.pendingAction = {
      playerId: hostId,
      type: ActionType.StartingPlayerSelection,
      data: {
        label: 'Choose who goes first',
        choices: [
          { label: 'Me', value: hostId },
          { label: 'Opponent', value: state.playerOrder[1] }
        ]
      }
    };
    EngineLogger.info(state, LogCategory.ACTION, `Waiting for ${engine.getPlayerName(hostId)} to choose starting player.`);
  }

  public static resolveStartingPlayer(state: GameState, engine: EngineContext, chosenPlayerId: PlayerId) {
    if (!state.mulliganState) return;

    state.mulliganState.startingPlayerId = chosenPlayerId;
    state.mulliganState.isStartingPlayerSelected = true;
    state.activePlayerId = chosenPlayerId;
    state.priorityPlayerId = chosenPlayerId;

    // Reorder playerOrder so starting player is first
    const index = state.playerOrder.indexOf(chosenPlayerId);
    if (index !== -1) {
      const newOrder = [...state.playerOrder.slice(index), ...state.playerOrder.slice(0, index)];
      state.playerOrder = newOrder;
    }

    EngineLogger.info(state, LogCategory.ACTION, `${engine.getPlayerName(chosenPlayerId)} will go first.`);

    // Draw initial hands
    for (const playerId of state.playerOrder) {
      for (let i = 0; i < 7; i++) {
        engine.drawCard(playerId);
      }
    }

    this.promptMulligan(state, engine);
  }

  public static promptMulligan(state: GameState, engine: EngineContext): void {
    if (!state.mulliganState) return;

    // Find first player who hasn't decided
    const nextPlayerId = state.playerOrder.find(id => state.mulliganState!.decisions[id] === 'none');

    if (nextPlayerId) {
      const player = state.players[nextPlayerId];

      state.pendingAction = {
        playerId: nextPlayerId,
        type: ActionType.Mulligan,
        data: {
          label: `Mulligan decision (Mulligans: ${state.mulliganState.mulliganCounts[nextPlayerId]})`,
          mCount: state.mulliganState.mulliganCounts[nextPlayerId],
          choices: [
            { label: 'Keep', value: 'keep' },
            { label: 'Mulligan', value: 'mulligan' }
          ]
        }
      };
      EngineLogger.info(state, LogCategory.ACTION, `Waiting for ${engine.getPlayerName(nextPlayerId)}'s mulligan decision.`);
    } else {
      // All decided
      this.finalizeMulligans(state, engine);
    }
  }

  public static resolveMulligan(state: GameState, engine: EngineContext, playerId: PlayerId, decision: 'keep' | 'mulligan'): void {
    if (!state.mulliganState) return;

    if (decision === 'mulligan') {
      state.mulliganState.mulliganCounts[playerId]++;
      const player = state.players[playerId];

      // London Mulligan: Put hand back, shuffle, draw 7
      player.library.push(...player.hand);
      player.hand = [];
      engine.processors.action.shuffleLibrary(state, playerId);

      for (let i = 0; i < 7; i++) {
        engine.drawCard(playerId);
      }

      state.mulliganState.decisions[playerId] = 'none'; // Needs to decide again
      EngineLogger.info(state, LogCategory.ACTION, `${engine.getPlayerName(playerId)} chose to mulligan (Total: ${state.mulliganState.mulliganCounts[playerId]}).`);
    } else {
      state.mulliganState.decisions[playerId] = 'keep';
      EngineLogger.info(state, LogCategory.ACTION, `${engine.getPlayerName(playerId)} chose to keep.`);
    }

    this.promptMulligan(state, engine);
  }

  public static finalizeMulligans(state: GameState, engine: EngineContext): void {
    if (!state.mulliganState) return;

    // Check if anyone needs to put cards back (London Mulligan)
    for (const playerId of state.playerOrder) {
      const mCount = state.mulliganState.mulliganCounts[playerId];
      const isDone = !!state.mulliganState.discardsComplete[playerId];

      EngineLogger.debug(state, LogCategory.ACTION, `[MULLIGAN-CHECK] Player: ${playerId}, mCount: ${mCount}, isDone: ${isDone}`);

      if (mCount > 0 && !isDone) {
        const player = state.players[playerId];
        
        player.pendingDiscardCount = mCount;
        state.pendingAction = {
          type: ActionType.Discard,
          playerId,
          count: mCount,
          data: {
            label: `Select ${mCount} card(s) to put on the bottom of your library`,
            isMulliganPutBack: true
          }
        };
        EngineLogger.info(state, LogCategory.ACTION, `${engine.getPlayerName(playerId)} must put ${mCount} cards on the bottom.`);
        return; // Handle one at a time for simplicity
      }
    }

    // All done
    EngineLogger.info(state, LogCategory.ACTION, `[MULLIGAN-CLEANUP] All mulligans resolved. Clearing pending action.`);
    state.mulliganState.isComplete = true;
    state.pendingAction = undefined;
    state.turnState.cardsDrawnThisTurn = {};
    engine.resetPriorityToActivePlayer();
    EngineLogger.info(state, LogCategory.ACTION, `Game started!`);
  }

  public static resolvePutBack(state: GameState, engine: EngineContext, playerId: PlayerId, cardIds: string[]): void {
    const player = state.players[playerId];
    if (!player) return;

    for (const id of cardIds) {
      const index = player.hand.findIndex(c => c.id === id);
      if (index !== -1) {
        const [card] = player.hand.splice(index, 1);
        card.zone = Zone.Library;
        player.library.unshift(card); // Bottom of library (library is treated as a stack where pop is top, so unshift is bottom? Wait.)
        // Let's check GameSetupProcessor or MovementHandler to see which end of the array is top/bottom.
      }
    }

    // Reset mulligan count so we don't prompt again
    if (state.mulliganState) {
      state.mulliganState.discardsComplete[playerId] = true;
    }

    this.finalizeMulligans(state, engine);
  }
}
