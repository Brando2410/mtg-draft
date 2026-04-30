import { IEffectHandler } from "../../IEffectHandler";
import { LifeDamageHandler as LegacyHandler } from "./LifeDamageHandler";

export const DamageHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleDamage(state, effect, context);
    }
};

export const GainLifeHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleGainLife(state, effect, context);
    }
};

export const LoseLifeHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleLoseLife(state, effect, context);
    }
};


