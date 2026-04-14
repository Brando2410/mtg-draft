import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const MilaCraftyCompanion: CardDefinition = {
        name: "Mila, Crafty Companion",
        manaCost: "{1}{W}{W}",
        colors: ["W"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Fox"],
        power: "2",
        toughness: "3",
        oracleText: "Whenever an opponent attacks one or more planeswalkers you control, create a 1/1 white Spirit creature token. Whenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
        faces: [
            {
                name: "Mila, Crafty Companion",
                manaCost: "{1}{W}{W}",
                colors: ["W"],
                supertypes: ["Legendary"],
                types: ["Creature"],
                subtypes: ["Fox"],
                power: "2",
                toughness: "3",
                oracleText: "Whenever an opponent attacks one or more planeswalkers you control, create a 1/1 white Spirit creature token. Whenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
                abilities: [
                    {
                        type: AbilityType.Triggered,
                        eventMatch: TriggerEvent.Attack,
                        triggerCondition: "OpponentAttacksYourPlaneswalker",
                        effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Spirit', power: "1", toughness: "1", colors: ['W'], types: ['Creature', 'Token'], subtypes: ['Spirit'] } }]
                    },
                    {
                        type: AbilityType.Triggered,
                        eventMatch: TriggerEvent.BecomeTarget,
                        triggerCondition: "OpponentTargetsYourPermanent",
                        effects: [{ type: EffectType.DrawCards, amount: 1, optional: true }]
                    }
                ]
            },
            {
                name: "Lukka, Wayward Bondbreaker",
                manaCost: "{4}{R}{R}",
                colors: ["R"],
                supertypes: ["Legendary"],
                types: ["Planeswalker"],
                subtypes: ["Lukka"],
                loyalty: "5",
                oracleText: "[+1]: You may exile a creature card from your graveyard. If you do, create a 3/3 red Beast creature token.\n[-2]: Exile target creature you control, then reveal cards from the top of your library until you reveal a creature card with mana value greater than the exiled creature's mana value. Put that card onto the battlefield and the rest on the bottom in a random order.\n[-7]: You get an emblem with \"Whenever a creature enters the battlefield under your control, it deals damage equal to its power to any target.\"",
                abilities: [
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '+1' }],
                        effects: [{
                            type: EffectType.Choice,
                            label: "Exile a creature card from graveyard?",
                            optional: true,
                            choices: [{
                                label: "Exile & Create Beast",
                                effects: [
                                    { type: EffectType.Exile, sourceZone: Zone.Graveyard, restrictions: [{ type: 'Type', value: 'Creature' }] },
                                    { type: EffectType.CreateToken, tokenBlueprint: { name: 'Beast', power: "3", toughness: "3", colors: ['R'], types: ['Creature', 'Token'], subtypes: ['Beast'] } }
                                ]
                            }]
                        }]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '-2' }],
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }] },
                        effects: [
                            { type: EffectType.Exile, targetMapping: TargetMapping.Target1, storeMV: 'SAVED_MV' },
                            {
                                type: EffectType.SearchLibrary,
                                fromTop: -1, 
                                restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'ManaValueGreaterThanSaved' }],
                                destination: Zone.Battlefield,
                                remainderZone: Zone.Library,
                                remainderPosition: 'bottom',
                                shuffleRemainder: true
                            }
                        ]
                    },
                    {
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '-7' }],
                        effects: [{
                            type: EffectType.CreateEmblem,
                            emblemBlueprint: {
                                name: "Lukka's Emblem",
                                oracleText: "Whenever a creature enters the battlefield under your control, it deals damage equal to its power to any target.",
                                abilities: [{
                                    type: AbilityType.Triggered,
                                    eventMatch: TriggerEvent.EnterBattlefieldOther,
                                    triggerCondition: "TargetYourPermanent_OpponentSource",
                                    targetDefinition: { count: 1, type: TargetType.AnyTarget },
                                    effects: [{ type: EffectType.DealDamage, amount: DynamicAmount.SourcePower, targetMapping: TargetMapping.Target1 }]
                                }]
                            }
                        }]
                    }
                ]
            }
        ]
    };
