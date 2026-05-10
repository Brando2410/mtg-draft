import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, Zone } from '@shared/engine_types';

export const BlexVexingPest: CardDefinition = {
    name: "Blex, Vexing Pest",
    manaCost: "{2}{G}",

    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Pest"],
    power: "3",
    toughness: "2",
    oracleText: "Other Pests, Bats, Insects, Snakes, and Spiders you control get +1/+1.\nSearch for Blex: Look at the top five cards of your library. You may put any number of them into your hand and the rest into your graveyard. You lose 3 life for each card put into your hand this way.",
    faces: [
        {
            name: "Blex, Vexing Pest",
            manaCost: "{2}{G}",
            colors: ["G"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Pest"],
            power: "3",
            toughness: "2",
            oracleText: "Other Pests, Bats, Insects, Snakes, and Spiders you control get +1/+1.",
            abilities: [{
                type: AbilityType.Static,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    layer: 7,
                    targetMapping: TargetMapping.OtherCreaturesYouControl,
                    restrictions: [{
                        type: Restriction.Any,
                        restrictions: [
                            Restriction.Pest,
                            Restriction.Bat,
                            Restriction.Insect,
                            Restriction.Snake,
                            Restriction.Spider
                        ]
                    }]
                }]
            }]
        },
        {
            name: "Search for Blex",
            manaCost: "{2}{B}{B}",
            colors: ["B"],
            types: ["Sorcery"],
            oracleText: "Look at the top five cards of your library. You may put any number of them into your hand and the rest into your graveyard. You lose 3 life for each card put into your hand this way.",
            abilities: [{
                type: AbilityType.Spell,
                effects: [{
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 5,
                    zone: Zone.Hand,
                    remainderZone: Zone.Graveyard,
                    amount: 'ANY'
                }]
            }]
        }
    ],
    scryfall_id: "c204b7ca-0904-40fa-b20c-92400fae20b8",
    image_url: "https://cards.scryfall.io/normal/front/c/2/c204b7ca-0904-40fa-b20c-92400fae20b8.jpg?1739541943",
    rarity: "mythic"
};

