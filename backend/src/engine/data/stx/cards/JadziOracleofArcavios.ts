import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const JadziOracleofArcavios: CardDefinition = {
    name: "Jadzi, Oracle of Arcavios",
    manaCost: "{6}{U}{U}",
    scryfall_id: "d7148d24-373e-4485-860b-c3429c2337f2",
    image_url: "https://cards.scryfall.io/normal/front/d/7/d7148d24-373e-4485-860b-c3429c2337f2.jpg?1624593477",
    colors: ["U"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "5",
    toughness: "5",
    oracleText: "You may discard a card: Return Jadzi, Oracle of Arcavios to its owner's hand.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, reveal the top card of your library. If it's a nonland card, you may cast it by paying {1} rather than paying its mana cost. If it's a land card, put it onto the battlefield.",
    faces: [
        {
            name: "Jadzi, Oracle of Arcavios",
            manaCost: "{6}{U}{U}",
            colors: ["U"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Human", "Wizard"],
            power: "5",
            toughness: "5",
            oracleText: "You may discard a card: Return Jadzi, Oracle of Arcavios to its owner's hand.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, reveal the top card of your library. If it's a nonland card, you may cast it by paying {1} rather than paying its mana cost. If it's a land card, put it onto the battlefield.",
            abilities: [
                {
                    type: AbilityType.Activated,
                    costs: [{ type: CostType.Discard, amount: 1 }],
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Self }]
                },
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                    effects: [{
                        type: EffectType.LookAtTopAndPick,
                        fromTop: 1,
                        effects: [
                            {
                                type: EffectType.ConditionalEffect,
                                condition: 'NotLand',
                                effects: [{
                                    type: EffectType.Choice,
                                    label: 'Cast for {1}?',
                                    choices: [{
                                        label: 'Cast',
                                        effects: [{
                                            type: EffectType.CastSpell,
                                            targetMapping: TargetMapping.SelectedCard,
                                            alternateCost: '{1}'
                                        }]
                                    }]
                                }],
                                onFailureEffects: [{
                                    type: EffectType.MoveToZone,
                                    zone: Zone.Battlefield,
                                    targetMapping: TargetMapping.SelectedCard
                                }]
                            }
                        ]
                    }]
                }
            ]
        },
        {
            name: "Journey to the Oracle",
            manaCost: "{2}{G}{G}",
            colors: ["G"],
            supertypes: ["Legendary"],
            types: ["Sorcery"],
            oracleText: "Put any number of land cards from your hand onto the battlefield. Then if you control eight or more lands, you may discard a card. If you do, return Journey to the Oracle to its owner's hand.",
            abilities: [{
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.MoveToZone,
                        zone: Zone.Battlefield,
                        sourceZones: [Zone.Hand],
                        targetDefinitions: [{
                            type: TargetType.Card,
                            count: 99, // "Any number"
                            minCount: 0,
                            restrictions: [Restriction.Land]
                        }],
                        targetMapping: TargetMapping.TargetAll
                    },
                    {
                        type: EffectType.Choice,
                        label: "Discard and return to hand?",
                        condition: 'ControlEightOrMoreLands',
                        optional: true,
                        choices: [{
                            label: "Discard & Return",
                            costs: [{ type: CostType.Discard, amount: 1 }],
                            effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Self }]
                        }]
                    }
                ]
            }]
        }
    ]
};
