import { IEffectHandler } from "../../IEffectHandler";
import { DiscardEffectHandler } from "./DiscardEffectHandler";
import { DrawCardsHandler } from "./DrawCardsHandler";
import { MillEffectHandler } from "./MillEffectHandler";
import { ScrySurveilHandler } from "./ScrySurveilHandler";
import { SearchEffectHandler } from "./SearchEffectHandler";

export const DrawCardsEffectHandler: IEffectHandler<any> = {
    handle: (state, effect, context) => DrawCardsHandler.handle(state, effect, context)
};

export const MillHandler: IEffectHandler<any> = {
    handle: (state, effect, context) => MillEffectHandler.handle(state, effect, context)
};

export const DiscardHandler: IEffectHandler<any> = {
    handle: (state, effect, context) => DiscardEffectHandler.handle(state, effect, context)
};

export const ScrySurveilEffectHandler: IEffectHandler<any> = {
    handle: (state, effect, context) => ScrySurveilHandler.handle(state, effect, context)
};

export const SearchHandler: IEffectHandler<any> = {
    handle: (state, effect, context) => SearchEffectHandler.handle(state, effect, context)
};
