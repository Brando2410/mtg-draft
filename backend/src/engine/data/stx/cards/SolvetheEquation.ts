import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SolvetheEquation: CardDefinition = {
    name: 'Solve the Equation',
    manaCost: '{2}{U}',
    colors: ['U'],
    types: ['Sorcery'],
    oracleText: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinitions: [{
                        type: TargetType.InstantOrSorcery,
                        count: 1
                    }],
                    zone: Zone.Hand,
                    reveal: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "66c04ee2-c1e0-45fb-aaf5-1b4459df80fc",
    image_url: "https://cards.scryfall.io/normal/front/6/6/66c04ee2-c1e0-45fb-aaf5-1b4459df80fc.jpg?1624590433",
    rarity: "uncommon"
};

