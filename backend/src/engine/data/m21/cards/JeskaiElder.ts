import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const JeskaiElder: Record<string, ImplementableCard> = {
    "Jeskai Elder": {
        name: "Jeskai Elder",
        manaCost: "{1}{U}",
        oracleText: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhenever this creature deals combat damage to a player, you may draw a card. If you do, discard a card.",
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
