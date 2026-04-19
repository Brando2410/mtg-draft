import { IEffectHandler } from "../../IEffectHandler";
import { PermanentHandler as LegacyHandler } from "./PermanentHandler";

export const DestroyHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleDestroy(state, effect, log, context);
    }
};

export const SacrificeHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleSacrifice(state, effect, log, context);
    }
};

export const UntapHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleUntap(state, effect, log, context);
    }
};

export const TapHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleTap(state, effect, log, context);
    }
};

export const FightHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleFight(state, effect, log, context);
    }
};

export const AddCountersHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleAddCounters(state, effect, log, context);
    }
};

export const DoubleCountersHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleDoubleCounters(state, effect, log, context);
    }
};

export const MoveCountersHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleMoveCounters(state, effect, log, context);
    }
};

export const CreateTokenHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleCreateToken(state, effect, log, context);
    }
};

export const CreateTokenCopyHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleCreateTokenCopy(state, effect, log, context);
    }
};

export const AttachHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleAttach(state, effect, log, context);
    }
};

export const PrepareHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handlePrepare(state, effect, log, context);
    }
};

export const UnprepareHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleUnprepare(state, effect, log, context);
    }
};

export const CreateEmblemHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyHandler.handleCreateEmblem(state, effect, log, context);
    }
};


