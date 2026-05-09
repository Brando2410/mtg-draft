import { EffectType, GameState, EngineFrame } from "@shared/engine_types";
import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";
import { LogCategory } from "../../../../utils/EngineLogger";

/**
 * Unified handler for permission-granting effects.
 * Maps specialized effects (AllowPlayMilledCard, AllowPlayExiled) 
 * to system-recognized Continuous Effects.
 */
export const PermissionEffectHandler: IEffectHandler = {
    handle(state: GameState, effect: any, context: EngineFrame) {
        const { logger, effect: EP } = getProcessors(state);
        const { sourceId, controllerId, targets } = context;

        let targetIds = [...(targets || [])];
        let registeredType: string | undefined;

        switch (effect.type) {
            case EffectType.AllowPlayMilledCard:
                if (targetIds.length === 0) {
                    targetIds = state.turnState.lastMilledIds || [];
                }
                registeredType = EffectType.AllowCastFromGraveyard;
                break;

            case EffectType.AllowPlayExiled:
                if (targetIds.length === 0) {
                    targetIds = state.turnState.lastExiledIds || [];
                }
                registeredType = EffectType.AllowPlayExiled;
                break;

            case EffectType.AllowPlayFromTop:
                registeredType = EffectType.AllowPlayFromTop;
                break;

            case EffectType.AllowCastFromGraveyard:
                registeredType = EffectType.AllowCastFromGraveyard;
                break;

            default:
                registeredType = effect.type;
        }

        if (targetIds.length === 0 && effect.type !== EffectType.AllowPlayFromTop) {
            logger.debug(state, LogCategory.ACTION, `[PermissionEffectHandler] No targets found for ${effect.type}. Skipping.`);
            return;
        }

        // Delegate to ApplyContinuousEffect with the semantic type
        EP.executeEffect({
            state,
            effect: {
                ...effect,
                type: EffectType.ApplyContinuousEffect,
                registeredType: registeredType,
                targetIds: targetIds,
            },
            context: EP.createEngineFrame(state, {
                sourceId,
                targets: [],
                controllerIdOverride: controllerId,
                parentContext: context
            })
        });

        logger.info(state, LogCategory.ACTION, `[SYSTEM] Permission granted: ${registeredType} for ${targetIds.length} card(s).`);
    }
};

