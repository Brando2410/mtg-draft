import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const SilverquillCharm: CardDefinition = {
    name: "Silverquill Charm",
    manaCost: "{W}{B}",
    colors: ["B", "W"],
    types: ["Instant"],
    oracleText: "Choose one —\n• Put two +1/+1 counters on target creature.\n• Exile target creature with power 2 or less.\n• Each opponent loses 3 life and you gain 3 life.",
    abilities: [
        {
            type: AbilityType.Spell,
            modes: [
                {
                    type: EffectType.Choice,
                    targetDefinition: { type: TargetType.Creature, count: 1 },
                    label: "Put two +1/+1 counters on target creature",
                    effects: [
                        {
                            type: EffectType.AddCounters,
                            amount: 2,
                            counterType: '+1/+1',
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                },
                {
                    label: "Exile target creature with power 2 or less",
                    effects: [
                        {
                            type: EffectType.Exile,
                            targetDefinition: {
                                type: TargetType.Creature,
                                count: 1,
                                restrictions: [Restriction.Power2OrLess]
                            }
                        }
                    ]
                },
                {
                    label: "Each opponent loses 3 life and you gain 3 life",
                    effects: [
                        {
                            type: EffectType.LoseLife,
                            amount: 3,
                            targetMapping: TargetMapping.EachOpponent
                        },
                        {
                            type: EffectType.GainLife,
                            amount: 3,
                            targetMapping: TargetMapping.Controller
                        }
                    ]
                }


            ]
        }
    ]
};
