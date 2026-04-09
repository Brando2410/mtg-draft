import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const KitesailFreebooter: Record<string, ImplementableCard> = {
    "Kitesail Freebooter": {
        name: "Kitesail Freebooter",
        manaCost: "{1}{B}",
        oracleText: "Flying\nWhen this creature enters, target opponent reveals their hand. You choose a noncreature, nonland card from it. Exile that card until this creature leaves the battlefield.",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "1",
        toughness: "2",
        keywords: [],
        abilities: []
    }
};
