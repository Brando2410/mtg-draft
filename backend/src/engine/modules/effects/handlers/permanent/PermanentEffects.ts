import { IEffectHandler } from "../../IEffectHandler";
import { PermanentHandler as LegacyHandler } from "./PermanentHandler";

export const DestroyHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleDestroy(state, effect, context);
    }
};

export const SacrificeHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleSacrifice(state, effect, context);
    }
};

export const UntapHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleUntap(state, effect, context);
    }
};

export const TapHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleTap(state, effect, context);
    }
};

export const FightHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleFight(state, effect, context);
    }
};

export const AddCountersHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleAddCounters(state, effect, context);
    }
};

export const DoubleCountersHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleDoubleCounters(state, effect, context);
    }
};

export const MoveCountersHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleMoveCounters(state, effect, context);
    }
};

export const CreateTokenHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleCreateToken(state, effect, context);
    }
};

export const CreateTokenCopyHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleCreateTokenCopy(state, effect, context);
    }
};

export const AttachHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleAttach(state, effect, context);
    }
};

export const PrepareHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handlePrepare(state, effect, context);
    }
};

export const UnprepareHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleUnprepare(state, effect, context);
    }
};

export const CreateEmblemHandler: IEffectHandler = {
    handle(state, effect, context) {
        return LegacyHandler.handleCreateEmblem(state, effect, context);
    }
};
