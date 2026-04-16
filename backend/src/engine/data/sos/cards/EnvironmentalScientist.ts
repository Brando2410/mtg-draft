import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
    export const EnvironmentalScientist: CardDefinition = {
    name: "Environmental Scientist",
    manaCost: "{1}{G}",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Human",
        "Druid"
    ],
    keywords: [],
    oracleText: "When this creature enters, you may search your library for a basic land card, reveal it, put it into your hand, then shuffle.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetMapping: TargetMapping.Controller,
                    targetDefinition: {
                        type: TargetType.Land,
                        count: 1,
                        restrictions: ['Basic']
                    },
                    zone: Zone.Hand,
                    optional: true,
                    reveal: true,
                    shuffle: true
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};
    