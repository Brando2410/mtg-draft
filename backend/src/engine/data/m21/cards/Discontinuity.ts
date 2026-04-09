import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Discontinuity: Record<string, ImplementableCard> = {
    "Discontinuity": {
        name: "Discontinuity",
        manaCost: "{3}{U}{U}{U}",
        oracleText: "During your turn, this spell costs {2}{U}{U} less to cast.\nEnd the turn. (Exile all spells and abilities from the stack, including this card. The player whose turn it is discards down to their maximum hand size. Damage wears off, and \"this turn\" and \"until end of turn\" effects end.)",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: []
    }
};
