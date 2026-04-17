import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const GrimTutor: CardDefinition = {
    name: 'Grim Tutor',
    manaCost: '{1}{B}{B}',
    scryfall_id: "928558ab-e29a-44cb-ac2f-88443571f41a",
    image_url: "https://cards.scryfall.io/normal/front/9/2/928558ab-e29a-44cb-ac2f-88443571f41a.jpg?1594736179",
    oracleText: 'Search your library for a card, put that card into your hand, then shuffle. You lose 3 life.',
    colors: ['B'],
    types: ['Sorcery'],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: { type: TargetType.Card, count: 1 },
                    zone: Zone.Hand,
                },
                { type: EffectType.LoseLife, amount: 3, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};


