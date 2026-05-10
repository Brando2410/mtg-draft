import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const VanishingVerse: CardDefinition = {
        name: 'Vanishing Verse',
        manaCost: '{W}{B}',
        colors: ['W', 'B'],
        types: ['Instant'],
        oracleText: "Exile target monocolored permanent.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: [Restriction.Monocolored]
                }],
                effects: [
                    {
                        type: EffectType.Exile,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ],
    scryfall_id: "8a475868-a335-45e7-9d59-9dc4c2cea1ae",
    image_url: "https://cards.scryfall.io/normal/front/8/a/8a475868-a335-45e7-9d59-9dc4c2cea1ae.jpg?1775941950",
    rarity: "rare"
};

