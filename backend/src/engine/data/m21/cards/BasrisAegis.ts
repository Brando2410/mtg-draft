import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const BasrisAegis: Record<string, ImplementableCard> = {
    "Basri's Aegis": {
        name: "Basri's Aegis",
        manaCost: "{2}{W}{W}",
        oracleText: "Put a +1/+1 counter on each of up to two target creatures. You may search your library and/or graveyard for a card named Basri, Devoted Paladin, reveal it, and put it into your hand. If you search your library this way, shuffle.",
        colors: ["white"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "basris_aegis_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: {
                    type: TargetType.Permanent,
                    restrictions: ["creature"],
                    count: 2,
                    minCount: 0
                },
                effects: [
                    {
                        type: EffectType.AddCounters,
                        value: "+1/+1",
                        amount: 1,
                        targetMapping: "TARGET_ALL"
                    },
                    {
                        type: EffectType.SearchLibrary,
                        sourceZones: [Zone.Library, Zone.Graveyard],
                        amount: 1,
                        optional: true,
                        reveal: true,
                        shuffle: true,
                        destination: Zone.Hand,
                        targetDefinition: {
                            type: TargetType.Card,
                            restrictions: [{ name: "Basri, Devoted Paladin" }],
                            count: 1
                        }
                    }
                ]
            }
        ]
    }
};
