import { IConditionHandler } from "./IConditionHandler";
import { PermanentConditions } from "./handlers/PermanentConditions";
import { TurnConditions } from "./handlers/TurnConditions";
import { EventConditions } from "./handlers/EventConditions";
import { PlayerConditions } from "./handlers/PlayerConditions";
import { SpecializedConditions } from "./handlers/SpecializedConditions";

export const ConditionRegistry: Record<string, IConditionHandler> = {
    ...PermanentConditions,
    ...TurnConditions,
    ...EventConditions,
    ...PlayerConditions,
    ...SpecializedConditions,
    
    // Add any legacy aliases or cross-category maps here if needed
    "INFUSION": TurnConditions["GAINED_LIFE_THIS_TURN"],
};
