import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CodieVociferousCodex: CardDefinition = {
    name: "Codie, Vociferous Codex",
    manaCost: "{3}",
    scryfall_id: "714c67a5-93ee-4362-9711-d0e58b90480f",
    image_url: "https://cards.scryfall.io/normal/front/7/1/714c67a5-93ee-4362-9711-d0e58b90480f.jpg?1632061963",
    rarity: "rare",
    colors: [],
    types: ["Legendary", "Artifact", "Creature"],
    subtypes: ["Construct"],
    power: "1",
    toughness: "4",
    oracleText: "You can't cast unconventional spells.\n{4}, {T}: Add {W}{U}{B}{R}{G}. When you cast your next spell this turn, exile cards from the top of your library until you exile an instant or sorcery card with mana value less than that spell's mana value. You may cast it without paying its mana cost. Put the rest on the bottom of your library in a random order.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    restrictionsToAdd: [
                        { type: "CannotCastPermanentSpells" }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: "{4}" },
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.AddManaChoice,
                    mana: "{W}{U}{B}{R}{G}"
                },
                {
                    type: EffectType.CreateDelayedTrigger,
                    eventMatch: TriggerEvent.CastSpell,
                    maxTriggers: 1,
                    condition: ConditionType.NextSpellThisTurn,
                    effects: [
                        {
                            type: EffectType.ExileUntilManaValue,
                            restrictions: [Restriction.InstantOrSorcery, Restriction.ManaValueLessThanSource],
                            targetMapping: TargetMapping.Controller,
                            effects: [
                                {
                                    type: EffectType.AllowCastWithoutPaying,
                                    targetMapping: TargetMapping.SelectedCard
                                }
                            ],
                            onFailureEffects: [
                                {
                                    type: EffectType.PutRemainderOnBottomRandom,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
