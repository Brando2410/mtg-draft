import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const MistralSinger: Record<string, ImplementableCard> = {
    "Mistral Singer": {
        name: "Mistral Singer",
        manaCost: "{2}{U}",
        oracleText: "Flying\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Siren", "Wizard"],
        power: "2",
        toughness: "2",
        keywords: ["Flying", "Prowess"],
        abilities: []
    }
};
