import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const SanctumofAll: CardDefinition = {
    name: "Sanctum of All",
    manaCost: "{W}{U}{B}{R}{G}",
    oracleText: "At the beginning of your upkeep, you may search your library and/or graveyard for a Shrine card and put it onto the battlefield. If you search your library this way, shuffle.\nIf an ability of a Shrine you control triggers, if you control five or more Shrines, that ability triggers an additional time.",
    colors: ["W", "U", "B", "R", "G"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Upkeep,
            activeZone: Zone.Battlefield,
            condition: 'PLAYER_IS_CONTROLLER',
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Search for a Shrine card?",
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    sourceZones: [Zone.Library, Zone.Graveyard],
                                    zone: Zone.Battlefield,
                                    restrictions: [Restriction.Shrine],
                                    reveal: true,
                                    shuffle: true
                                }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        },
        {
            id: "sanctum_all_trigger_double",
            type: AbilityType.Replacement,
            activeZone: Zone.Battlefield,
            replacesEvent: 'ON_SHRINE_TRIGGER',
            condition: 'YOU_CONTROL_FIVE_OR_MORE_SHRINES',
            effects: [{ type: EffectType.AddAdditionalTrigger, targetMapping: TargetMapping.TriggerSource }]
        }
    ],
    scryfall_id: "ba91338c-1f6c-4b83-851f-98c3e9dea17b",
    image_url: "https://cards.scryfall.io/normal/front/b/a/ba91338c-1f6c-4b83-851f-98c3e9dea17b.jpg?1594737442",
    rarity: "rare"
};

