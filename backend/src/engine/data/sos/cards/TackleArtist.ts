import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const TackleArtist: CardDefinition = {
    name: "Tackle Artist",
    manaCost: "{3}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Orc", "Sorcerer"],
    keywords: ["Trample"],
    power: "4",
    toughness: "3",
    oracleText: "Trample\nOpus — Whenever you cast an instant or sorcery spell, put a +1/+1 counter on this creature. If five or more mana was spent to cast that spell, put two +1/+1 counters on this creature instead.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 2,
                    counterType: '+1/+1',
                    condition: 'SPENT_MANA_GE:5',
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    condition: 'SPENT_MANA_LT:5',
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "b87e2474-98c1-4c1a-91ed-340b72d31653",
    image_url: "https://cards.scryfall.io/normal/front/b/8/b87e2474-98c1-4c1a-91ed-340b72d31653.jpg?1775937898",
    rarity: "common"
};

