import { AbilityType, Zone, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const LlanowarVisionary: CardDefinition = {

    name: "Llanowar Visionary",
    manaCost: "{2}{G}",
    oracleText: "When this creature enters, draw a card.\n{T}: Add {G}.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Elf", "Druid"],
    power: "2",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }],

        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            isManaAbility: true,
            costs: [{ type: 'Tap' }],
            effects: [{ type: EffectType.AddMana, value: 'G' }],

        }
    ]
};


