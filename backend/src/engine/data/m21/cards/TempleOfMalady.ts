import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const TempleOfMalady: CardDefinition = {

    name: "Temple of Malady",
    manaCost: "",
    oracleText: "Temple of Malady enters the battlefield tapped.\nWhen Temple of Malady enters the battlefield, scry 1.\n{T}: Add {B} or {G}.",
    colors: [],
    supertypes: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => {
                return event.data?.object?.id === source.sourceId;
            },
            effects: [{ type: EffectType.Scry, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    choices: [
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] },
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] }
                    ]
                }
            ]
        },
    ]

};



