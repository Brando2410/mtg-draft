import { GameObject, GameState, PlayerId, Zone } from '@shared/engine_types';
import { Card } from '@shared/types';
import { oracle } from '../../OracleLogicMap';
import { LogCategory, EngineLogger } from '../../utils/EngineLogger';

export class GameSetupProcessor {
  public static initializePlayers(
    state: GameState,
    playerIds: PlayerId[],
    names: Record<string, string>,
    decks: Record<string, Card[]>,
    avatars: Record<string, string> = {}
  ) {
    for (const id of playerIds) {
      state.players[id] = {
        id,
        playerId: id,
        controllerId: id,
        ownerId: id,
        name: names[id] || `Player ${id.slice(0, 4)}`,
        avatar: avatars[id],
        life: 20,
        poisonCounters: 0,
        library: (() => {
          const d = decks[id];
          let cards: any[] = [];
          if (Array.isArray(d)) cards = d;
          else if (d) cards = (d as any).mainEntry || (d as any).cards || [];
          return cards.map((cardRef, index) => this.createGameObject(id, cardRef, index));
        })(),
        hand: [],
        graveyard: [],
        sideboard: [],
        manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
        hasPlayedLandThisTurn: false,
        fullControl: false,
        maxHandSize: 7,
        pendingDiscardCount: 0,
        virtualHand: [],
        stops: {},
        autoOrderTriggers: false,
        passUntilEndOfTurn: false,
        extraTurns: 0,
        turnsToSkip: 0
      };
    }
  }

  public static createGameObject(ownerId: PlayerId, cardRef: Card, index: number): GameObject {
    const logicData = oracle.getCard(cardRef.name);
    let typeLine = cardRef.typeLine || cardRef.type_line || logicData?.type_line || '';

    // Normalize legacy "Enchant Creature" to "Enchantment — Aura"
    if (typeLine.toLowerCase().trim() === 'enchant creature') {
      typeLine = 'Enchantment — Aura';
    }
    const colorMap: any = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
    const rawColors = cardRef.colors || cardRef.card_colors || (cardRef as any).color || logicData?.colors || [];
    const normalizedColors = rawColors.map((c: string) => colorMap[c.toUpperCase()] || c.toLowerCase());

    const baseKeywords = logicData?.keywords || cardRef.keywords || [];

    // CR 205.4: Supertypes
    const knownSupertypes = ['basic', 'legendary', 'snow', 'world', 'ongoing'];
    const parts = typeLine ? typeLine.split('//')[0].split(/[-—]/) : [];
    const typePart = parts[0] ? parts[0].trim().split(/\s+/) : [];

    const supertypes = typePart.filter((t: string) => knownSupertypes.includes(t.toLowerCase()));
    const types = typePart.filter((t: string) => !knownSupertypes.includes(t.toLowerCase()));
    const subtypes = parts[1] ? parts[1].trim().split(/\s+/).filter(Boolean) : [];

    return {
      id: `${ownerId}-lib-${index}`,
      ownerId,
      controllerId: ownerId,
      zone: Zone.Library,
      definition: {
        name: cardRef.name || 'Unknown Card',
        manaCost: (cardRef.manaCost || (cardRef as any).mana_cost || logicData?.manaCost || '').split('//')[0].trim(),
        colors: normalizedColors,
        supertypes: supertypes.length > 0 ? supertypes : (logicData?.supertypes || []),
        types: types.length > 0 ? types : (logicData?.types || []),
        subtypes: subtypes.length > 0 ? subtypes : (logicData?.subtypes || []),
        oracleText: cardRef.oracleText || logicData?.oracleText || '',
        type_line: typeLine,
        image_url: cardRef.image_url || cardRef.image_uris?.normal || cardRef.image_uris?.large || logicData?.image_url,
        scryfall_id: cardRef.scryfall_id || cardRef.id || logicData?.scryfall_id,
        power: cardRef.power || logicData?.power,
        toughness: cardRef.toughness || logicData?.toughness,
        loyalty: cardRef.loyalty || logicData?.loyalty,
        keywords: baseKeywords,
        abilities: logicData?.abilities || [],
        flashbackCost: logicData?.flashbackCost || cardRef.flashbackCost || cardRef.flashback_cost,
        entersWithXCounters: logicData?.entersWithXCounters,
        entersTapped: logicData?.entersTapped,
        entersTappedCondition: logicData?.entersTappedCondition,
        entersPrepared: logicData?.entersPrepared,
        preparedFace: logicData?.preparedFace,
        faces: logicData?.faces,
        cannotBeCopied: logicData?.cannotBeCopied,
        exileOnResolution: logicData?.exileOnResolution
      },
      isTapped: false,
      damageMarked: 0,
      deathtouchMarked: false,
      summoningSickness: false,
      abilitiesUsedThisTurn: 0,
      faceDown: false,
      isPrepared: false,
      keywords: [...baseKeywords],
      counters: (cardRef.loyalty || logicData?.loyalty)
        ? { loyalty: parseInt(String(cardRef.loyalty || logicData?.loyalty)) }
        : {}
    };
  }

  public static shuffleLibrary(state: GameState, playerId: PlayerId) {
    const player = state.players[playerId];
    if (!player) return;
    EngineLogger.info(state, LogCategory.ACTION, `Shuffling library for: ${player.name}`);
    for (let i = player.library.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [player.library[i], player.library[j]] = [player.library[j], player.library[i]];
    }
  }
}
