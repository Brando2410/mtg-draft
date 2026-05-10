import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const GoBlank: CardDefinition = {
        name: 'Go Blank',
        manaCost: '{2}{B}',

        colors: ['B'],
        types: ['Sorcery'],
        oracleText: "Target player discards two cards. Then exile that player's graveyard.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.Player,
                    count: 1
                }],
                effects: [
                    { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Target1 },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Target1, sourceZones: [Zone.Graveyard] }
                ]
            }
        ],
    scryfall_id: "846e8657-7435-44c6-a997-b8b156d0cd2c",
    image_url: "https://cards.scryfall.io/normal/front/8/4/846e8657-7435-44c6-a997-b8b156d0cd2c.jpg?1624590993",
    rarity: "uncommon"
};

