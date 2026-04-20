import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const TerrorofthePeaks: CardDefinition = {
    name: "Terror of the Peaks",
    manaCost: "{3}{R}{R}",
    scryfall_id: "057e03ef-62f9-4b6a-939e-2dc868eb370f",
    image_url: "https://cards.scryfall.io/normal/front/0/5/057e03ef-62f9-4b6a-939e-2dc868eb370f.jpg?1594736829",
    oracleText: "Spells your opponents cast that target Terror of the Peaks cost an additional 3 life to cast.\nWhenever another creature enters the battlefield under your control, Terror of the Peaks deals damage equal to that creature's power to any target.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Dragon"],
    power: "5",
    toughness: "4",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.AdditionalCost,
                    targetMapping: TargetMapping.EachOpponent,
                    condition: 'SPELL_TARGETS_SOURCE',
                    additionalCosts: [{ type: CostType.PayLife, value: 3 }]
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefieldOther,
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [{ type: EffectType.DealDamage, amount: 'EVENT_OBJECT_POWER', targetMapping: TargetMapping.Target1 }]
        }
    ]
};
