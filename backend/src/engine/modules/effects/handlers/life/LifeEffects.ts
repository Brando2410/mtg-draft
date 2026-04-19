import { IEffectHandler } from "../../IEffectHandler";
import { LifeDamageHandler as LegacyHandler } from "./LifeDamageHandler";

export const DamageHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleDamage(state, effect, log, context);
    }
};

export const GainLifeHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleGainLife(state, effect, log, context);
    }
};

export const LoseLifeHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleLoseLife(state, effect, log, context);
    }
};


