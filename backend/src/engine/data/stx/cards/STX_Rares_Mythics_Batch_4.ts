import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone, SelectionType, Restriction } from '@shared/engine_types';

export const STX_Rares_Mythics_Batch_4: CardDefinition[] = [
    {
        name: "Blex, Vexing Pest // Search for Blex",
        manaCost: "{2}{G}{G} // {2}{B}{B}",
        colors: ["G", "B"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Pest"],
        power: "3",
        toughness: "3",
        oracleText: "Other Pests, Bats, Insects, Snakes, and Spiders you control get +1/+1.\nSearch for Blex: Look at the top five cards of your library. You may put any number of them into your hand and the rest into your graveyard. You lose 3 life for each card put into your hand this way.",
        abilities: [{
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: 'PERMANENT',
                powerModifier: 1,
                toughnessModifier: 1,
                targetMapping: 'PESTS_YOU_CONTROL'
            }]
        }],
        preparedFace: {
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
                    selectionType: 'AnyNumber',
                    zone: Zone.Hand,
                    remainderZone: Zone.Graveyard,
                    additionalEffectPerCard: { type: EffectType.LoseLife, amount: 3, targetMapping: TargetMapping.Controller }
                }]
            }]
        }
    },
    {
        name: "Extus, Oriq Overlord // Awaken the Blood Avatar",
        manaCost: "{1}{W}{B}{B} // {6}{B}{R}",
        colors: ["W", "B", "R"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human", "Warlock"],
        power: "2",
        toughness: "4",
        oracleText: "Double strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, return target creature card from your graveyard to your hand.\nAwaken the Blood Avatar: As an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way. Each opponent sacrifices a creature. Create a 3/6 black and red Avatar creature token with haste and 'Whenever this creature attacks, it deals 3 damage to each opponent.'",
        abilities: [
            {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.Magecraft,
                targetDefinition: { type: TargetType.CardInGraveyard, count: 1, restrictions: ['Creature', 'Yours'] },
                effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
            }
        ],
        preparedFace: {
            name: "Awaken the Blood Avatar",
            manaCost: "{6}{B}{R}",
            colors: ["B", "R"],
            types: ["Sorcery"],
            oracleText: "As an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way. Each opponent sacrifices a creature. Create a 3/6 black and red Avatar creature token with haste and 'Whenever this creature attacks, it deals 3 damage to each opponent.'",
            abilities: [
                {
                    type: AbilityType.Spell,
                    additionalCosts: [{ 
                        type: 'Sacrifice', 
                        optional: true, 
                        selectionType: SelectionType.AnyNumber,
                        restrictions: [{ type: 'Type', value: 'Creature' }],
                        costModifiers: [{ type: 'REDUCE_GENERIC_PER_COUNTER', counterType: 'SacrificeCount', amount: 2 }] // Simplified for engine
                    }],
                    effects: [
                        { type: EffectType.Sacrifice, targetMapping: TargetMapping.EachOpponent, amount: 1, all: true },
                        {
                            type: EffectType.CreateToken,
                            tokenBlueprint: {
                                name: "Avatar",
                                power: 3,
                                toughness: 6,
                                colors: ["B", "R"],
                                types: ["Creature"],
                                subtypes: ["Avatar"],
                                keywords: ["Haste"],
                                abilities: [{
                                    type: AbilityType.Triggered,
                                    eventMatch: TriggerEvent.Attack,
                                    effects: [{ type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.EachOpponent, all: true }]
                                }]
                            }
                        }
                    ]
                }
            ]
        }
    }
];
