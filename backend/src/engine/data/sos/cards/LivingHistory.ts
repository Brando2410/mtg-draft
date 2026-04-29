import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const LivingHistory: CardDefinition = {
    name: "Living History",
    manaCost: "{1}{R}",
    scryfall_id: "2028792c-fd60-40d4-bff7-3b82dbe1ffb5",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/2/0/2028792c-fd60-40d4-bff7-3b82dbe1ffb5.jpg?1775937797",
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
                        image_url: "https://cards.scryfall.io/normal/front/d/0/d0f3bd3d-08cf-4783-ae31-03770c8be69c.jpg?1775864773",
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
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.Attacking]
            },
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
    ]
};

