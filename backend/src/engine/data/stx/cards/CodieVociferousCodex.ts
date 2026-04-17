import { AbilityType, CardDefinition, DurationType, CostType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

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
            effects: [{ type: EffectType.CombatConstraint, restrictions: ['CannotCastPermanentSpells'] }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{4}' }, { type: CostType.Tap }],
            effects: [
                { type: EffectType.AddMana, manaType: 'WUBRG' },
                {
                    type: EffectType.CreateDelayedTrigger,
                    eventMatch: TriggerEvent.CastSpell,
                    duration: { type: DurationType.UntilEndOfTurn },
                    condition: "NextSpellThisTurn",
                    effects: [{
                        type: EffectType.SearchLibrary,
                        fromTop: -1, // Search until found
                        restrictions: ['instant_or_sorcery', 'mv < source_mv'],
                        zone: Zone.Exile,
                        remainderZone: Zone.Library,
                        remainderPosition: 'bottom',
                        shuffleRemainder: true,
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
        }
    ]
};



