import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const CodieVociferousCodex: CardDefinition = {
    name: "Codie, Vociferous Codex",
    manaCost: "{3}",

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
            id: "{4}, {T}: Add {W}{U}{B}{R}{G}. When you cast your next spell this turn, exile cards from the top of your library until you exile an instant or sorcery card with mana value less than that spell's mana value. You may cast it without paying its mana cost. Put the rest on the bottom of your library in a random order.",
            costs: [
                { type: CostType.Mana, value: "{4}" },
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: "{W}{U}{B}{R}{G}"
                },
                {
                    type: EffectType.CreateDelayedTrigger,
                    eventMatch: TriggerEvent.CastSpell,
                    maxTriggers: 1,
                    condition: ConditionType.NextSpellThisTurn,
                    effects: [
                        {
                            type: EffectType.RevealUntilCondition,
                            restrictions: [Restriction.InstantOrSorcery, Restriction.ManaValueLessThanSource],
                            remainderZone: Zone.Library,
                            remainderPosition: 'bottom',
                            shuffleRemainder: true,
                            next: {
                                type: EffectType.Choice,
                                optional: true,
                                choices: [
                                    {
                                        label: "Cast revealed card",
                                        value: "yes",
                                        effects: [{
                                            type: EffectType.CastSpell,
                                            targetMapping: TargetMapping.Target1,
                                            isFreeCast: true
                                        }]
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "714c67a5-93ee-4362-9711-d0e58b90480f",
    image_url: "https://cards.scryfall.io/normal/front/7/1/714c67a5-93ee-4362-9711-d0e58b90480f.jpg?1632061963",
    rarity: "rare"
};

