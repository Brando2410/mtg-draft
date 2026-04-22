// mutations.ts
// Structured engine mutations for undo/redo and logging

import { Zone } from "./core";

export const MutationType = {
    MOVE_CARD: 'MOVE_CARD',
    CHANGE_LIFE: 'CHANGE_LIFE',
    ADD_COUNTERS: 'ADD_COUNTERS',
    TAP_STATUS: 'TAP_STATUS',
    MANA_POOL: 'MANA_POOL',
    SUMMONING_SICKNESS: 'SUMMONING_SICKNESS',
    TRANSFORM: 'TRANSFORM',
    ATTACH: 'ATTACH'
} as const;
export type MutationType = typeof MutationType[keyof typeof MutationType];

export interface Mutation {
    type: MutationType;
    sourceId: string;
    payload: any;
    undoPayload: any;
    timestamp: number;
}

export interface MoveCardPayload {
    cardId: string;
    fromZone: Zone;
    toZone: Zone;
    fromPlayerId: string;
    toPlayerId: string;
    index?: number;
}
