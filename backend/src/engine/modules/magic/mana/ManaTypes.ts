// ManaTypes.ts
import { GameObjectId } from '@shared/engine_types';

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';

export interface ManaPoolRecord {
    W: number;
    U: number;
    B: number;
    R: number;
    G: number;
    C: number;
}

export interface RestrictedMana {
    color: ManaColor;
    amount: number;
    restrictions: string[];
}

export interface ManaRequirements {
    colored: Record<string, number>;
    generic: number;
    xCount: number;
}

export interface ManaSourceInfo {
    id: GameObjectId;
    colors: ManaColor[];
    isLand: boolean;
    producesAny?: boolean;
}

export interface ManaProductionYield {
    colors: Set<ManaColor>;
    hasChoice: boolean;
    choiceColors: string[];
    restrictions: string[];
}

export interface ManaSourceCandidate {
    obj: import('@shared/engine_types').GameObject;
    abilities: { ability: import('@shared/engine_types').AbilityDefinition, originalIndex: number }[];
    allPossibleColors: Set<ManaColor>;
    allPossibleColorsArray: ManaColor[];
    choiceColors: string[];
    
    // Scored properties for candidate selection
    aIdx?: number;
    cIdx?: number;
    versatility?: number;
    demandScore?: number;
    yieldScore?: number;
    currentYield?: number;
}
