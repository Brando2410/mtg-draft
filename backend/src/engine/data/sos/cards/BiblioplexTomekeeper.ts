import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const BiblioplexTomekeeper: CardDefinition = {
    name: "Biblioplex Tomekeeper",
    manaCost: "{4}",
    scryfall_id: "bf2efdd9-d2b4-4bea-a5b9-dbb2eee4dfba",
    image_url: "https://cards.scryfall.io/normal/front/b/f/bf2efdd9-d2b4-4bea-a5b9-dbb2eee4dfba.jpg?1775938724",
    colors: [],
    types: [
        "Artifact",
        "Creature"
    ],
    subtypes: [
        "Construct"
    ],
    keywords: [],
    oracleText: "When this creature enters, choose up to one —\n• Target creature becomes prepared. (Only creatures with prepare spells can become prepared.)\n• Target creature becomes unprepared.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: CostType.Choice,
                    optional: true,
                    choices: [
                        { 
                            label: 'Prepare a creature', 
                            effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Target1 }], 
                            targetDefinition: { type: TargetType.Creature } 
                        },
                        { 
                            label: 'Unprepare a creature', 
                            effects: [{ type: EffectType.Unprepare, targetMapping: TargetMapping.Target1 }], 
                            targetDefinition: { type: TargetType.Creature } 
                        }
                    ]
                }
            ]
        }
    ],
    power: "3",
    toughness: "4"
};
    
