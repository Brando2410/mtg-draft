import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ScouredBarrens: CardDefinition = {

    name: "Scoured Barrens",
    manaCost: "",
    oracleText: "Scoured Barrens enters the battlefield tapped.\nWhen Scoured Barrens enters the battlefield, you gain 1 life.\n{T}: Add {W} or {B}.",
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
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        },
    ]
};


