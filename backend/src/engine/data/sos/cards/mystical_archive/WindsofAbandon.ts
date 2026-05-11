import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Restriction, Zone } from '@shared/engine_types';

export const WindsofAbandon: CardDefinition = {
    name: "Winds of Abandon",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: ["Overload"],
    oracleText: "Exile target creature you don't control. For each creature exiled this way, its controller searches their library for a basic land card. Those players put those cards onto the battlefield tapped, then shuffle.\nOverload {4}{W}{W} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
    set: "soa",
    scryfall_id: "ddf7fa6e-e38c-4f3d-8d8b-6ecbccdbb8f9",
    image_url: "https://cards.scryfall.io/normal/front/d/d/ddf7fa6e-e38c-4f3d-8d8b-6ecbccdbb8f9.jpg?1775936442",
    rarity: "mythic",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 1,
            modes: [
                {
                    label: "Exile target creature you don't control",
                    targetDefinitions: [{
                        type: TargetType.Creature,
                        restrictions: [Restriction.NotControlled],
                        count: 1
                    }],
                    effects: [
                        {
                            type: EffectType.Exile,
                            targetMapping: TargetMapping.Target1,
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    targetMapping: TargetMapping.Target1Controller,
                                    targetDefinitions: [{ type: TargetType.Land, restrictions: [Restriction.Basic] }],
                                    zone: Zone.Battlefield,
                                    tapped: true,
                                    shuffle: true,
                                    label: "Search for a basic land card"
                                }
                            ]
                        }
                    ]
                },
                {
                    label: "Overload: Exile each creature you don't control",
                    isAlternativeCost: true,
                    costs: [{ type: 'Mana', value: "{4}{W}{W}" }],
                    effects: [
                        {
                            type: EffectType.Exile,
                            targetMapping: TargetMapping.EachOpponentCreature,
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    targetMapping: TargetMapping.Target1Controller,
                                    targetDefinitions: [{ type: TargetType.Land, restrictions: [Restriction.Basic] }],
                                    zone: Zone.Battlefield,
                                    tapped: true,
                                    shuffle: true,
                                    label: "Search for a basic land card"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
};
