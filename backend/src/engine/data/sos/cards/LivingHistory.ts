import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const LivingHistory: CardDefinition = {
    name: "Living History",
    manaCost: "{1}{R}",
    colors: ["R"],
    types: ["Enchantment"],
    subtypes: [],
    keywords: [],
    oracleText: "When this enchantment enters, create a 2/2 red and white Spirit creature token.\nWhenever you attack, if a card left your graveyard this turn, target attacking creature gets +2/+0 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: "Spirit",
                        colors: ["R", "W"],
                        types: ["Creature"],
                        subtypes: ["Spirit"],
                        power: 2,
                        toughness: 2,
                        image_url: "https://cards.scryfall.io/normal/front/8/7/877f7ddb-ed70-41a0-b845-d9bf8ac65f9b.jpg?1775828448"
                    },
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.AttackersDeclared,
            condition: ConditionType.CardsLeftYourGraveyardThisTurn,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.Attacking]
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 0,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "2028792c-fd60-40d4-bff7-3b82dbe1ffb5",
    image_url: "https://cards.scryfall.io/normal/front/2/0/2028792c-fd60-40d4-bff7-3b82dbe1ffb5.jpg?1775937797",
    rarity: "uncommon"
};

