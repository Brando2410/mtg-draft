import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const TabletofDiscovery: CardDefinition = {
    name: "Tablet of Discovery",
    manaCost: "{2}{R}",
    colors: [
        "R"
    ],
    types: [
        "Artifact"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "When this artifact enters, mill a card. You may play that card this turn. (To mill a card, put the top card of your library into your graveyard.)\n{T}: Add {R}.\n{T}: Add {R}{R}. Spend this mana only to cast instant and sorcery spells.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Mill,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.AllowPlayMilledCard,
                    duration: {
                        type: DurationType.UntilEndOfTurn
                    }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                {
                    type: CostType.Tap
                }
            ],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'R',
                    amount: 1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                {
                    type: CostType.Tap
                }
            ],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'R',
                    amount: 2,
                    restriction: 'Instant_or_Sorcery'
                }
            ]
        }
    ]
};
    
