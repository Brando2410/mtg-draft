import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const DoubleVision: CardDefinition = {
    name: "Double Vision",
    manaCost: "{3}{R}{R}",
    scryfall_id: "754b77b4-4cc4-4e49-a7a4-667401e7e063",
    image_url: "https://cards.scryfall.io/normal/front/7/5/754b77b4-4cc4-4e49-a7a4-667401e7e063.jpg?1594736598",
    oracleText: "Whenever you cast your first instant or sorcery spell each turn, copy that spell. You may choose new targets for the copy.",
    colors: ["R"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastFirstInstantOrSorcery,
            condition: ConditionType.EventPlayerIsYou,
            effects: [{
                type: EffectType.CopySpellOnStack,
                targetMapping: TargetMapping.TriggerSource,
                chooseNewTargets: true
            }]
        }
    ]
};




