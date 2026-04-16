import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SwiftwaterCliffs: CardDefinition = {

    name: "Swiftwater Cliffs",
    manaCost: "",
    oracleText: "Swiftwater Cliffs enters the battlefield tapped.\nWhen Swiftwater Cliffs enters the battlefield, you gain 1 life.\n{T}: Add {U} or {R}.",
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
            activeZone: ZoneRequirement.Battlefield,
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
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] }
                    ]
                }
            ]
        },
    ]

};


