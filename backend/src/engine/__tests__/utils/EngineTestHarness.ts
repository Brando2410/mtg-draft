import { GameEngine } from '../../GameEngine';
import { PlayerId, Zone, GameObject } from '@shared/engine_types';
import { oracle } from '../../OracleLogicMap';

export class EngineTestHarness {
    public engine: GameEngine;

    constructor() {
        const decks: Record<string, any[]> = {
            'Player1': new Array(60).fill({ name: 'Plains' }),
            'Player2': new Array(60).fill({ name: 'Plains' })
        };
        this.engine = new GameEngine(['Player1', 'Player2'], decks);
        this.engine.shouldLog = false;
    }

    public setupGame() {
        this.engine.startGame();
        return {
            engine: this.engine,
            state: this.engine.getState(),
            p1: this.engine.getState().players['Player1'],
            p2: this.engine.getState().players['Player2']
        };
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 11);
    }

    public createCardObject(cardName: string, ownerId: PlayerId, zone: Zone): GameObject | null {
        const def = oracle.getCard(cardName);
        if (!def) return null;

        return {
            id: `card_${this.generateId()}`,
            ownerId,
            controllerId: ownerId,
            zone,
            definition: def,
            isTapped: false,
            damageMarked: 0,
            summoningSickness: true,
            abilitiesUsedThisTurn: 0,
            faceDown: false,
            isPrepared: false,
            keywords: [],
            deathtouchMarked: false,
            counters: {}
        };
    }

    public putCardInZone(playerId: string, cardName: string, zone: Zone): GameObject | null {
        const pId = playerId as PlayerId;
        const obj = this.createCardObject(cardName, pId, zone);
        if (!obj) return null;

        const state = this.engine.getState();
        if (zone === Zone.Battlefield) {
            state.battlefield.push(obj);
            const { RegistryProcessor } = require('../../modules/core/RegistryProcessor');
            RegistryProcessor.registerAbilities(state, obj);
        } else if (zone === Zone.Hand) {
            state.players[pId].hand.push(obj);
        } else if (zone === Zone.Graveyard) {
            state.players[pId].graveyard.push(obj);
        } else if (zone === Zone.Library) {
            state.players[pId].library.push(obj);
        }
        
        return obj;
    }

    public addMana(playerId: string, config: {W?: number, U?: number, B?: number, R?: number, G?: number, C?: number}) {
        const pId = playerId as PlayerId;
        const pool = this.engine.getState().players[pId].manaPool;
        if (config.W) pool.W += config.W;
        if (config.U) pool.U += config.U;
        if (config.B) pool.B += config.B;
        if (config.R) pool.R += config.R;
        if (config.G) pool.G += config.G;
        if (config.C) pool.C += config.C;
    }

    public resolveStack() {
        const state = this.engine.getState();
        let loopLimit = 100;
        while (state.stack.length > 0 && !state.pendingAction && loopLimit > 0) {
            this.engine.passPriority(state.priorityPlayerId as PlayerId, true);
            loopLimit--;
        }
    }

    public chooseOption(label: string) {
        const state = this.engine.getState();
        if (!state.pendingAction || !state.pendingAction.data?.choices) return;
        const choices = state.pendingAction.data.choices;
        const index = choices.findIndex((c: any) => c.label === label || c.value === label);
        if (index !== -1) {
            this.engine.resolveChoice(state.pendingAction.playerId as PlayerId, index);
        }
    }

    public chooseTarget(targetId: string) {
        const state = this.engine.getState();
        if (!state.pendingAction) return;
        if (state.pendingAction.type === 'TARGETING') {
            this.engine.resolveTargeting(state.pendingAction.playerId as PlayerId, targetId);
        } else if (state.pendingAction.type === 'ModalSelection' && state.pendingAction.data?.choices) {
            this.chooseOption(targetId);
        }
    }
}
