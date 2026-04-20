import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const GrimTutor: CardDefinition = {
    name: "Grim Tutor",
    manaCost: "{1}{B}{B}",
    scryfall_id: "9286eb9e-7385-4412-811d-616cb369d1b7",
    image_url: "https://cards.scryfall.io/normal/front/9/2/9286eb9e-7385-4412-811d-616cb369d1b7.jpg?1594736179",
    oracleText: "Search your library for a card and put that card into your hand, then shuffle. You lose 3 life.",
    colors: ["B"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: { type: TargetType.Card, count: 1 },
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.LoseLife,
                    amount: 3,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
