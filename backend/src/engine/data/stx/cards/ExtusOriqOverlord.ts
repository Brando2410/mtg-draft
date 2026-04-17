import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone, ConditionType } from '@shared/engine_types';

export const ExtusOriqOverlord: CardDefinition = {
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
                targetDefinition: {
                    count: 1,
                    type: TargetType.CardInGraveyard,
                    restrictions: ['creature', 'yours']
                },
                effects: [{
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.Target1
                }]
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
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.EachOpponent,
                            restrictions: ['creature']
                        },
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
                                    condition: ConditionType.SelfAttacks,
                                    effects: [{
                                        type: EffectType.LoseLife,
                                        amount: 3,
                                        targetMapping: TargetMapping.EachOpponent
                                    }]
                                }]
                            }
                        }
                    ]
                }
            ]
        }
    ]
};



