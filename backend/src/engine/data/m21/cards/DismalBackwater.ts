import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const DismalBackwater: CardDefinition = {

    name: "Dismal Backwater",
    manaCost: "",
    oracleText: "Dismal Backwater enters the battlefield tapped.\nWhen Dismal Backwater enters the battlefield, you gain 1 life.\n{T}: Add {U} or {B}.",
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
            effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    choices: [
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        },
    ]

};



