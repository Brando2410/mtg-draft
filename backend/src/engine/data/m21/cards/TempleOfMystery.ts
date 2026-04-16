import { AbilityType, Zone, EffectType, CardDefinition, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TempleOfMystery: CardDefinition = {

    name: "Temple of Mystery",
    manaCost: "",
    oracleText: "Temple of Mystery enters the battlefield tapped.\nWhen Temple of Mystery enters the battlefield, scry 1.\n{T}: Add {G} or {U}.",
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
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] },
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] }
                    ]
                }
            ]
        },
    ]

};


