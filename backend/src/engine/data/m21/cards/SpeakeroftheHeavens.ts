import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const SpeakeroftheHeavens: CardDefinition = {
    name: "Speaker of the Heavens",
    manaCost: "{W}",
    scryfall_id: "1f44b56a-0a44-43a4-8f9e-72f7c00bb4a6",
    image_url: "https://cards.scryfall.io/normal/front/1/f/1f44b56a-0a44-43a4-8f9e-72f7c00bb4a6.jpg?1594735210",
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
                        image_url: 'https://cards.scryfall.io/large/front/9/e/9e12d954-3ec2-46e3-b01f-1fd63159e8a4.jpg?1594733473'
                    }, 
                    targetMapping: TargetMapping.Controller 
                }
            ]
        }
    ]
};
