import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const MageHunter: CardDefinition = {
    name: 'Mage Hunter',
    manaCost: '{3}{B}',
    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Horror'],
    power: "3",
    toughness: "4",
    oracleText: 'Whenever an opponent casts or copies an instant or sorcery spell, they lose 1 life.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.MagecraftOpponent,
            effects: [{ type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.TriggerController }]
        }
    ]
  };


