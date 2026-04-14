import { CardDefinition, Zone, AbilityType, EffectType, TriggerEvent, TargetType, SelectionType, TargetMapping } from '@shared/engine_types';

export const STX_Rares_Mythics_Batch_4: CardDefinition[] = [
    {
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
                        restrictions: [{ type: 'SubtypeIn', value: ['Pest', 'Bat', 'Insect', 'Snake', 'Spider'] }]
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
                        selectionType: SelectionType.AnyNumber,
                        destination: Zone.Hand,
                        remainderZone: Zone.Graveyard,
                        additionalEffectPerCard: { type: EffectType.LoseLife, amount: 3, targetMapping: TargetMapping.Controller }
                    }]
                }]
            }
        ]
    },
    {
        name: "Extus, Oriq Overlord",
        manaCost: "{1}{W}{B}{B}",
        colors: ["W", "B"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human", "Warlock"],
        power: "2",
        toughness: "4",
        keywords: ["Double Strike"],
        oracleText: "Double strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, return target creature card from your graveyard to your hand.\nAwaken the Blood Avatar: As an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way. Each opponent sacrifices a creature. Create a 3/6 black and red Avatar creature token with haste and 'Whenever this creature attacks, it deals 3 damage to each opponent.'",
        faces: [
            {
                name: "Extus, Oriq Overlord",
                manaCost: "{1}{W}{B}{B}",
                colors: ["W", "B"],
                supertypes: ["Legendary"],
                types: ["Creature"],
                subtypes: ["Human", "Warlock"],
                power: "2",
                toughness: "4",
                keywords: ["Double Strike"],
                oracleText: "Double strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, return target creature card from your graveyard to your hand.",
                abilities: [{
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                    targetDefinition: { count: 1, type: TargetType.Card, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'GRAVEYARD' }, { type: 'Source', value: 'CONTROLLER' }] },
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
                }]
            },
            {
                name: "Awaken the Blood Avatar",
                manaCost: "{6}{B}{R}",
                colors: ["B", "R"],
                types: ["Sorcery"],
                oracleText: "As an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way. Each opponent sacrifices a creature. Create a 3/6 black and red Avatar creature token with haste and 'Whenever this creature attacks, it deals 3 damage to each opponent.'",
                abilities: [
                    {
                        type: AbilityType.Static,
                        effects: [{
                            type: EffectType.CostReduction,
                            amount: '{2}',
                            selectionType: SelectionType.AnyNumber,
                            costToPay: { type: 'Sacrifice', restrictions: [{ type: 'Type', value: 'Creature' }] }
                        }]
                    },
                    {
                        type: AbilityType.Spell,
                        effects: [
                            { type: EffectType.Sacrifice, targetMapping: TargetMapping.EachOpponent, restriction: { type: 'Type', value: 'Creature' } },
                            {
                                type: EffectType.CreateToken,
                                tokenBlueprint: {
                                    name: 'Blood Avatar',
                                    power: "3",
                                    toughness: "6",
                                    colors: ['B', 'R'],
                                    types: ['Creature', 'Token'],
                                    subtypes: ['Avatar'],
                                    keywords: ['Haste'],
                                    image_url: 'https://cards.scryfall.io/large/front/9/4/94a50acd-ac2d-47bf-b331-0bcf5edd9c75.jpg?1641306148',
                                    oracleText: "Whenever this creature attacks, it deals 3 damage to each opponent.",
                                    abilities: [{
                                        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                                        condition: "SelfAttacks",
                                        effects: [{ type: EffectType.LoseLife, amount: 3, targetMapping: TargetMapping.EachOpponent }]
                                    }]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
];


