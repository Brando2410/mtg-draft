const fs = require('fs');
const pf = 'c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/modules/actions/TargetingProcessor.ts';
const content = fs.readFileSync(pf, 'utf-8');
const lines = content.split('\n');
const getLines = (start, end) => lines.slice(start - 1, end).join('\n');

const newContent = `import { GameObject, GameObjectId, GameState, PlayerId, Zone, TargetType, TargetMapping } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { ActionProcessor } from './ActionProcessor';
import { TargetValidator } from './TargetValidator';
import { TargetMapper } from './TargetMapper';

/**
 * Rules Engine Module: Targeting (Rule 115)
 * Retains interactive flow and facets while validation/mapping is extracted.
 */
export class TargetingProcessor {

    // --- FACADES FOR EXTRACTED MODULES ---
    public static calculateTotalCounts(targetDef: any, xValue: number = 0) { return TargetMapper.calculateTotalCounts(targetDef, xValue); }
    public static generateTargetPrompt(targetDef: any, selectedCount: number, xValue: number = 0, isSpellCasting: boolean = false) { return TargetMapper.generateTargetPrompt(targetDef, selectedCount, xValue, isSpellCasting); }
    public static findObjectInAnyZone(state: GameState, id: string): GameObject | null { return TargetValidator.findObjectInAnyZone(state, id); }
    public static isLegalTarget(state: GameState, sourceOrId: string | any, targetId: string, abilityTargetDef?: any, targetIndex: number = 0): boolean { return TargetValidator.isLegalTarget(state, sourceOrId, targetId, abilityTargetDef, targetIndex); }
    public static hasLegalTargets(state: GameState, sourceId: string, targetDef: any, controllerId: string): boolean { return TargetValidator.hasLegalTargets(state, sourceId, targetDef, controllerId); }
    public static matchesRestrictions(state: GameState, targetObj: any, restrictions: any[], controllerId: string | null, sourceId: string, log?: (msg: string) => void, stackObject?: any): boolean { return TargetValidator.matchesRestrictions(state, targetObj, restrictions, controllerId, sourceId, log, stackObject); }
    public static sourceHasQualities(source: any, qualities: string[], state?: GameState): boolean { return TargetValidator.sourceHasQualities(source, qualities, state); }
    public static resolveTargetMapping(state: GameState, mapping: string, targets: string[], sourceId: GameObjectId, controllerId: PlayerId, stackData?: any, effect?: any, parentContext?: any): string[] { return TargetMapper.resolveTargetMapping(state, mapping, targets, sourceId, controllerId, stackData, effect, parentContext); }
    public static getDefinitionForIndex(targetDef: any, targetIndex: number): any { return TargetMapper.getDefinitionForIndex(targetDef, targetIndex); }

` + '\n' + getLines(955, 1212) + '\n}\n';

fs.writeFileSync(pf, newContent);
console.log('Successfully refactored TargetingProcessor.ts!');
