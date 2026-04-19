import { PlayerId } from "@shared/engine_types";
import { IEffectHandler } from "../../IEffectHandler";
import { MoveEffectHandler as LegacyHandler } from "./MoveEffectHandler";

export const MovementHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { targets, controllerId } = context;
        
        log(`[DEBUG] EffectProcessor: Dispatching ${effect.type} for targets: ${targets}`);
        
        const searchingPlayerId = (targets.find((tid: string) => state.players[tid as PlayerId]) as PlayerId) || controllerId;
        
        return LegacyHandler.handle(state, effect, log, {
            ...context,
            controllerId: searchingPlayerId,
        });
    }
};


