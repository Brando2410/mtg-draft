import { PlayerId } from "@shared/engine_types";
import { IEffectHandler } from "../../IEffectHandler";
import { MoveEffectHandler as LegacyHandler } from "./MoveEffectHandler";

export const MovementHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { targets, controllerId } = context;
        const searchingPlayerId = (targets.find((tid: string) => state.players[tid as PlayerId]) as PlayerId) || controllerId;

        return LegacyHandler.handle(state, effect, {
            ...context,
            controllerId: searchingPlayerId,
        });
    }
};


