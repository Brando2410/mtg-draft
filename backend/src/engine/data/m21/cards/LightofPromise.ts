import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const LightofPromise: CardDefinition = {
    name: "Light of Promise",
    manaCost: "{2}{W}",
    scryfall_id: "d5f80411-0a95-4e0a-b7a8-af23ddf385cc",
    image_url: "https://cards.scryfall.io/normal/front/d/5/d5f80411-0a95-4e0a-b7a8-af23ddf385cc.jpg?1594735041",
    oracleText: "Enchant creature\nEnchanted creature has \"Whenever you gain life, put that many +1/+1 counters on this creature.\"",
    colors: ["W"],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: ["Enchant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LifeGain,
            condition: ConditionType.EventPlayerIsYou,
            effects: [{
                type: EffectType.AddCounters,
                amount: 'EVENT_AMOUNT',
                counterType: '+1/+1',
                targetMapping: TargetMapping.EnchantedCreature
            }]
        }
    ]
};
