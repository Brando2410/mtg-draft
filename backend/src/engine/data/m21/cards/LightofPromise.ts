import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const LightofPromise: CardDefinition = {
    name: "Light of Promise",
    manaCost: "{2}{W}",
    scryfall_id: "d5f80411-0a95-4e0a-b7a8-af23ddf385cc",
    image_url: "https://cards.scryfall.io/normal/front/d/5/d5f80411-0a95-4e0a-b7a8-af23ddf385cc.jpg?1594735041",
    oracleText: "Enchant creature\nEnchanted creature has \"Whenever you gain life, put that many +1/+1 counters on this creature.\"",
    colors: ["W"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, count: 1 },
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LifeGain,
            condition: (state: any, event: any, source: any) => state.battlefield.some((o: any) => o.id === source.attachedTo && o.controllerId === event.playerId),
            effects: [{ type: EffectType.AddCounters, amount: 'EVENT_AMOUNT', value: '+1/+1', targetMapping: TargetMapping.EnchantedCreature }]
        }
    ]
};




