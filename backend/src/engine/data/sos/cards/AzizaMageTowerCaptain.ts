import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const AzizaMageTowerCaptain: CardDefinition = {
    name: "Aziza, Mage Tower Captain",
    manaCost: "{R}{W}",
    scryfall_id: "6261e89a-dbf1-481a-823e-6bb00be57195",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/6/2/6261e89a-dbf1-481a-823e-6bb00be57195.jpg?1775938194",
    colors: ["R", "W"],
    types: ["Legendary", "Creature"],
    subtypes: ["Djinn", "Sorcerer"],
    keywords: [],
    power: "2",
    toughness: "2",
    oracleText: "Whenever you cast an instant or sorcery spell, you may tap three untapped creatures you control. If you do, copy that spell. You may choose new targets for the copy.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Aziza: Tap 3 creatures to copy spell?",
                    choices: [
                        {
                            label: "Yes",
                            costs: [
                                {
                                    type: CostType.TapSelection,
                                    value: 3,
                                    restrictions: [Restriction.Creature, Restriction.Untapped, Restriction.YouControl]
                                }
                            ],
                            effects: [
                                {
                                    type: EffectType.CopySpellOnStack,
                                    targetMapping: TargetMapping.TriggerEventSource,
                                    chooseNewTargets: true
                                }
                            ]
                        },
                        {
                            label: "No",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ]
};
