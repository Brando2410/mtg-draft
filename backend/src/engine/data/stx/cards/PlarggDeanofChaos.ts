import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const PlarggDeanofChaos: CardDefinition = {
    name: "Plargg, Dean of Chaos",
    manaCost: "{1}{R}",
    colors: ["R"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Orc", "Shaman"],
    power: "2",
    toughness: "2",
    oracleText: "{T}, Discard a card: Draw a card.\n{4}{R}, {T}: Reveal cards from the top of your library until you reveal a nonland card with mana value 3 or less. You may cast that card without paying its mana cost. Put the rest on the bottom of your library in a random order.",
    faces: [
        {
            name: "Plargg, Dean of Chaos",
            manaCost: "{1}{R}",
            colors: ["R"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Orc", "Shaman"],
            power: "2",
            toughness: "2",
            oracleText: "{T}, Discard a card: Draw a card.\n{4}{R}, {T}: Reveal cards from the top of your library until you reveal a nonland card with mana value 3 or less. You may cast that card without paying its mana cost. Put the rest on the bottom of your library in a random order.",
            abilities: [
                {
                    type: AbilityType.Activated,
                    costs: [{ type: 'Tap', targetMapping: TargetMapping.Self }, { type: 'Discard', value: 1 }],
                    effects: [{ type: EffectType.DrawCards, amount: 1 }]
                },
                {
                    type: AbilityType.Activated,
                    costs: [{ type: 'Mana', value: '{4}{R}' }, { type: 'Tap', targetMapping: TargetMapping.Self }],
                    effects: [{
                        type: EffectType.SearchLibrary,
                        fromTop: -1,
                        restrictions: ['Nonland', 'MV_LE:3'],
                        zone: Zone.Exile,
                        effects: [{
                            type: EffectType.Choice,
                            label: 'Cast revealed spell?',
                            optional: true,
                            choices: [{
                                label: 'Cast',
                                effects: [{ type: EffectType.CastSpell, targetMapping: TargetMapping.SelectedCard, isFreeCast: true }]
                            }]
                        }]
                    }]
                }
            ]
        },
        {
            name: "Augusta, Dean of Order",
            manaCost: "{2}{W}",
            colors: ["W"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Human", "Cleric"],
            power: "1",
            toughness: "3",
            oracleText: "Other creatures you control get +1/+0 as long as they're attacking.\nWhenever you attack, untap all creatures you control.",
            abilities: [
                {
                    type: AbilityType.Static,
                    effects: [{
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 1,
                        targetMapping: TargetMapping.AllCreaturesYouControl,
                        restrictions: [{ type: 'Attacking' }, { type: 'Not', restriction: { type: 'Self' } }]
                    }]
                },
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                    condition: "OnYourAttack",
                    effects: [{ type: EffectType.Untap, targetMapping: TargetMapping.AllCreaturesYouControl }]
                }
            ]
        }
    ]
}

