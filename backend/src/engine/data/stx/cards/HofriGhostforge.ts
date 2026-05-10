import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

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
                    restrictions: [Restriction.Spirit]
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["Trample", "Haste"],
                    layer: 6,
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [Restriction.Spirit]
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DeathOther,
            condition: 'EVENT_OBJECT_MATCHES:NON_TOKEN,YOU_CONTROL',
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
                            sourceMapping: TargetMapping.TriggerEventSource,
                            subtypesToAdd: ["Spirit"],
                            storeLinkedId: 'HOFRI_EXILE',
                            abilitiesToAdd: [{
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.LeaveBattlefield,
                                effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, targetMapping: TargetMapping.LinkedObject, linkKey: 'HOFRI_EXILE' }]
                            }]
                        }
                    ]
                }]
            }]
        }
    ],
    scryfall_id: "bc03cdb6-5ad0-452d-a698-bd19f5ebac83",
    image_url: "https://cards.scryfall.io/normal/front/b/c/bc03cdb6-5ad0-452d-a698-bd19f5ebac83.jpg?1775941787",
    rarity: "mythic"
};

