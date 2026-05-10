import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const RiseofExtus: CardDefinition = {
  name: 'Rise of Extus',
  manaCost: '{4}{B/G}{B/G}',
  colors: ['B', 'G'],
  types: ['Sorcery'],
  oracleText: 'Exile target creature or planeswalker. Learn.',
  abilities: [
    {
      type: AbilityType.Spell,
      targetDefinitions: [{
        count: 1,
        type: TargetType.CreatureOrPlaneswalker
      }],
      effects: [
        { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
        { type: EffectType.Learn }
      ]
    }
  ],
    scryfall_id: "bbf97a71-485e-4d47-98de-bdf6f6dae0c2",
    image_url: "https://cards.scryfall.io/normal/front/b/b/bbf97a71-485e-4d47-98de-bdf6f6dae0c2.jpg?1624739773",
    rarity: "common"
};

