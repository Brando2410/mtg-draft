import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const StrategicPlanning: CardDefinition = {
    name: 'Strategic Planning',
    manaCost: '{1}{U}',
    colors: ['U'],
    types: ['Sorcery'],
    oracleText: 'Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.LookAtTopAndPick,
            fromTop: 3,
            amount: 1,
            zone: Zone.Hand,
            remainderZone: Zone.Graveyard,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  };
