import { GameObject, GameState, Zone, StackObject } from "@shared/engine_types";

/**
 * LkiProcessor: Manages Last Known Information (Rule 608.2h)
 * Stores snapshots of game objects right before they change zones.
 */
export class LkiProcessor {
  /**
   * Captures a snapshot of the object before it moves.
   */
  public static saveSnapshot(state: GameState, obj: GameObject | StackObject, leavingZone: Zone) {
    if (!state.lki) {
      state.lki = {};
    }

    if (!state.lki[obj.id]) {
      state.lki[obj.id] = {};
    }

    if (leavingZone === Zone.Stack) {
      // StackObjects are distinct from GameObjects and contain critical resolution data (targets, modes)
      state.lki[obj.id]![leavingZone] = JSON.parse(JSON.stringify(obj));
      return;
    }

    const card = obj as GameObject;
    // Deep clone important properties for look-back triggers
    state.lki[obj.id]![leavingZone] = {
      ...card,
      definition: { ...card.definition },
      counters: { ...card.counters },
      effectiveStats: card.effectiveStats ? { ...card.effectiveStats } : undefined,
    } as GameObject;
  }

  /**
   * Retrieves LKI for an object from its last known state in a specific zone.
   * If zone is omitted, it returns the most recent LKI from any public zone.
   */
  public static getLki(state: GameState, objId: string, expectedZone?: Zone): any | null {
    if (!state.lki || !state.lki[objId]) return null;

    const record = state.lki[objId]!;
    
    if (expectedZone) {
      return record[expectedZone] || null;
    }

    // Public zones priority order for generic LKI lookups (CR 400.7)
    const priority: Zone[] = [Zone.Battlefield, Zone.Stack, Zone.Graveyard, Zone.Exile, Zone.Hand, Zone.Library];
    for (const zone of priority) {
      if (record[zone]) return record[zone]!;
    }

    return null;
  }

  /**
   * Cleans up LKI for a specific turn to prevent memory bloat if needed.
   * Generally LKI should persist until the turn ends or objects move again.
   */
  public static clear(state: GameState) {
    state.lki = {};
  }
}
