import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const CodieVociferousCodex: CardDefinition = {
        name: "Codie, Vociferous Codex",
        manaCost: "{3}",
        colors: [],
        supertypes: ["Legendary"],
        types: ["Artifact", "Creature"],
        subtypes: ["Construct"],
        power: "1",
        toughness: "4",
        oracleText: "You can't cast permanent spells.\n{4}, {T}: Add {W}{U}{B}{R}{G}. When you cast your next spell this turn, exile cards from the top of your library until you exile an instant or sorcery card with mana value less than that spell's mana value. You may cast that card without paying its mana cost. Put the rest on the bottom of your library in a random order.",
        abilities: [
            {
                type: AbilityType.Static,
                effects: [{ type: EffectType.CombatConstraint, restrictions: [{ type: 'CannotCastPermanentSpells' }] }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'Mana', value: '{4}' }, { type: 'Tap', targetMapping: TargetMapping.Self }],
                effects: [
                    { type: EffectType.AddMana, manaType: 'WUBRG', amount: 5 },
                    { 
                        type: EffectType.CreateDelayedTrigger,
                    eventMatch: TriggerEvent.CastSpell,
                        duration: 'UNTIL_END_OF_TURN',
                        condition: "NextSpellThisTurn",
                        effects: [{
                            type: EffectType.SearchLibrary,
                            fromTop: -1, // Search until found
                            restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }, { type: 'ManaValueLessThanSource' }],
                            destination: Zone.Exile,
                            remainderZone: Zone.Library,
                            remainderPosition: 'bottom',
                            shuffleRemainder: true,
                            effects: [{
                                type: EffectType.Choice,
                                label: 'Cast revealed spell?',
                                optional: true,
                                choices: [{
                                    label: 'Cast',
                                    effects: [{ type: EffectType.CastSpell, targetMapping: 'SELECTED_CARD', isFreeCast: true }]
                                }]
                            }]
                        }]
                    }
                ]
            }
        ]
    };


