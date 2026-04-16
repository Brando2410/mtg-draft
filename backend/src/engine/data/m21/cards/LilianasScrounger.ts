import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const LilianasScrounger: CardDefinition = {
    name: "Liliana's Scrounger",
    manaCost: "{2}{B}",
    oracleText: "At the beginning of each end step, if a creature died this turn, you may put a loyalty counter on a Liliana planeswalker you control.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Zombie"],
    power: "3",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            activeZone: Zone.Battlefield,
            condition: 'CREATURE_DIED_THIS_TURN',
            optional: true,
            targetDefinition: {
                type: TargetType.Planeswalker,
                count: 1,
                restrictions: ['Liliana', 'YouControl']
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'loyalty',
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};


