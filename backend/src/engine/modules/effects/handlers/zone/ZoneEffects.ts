import { IEffectHandler } from "../../IEffectHandler";
import { DrawCardsHandler } from "./DrawCardsHandler";
import { MillEffectHandler } from "./MillEffectHandler";
import { DiscardEffectHandler } from "./DiscardEffectHandler";
import { ScrySurveilHandler } from "./ScrySurveilHandler";
import { SearchEffectHandler } from "./SearchEffectHandler";

export const DrawCardsEffectHandler: IEffectHandler = {
    handle: (state, effect, log, context) => DrawCardsHandler.handle(state, effect, log, context)
};

export const MillHandler: IEffectHandler = {
    handle: (state, effect, log, context) => MillEffectHandler.handle(state, effect, log, context)
};

export const DiscardHandler: IEffectHandler = {
    handle: (state, effect, log, context) => DiscardEffectHandler.handle(state, effect, log, context)
};

export const ScrySurveilEffectHandler: IEffectHandler = {
    handle: (state, effect, log, context) => ScrySurveilHandler.handle(state, effect, log, context)
};

export const SearchHandler: IEffectHandler = {
    handle: (state, effect, log, context) => SearchEffectHandler.handle(state, effect, log, context)
};
