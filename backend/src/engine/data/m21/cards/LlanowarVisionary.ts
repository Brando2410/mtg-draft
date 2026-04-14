import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LlanowarVisionary: Record<string, ImplementableCard> = {
    "Llanowar Visionary": {
        name: "Llanowar Visionary",
        manaCost: "{2}{G}",
        oracleText: "When this creature enters, draw a card.\n{T}: Add {G}.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elf", "Druid"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "llanowar_visionary_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: 'CONTROLLER' }],
                oracleText: "When this creature enters, draw a card."
            },
            {
                id: "llanowar_visionary_mana",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{G}' }],
                oracleText: "{T}: Add {G}."
            }
        ]
    }
};


