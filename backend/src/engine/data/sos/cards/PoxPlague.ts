import { AbilityType, CardDefinition, EffectType, GameState, PlayerId, Restriction, TargetMapping } from '@shared/engine_types';
export const PoxPlague: CardDefinition = {
    name: "Pox Plague",
    manaCost: "{B}{B}{B}{B}{B}",
    colors: ["B"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Each player loses half their life, then discards half the cards in their hand, then sacrifices half the permanents they control of their choice. Round down each time.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.LoseLife,
                    label: "Lose half life",
                    targetMapping: TargetMapping.EachPlayer,
                    amount: {
                        type: 'PLAYER_LIFE',
                        multiplier: 0.5,
                        rounding: 'floor'
                    }
                },
                {
                    type: EffectType.DiscardCards,
                    label: "Discard half hand",
                    targetMapping: TargetMapping.EachPlayer,
                    amount: {
                        type: 'PLAYER_HAND_SIZE',
                        multiplier: 0.5,
                        rounding: 'floor'
                    }
                },
                {
                    type: EffectType.Sacrifice,
                    label: "Sacrifice half permanents",
                    targetMapping: TargetMapping.EachPlayer,
                    restrictions: [Restriction.Permanent],
                    amount: {
                        type: 'COUNT_PLAYER_PERMANENTS',
                        multiplier: 0.5,
                        rounding: 'floor'
                    }
                }
            ]
        }
    ],
    scryfall_id: "9c99c17b-ad3a-4859-97e8-469718b81cd9",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9c99c17b-ad3a-4859-97e8-469718b81cd9.jpg?1775937566",
    rarity: "rare"
};

