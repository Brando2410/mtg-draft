export interface Card {
    // --- Identity ---
    id: string;           // Unique instance ID (GUID) generated for each card in a draft/game
    scryfall_id: string;  // External reference ID (usually Scryfall UUID)
    name: string;
    
    // --- Visuals ---
    image_url: string;
    back_image_url?: string;
    rarity: string;

    // --- Core Stats ---
    manaCost: string;
    cmc: number;
    colors: string[];
    typeLine: string;
    
    // --- Details ---
    oracleText?: string;
    power?: string;
    toughness?: string;
    loyalty?: string | number;
    keywords: string[];

    // --- UI/Logic Helpers ---
    types: string[];
    supertypes: string[];
    
    // --- Legacy / Deprecated (To be removed after migration) ---
    mana_cost?: string;
    type_line?: string;
    card_colors?: string[];
}

export interface Player {
    id: string; // Socket ID
    playerId: string; // Persistent UUID/Unique ID
    name: string;
    avatar: string;
    online: boolean;
    isBot?: boolean; // New property to identify bots
    lastSeen: number;
    pool: Card[];
    matchWins?: number;
    deck?: Card[] | { name?: string; cards?: Card[]; mainEntry?: Card[] };
    isReady?: boolean;
}

export interface Rules {
    playerCount: number;
    packsPerPlayer: number;
    cardsPerPack: number;
    timer: number | null;
    rarityBalance: boolean;
    anonymousMode: boolean;
    fillBots: boolean; // New setting to fill missing players with bots
    cubeName: string;
    isNormalMatch?: boolean;
    isSealed?: boolean;
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

export * from './engine_types';
import { type GameState } from './engine_types';

export interface Room {
    id: string;
    host: string; // Socket ID
    hostPlayerId: string;
    players: Player[];
    status: 'waiting' | 'drafting' | 'deckbuilding' | 'active' | 'tournament' | 'completed';
    isPaused: boolean;
    cube: {
        name: string;
        cards: Card[];
    };
    rules: Rules;
    isNormalMatch?: boolean;
    draftState?: DraftState;
    gameState?: GameState;
    matches?: {
        players: string[];
        wins: Record<string, number>;
        status: 'pending' | 'active' | 'completed';
        engineState?: any;
        joinedPlayers?: string[];
    }[];
    checkpoint?: GameState; // DEBUG: Saved game state
    serverTime?: number;
}