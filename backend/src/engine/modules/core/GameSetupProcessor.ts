import { GameState, PlayerId, Zone, GameObject } from '@shared/engine_types';
import { Card } from '@shared/types';
import { M21_LOGIC } from '../../data/m21_logic';

export class GameSetupProcessor {
  public static initializePlayers(
    state: GameState,
    playerIds: PlayerId[],
    names: Record<string, string>,
    decks: Record<string, Card[]>
  ) {
    for (const id of playerIds) {
      state.players[id] = {
        id,
        name: names[id] || `Player ${id.slice(0, 4)}`,
        life: 20,
        poisonCounters: 0,
        library: (decks[id] || []).map((cardRef, index) => this.createGameObject(id, cardRef, index)),
        hand: [],
        graveyard: [],
        manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
        hasPlayedLandThisTurn: false,
        fullControl: false,
        maxHandSize: 7,
        pendingDiscardCount: 0
      };
    }
  }

  private static createGameObject(ownerId: PlayerId, cardRef: Card, index: number): GameObject {
    const typeLine = cardRef.typeLine || cardRef.type_line || '';
    return {
      id: `${ownerId}-lib-${index}`,
      ownerId,
      controllerId: ownerId,
      zone: Zone.Library,
      definition: {
        name: cardRef.name || 'Unknown Card',
        manaCost: cardRef.manaCost || cardRef.mana_cost || '',
        colors: cardRef.card_colors || cardRef.colors || [],
        supertypes: [],
        types: typeLine.split(/[-—]/)[0].trim().split(/\s+/).filter(Boolean),
        subtypes: typeLine.includes('—') ? typeLine.split(/[-—]/)[1].trim().split(/\s+/).filter(Boolean) : [],
        oracleText: cardRef.oracleText || cardRef.oracle_text || '',
        type_line: typeLine,
        image_url: cardRef.image_url || cardRef.image_uris?.normal || cardRef.image_uris?.large,
        scryfall_id: (cardRef as any).scryfall_id || (cardRef as any).id,
        power: (cardRef as any).power,
        toughness: (cardRef as any).toughness,
        keywords: cardRef.keywords || []
      },
      isTapped: false,
      damageMarked: 0,
      deathtouchMarked: false,
      summoningSickness: false,
      abilitiesUsedThisTurn: 0,
      faceDown: false,
      keywords: [...(cardRef.keywords || [])],
      counters: ((cardRef as any).loyalty || M21_LOGIC[cardRef.name]?.loyalty)
        ? { loyalty: parseInt((cardRef as any).loyalty || M21_LOGIC[cardRef.name]?.loyalty) }
        : {}
    };
  }

  public static shuffleLibrary(state: GameState, playerId: PlayerId, log: (msg: string) => void) {
    const player = state.players[playerId];
    if (!player) return;
    log(`Shuffling library for: ${player.name}`);
    for (let i = player.library.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [player.library[i], player.library[j]] = [player.library[j], player.library[i]];
    }
  }

  public static drawCard(state: GameState, playerId: PlayerId, log: (msg: string) => void): boolean {
    const player = state.players[playerId];
    if (!player || player.library.length === 0) return false;
    const card = player.library.pop();
    if (card) {
      card.zone = Zone.Hand;
      player.hand.push(card);
      log(`${player.name} draws a card.`);
      return true;
    }
    return false;
  }
}
