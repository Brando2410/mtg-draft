import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ScavengingOoze: CardDefinition = {
    name: "Scavenging Ooze",
    manaCost: "{1}{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Ooze"],
    oracleText: "{G}: Exile target card from a graveyard. If it was a creature card, put a +1/+1 counter on Scavenging Ooze and you gain 1 life.",
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Mana', value: 'G' }],
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
            },
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    condition: 'TARGET_1_MATCHES:creature',
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    condition: 'TARGET_1_MATCHES:creature',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};


