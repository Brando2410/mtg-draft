import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const HofriGhostforge: CardDefinition = {
        name: "Hofri Ghostforge",
        manaCost: "{3}{R}{W}",
        colors: ["R", "W"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Dwarf", "Cleric"],
        power: "4",
        toughness: "5",
        oracleText: "Spirits you control get +1/+1 and have trample and haste. Whenever another nontoken creature you control dies, exile it. If you do, create a token that's a copy of that creature, except it's a Spirit in addition to its other types and it has \"When this creature leaves the battlefield, return the exiled card to its owner's graveyard.\"",
        abilities: [
            {
                type: AbilityType.Static,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 1,
                        toughnessModifier: 1,
                        layer: 7,
                        targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                        restrictions: [{ type: 'Subtype', value: 'Spirit' }]
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        abilitiesToAdd: ["Trample", "Haste"],
                        layer: 6,
                        targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                        restrictions: [{ type: 'Subtype', value: 'Spirit' }]
                    }
                ]
            },
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                condition: "AnotherNontokenCreatureYouControlDies",
                effects: [{
                    type: EffectType.Choice,
                    label: "Hofri: Exile and create Spirit token?",
                    optional: true,
                    choices: [{
                        label: "Exile & Copy",
                        effects: [
                            { type: EffectType.Exile, targetMapping: TargetMapping.TriggerEventSource },
                            {
                                type: EffectType.CreateTokenCopy,
                                targetMapping: TargetMapping.TriggerEventSource,
                                subtypesToAdd: ["Spirit"],
                                storeLinkedId: 'HOFRI_EXILE',
                                abilitiesToAdd: [{
                                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveBattlefield,
                                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, targetMapping: 'LINKED_OBJECT', linkKey: 'HOFRI_EXILE' }]
                                }]
                            }
                        ]
                    }]
                }]
            }
        ]
    };


