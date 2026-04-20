import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const LilianasScrounger: CardDefinition = {
    name: "Liliana's Scrounger",
    manaCost: "{2}{B}",
    scryfall_id: "5a64625f-937a-449e-b1fc-cd0f25b033f6",
    image_url: "https://cards.scryfall.io/normal/front/5/a/5a64625f-937a-449e-b1fc-cd0f25b033f6.jpg?1596250192",
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
            condition: 'CREATURE_DIED_THIS_TURN',
            optional: true,
            targetDefinition: {
                type: TargetType.Planeswalker,
                count: 1,
                restrictions: [Restriction.Liliana, Restriction.YouControl]
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
