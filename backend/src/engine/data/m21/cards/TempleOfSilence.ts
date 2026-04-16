import { AbilityType, Zone, EffectType, CardDefinition, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TempleOfSilence: CardDefinition = {

    name: "Temple of Silence",
    manaCost: "",
    oracleText: "Temple of Silence enters the battlefield tapped.\nWhen Temple of Silence enters the battlefield, scry 1.\n{T}: Add {W} or {B}.",
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
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        },
    ]

};


