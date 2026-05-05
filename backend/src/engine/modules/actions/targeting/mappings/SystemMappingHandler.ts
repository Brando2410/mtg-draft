import { ITargetMappingHandler, TargetMappingContext } from "../TargetMappingRegistry";
import { TargetMapping } from "@shared/engine_types";

/**
 * Handles system-level mappings (THIS, SOURCE, LAST_MILLED_IDS, etc.)
 */
export class SystemMappingHandler implements ITargetMappingHandler {
    resolve(ctx: TargetMappingContext): string[] {
        const { state, mapping, context, effect } = ctx;
        
        const m = mapping.toUpperCase();
        switch (m) {
            case TargetMapping.This:
            case TargetMapping.Source:
            case TargetMapping.SourceObject:
            case TargetMapping.Self:
                return context.sourceId ? [context.sourceId] : [];
            
            case TargetMapping.LastMilledIds:
            case TargetMapping.LastMilled:
                return state.turnState.lastMilledIds || [];
            
            case TargetMapping.LastDiscardedIds:
                return state.turnState.lastDiscardedIds || [];
            
            case TargetMapping.AttachedTo:
            case TargetMapping.EnchantedPermanent:
            case TargetMapping.EnchantedCreature:
                // Logic for finding what this object is attached to
                return []; 
            
            default:
                return [];
        }
    }
}
