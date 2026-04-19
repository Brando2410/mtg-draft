import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

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
            condition: (state: any, event: any, ability: any) => event.playerId === ability.controllerId,
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
                                    restrictions: [
                                        { type: 'Type', value: 'Shrine' }
                                    ],
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
            // Note: Trigger doubling support requires engine-level integration with TriggerProcessor.
            // This remains a structured placeholder for future engine updates.
            replacesEvent: 'ON_SHRINE_TRIGGER',
            condition: (state: any, event: any, ability: any) =>
                state.battlefield.filter((o: any) => o.controllerId === ability.controllerId && (o.definition.subtypes || []).includes('Shrine')).length >= 5,
            effects: [{ type: EffectType.AddAdditionalTrigger, targetMapping: TargetMapping.TriggerSource }]
        }
    ]
};


