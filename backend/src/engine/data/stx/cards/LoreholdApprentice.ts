import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const LoreholdApprentice: CardDefinition = {
    name: "Lorehold Apprentice",
    manaCost: "{R}{W}",
    colors: ["R", "W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "2",
    toughness: "1",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, each Spirit you control deals 1 damage to each opponent.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent,
                    damageSourceMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: ['Spirit']
                }
            ]
        }
    ]
};


