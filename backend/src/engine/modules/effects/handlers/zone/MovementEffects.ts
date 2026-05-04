import { PlayerId } from "@shared/engine_types";
import { IEffectHandler } from "../../IEffectHandler";
import { MovementHandler as LegacyHandler } from "./MoveEffectHandler";

export const MovementHandler: IEffectHandler<any> = {
    handle(state, effect, context) {
        const { targets, controllerId } = context;
        const searchingPlayerId = (targets.find((tid: string) => state.players[tid as PlayerId]) as PlayerId) || controllerId;

        return LegacyHandler.handle(state, effect, {
            ...context,
            controllerId: searchingPlayerId,
        });
    }
};


