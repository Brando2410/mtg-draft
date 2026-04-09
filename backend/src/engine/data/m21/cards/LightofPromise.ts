import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const LightofPromise: Record<string, ImplementableCard> = {
    "Light of Promise": {
        name: "Light of Promise",
        manaCost: "{2}{W}",
        oracleText: "Enchant creature\nEnchanted creature has \"Whenever you gain life, put that many +1/+1 counters on this creature.\"",
        colors: ["white"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: ["Aura"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "light_promise_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: []
            },
            {
                id: "light_promise_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_LIFE_GAIN',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    const hostId = (source as any).attachedTo;
                    if (!hostId) return false;
                    const host = state.battlefield.find((o: any) => o.id === hostId);
                    return host && event.playerId === host.controllerId;
                },
                effects: [{ type: 'AddCounters', amount: 'EVENT_AMOUNT', value: '+1/+1', targetMapping: 'ENCHANTED_CREATURE' }]
            }
        ]
    }
};
