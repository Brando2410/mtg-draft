import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const MistralSinger: CardDefinition = {
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
    };


