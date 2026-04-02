import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameState, GameEvent, GameObject } from '@shared/engine_types';

/**
 * M21 RULES REGISTRY
 * -------------------
 * This is the primary source of truth for Core Set 2021 cards.
 * Card metadata (PT, images, costs) is provided by the Deck JSON.
 * Manual engine logic for abilities is defined below.
 */

const metadata: Record<string, any> = {};


export const M21_LOGIC: Record<string, ImplementableCard> = {


    "Archfiend's Vessel": {
        ...metadata["Archfiend's Vessel"],
        abilities: [
            {
                id: "archfiend_vessel_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    const obj = event.data?.object;
                    return event.sourceZone === 'Graveyard' || (event.sourceZone === 'Stack' && obj?.lastNonStackZone === 'Graveyard');
                },
                effects: [
                    { type: 'Exile', targetMapping: 'SELF' },
                    {
                        type: 'CreateToken',
                        tokenBlueprint: {
                            name: 'Demon', power: '5', toughness: '5', colors: ['B'],
                            types: ['Creature'], subtypes: ['Demon'], keywords: ['Flying'],
                            image_url: 'https://cards.scryfall.io/large/front/b/8/b8fd1237-674e-4e45-813c-ccaa689ec170.jpg'
                        },
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    },

    "Barrin, Tolarian Archmage": {
        ...metadata["Barrin, Tolarian Archmage"],
        abilities: [
            {
                id: "barrin_etb_bounce",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature', 'Planeswalker', 'Other'] },
                effects: [{ type: 'ReturnToHand', targetMapping: 'TARGET_1' }]
            },
            {
                id: "barrin_end_step_draw",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_END_STEP',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && state.turnState.playersWithPermanentReturnedThisTurn[source.controllerId] === true,
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Basri, Devoted Paladin": {
        ...metadata["Basri, Devoted Paladin"],
        loyalty: "4",
        abilities: [
            {
                id: "basri_devoted_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature'] },
                effects: [
                    { type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'TARGET_1' },
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Vigilance'], layer: 6, targetMapping: 'TARGET_1' }
                ]
            },
            {
                id: "basri_devoted_minus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-1' }],
                effects: [
                    {
                        type: 'AddTriggeredAbility',
                        eventMatch: 'ON_ATTACK',
                        duration: 'UNTIL_END_OF_TURN',
                        effects: [{ type: 'AddCounters', targetMapping: 'EVENT_TARGET', value: '+1/+1', amount: 1 }]
                    }
                ]
            },
            {
                id: "basri_devoted_minus_6",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-6' }],
                effects: [
                    {
                        type: 'ApplyContinuousEffect',
                        powerModifier: 2,
                        toughnessModifier: 2,
                        abilitiesToAdd: ['Flying'],
                        duration: 'UNTIL_END_OF_TURN',
                        layer: 6,
                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                    },
                    {
                        type: 'ApplyContinuousEffect',
                        powerModifier: 2,
                        toughnessModifier: 2,
                        duration: 'UNTIL_END_OF_TURN',
                        layer: 7,
                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                    }
                ]
            }
        ]
    },

    "Basri Ket": {
        ...metadata["Basri Ket"],
        loyalty: "3",
        abilities: [
            {
                id: "basri_ket_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature'] },
                effects: [
                    { type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'TARGET_1' },
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Indestructible'], layer: 6, targetMapping: 'TARGET_1' }
                ]
            },
            {
                id: "basri_ket_minus_2",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-2' }],
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: {
                        name: 'Soldier', power: '1', toughness: '1', colors: ['W'],
                        types: ['Creature'], subtypes: ['Soldier'], keywords: [],
                        image_url: 'https://cards.scryfall.io/large/front/b/7/b7b55dcf-ae63-4b84-8d39-80b5a6de3c1a.jpg'
                    },
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }]
            },
            {
                id: "basri_ket_minus_6",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-6' }],
                effects: [{
                    type: 'CreateEmblem',
                    emblemBlueprint: {
                        name: "Basri Ket Emblem",
                        oracleText: "At the beginning of combat on your turn, create a 1/1 white Soldier creature token, then put a +1/+1 counter on each creature you control.",
                        abilities: [
                            {
                                triggerEvent: 'ON_BEGINNING_OF_COMBAT_STEP',
                                // Condition: only trigger on the emblem controller's turn
                                triggerCondition: (state: any, event: any, trigger: any) => {
                                    return state.activePlayerId === trigger.controllerId;
                                },
                                effects: [
                                    // 1. Create a 1/1 Soldier token for the controller
                                    {
                                        type: 'CreateToken',
                                        amount: 1,
                                        targetMapping: 'CONTROLLER',
                                        tokenBlueprint: {
                                            name: 'Soldier', power: '1', toughness: '1', colors: ['W'],
                                            types: ['Creature'], subtypes: ['Soldier'], keywords: [],
                                            image_url: 'https://cards.scryfall.io/large/front/b/7/b7b55dcf-ae63-4b84-8d39-80b5a6de3c1a.jpg'
                                        }
                                    },
                                    // 2. Put a +1/+1 counter on each creature the controller controls
                                    {
                                        type: 'AddCounters',
                                        amount: 1,
                                        value: '+1/+1',
                                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                                    }
                                ]
                            }
                        ]
                    }
                }]
            }
        ]
    },

    "Basri's Acolyte": {
        ...metadata["Basri's Acolyte"],
        abilities: [
            {
                id: "basri_acolyte_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                targetDefinition: { type: 'Permanent', count: 2, optional: true, restrictions: ['Creature', 'Other', 'YouControl'] },
                effects: [{ type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'TARGET_ALL' }],
            }
        ]
    },

    "Basri's Lieutenant": {
        ...metadata["Basri's Lieutenant"],
        abilities: [
            {
                id: "basri_lieutenant_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                // Rule 603.2: ETB usually triggers only for the object itself unless specified.
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
                effects: [{ type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'TARGET_1' }]
            },
            {
                id: "basri_lieutenant_death_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DEATH',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    const diedObj = event.data?.object;
                    if (!diedObj) return false;

                    // 1. Must be a creature (Rule 700.4)
                    const isCreature = (diedObj.definition?.types || []).some((t: string) => t.toLowerCase() === 'creature');
                    // 2. Must be controlled by the same player who controls this Lieutenant
                    const isController = diedObj.controllerId === source.controllerId;
                    // 3. Must have had a +1/+1 counter OR be the Lieutenant itself (Rule 603.10)
                    const hadCounter = (diedObj.counters || {})['+1/+1'] > 0;
                    const isSelf = diedObj.id === source.sourceId;

                    return isCreature && isController && (hadCounter || isSelf);
                },
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: {
                        name: 'Knight', power: '2', toughness: '2', colors: ['W'],
                        types: ['Creature'], subtypes: ['Knight'], keywords: ['Vigilance'],
                        image_url: 'https://cards.scryfall.io/large/front/2/0/204b3adf-e76b-4ce9-b84d-b4e65b7054d4.jpg'
                    },
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    },

    "Battle-Rattle Shaman": {
        ...metadata["Battle-Rattle Shaman"],
        abilities: [
            {
                id: "battle_rattle_shaman_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_BEGINNING_OF_COMBAT_STEP',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 2, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Bolt Hound": {
        ...metadata["Bolt Hound"],
        abilities: [
            {
                id: "bolt_hound_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'OTHER_CREATURES_YOU_CONTROL' }]
            }
        ]
    },

    "Bone Pit Brute": {
        ...metadata["Bone Pit Brute"],
        abilities: [
            {
                id: "bone_pit_brute_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 4, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Brash Taunter": {
        ...metadata["Brash Taunter"],
        abilities: [
            {
                id: "brash_taunter_indestructible",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', abilitiesToAdd: ['Indestructible'], layer: 6, targetMapping: 'SELF' }]
            },
            {
                id: "brash_taunter_damage_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DAMAGE_DEALT_TO_CREATURE',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.targetId === source.sourceId,
                targetDefinition: { type: 'Player', count: 1, restrictions: ['Opponent'] },
                effects: [{ type: 'DealDamage', amount: 'EVENT_AMOUNT', targetMapping: 'TARGET_1' }]
            },
            {
                id: "brash_taunter_fight",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{2}{R}' }, { type: 'Tap', value: null }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Other'] },
                effects: [{ type: 'Fight', targetMapping: 'SELF_AND_TARGET_1' }]
            }
        ]
    },

    "Burlfist Oak": {
        ...metadata["Burlfist Oak"],
        abilities: [
            {
                id: "burlfist_oak_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DRAW',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 2, toughnessModifier: 2, layer: 7, targetMapping: 'SELF' }]
            }
        ]
    },

    "Burn Bright": {
        ...metadata["Burn Bright"],
        abilities: [
            {
                id: "burn_bright_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 2, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    },

    "Caged Zombie": {
        ...metadata["Caged Zombie"],
        abilities: [
            {
                id: "caged_zombie_lose_life",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{B}' }, { type: 'Tap', value: null }],
                triggerCondition: (state: any) => state.turnState.creaturesDiedThisTurn > 0,
                effects: [{ type: 'LoseLife', amount: 2, targetMapping: 'EACH_OPPONENT' }]
            }
        ]
    },

    "Celestial Enforcer": {
        ...metadata["Celestial Enforcer"],
        abilities: [
            {
                id: "celestial_enforcer_tap",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{W}' }, { type: 'Tap', value: null }],
                triggerCondition: (state: any, event: any, source: any) => state.battlefield.some((o: any) => o.controllerId === source.controllerId && (o.effectiveStats?.keywords || []).includes('Flying')),
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'Tapped', value: true, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Chandra's Magmutt": {
        ...metadata["Chandra's Magmutt"],
        abilities: [
            {
                id: "chandra_magmutt_ping",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                targetDefinition: { type: 'AnyTarget', count: 1, restrictions: ['Player', 'Planeswalker'] },
                effects: [{ type: 'DealDamage', amount: 1, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Drowsing Tyrannodon": {
        ...metadata["Drowsing Tyrannodon"],
        abilities: [
            {
                id: "drowsing_tyrannodon_defender",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: 'ApplyContinuousEffect',
                    layer: 6,
                    abilitiesToRemove: ['Defender'],
                    condition: (state: any, source: any) => state.battlefield.some((o: any) => o.controllerId === source.controllerId && (o.effectiveStats?.power || 0) >= 4),
                    targetMapping: 'SELF'
                }]
            }
        ]
    },

    "Chandra, Heart of Fire": {
        ...metadata["Chandra, Heart of Fire"],
        loyalty: "5",
        abilities: [
            {
                id: "chandra_heart_fire_plus_1_a",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                effects: [
                    { type: 'DiscardCards', amount: -1, targetMapping: 'CONTROLLER' },
                    { type: 'ExileTopCard', amount: 3, targetMapping: 'CONTROLLER' },
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', value: 'MAY_PLAY_EXILED', targetMapping: 'CONTROLLER' }
                ]
            },
            {
                id: "chandra_heart_fire_plus_1_b",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [{ type: 'DealDamage', amount: 2, targetMapping: 'TARGET_1' }]
            },
            {
                id: "chandra_heart_fire_minus_9",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-9' }],
                effects: [
                    { 
                        type: 'Choice', 
                        label: 'Search Library and Graveyard for Red Instant/Sorcery cards', 
                        targetIdMapping: 'CONTROLLER_GRAVEYARD_AND_LIBRARY', 
                        restrictions: ['Red', 'InstantOrSorcery'], 
                        maxCount: 99, 
                        optional: true,
                        effects: [
                            { type: 'Exile', targetMapping: 'SELECTED' },
                            { type: 'ApplyContinuousEffect', value: 'MAY_CAST_WITHOUT_PAYING', duration: 'UNTIL_END_OF_TURN', targetMapping: 'CONTROLLER' }
                        ]
                    },
                    { type: 'Shuffle', targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Deathless Knight": {
        ...metadata["Deathless Knight"],
        keywords: ["Haste"],
        abilities: [
            {
                id: "deathless_knight_trigger",

                type: AbilityType.Triggered,
                triggerEvent: 'ON_LIFE_GAIN',
                activeZone: ZoneRequirement.Graveyard,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'ReturnToHand', targetMapping: 'SELF' }]
            }
        ]
    },

    "Dismal Backwater": {
        ...metadata["Dismal Backwater"],
        abilities: [
            {
                id: "dismal_backwater_etb_tapped",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'Tapped', value: true, targetMapping: 'SELF' }]
            },
            {
                id: "dismal_backwater_etb_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'GainLife', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Bloodfell Caves": {
        ...metadata["Bloodfell Caves"],
        abilities: [
            {
                id: "bloodfell_caves_etb_tapped",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'Tapped', targetMapping: 'SELF' }]
            },
            {
                id: "bloodfell_caves_etb_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'GainLife', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Blood Glutton": {
        ...metadata["Blood Glutton"],
        abilities: []
    },

    "Enthralling Hold": {
        ...metadata["Enthralling Hold"],
        abilities: [
            {
                id: "enthralling_hold_aura",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', layer: 2, value: 'CONTROL_ENCHANTED', targetMapping: 'SELF' }]
            }
        ]
    },

    "Experimental Overload": {
        name: "Experimental Overload",
        manaCost: "{2}{U}{R}",
        colors: ["blue", "red"],
        types: ["Sorcery"],
        supertypes: [],
        subtypes: [],
        keywords: [],
        type_line: "Sorcery",
        oracleText: "Create a 0/0 blue and red Weird creature token, then put X +1/+1 counters on it, where X is the number of instant and sorcery cards in your graveyard. You may return an instant or sorcery card from your graveyard to your hand. Exile Experimental Overload.",
        image_url: "https://cards.scryfall.io/large/front/d/1/d1fded7b-c97e-43ed-babf-db17d0a6c24a.jpg",
        abilities: [
            {
                id: "experimental_overload_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    {
                        type: 'CreateToken',
                        tokenBlueprint: {
                            name: 'Weird',
                            colors: ['U', 'R'],
                            types: ['Creature'],
                            subtypes: ['Weird'],
                            image_url: 'https://cards.scryfall.io/large/front/d/1/d1fded7b-c97e-43ed-babf-db17d0a6c24a.jpg'
                        },
                        amount: 1,
                        powerOverride: 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT',
                        toughnessOverride: 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT',
                        targetMapping: 'CONTROLLER'
                    },
                    {
                        type: 'Choice',
                        label: 'Scegli un Istantaneo o Stregoneria dal cimitero da rimettere in mano',
                        targetIdMapping: 'CONTROLLER_GRAVEYARD',
                        restrictions: ['Instant', 'Sorcery'],
                        optional: true,
                        effects: [
                            { type: 'ReturnToHand', targetMapping: 'SELECTED_CARD' }
                        ]
                    },
                    { type: 'Exile', targetMapping: 'SELF' }
                ]
            }
        ]
    },

    "Fierce Empath": {
        ...metadata["Fierce Empath"],
        abilities: [
            {
                id: "fierce_empath_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [
                    { 
                        type: 'SearchLibrary', 
                        reveal: true,
                        optional: true,
                        toZone: Zone.Hand,
                        restrictions: ['Creature', 'CMC>=6'],
                        targetMapping: 'CONTROLLER' 
                    }
                ]
            }
        ]
    },

    "Gadrak, the Crown-Scourge": {
        ...metadata["Gaddrak, the Crown-Scourge"],
        abilities: [
            {
                id: "gaddrak_attack_constraint",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: 'CombatConstraint',
                    value: 'CANNOT_ATTACK',
                    condition: (state: any) => state.battlefield.filter((o: any) => o.controllerId === state.activePlayerId && o.definition.types.includes('Artifact')).length < 4,
                    targetMapping: 'SELF'
                }]
            },
            {
                id: "gaddrak_end_step_treasure",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_END_STEP',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Treasure', types: ['Artifact'], subtypes: ['Treasure'], oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.' },
                    amount: -1, // Use state tracking for 'nontoken creatures that died this turn'
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    },

    "Garruk, Unleashed": {
        ...metadata["Garruk, Unleashed"],
        abilities: [
            {
                id: "garruk_unleashed_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '+1' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 3, toughnessModifier: 3, abilitiesToAdd: ['Trample'], layer: 7, targetMapping: 'TARGET_1' }]
            },
            {
                id: "garruk_unleashed_minus_2",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '-2' }],
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Beast', power: '3', toughness: '3', colors: ['G'], types: ['Creature'], subtypes: ['Beast'] },
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    },

    "Ghostly Pilferer": {
        ...metadata["Ghostly Pilferer"],
        abilities: [
            {
                id: "ghostly_pilferer_untap_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_UNTAP',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId !== source.controllerId,
                effects: [{ type: 'Choice', label: 'Pay {2} to draw?', costs: [{ type: 'Mana', value: '{2}' }], effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }] }]
            },
            {
                id: "ghostly_pilferer_cast_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_OPPONENT_CAST_NON_HAND',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId !== source.controllerId,
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Griffin Aerie": {
        ...metadata["Griffin Aerie"],
        abilities: [
            {
                id: "griffin_aerie_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_END_STEP',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && (state.turnState.lifeGainedThisTurn || 0) >= 3,
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Griffin', power: '2', toughness: '2', colors: ['W'], types: ['Creature'], subtypes: ['Griffin'], keywords: ['Flying'] },
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    },

    "Indulgent Aristocrat": {
        ...metadata["Indulgent Aristocrat"],
        keywords: ["Lifelink"],
        abilities: [
            {
                id: "indulgent_aristocrat_sacrifice",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Mana', value: '{2}' },
                    { type: 'Sacrifice', restrictions: ['Creature'] }
                ],
                effects: [{
                    type: 'AddCounters',
                    amount: 1,
                    value: '+1/+1',
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Vampire']
                }]
            }
        ]
    },

    "Liliana, Waker of the Dead": {
        ...metadata["Liliana, Waker of the Dead"],
        loyalty: "4",
        abilities: [
            {
                id: "liliana_waker_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                effects: [
                    { type: 'DiscardCard', targetMapping: 'EACH_PLAYER' },
                    { type: 'LoseLife', amount: 3, conditionPath: 'playerDidNotDiscard', targetMapping: 'EACH_OPPONENT' }
                ]
            },
            {
                id: "liliana_waker_minus_3",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-3' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: -1, toughnessModifier: -1, modifierPath: 'graveyardSize', targetMapping: 'TARGET_1' }]
            },
            {
                id: "liliana_waker_minus_7",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-7' }],
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Liliana Emblem', power: '', toughness: '', colors: ['B'], types: ['Emblem'], subtypes: ['Liliana'], keywords: [], oracleText: 'At the beginning of combat on your turn, put target creature card from a graveyard onto the battlefield under your control. It gains haste.' }, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Mangara, the Diplomat": {
        ...metadata["Mangara, the Diplomat"],
        abilities: [
            {
                id: "mangara_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACKERS_DECLARED',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    // "Whenever an opponent attacks with creatures..."
                    const isOpponent = event.playerId !== source.controllerId;
                    if (!isOpponent) return false;

                    // "...if two or more of those creatures are attacking you and/or planeswalkers you control..."
                    const myPlaneswalkers = state.battlefield
                        .filter((o: any) => o.controllerId === source.controllerId && (o.definition.types || []).includes('Planeswalker'))
                        .map((o: any) => o.id);

                    const attackingMeOrMyPWs = (event.data.attackers || []).filter((a: any) =>
                        a.targetId === source.controllerId || myPlaneswalkers.includes(a.targetId)
                    );

                    return attackingMeOrMyPWs.length >= 2;
                },
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "mangara_second_spell_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_SECOND_SPELL_CAST',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    // "Whenever an opponent casts their second spell each turn..."
                    return event.playerId !== source.controllerId;
                },
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Mazemind Tome": {
        ...metadata["Mazemind Tome"],
        abilities: [
            {
                id: "mazemind_tome_scry",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                effects: [
                    { type: 'AddCounters', amount: 1, value: 'page', targetMapping: 'SELF' },
                    { type: 'Scry', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            },
            {
                id: "mazemind_tome_draw",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{2}' }, { type: 'Tap', value: null }],
                effects: [
                    { type: 'AddCounters', amount: 1, value: 'page', targetMapping: 'SELF' },
                    { type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            },
            {
                id: "mazemind_tome_exile_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_COUNTER_ADDED',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any) => event.counterType === 'page' && (event.target.counters['page'] || 0) >= 4,
                effects: [
                    { type: 'Exile', targetMapping: 'SELF' },
                    { type: 'GainLife', amount: 4, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Mistral Singer": {
        ...metadata["Mistral Singer"],
        abilities: []
    },

    "Scavenging Ooze": {
        name: "Scavenging Ooze",
        manaCost: "{1}{G}",
        colors: ["green"],
        types: ["Creature"],
        subtypes: ["Ooze"],
        supertypes: [],
        oracleText: "{G}: Exile target card from a graveyard. If it was a creature card, put a +1/+1 counter on Scavenging Ooze and you gain 1 life.",
        image_url: "https://cards.scryfall.io/normal/front/1/7/17b59819-4746-4c67-b6e5-4157d498a065.jpg",
        keywords: [],
        abilities: [
            {
                id: "scavenging_ooze_exile",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{G}' }],
                targetDefinition: { type: 'Card', count: 1, restrictions: ['Graveyard'] },
                effects: [
                    { type: 'Exile', targetMapping: 'TARGET_1' },
                    { type: 'AddCounters', amount: 1, value: '+1/+1', condition: 'targetWasCreature', targetMapping: 'SELF' },
                    { type: 'GainLife', amount: 1, condition: 'targetWasCreature', targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Teferi, Master of Time": {
        name: "Teferi, Master of Time",
        manaCost: "{2}{U}{U}",
        colors: ["blue"],
        types: ["Planeswalker"],
        subtypes: ["Teferi"],
        supertypes: ["Legendary"],
        oracleText: "You may activate loyalty abilities of Teferi, Master of Time on any player's turn any time you could cast an instant.\n+1: Draw a card, then discard a card.\n−3: Target creature an opponent controls phases out. (Treat it and anything attached to it as though they don't exist until its controller's next turn.)\n−10: Take two extra turns after this one.",
        image_url: "https://cards.scryfall.io/normal/front/9/c/9c0c61e3-9f3d-4e7f-9046-0ea336dd8a2d.jpg",
        loyalty: "3",
        keywords: [],
        abilities: [
            {
                id: "teferi_master_any_turn",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'AllowOutOfTurnActivation', targetMapping: 'SELF' }]
            },
            {
                id: "teferi_master_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }, { type: 'DiscardCards', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "teferi_master_minus_3",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-3' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'OpponentControl'] },
                effects: [{ type: 'PhasedOut', value: true, targetMapping: 'TARGET_1' }]
            },
            {
                id: "teferi_master_minus_10",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-10' }],
                effects: [{ type: 'ExtraTurns', amount: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Nine Lives": {
        ...metadata["Nine Lives"],
        keywords: ["Hexproof"],
        abilities: [
            {
                id: "nine_lives_replacement_damage",
                type: AbilityType.Replacement,
                activeZone: ZoneRequirement.Battlefield,
                replaceEvent: 'ON_DAMAGE_DEALT_TO_PLAYER',
                effects: [
                    { type: 'PreventDamage', targetMapping: 'CONTROLLER' },
                    { type: 'AddCounters', amount: 1, value: 'incarnation', targetMapping: 'SELF' }
                ]
            },
            {
                id: "nine_lives_loosing_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_COUNTER_ADDED',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any) => event.counterType === 'incarnation' && (event.target.counters['incarnation'] || 0) >= 9,
                effects: [
                    { type: 'Exile', targetMapping: 'SELF' },
                    { type: 'LoseGame', targetMapping: 'CONTROLLER' }
                ]
            },
            {
                id: "nine_lives_leave_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_LEAVE_BATTLEFIELD',
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'LoseGame', targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Pack Leader": {
        ...metadata["Pack Leader"],
        abilities: [
            {
                id: "pack_leader_anthem",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: 'ApplyContinuousEffect',
                    powerModifier: 1,
                    toughnessModifier: 1,
                    layer: 7,
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Dog', 'other']
                }]
            },
            {
                id: "pack_leader_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.attackerId === source.sourceId,
                effects: [{
                    type: 'AddPreventionEffect',
                    damageType: 'CombatDamage',
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Dog'],
                    duration: 'UntilEndOfTurn'
                }]
            }
        ]
    },

    "Peer into the Abyss": {
        ...metadata["Peer into the Abyss"],
        abilities: [
            {
                id: "peer_into_abyss_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Player', count: 1 },
                effects: [
                    { type: 'DrawCards', amount: 'HALF_LIBRARY_ROUND_UP', targetMapping: 'TARGET_1' },
                    { type: 'LoseLife', amount: 'HALF_LIFE_ROUND_UP', targetMapping: 'TARGET_1' }
                ]
            }
        ]
    },

    "See the Truth": {
        ...metadata["See the Truth"],
        abilities: [
            {
                id: "see_the_truth_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    {
                        condition: "castFromHand",
                        type: 'LookAtTopAndPick',
                        amount: 3,
                        targetMapping: 'CONTROLLER'
                    },
                    {
                        condition: "notCastFromHand",
                        type: 'DrawCards',
                        amount: 3,
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    },

    "Stormwing Entity": {
        ...metadata["Stormwing Entity"],
        keywords: ["Flying"],
        abilities: [
            {
                id: "stormwing_cost_reduction",
                type: AbilityType.Static,
                activeZone: Zone.Hand,
                effects: [
                    {
                        type: 'CostReduction',
                        targetMapping: 'SELF',
                        manaReduction: '{3}{U}',
                        restrictions: ['instantorsorcerycastthisturn']
                    }
                ]
            },
            {
                id: "stormwing_etb_scry",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'Scry', amount: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Sublime Epiphany": {
        ...metadata["Sublime Epiphany"],
        abilities: [
            {
                id: "sublime_epiphany_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                multiMode: { type: 'CHOOSE_ONE_OR_MORE' },
                modes: [
                    { label: 'Counter target spell', targetDefinition: { type: 'Spell' }, effects: [{ type: 'CounterSpell', targetMapping: 'TARGET_1' }] },
                    { label: 'Counter target activated or triggered ability', targetDefinition: { type: 'Ability' }, effects: [{ type: 'CounterAbility', targetMapping: 'TARGET_1' }] },
                    { label: 'Return target nonland permanent to owner hand', targetDefinition: { type: 'Permanent', restrictions: ['Nonland'] }, effects: [{ type: 'ReturnToHand', targetMapping: 'TARGET_1' }] },
                    { label: 'Create token copy of target creature', targetDefinition: { type: 'Permanent', restrictions: ['Creature', 'YouControl'] }, effects: [{ type: 'CreateTokenCopy', targetMapping: 'TARGET_1' }] },
                    { label: 'Target player draws a card', targetDefinition: { type: 'Player' }, effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'TARGET_1' }] }
                ]
            }
        ]
    },

    "Tormod's Crypt": {
        ...metadata["Tormod's Crypt"],
        abilities: [
            {
                id: "tormod_crypt_exile",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Tap' },
                    { type: 'Sacrifice', targetMapping: 'SELF' }
                ],
                targetDefinition: { type: 'Player', count: 1 },
                effects: [
                    { type: 'ExileAllCards', targetMapping: 'TARGET_1' }
                ]
            }
        ]
    },

    "Conspicuous Snoop": {
        ...metadata["Conspicuous Snoop"],
        abilities: [
            {
                id: "snoop_reveal_top",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'PlayWithTopCardRevealed', targetMapping: 'CONTROLLER' }]
            },
            {
                id: "snoop_cast_goblins",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'AllowCastFromTop', restrictions: ['Goblin'], targetMapping: 'SELF' }]
            },
            {
                id: "snoop_gain_abilities",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'GainAbilitiesOfTopCard', condition: 'TOP_CARD_IS_GOBLIN', targetMapping: 'SELF' }]
            }
        ]
    },

    "Double Vision": {
        ...metadata["Double Vision"],
        abilities: [
            {
                id: "double_vision_copy",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_CAST_FIRST_INSTANT_SORCERY',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'CopySpellOnStack', targetMapping: 'TRIGGER_SOURCE' }]
            }
        ]
    },

    "Terror of the Peaks": {
        ...metadata["Terror of the Peaks"],
        keywords: ["Flying", "Ward 3_LIFE"],
        abilities: [
            {
                id: "terror_peaks_etb_damage",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB_OTHER',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) =>
                    event.data?.object?.controllerId === source.controllerId &&
                    event.data?.object?.definition?.types?.some((t: string) => t.toLowerCase() === 'creature'),
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [{ type: 'DealDamage', amount: 'EVENT_OBJECT_POWER', targetMapping: 'ANY_TARGET' }]
            }
        ]
    },

    "Vito, Thorn of the Dusk Rose": {
        ...metadata["Vito, Thorn of the Dusk Rose"],
        abilities: [
            {
                id: "vito_life_gain_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_LIFE_GAIN',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                targetDefinition: { type: 'Opponent', count: 1 },
                effects: [{ type: 'LoseLife', amount: 'EVENT_AMOUNT', targetMapping: 'TARGET_1' }]
            },
            {
                id: "vito_activated_lifelink",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{3}{B}{B}' }],
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', layer: 6, abilitiesToAdd: ['Lifelink'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    },

    "Wildwood Scourge": {
        ...metadata["Wildwood Scourge"],
        entersWithXCounters: true,
        abilities: [
            {
                id: "wildwood_scourge_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_COUNTERS_ADDED_OTHER',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) =>
                    event.data?.object?.controllerId === source.controllerId &&
                    event.counterType === '+1/+1' &&
                    !event.data?.object?.definition?.subtypes?.includes('Hydra'),
                effects: [{ type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'SELF' }]
            }
        ]
    },

    "Containment Priest": {
        ...metadata["Containment Priest"],
        keywords: ["Flash"],
        abilities: [
            {
                id: "containment_priest_entry_replacement",
                type: 'Replacement',
                activeZone: ZoneRequirement.Battlefield,
                oracleText: "If a nontoken creature would enter the battlefield and it wasn't cast, exile it instead."
            }
        ]
    },

    "Sanctum of All": {
        ...metadata["Sanctum of All"],
        abilities: [
            {
                id: "sanctum_all_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'SearchLibrary', value: 'Shrine', targetMapping: 'CONTROLLER' }, { type: 'PutOnBattlefield', targetMapping: 'TARGET_1' }]
            },
            {
                id: "sanctum_all_trigger_double",
                type: AbilityType.Replacement,
                activeZone: ZoneRequirement.Battlefield,
                replaceEvent: 'ON_SHRINE_TRIGGER',
                triggerCondition: (state: any) => state.battlefield.filter((o: any) => o.definition.subtypes.includes('Shrine')).length >= 5,
                effects: [{ type: 'AddAdditionalTrigger', targetMapping: 'TRIGGER_SOURCE' }]
            }
        ]
    },

    "Elder Gargaroth": {
        ...metadata["Elder Gargaroth"],
        abilities: [
            {
                id: "elder_gargaroth_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACK_OR_BLOCK',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.sourceId === source.sourceId,
                effects: [{
                    type: 'Choice',
                    label: 'Choose a mode for Elder Gargaroth:',
                    choices: [
                        { label: 'Create 3/3 Beast', effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Beast', power: '3', toughness: '3', colors: ['G'], types: ['Creature'], subtypes: ['Beast'] }, targetMapping: 'CONTROLLER' }] },
                        { label: 'Gain 3 life', effects: [{ type: 'GainLife', amount: 3, targetMapping: 'CONTROLLER' }] },
                        { label: 'Draw a card', effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }] }
                    ]
                }]
            }
        ]
    },

    "Primal Might": {
        ...metadata["Primal Might"],
        abilities: [
            {
                id: "primal_might_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                costs: [{ type: 'Mana', value: '{X}{G}' }],
                targetDefinition: { type: 'Permanent', count: 2, restrictions: ['Creature', 'YouControl', 'Creature', 'OpponentControl'] },
                effects: [
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 'X', toughnessModifier: 'X', layer: 7, targetMapping: 'TARGET_1' },
                    { type: 'Fight', targetMapping: 'TARGET_1', target2Mapping: 'TARGET_2' }
                ]
            }
        ]
    },

    "Chandra's Incinerator": {
        ...metadata["Chandra's Incinerator"],
        abilities: [
            {
                id: "chandra_incinerator_discount",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Hand,
                effects: [{ type: 'CostReduction', value: 'NONCOMBAT_DAMAGE_DEALT_THIS_TURN', targetMapping: 'SELF' }]
            },
            {
                id: "chandra_incinerator_trample_damage",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_NONCOMBAT_DAMAGE_OPPONENT',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.players[event.playerId]?.isOpponentOf?.(source.controllerId) || event.playerId !== source.controllerId,
                effects: [{ type: 'DealDamage', amount: 'DAMAGE_DEALT_AMOUNT', targetMapping: 'TARGET_CREATURE_OR_PW_OPPONENT' }]
            }
        ]
    },

    "Obsessive Stitcher": {
        ...metadata["Obsessive Stitcher"],
        abilities: [
            {
                id: "stitcher_loot",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{U}' }, { type: 'Tap', value: null }],
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }, { type: 'DiscardCard', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "stitcher_reanimate",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{2}{B}' }, { type: 'Tap', value: null }, { type: 'Sacrifice', targetMapping: 'SELF' }],
                targetDefinition: { type: 'CardInGraveyard', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'PutOnBattlefield', targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Rin and Seri, Inseparable": {
        ...metadata["Rin and Seri, Inseparable"],
        abilities: [
            {
                id: "rin_seri_cast_dog",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_CAST_SPELL',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.data?.card?.definition?.subtypes?.includes('Dog'),
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Cat', power: '1', toughness: '1', colors: ['G'], types: ['Creature'], subtypes: ['Cat'] }, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "rin_seri_cast_cat",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_CAST_SPELL',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.data?.card?.definition?.subtypes?.includes('Cat'),
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Dog', power: '1', toughness: '1', colors: ['W'], types: ['Creature'], subtypes: ['Dog'] }, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "rin_seri_activated",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{R}{G}{W}' }, { type: 'Tap' }],
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [
                    { type: 'DealDamage', amount: 'COUNT_Dog', targetMapping: 'TARGET_1' },
                    { type: 'GainLife', amount: 'COUNT_Cat', targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Niambi, Esteemed Speaker": {
        ...metadata["Niambi, Esteemed Speaker"],
        abilities: [
            {
                id: "niambi_etb_bounce",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature', 'Legendary', 'YouControl', 'Other'] },
                effects: [{ type: 'ReturnToHand', targetMapping: 'TARGET_1' }, { type: 'GainLife', amount: 'TARGET_1_CMC', targetMapping: 'CONTROLLER' }],
                oracleText: "When Niambi, Esteemed Speaker enters the battlefield, you may return another target legendary creature you control to its owner's hand. If you do, you gain life equal to that creature's mana value."
            },
            {
                id: "niambi_discard_draw",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{W}{U}' }, { type: 'Tap', value: null }, { type: 'Discard', restrictions: ['Legendary', 'Card'] }],
                effects: [{ type: 'DrawCards', amount: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Speaker of the Heavens": {
        ...metadata["Speaker of the Heavens"],
        abilities: [
            {
                id: "speaker_heavens_angel",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                triggerCondition: (state: any) => state.players[state.activePlayerId].life >= 27, // 20 + 7
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Angel', power: '4', toughness: '4', colors: ['W'], types: ['Creature'], subtypes: ['Angel'], keywords: ['Flying'] }, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Conclave Mentor": {
        ...metadata["Conclave Mentor"],
        abilities: [
            {
                id: "conclave_mentor_replacement",
                type: AbilityType.Replacement,
                activeZone: ZoneRequirement.Battlefield,
                replaceEvent: 'ON_ADD_COUNTERS',
                triggerCondition: (state: any, event: any, source: any) => event.counterType === '+1/+1' && event.target.controllerId === source.controllerId,
                effects: [{ type: 'ModifyCounterAmount', amount: 1, targetMapping: 'TRIGGER_EVENT' }]
            },
            {
                id: "conclave_mentor_death_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DEATH',
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'GainLife', amount: 'POWER', targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Baneslayer Angel": {
        ...metadata["Baneslayer Angel"],
        abilities: [
            {
                id: "baneslayer_angel_protection",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    { type: 'ApplyContinuousEffect', layer: 6, abilitiesToAdd: ['Protection from Demons'], targetMapping: 'SELF' },
                    { type: 'ApplyContinuousEffect', layer: 6, abilitiesToAdd: ['Protection from Dragons'], targetMapping: 'SELF' }
                ]
            }
        ]
    },

    "Idol of Endurance": {
        ...metadata["Idol of Endurance"],
        abilities: [
            {
                id: "idol_endurance_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ExileZoneCards', zone: Zone.Graveyard, restrictions: ['Creature', 'CMC<=3'], targetMapping: 'CONTROLLER', linked: 'IDOL_CARDS' }]
            },
            {
                id: "idol_endurance_activated",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{W}' }, { type: 'Tap', value: null }],
                effects: [{ type: 'AllowCastFromExile', linked: 'IDOL_CARDS', duration: 'UNTIL_END_OF_TURN', targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Angelic Ascension": {
        ...metadata["Angelic Ascension"],
        abilities: [
            {
                id: "angelic_ascension_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Planeswalker'] },
                effects: [
                    { type: 'Exile', targetMapping: 'TARGET_1' },
                    { type: 'CreateToken', tokenBlueprint: { name: 'Angel', power: '4', toughness: '4', colors: ['W'], types: ['Creature'], subtypes: ['Angel'], keywords: ['Flying'] }, targetMapping: 'TARGET_1_CONTROLLER' }
                ]
            }
        ]
    },

    "Teferi's Tutelage": {
        ...metadata["Teferi's Tutelage"],
        abilities: [
            {
                id: "teferi_tutelage_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }, { type: 'DiscardCard', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "teferi_tutelage_draw_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DRAW',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                targetDefinition: { type: 'Player', restrictions: ['Opponent'], count: 1 },
                effects: [{ type: 'Mill', amount: 2, repeatIfTypeMatch: ['Nonland', 'Nonland'], targetMapping: 'TARGET_OPPONENT' }]
            }
        ]
    },

    "Teferi's Ageless Insight": {
        ...metadata["Teferi's Ageless Insight"],
        abilities: [
            {
                id: "teferi_ageless_replacement",
                type: AbilityType.Replacement,
                activeZone: ZoneRequirement.Battlefield,
                replaceEvent: 'ON_DRAW',
                triggerCondition: (state: any) => (state.turnState.cardsDrawnThisTurn || 0) >= 1,
                effects: [{ type: 'ModifyDrawAmount', multiplier: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Jolrael, Mwonvuli Recluse": {
        ...metadata["Jolrael, Mwonvuli Recluse"],
        abilities: [
            {
                id: "jolrael_second_draw_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DRAW',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId && (state.turnState.cardsDrawnThisTurn[source.controllerId] || 0) === 2,
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Cat', power: '2', toughness: '2', colors: ['G'], types: ['Creature'], subtypes: ['Cat'] }, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "jolrael_activated_draw_buff",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{4}{G}{G}' }],
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerSet: 'COUNT_hand', toughnessSet: 'COUNT_hand', layer: 7, targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    },

    "Silversmote Ghoul": {
        ...metadata["Silversmote Ghoul"],
        abilities: [
            {
                id: "silversmote_ghoul_return",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_END_STEP',
                activeZone: ZoneRequirement.Graveyard,
                triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && (state.turnState.lifeGainedThisTurn || 0) >= 3,
                effects: [{ type: 'PutOnBattlefield', targetMapping: 'SELF', tapped: true }]
            },
            {
                id: "silversmote_ghoul_sacrifice",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{B}' }, { type: 'Sacrifice', targetMapping: 'SELF' }],
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Demonic Embrace": {
        ...metadata["Demonic Embrace"],
        abilities: [
            {
                id: "demonic_embrace_aura",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 3, toughnessModifier: 1, abilitiesToAdd: ['Flying'], layer: 7, targetMapping: 'ENCHANTED_CREATURE' }]
            },
            {
                id: "demonic_embrace_graveyard_cast",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Graveyard,
                effects: [{ type: 'AllowCastFromGraveyard', additionalCosts: [{ type: 'Life', value: 3 }, { type: 'Discard', amount: 1 }], targetMapping: 'SELF' }]
            }
        ]
    },

    "Liliana's Steward": {
        ...metadata["Liliana's Steward"],
        abilities: [
            {
                id: "liliana_steward_sacrifice",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                activatedOnlyAsSorcery: true,
                costs: [{ type: 'Tap', value: null }, { type: 'Sacrifice', targetMapping: 'SELF' }],
                targetDefinition: { type: 'Player', count: 1, restrictions: ['Opponent'] },
                effects: [{ type: 'DiscardCard', amount: 1, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Light of Promise": {
        ...metadata["Light of Promise"],
        abilities: [
            {
                id: "light_promise_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [] 
            },
            {
                id: "light_promise_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_LIFE_GAIN',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    const hostId = (source as any).attachedTo;
                    if (!hostId) return false;
                    const host = state.battlefield.find((o: any) => o.id === hostId);
                    return host && event.playerId === host.controllerId;
                },
                effects: [{ type: 'AddCounters', amount: 'EVENT_AMOUNT', value: '+1/+1', targetMapping: 'ENCHANTED_CREATURE' }]
            }
        ]
    },

    "Aven Gagglemaster": {
        ...metadata["Aven Gagglemaster"],
        abilities: [
            {
                id: "aven_gagglemaster_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'GainLife', amount: '2_PER_FLYING_CREATURE_YOU_CONTROL', targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Angelic Page": {
        ...metadata["Angelic Page"],
        abilities: [
            {
                id: "angelic_page_buff",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'AttackingOrBlocking'] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 1, toughnessModifier: 1, layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Daybreak Charger": {
        ...metadata["Daybreak Charger"],
        abilities: [
            {
                id: "daybreak_charger_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 2, toughnessModifier: 0, layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Staunch Shieldmate": {
        ...metadata["Staunch Shieldmate"],
        abilities: [] // Vanilla
    },

    "Swift Response": {
        ...metadata["Swift Response"],
        abilities: [
            {
                id: "swift_response_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Tapped'] },
                effects: [{ type: 'Destroy', targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Vryn Wingmare": {
        ...metadata["Vryn Wingmare"],
        abilities: [
            {
                id: "vryn_wingmare_tax",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'SpellTax', amount: 1, restrictions: ['Noncreature'], targetMapping: 'EACH_PLAYER' }]
            }
        ]
    },

    "Gale Swooper": {
        ...metadata["Gale Swooper"],
        abilities: [
            {
                id: "gale_swooper_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'], layer: 6, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Feat of Resistance": {
        ...metadata["Feat of Resistance"],
        abilities: [
            {
                id: "feat_resistance_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
                effects: [
                    { type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'TARGET_1' },
                    {
                        type: 'Choice', label: 'Choose a color', targetMapping: 'TARGET_1', choices: [
                            { label: 'White', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from White'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Blue', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from Blue'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Black', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from Black'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Red', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from Red'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Green', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from Green'], layer: 6, targetMapping: 'TARGET_1' }] }
                        ]
                    }
                ]
            }
        ]
    },

    "Falconer Adept": {
        ...metadata["Falconer Adept"],
        abilities: [
            {
                id: "falconer_adept_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.targetId === source.sourceId,
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Bird', power: '1', toughness: '1', colors: ['W'], types: ['Creature'], subtypes: ['Bird'], keywords: ['Flying'] },
                    targetMapping: 'CONTROLLER',
                    isAttacking: true
                }]
            }
        ]
    },

    "Secure the Scene": {
        ...metadata["Secure the Scene"],
        abilities: [
            {
                id: "secure_scene_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Nonland'] },
                effects: [
                    { type: 'Exile', targetMapping: 'TARGET_1' },
                    {
                        type: 'CreateToken',
                        tokenBlueprint: {
                            name: 'Soldier',
                            power: '1',
                            toughness: '1',
                            colors: ['W'],
                            types: ['Creature'],
                            subtypes: ['Soldier'],
                            cmc: 0,
                            image_url: 'https://cards.scryfall.io/large/front/d/0/d003cc2e-6e47-49f3-8f0a-b3287667bf97.jpg'
                        },
                        targetMapping: 'TARGET_1_CONTROLLER'
                    }
                ]
            }
        ]
    },

    "Garruk's Uprising": {
        ...metadata["Garruk's Uprising"],
        abilities: [
            {
                id: "garruk_uprising_etb_draw",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.battlefield.some((o: any) => o.controllerId === source.controllerId && (o.effectiveStats?.power || 0) >= 4),
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "garruk_uprising_trample_static",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', layer: 6, abilitiesToAdd: ['Trample'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            },
            {
                id: "garruk_uprising_creature_etb_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB_OTHER',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.target.controllerId === source.controllerId && (event.target.effectiveStats?.power || 0) >= 4 && event.target.id !== source.sourceId,
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Garruk's Harbinger": {
        ...metadata["Garruk's Harbinger"],
        keywords: ["Hexproof from black", "Trample"],
        abilities: [
            {
                id: "harbinger_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: ['ON_DAMAGE_TAKED', 'ON_DAMAGE_PLAYER'],
                triggerCondition: (state: any, event: any, t: any) => {
                    // Deal combat damage to player or planeswalker
                    if (event.sourceId !== t.sourceId || !event.data?.isCombat) return false;

                    const target = state.players[event.targetId] || state.battlefield.find((o: any) => o.id === event.targetId);
                    if (!target) return false;

                    if (state.players[event.targetId]) return true; // It's a player
                    return (target as any).definition.types.some((type: string) => type.toLowerCase() === 'planeswalker');
                },
                effects: [
                    {
                        type: EffectType.LookAtTopAndPick,
                        amount: 'EVENT_AMOUNT',
                        targetMapping: 'CONTROLLER',
                        reveal: true,
                        optional: true,
                        hideUndo: true,
                        restrictions: [
                            'creature',
                            { types: ['planeswalker'], nameIncludes: 'Garruk' }
                        ]
                    }
                ]
            }
        ]
    },

    "Heartfire Immolator": {
        ...metadata["Heartfire Immolator"],
        abilities: [
            {
                id: "heartfire_immolator_sacrifice",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{R}' }, { type: 'Sacrifice', targetMapping: 'SELF' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Planeswalker'] },
                effects: [{ type: 'DealDamage', amount: 'POWER', targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Sanctum of Calm Waters": {
        ...metadata["Sanctum of Calm Waters"],
        abilities: [
            {
                id: "sanctum_calm_waters_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_PRE_COMBAT_MAIN_PHASE_START',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [
                    {
                        type: 'Choice',
                        label: 'Draw cards for each Sanctum you control? (and discard a card)',
                        choices: [
                            {
                                label: 'Yes',
                                effects: [
                                    { type: 'DrawCards', amount: 'COUNT_Shrine', targetMapping: 'CONTROLLER' },
                                    { type: 'DiscardCards', amount: 1, targetMapping: 'CONTROLLER' }
                                ]
                            },
                            { label: 'No', effects: [] }
                        ],
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    },

    "Sanctum of Stone Fangs": {
        ...metadata["Sanctum of Stone Fangs"],
        abilities: [
            {
                id: "sanctum_stone_fangs_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_PRE_COMBAT_MAIN_PHASE_START',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [
                    { type: 'LoseLife', amount: 'COUNT_Shrine', targetMapping: 'EACH_OPPONENT' },
                    { type: 'GainLife', amount: 'COUNT_Shrine', targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Sanctum of Fruitful Harvest": {
        ...metadata["Sanctum of Fruitful Harvest"],
        abilities: [
            {
                id: "sanctum_fruitful_harvest_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_PRE_COMBAT_MAIN_PHASE_START',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'AddMana', amount: 'COUNT_Shrine', manaType: 'ANY', targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Sanctum of Shattered Heights": {
        ...metadata["Sanctum of Shattered Heights"],
        abilities: [
            {
                id: "sanctum_shattered_heights_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_PRE_COMBAT_MAIN_PHASE_START',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                costs: [{ type: 'Mana', value: '{1}' }, { type: 'Discard', targetMapping: 'SELF' }], // Wait, Shattered Heights cost is discard card
                effects: [{ type: 'DealDamage', amount: 'COUNT_Shrine', targetMapping: 'TARGET_1' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Planeswalker'] }
            }
        ]
    },

    "Sanctum of Tranquil Light": {
        ...metadata["Sanctum of Tranquil Light"],
        abilities: [
            {
                id: "sanctum_tranquil_light_tap",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{5}{W}' }], // Reduction needed
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'Tap', targetMapping: 'TARGET_1' }],
                costReduction: { type: 'ManaReduction', amount: 'COUNT_Shrine', manaType: 'GENERIC' }
            }
        ]
    },

    "Goremand": {
        ...metadata["Goremand"],
        abilities: [
            {
                id: "goremand_sacrifice_cost",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Hand,
                effects: [{ type: 'AdditionalCost', costs: [{ type: 'Sacrifice', restrictions: ['Creature'] }], targetMapping: 'SELF' }]
            },
            {
                id: "goremand_etb_sacrifice",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'Sacrifice', restrictions: ['Creature'], targetMapping: 'EACH_OPPONENT' }]
            }
        ]
    },

    "Heroic Intervention": {
        ...metadata["Heroic Intervention"],
        abilities: [
            {
                id: "heroic_intervention_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Hexproof', 'Indestructible'], layer: 6, targetMapping: 'ALL_PERMANENTS_YOU_CONTROL' }
                ]
            }
        ]
    },

    "Glorious Anthem": {
        ...metadata["Glorious Anthem"],
        abilities: [
            {
                id: "glorious_anthem_static",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 1, layer: 7, targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    },

    "Havoc Jester": {
        ...metadata["Havoc Jester"],
        abilities: [
            {
                id: "havoc_jester_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_SACRIFICE',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [{ type: 'DealDamage', amount: 1, targetMapping: 'ANY_TARGET' }]
            }
        ]
    },

    "Opt": {
        ...metadata["Opt"],
        abilities: [
            {
                id: "opt_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'Scry', amount: 1, targetMapping: 'CONTROLLER' },
                    { type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Shock": {
        ...metadata["Shock"],
        abilities: [
            {
                id: "shock_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [{ type: 'DealDamage', amount: 2, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Revitalize": {
        ...metadata["Revitalize"],
        abilities: [
            {
                id: "revitalize_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'GainLife', amount: 3, targetMapping: 'CONTROLLER' },
                    { type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Defiant Strike": {
        ...metadata["Defiant Strike"],
        abilities: [
            {
                id: "defiant_strike_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [
                    { type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' },
                    { type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Alpine Watchdog": {
        ...metadata["Alpine Watchdog"],
        abilities: []
    },

    "Anointed Chorister": {
        ...metadata["Anointed Chorister"],
        abilities: [
            {
                id: "anointed_chorister_pump",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{4}{W}' }],
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 3, toughnessModifier: 3, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'SELF' }]
            }
        ]
    },

    "Selfless Savior": {
        ...metadata["Selfless Savior"],
        abilities: [
            {
                id: "selfless_savior_sac",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Sacrifice', restrictions: ['SELF'] }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Another'] },
                effects: [{ type: 'ApplyContinuousEffect', abilitiesToAdd: ['Indestructible'], duration: 'UNTIL_END_OF_TURN', layer: 6, targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Duress": {
        ...metadata["Duress"],
        abilities: [
            {
                id: "duress_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Player', count: 1, restrictions: ['Opponent'] },
                effects: [
                    {
                        type: 'Choice',
                        label: 'Choose a noncreature, nonland card',
                        targetMapping: 'TARGET_1',
                        targetIdMapping: 'TARGET_1_HAND',
                        restrictions: ['Noncreature', 'Nonland'],
                        effects: [{ type: 'DiscardCards', amount: 1, targetMapping: 'SELECTED_CARD' }]
                    }
                ]
            }
        ]
    },

    "Bad Deal": {
        ...metadata["Bad Deal"],
        abilities: [
            {
                id: "bad_deal_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'DrawCards', amount: 2, targetMapping: 'CONTROLLER' },
                    { type: 'DiscardCards', amount: 2, targetMapping: 'EACH_OPPONENT' },
                    { type: 'LoseLife', amount: 2, targetMapping: 'EACH_PLAYER' }
                ]
            }
        ]
    },

    "Village Rites": {
        ...metadata["Village Rites"],
        abilities: [
            {
                id: "village_rites_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                costs: [{ type: 'Sacrifice', restrictions: ['Creature'] }],
                effects: [{ type: 'DrawCards', amount: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    },

    "Alchemist's Gift": {
        ...metadata["Alchemist's Gift"],
        abilities: [
            {
                id: "alchemist_gift_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [
                    { type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 1, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' },
                    {
                        type: 'Choice',
                        label: 'Choose a keyword',
                        choices: [
                            { label: 'Deathtouch', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Deathtouch'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Lifelink', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'], layer: 6, targetMapping: 'TARGET_1' }] }
                        ]
                    }
                ]
            }
        ]
    },

    "Basri's Solidarity": {
        ...metadata["Basri's Solidarity"],
        abilities: [
            {
                id: "basri_solidarity_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [{ type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    },

    "Chandra's Outrage": {
        ...metadata["Chandra's Outrage"],
        abilities: [
            {
                id: "chandra_outrage_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [
                    { type: 'DealDamage', amount: 4, targetMapping: 'TARGET_1' },
                    { type: 'DealDamage', amount: 2, targetMapping: 'TARGET_1_CONTROLLER' }
                ]
            }
        ]
    },

    "Rain of Revelation": {
        ...metadata["Rain of Revelation"],
        abilities: [
            {
                id: "rain_revelation_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'DrawCards', amount: 3, targetMapping: 'CONTROLLER' },
                    { type: 'DiscardCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    },

    "Eliminate": {
        ...metadata["Eliminate"],
        abilities: [
            {
                id: "eliminate_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['CreatureOrPlaneswalker', 'CMC<=3'] },
                effects: [{ type: 'Destroy', targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Liliana's Devotee": {
        ...metadata["Liliana's Devotee"],
        abilities: [
            {
                id: "liliana_devotee_lord",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 0, targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL', restrictions: ['Zombie'], layer: 7 }]
            },
            {
                id: "liliana_devotee_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_END_STEP',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && state.turnState.creaturesDiedThisTurn > 0,
                effects: [
                    {
                        type: 'Choice',
                        choices: [
                            {
                                label: 'Pay {1}{B} to create a Zombie',
                                costs: [{ type: 'Mana', value: '{1}{B}' }],
                                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Zombie', power: '2', toughness: '2', colors: ['B'], types: ['Creature'], subtypes: ['Zombie'] }, targetMapping: 'CONTROLLER' }]
                            },
                            { label: 'Do not pay', effects: [] }
                        ],
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    },

    "Feline Sovereign": {
        ...metadata["Feline Sovereign"],
        abilities: [
            {
                id: "feline_sovereign_lord",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    { type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 1, targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL', restrictions: ['Other', 'Cat'], layer: 7 },
                    { type: 'ApplyContinuousEffect', abilitiesToAdd: ['Protection from Dogs'], targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL', restrictions: ['Other', 'Cat'], layer: 6 }
                ]
            },
            {
                id: "feline_sovereign_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DAMAGE_PLAYER',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    if (!event.data?.isCombat) return false;
                    const attacker = state.battlefield.find((o: any) => o.id === event.sourceId);
                    return attacker && attacker.controllerId === source.controllerId && attacker.definition.subtypes.some((s: any) => s.toLowerCase() === 'cat');
                },
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['ArtifactOrEnchantment', 'OpponentControls'] },
                effects: [{ type: 'Destroy', targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Leafkin Avenger": {
        ...metadata["Leafkin Avenger"],
        abilities: [
            {
                id: "leafkin_avenger_buff",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{G}' }],
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 1, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'SELF' }]
            },
            {
                id: "leafkin_avenger_damage",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{7}{R}' }, { type: 'Tap' }],
                targetDefinition: { type: 'PlayerOrPlaneswalker', count: 1 },
                effects: [{ type: 'DealDamage', amount: 'COUNT_is_power4plus', targetMapping: 'TARGET_1' }]
            }
        ]
    },

    "Alpine Houndmaster": {
        ...metadata["Alpine Houndmaster"],
        abilities: [
            {
                id: "alpine_houndmaster_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    { 
                        type: 'SearchLibrary', 
                        optional: true,
                        reveal: true,
                        restrictions: [{ nameEquals: 'Alpine Watchdog' }], 
                        toZone: Zone.Hand,
                        targetMapping: 'CONTROLLER' 
                    }, 
                    { 
                        type: 'SearchLibrary', 
                        optional: true,
                        reveal: true,
                        restrictions: [{ nameEquals: 'Igneous Cur' }], 
                        toZone: Zone.Hand,
                        targetMapping: 'CONTROLLER' 
                    }
                ]
            },
            {
                id: "alpine_houndmaster_attack",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.targetId === source.id,
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 'COUNT_other_attacking', toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'SELF' }]
            }
        ]
    },

    "Grasp of Darkness": {
        ...metadata["Grasp of Darkness"],
        abilities: [
            {
                id: "grasp_darkness_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: -4, toughnessModifier: -4, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    },
};