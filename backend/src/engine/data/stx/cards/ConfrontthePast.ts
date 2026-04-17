import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ConfrontthePast: CardDefinition = {
    name: 'Confront the Past',
    manaCost: '{X}{B}',
    scryfall_id: "e1951763-be97-400c-aa95-6b101f47bddf",
    image_url: "https://cards.scryfall.io/normal/front/e/1/e1951763-be97-400c-aa95-6b101f47bddf.jpg?1637082105",
    colors: ['B'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Choose one —\n• Return target planeswalker card with mana value X or less from your graveyard to the battlefield.\n• Exile target planeswalker with mana value X or less.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Return or Exile?",
                    choices: [
                        {
                            label: "Return from Graveyard",
                            targetDefinition: { count: 1, type: TargetType.CardInGraveyard, restrictions: ['Planeswalker', 'mv <= x'] },
                            effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.Target1 }]
                        },
                        {
                            label: "Exile from Battlefield",
                            targetDefinition: { count: 1, type: TargetType.Planeswalker, restrictions: ['mv <= x'] },
                            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
                        }
                    ]
                }
            ]
        }
    ]
};

