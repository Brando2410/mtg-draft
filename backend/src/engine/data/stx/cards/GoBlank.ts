import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const GoBlank: CardDefinition = {
        name: 'Go Blank',
        manaCost: '{2}{B}',
        colors: ['B'],
        types: ['Sorcery'],
        oracleText: "Target player discards two cards. Then exile that player's graveyard.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1
                },
                effects: [
                    { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Target1 },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Target1, sourceZone: Zone.Graveyard }
                ]
            }
        ]
    };

