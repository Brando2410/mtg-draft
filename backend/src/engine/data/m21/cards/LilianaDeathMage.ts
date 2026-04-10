import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LilianaDeathMage: Record<string, ImplementableCard> = {
    "Liliana, Death Mage": {
        name: "Liliana, Death Mage",
        manaCost: "{4}{B}{B}",
        oracleText: "+1: Return up to one target creature card from your graveyard to your hand.\n −3: Destroy target creature. Its controller loses 2 life.\n −7: Target opponent loses 2 life for each creature card in their graveyard.",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        loyalty: "4",
        abilities: []
    }
};
