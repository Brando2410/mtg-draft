import { AbilityType, CardDefinition, EffectType, TriggerEvent } from '@shared/engine_types';

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
      ],
    scryfall_id: "f427cf73-9f5e-4ef5-bc4f-29ffbfda9d57",
    image_url: "https://cards.scryfall.io/normal/front/f/4/f427cf73-9f5e-4ef5-bc4f-29ffbfda9d57.jpg?1624589635",
    rarity: "uncommon"
};

