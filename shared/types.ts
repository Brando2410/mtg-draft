export interface Card {
  id: string; // Unique instance ID generated on draft start
  scryfall_id?: string;
  name: string;
  rarity?: string;
  cmc?: number;
  card_colors?: string[];
  color?: string;
  image_uris?: {
    normal: string;
    small: string;
  };
  back_image_url?: string; // Nuova proprietà per le carte bifronte
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
}

export interface Player {
  id: string; // Socket ID
  playerId: string; // Persistent UUID/Unique ID
  name: string;
  avatar: string;
  online: boolean;
  lastSeen: number;
  pool: Card[];
}

export interface Rules {
  playerCount: number;
  packsPerPlayer: number;
  cardsPerPack: number;
  timer: number | null;
  rarityBalance: boolean;
  anonymousMode: boolean;
  cubeName: string;
}

export interface DraftState {
  round: number;
  totalPicksInRound: number;
  unopenedPacks: Card[][][]; // [playerIndex][packSlot][cards]
  queues: Card[][][];        // [playerIndex][queueSlot][cards]
  playerTimers: Record<string, number | null>; // playerId -> timestamp
  isPaused: boolean;
  timeLeftPaused: number | null;
  selections: Record<string, string | null>; // playerId -> cardId
  playerTimersRemaining?: Record<string, number>; // playerId -> remainingMs
}

export interface Room {
  id: string;
  host: string; // Socket ID
  hostPlayerId: string;
  players: Player[];
  status: 'waiting' | 'drafting' | 'completed';
  isPaused: boolean;
  cube: {
    name: string;
    cards: Card[];
  };
  rules: Rules;
  draftState?: DraftState;
  serverTime?: number;
}
