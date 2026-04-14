import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const StrictProctor: CardDefinition = {
        name: "Strict Proctor",
        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Creature"],
        subtypes: ["Spirit", "Cleric"],
        power: "1",
        toughness: "3",
        keywords: ["Flying"],
        oracleText: "Flying\nWhenever a permanent entering the battlefield causes a triggered ability to trigger, counter that ability unless its controller pays {2}.",
        abilities: [
            {
                type: AbilityType.Triggered,
                eventMatch: 'ON_TRIGGER_QUEUED', 
                triggerCondition: "IsETBTrigger",
                effects: [{
                    type: EffectType.Choice,
                    label: "Strict Proctor: Pay {2} or counter ability?",
                    targetMapping: TargetMapping.TriggerController,
                    choices: [
                        { label: "Pay {2}", costs: [{ type: 'Mana', value: '{2}' }] },
                        { label: "Don't Pay", effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.TriggerEventSource }] }
                    ]
                }]
            }
        ]
    };
