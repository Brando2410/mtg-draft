import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const NineLives: CardDefinition = {
    name: "Nine Lives",
    manaCost: "{1}{W}{W}",

    oracleText: "Hexproof\nIf a source would deal damage to you, prevent that damage and put an incarnation counter on this enchantment.\nWhen there are nine or more incarnation counters on this enchantment, exile it.\nWhen this enchantment leaves the battlefield, you lose the game.",
    colors: ["W"],
    types: ["Enchantment"],
    keywords: ["Hexproof"],
    abilities: [
        {
            type: AbilityType.Replacement,
            replacesEvent: 'ON_DAMAGE_DEALT_TO_PLAYER',
            effects: [
                {
                    type: EffectType.PreventDamage,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: 'incarnation',
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CountersAdded,
            condition: 'SOURCE_HAS_9_OR_MORE_INCARNATION_COUNTERS',
            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Self }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LeaveBattlefield,
            effects: [{ type: EffectType.LoseGame, targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "e70b7a73-484e-48f1-944c-3d38866cdc20",
    image_url: "https://cards.scryfall.io/normal/front/e/7/e70b7a73-484e-48f1-944c-3d38866cdc20.jpg?1594735092",
    rarity: "rare"
};

