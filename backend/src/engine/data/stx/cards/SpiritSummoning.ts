import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const SpiritSummoning: CardDefinition = {
    name: 'Spirit Summoning',
    manaCost: '{1}{R/W}{R/W}',
    colors: ['R', 'W'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create a 3/2 red and white Spirit creature token.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Spirit',
              manaCost: '',
              colors: ['R', 'W'],
              types: ['Creature', 'Token'],
              subtypes: ['Spirit'],
              power: "3",
              toughness: "2",

            },
            amount: 1,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ],
    scryfall_id: "74be6236-4095-419c-9927-fbd874df21f8",
    image_url: "https://cards.scryfall.io/normal/front/7/4/74be6236-4095-419c-9927-fbd874df21f8.jpg?1637082381",
    rarity: "common"
};

