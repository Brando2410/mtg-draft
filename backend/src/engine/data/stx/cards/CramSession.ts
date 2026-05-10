import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const CramSession: CardDefinition = {
    name: 'Cram Session',
    manaCost: '{1}{B/G}',

    colors: ['B', 'G'],
    types: ['Sorcery'],
    oracleText: 'You gain 2 life.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller },
          { type: EffectType.Learn }
        ]
      }
    ],
    scryfall_id: "c59a249f-35ed-447a-845b-32ba5a53124e",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c59a249f-35ed-447a-845b-32ba5a53124e.jpg?1627428330",
    rarity: "common"
};

