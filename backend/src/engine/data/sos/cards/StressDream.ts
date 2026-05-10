import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const StressDream: CardDefinition = {
    name: "Stress Dream",
    manaCost: "{3}{U}{R}",
    colors: ["R", "U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Stress Dream deals 5 damage to up to one target creature. Look at the top two cards of your library. Put one of those cards into your hand and the other on the bottom of your library.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                optional: true
            }],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 5,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 2,
                    amount: 1,
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "1ec40a1b-51e7-4a35-966c-ab2a10f21a80",
    image_url: "https://cards.scryfall.io/normal/front/1/e/1ec40a1b-51e7-4a35-966c-ab2a10f21a80.jpg?1775938641",
    rarity: "uncommon"
};

