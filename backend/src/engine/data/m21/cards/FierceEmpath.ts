import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const FierceEmpath: CardDefinition = {
    name: "Fierce Empath",
    manaCost: "{2}{G}",
    oracleText: "When this creature enters, you may search your library for a creature card with mana value 6 or greater, reveal it, put it into your hand, then shuffle.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Elf"],
    power: "1",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        type: TargetType.Creature,
                        count: 1,
                        restrictions: ['MV_GE:6']
                    },
                    zone: Zone.Hand,
                    reveal: true,
                    optional: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};




