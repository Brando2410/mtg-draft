import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const PageLooseLeaf: CardDefinition = {
    "name": "Page, Loose Leaf",
    "manaCost": "{2}",
    "colors": [],
    "types": [
        "Legendary",
        "Artifact",
        "Creature"
    ],
    "subtypes": [
        "Construct"
    ],
    "oracleText": "{T}: Add {C}.\nGrandeur — Discard another card named Page, Loose Leaf: Reveal cards from the top of your library until you reveal an instant or sorcery card. Put that card into your hand and the rest on the bottom of your library in a random order.",
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            effects: [{ type: EffectType.AddMana, value: '{C}' }],
            isManaAbility: true
        },
        {
            type: AbilityType.Activated,
            costs: [
                {
                    type: 'Discard',
                    restrictions: ['another', 'Page, Loose Leaf'] //legal restriction?
                }
            ],
            effects: [
                {
                    type: EffectType.RevealUntilCondition,
                    restrictions: ['Instant_OR_Sorcery'],
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    "power": "0",
    "toughness": "2"
};



