import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const StandUpforYourself: CardDefinition = {
    name: "Stand Up for Yourself",
    manaCost: "{2}{W}",
    colors: ["W"],
    types: ["Instant"],
    oracleText: "Destroy target creature with power 3 or greater.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                restrictions: [Restriction.Power3OrGreater]
            }],
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "b756ca13-b904-4510-9bbb-5bc2864abfbd",
    image_url: "https://cards.scryfall.io/normal/front/b/7/b756ca13-b904-4510-9bbb-5bc2864abfbd.jpg?1775937151",
    rarity: "uncommon"
};

