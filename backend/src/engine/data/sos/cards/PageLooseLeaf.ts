import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, Zone } from '@shared/engine_types';
    export const PageLooseLeaf: CardDefinition = {
    name: "Page, Loose Leaf",
    manaCost: "{2}",
    colors: [],
    types: [
        "Legendary",
        "Artifact",
        "Creature"
    ],
    subtypes: [
        "Construct"
    ],
    keywords: [],
    oracleText: "{T}: Add {C}.\nGrandeur — Discard another card named Page, Loose Leaf: Reveal cards from the top of your library until you reveal an instant or sorcery card. Put that card into your hand and the rest on the bottom of your library in a random order.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, value: '{C}' }],
            isManaAbility: true
        },
        {
            type: AbilityType.Activated,
            costs: [
                {
                    type: CostType.Discard,
                    restrictions: [Restriction.Another, 'Page, Loose Leaf'] //legal restriction?
                }
            ],
            effects: [
                {
                    type: EffectType.RevealUntilCondition,
                    restrictions: [
                { type: 'Type', value: 'InstantOrSorcery' }
            ],
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "0",
    toughness: "2"
};
    