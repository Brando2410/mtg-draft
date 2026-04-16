import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const DecorumDissertation: CardDefinition = {
    "name": "Decorum Dissertation",
    "manaCost": "{2}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Target player draws two cards. If that player is you, you may put a land card from your hand onto the battlefield.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Player', count: 1 },
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.Choice,
                    condition: 'TARGET_1_IS_CONTROLLER', // Wait, event for spells usually has targets.
                    label: "Put a land from hand onto battlefield?",
                    choices: [
                        {
                            label: "Yes",
                            targetDefinition: { type: 'Card', count: 1, restrictions: ['Land'], sourceZones: [Zone.Hand] },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.SelectedCards }]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ]
};



