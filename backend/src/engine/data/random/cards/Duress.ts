import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Duress: CardDefinition = {
  name: 'Duress',
  manaCost: '{B}',
  colors: ['B'],
  types: ['Sorcery'],
  oracleText: 'Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.',
  abilities: [
    {
      type: AbilityType.Spell,
      targetDefinition: {
        count: 1,
        type: TargetType.Player,
        restrictions: [{ type: 'Opponent' }]
      },
      effects: [
        {
          type: EffectType.Choice,
          label: "Choose a noncreature, nonland card to discard",
          targetIdMapping: TargetMapping.Target1HandRevealPick,
          restrictions: [
            {
              type: 'Not',
              restriction: { type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Land' }] }
            }
          ],
          effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, isDiscard: true }]
        }
      ]
    }
  ]
};

