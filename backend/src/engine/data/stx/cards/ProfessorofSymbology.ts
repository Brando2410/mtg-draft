import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ProfessorofSymbology: CardDefinition = {
      name: 'Professor of Symbology',
      manaCost: '{1}{W}',
      colors: ['W'],
      types: ['Creature'],
      subtypes: ['Kor', 'Cleric'],
      power: "2",
      toughness: "1",
      oracleText: "When Professor of Symbology enters the battlefield, learn.",
      abilities: [
          {
              type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
              effects: [{ type: EffectType.Learn }]
          }
      ]
  };


