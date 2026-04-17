import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const IdolofEndurance: CardDefinition = {
    name: "Idol of Endurance",
    manaCost: "{2}{W}",
    scryfall_id: "4d60e84e-be05-49da-9720-4225abe9d003",
    image_url: "https://cards.scryfall.io/normal/front/4/d/4d60e84e-be05-49da-9720-4225abe9d003.jpg?1612316288",
    oracleText: "When this artifact enters, exile all creature cards with mana value 3 or less from your graveyard until this artifact leaves the battlefield.\n{1}{W}, {T}: Until end of turn, you may cast a creature spell from among cards exiled with this artifact without paying its mana cost.",
    colors: ["W"],
    types: ["Artifact"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.ExileUntilLeaves,
                    sourceZone: Zone.Graveyard,
                    returnZone: Zone.Graveyard,
                    targetMapping: TargetMapping.AllMatchingCards,
                    restrictions: [
                        "Creature",
                        "mv <= 3",
                        "youcontrol"
                    ],
                    storeLinkedId: 'IDOL_EXILED'
                }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [
                { type: CostType.Mana, value: '{1}{W}' }, 
                { type: CostType.Tap, targetMapping: TargetMapping.Self }
            ],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    effects: [
                        {
                            type: EffectType.CastSpell,
                            targetMapping: TargetMapping.ChoiceFromExiled,
                            linkKey: 'IDOL_EXILED',
                            isFreeCast: true
                        }
                    ]
                }
            ]
        }
    ]
};




