import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const AmbitiousAugmenter: CardDefinition = {
    name: "Ambitious Augmenter",
    manaCost: "{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Turtle", "Wizard"],
    keywords: ["Increment"],
    power: "1",
    toughness: "1",
    oracleText: "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nWhen this creature dies, if it had one or more counters on it, create a 0/0 green and blue Fractal creature token, then put this creature's counters on that token.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            condition: ConditionType.HasCounters,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Fractal',
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        colors: ['G', 'U'],
                        power: '0',
                        toughness: '0',
                        image_url: "https://cards.scryfall.io/normal/front/d/e/de564776-9d88-4533-8717-842eecdd0594.jpg?1775828279"
                    },
                    amount: 1
                },
                {
                    type: EffectType.MoveCounters,
                    targetMapping: TargetMapping.LastCreatedToken
                }
            ]
        }
    ],
    scryfall_id: "85629088-2007-4db5-9397-bac12a3d7498",
    image_url: "https://cards.scryfall.io/normal/front/8/b/8b5f1fdb-04df-4224-acb4-7819c37565f5.jpg?1775828306",
    rarity: "rare"
};

