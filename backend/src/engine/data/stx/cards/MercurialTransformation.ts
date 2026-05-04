import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const MercurialTransformation: CardDefinition = {
    name: 'Mercurial Transformation',
    manaCost: '{1}{U}',
    scryfall_id: "adcbe115-5482-4e5a-95bb-8ccbb01d3547",
    image_url: "https://cards.scryfall.io/normal/front/a/d/adcbe115-5482-4e5a-95bb-8ccbb01d3547.jpg?1637082344",
    colors: ['U'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Until end of turn, target nonland permanent loses all abilities and becomes a blue Frog creature with base power and toughness 1/1 or a blue Elemental creature with base power and toughness 4/4.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ count: 1, type: TargetType.NonlandPermanent }],
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Frog (1/1) or Elemental (4/4)?",
                    choices: [
                        {
                            label: 'Frog (1/1)',
                            effects: [{
                                type: EffectType.ApplyContinuousEffect,
                                duration: { type: DurationType.UntilEndOfTurn },
                                removeAllAbilities: true,
                                colorsSet: ['U'],
                                typesSet: ['Creature'],
                                subtypesSet: ['Frog'],
                                powerSet: 1,
                                toughnessSet: 1,
                                targetMapping: TargetMapping.Target1
                            }]
                        },
                        {
                            label: 'Elemental (4/4)',
                            effects: [{
                                type: EffectType.ApplyContinuousEffect,
                                duration: { type: DurationType.UntilEndOfTurn },
                                removeAllAbilities: true,
                                colorsSet: ['U'],
                                typesSet: ['Creature'],
                                subtypesSet: ['Elemental'],
                                powerSet: 4,
                                toughnessSet: 4,
                                targetMapping: TargetMapping.Target1
                            }]
                        }
                    ]
                }
            ]
        }
    ]
};

