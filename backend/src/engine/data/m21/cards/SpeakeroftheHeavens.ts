import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const SpeakeroftheHeavens: CardDefinition = {
    name: "Speaker of the Heavens",
    manaCost: "{W}",

    oracleText: "Vigilance, lifelink\n{T}: Create a 4/4 white Angel creature token with flying. Activate only if you have at least 7 more life than your starting life total and only as a sorcery.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "1",
    toughness: "1",
    keywords: ["Vigilance", "Lifelink"],
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            activatedOnlyAsSorcery: true,
            costs: [{ type: CostType.Tap }],
            condition: 'PLAYER_LIFE_GE_STARTING_PLUS_7',
            effects: [
                { 
                    type: EffectType.CreateToken, 
                    tokenBlueprint: { 
                        name: 'Angel', 
                        power: "4", 
                        toughness: "4", 
                        colors: ['W'], 
                        types: ['Creature'], 
                        subtypes: ['Angel'], 
                        keywords: ['Flying'],

                    }, 
                    targetMapping: TargetMapping.Controller 
                }
            ]
        }
    ],
    scryfall_id: "1f44b96a-8498-414a-a4ac-54c80dfa9f23",
    image_url: "https://cards.scryfall.io/normal/front/1/f/1f44b96a-8498-414a-a4ac-54c80dfa9f23.jpg?1594735262",
    rarity: "rare"
};

