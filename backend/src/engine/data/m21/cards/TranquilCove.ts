import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const TranquilCove: CardDefinition = {

    name: "Tranquil Cove",
    manaCost: "",
    oracleText: "Tranquil Cove enters the battlefield tapped.\nWhen Tranquil Cove enters the battlefield, you gain 1 life.\n{T}: Add {W} or {U}.",
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
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] }
                    ]
                }
            ]
        },
    ]

};




