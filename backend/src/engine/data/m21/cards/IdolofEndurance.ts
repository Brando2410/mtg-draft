import { CardDefinition, AbilityType, Zone, EffectType, TriggerEvent, TargetType, TargetMapping } from '@shared/engine_types';

export const IdolofEndurance: CardDefinition = {
    name: "Idol of Endurance",
    manaCost: "{2}{W}",
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
                        { type: 'Type', value: 'Creature' },
                        { type: 'Attribute', attribute: 'ManaValue', value: 3, comparison: 'LE' },
                        { type: 'Source', value: 'CONTROLLER' }
                    ],
                    storeLinkedId: 'IDOL_EXILED'
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{1}{W}' }, { type: 'Tap', targetMapping: TargetMapping.Self }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
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


