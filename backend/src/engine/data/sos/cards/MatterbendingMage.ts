import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
import { RuleUtils } from '../../../utils/RuleUtils';

export const MatterbendingMage: CardDefinition = {
    name: "Matterbending Mage",
    manaCost: "{2}{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    keywords: [],
    power: "2",
    toughness: "2",
    oracleText: "When this creature enters, return up to one other target creature to its owner's hand.\nWhenever you cast a spell with {X} in its mana cost, this creature can't be blocked this turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                minCount: 0,
                restrictions: [Restriction.Other]
            }],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: `${ConditionType.EventPlayerIsYou} && ${ConditionType.EventObjectHasX}`,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["Unblockable"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "460c6afd-cddf-4fea-925f-b27517ff250a",
    image_url: "https://cards.scryfall.io/normal/front/4/6/460c6afd-cddf-4fea-925f-b27517ff250a.jpg?1775937321",
    rarity: "uncommon"
};

