import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const AzizaMageTowerCaptain: CardDefinition = {
    name: "Aziza, Mage Tower Captain",
    manaCost: "{R}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Djinn",
        "Sorcerer"
    ],
    keywords: [],
    oracleText: "Whenever you cast an instant or sorcery spell, you may tap three untapped creatures you control. If you do, copy that spell. You may choose new targets for the copy.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
            effects: [
                {
                    type: CostType.Choice,
                    label: 'Tap 3 creatures to copy?',
                    optional: true,
                    costs: [
                        { 
                            type: CostType.Tap, 
                            amount: 3, 
                            restrictions: [{ type: 'Creature' }, { type: 'Controller', value: Restriction.Player }] 
                        }
                    ],
                    effects: [
                        { 
                            type: EffectType.CopySpellOnStack, 
                            targetMapping: TargetMapping.TriggerEventSource 
                        }
                    ]
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};
    