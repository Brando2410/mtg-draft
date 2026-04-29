import {
  AbilityType,
  CardDefinition, DurationType,
  EffectType,
  Restriction,
  RestrictionType,
  TargetMapping,
  TargetType
} from '@shared/engine_types';

/**
 * Academic Probation (STX 007)
 */
export const AcademicProbation: CardDefinition = {
    name: 'Academic Probation',
    manaCost: '{1}{W}',
    scryfall_id: "05521edf-f47f-4e7a-aec5-cdc4ae7368c2",
    image_url: "https://cards.scryfall.io/normal/front/0/5/05521edf-f47f-4e7a-aec5-cdc4ae7368c2.jpg?1637082074",
    type_line: 'Sorcery',
    types: ['Sorcery'],
    colors: ["W"],
    oracleText: "Choose one —\n• Choose a nonland card name. Until your next turn, spells with the chosen name can't be cast and activated abilities of permanents with that name can't be activated.\n• Choose target nonland permanent. Until your next turn, it can't attack or block, and its activated abilities can't be activated.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Academic Probation: Choose a mode',
                    choices: [
                        {
                            label: 'Name a nonland card',
                            effects: [
                                {
                                    type: EffectType.Choice,
                                    selectionPool: TargetMapping.NameACard,
                                    restrictions: [Restriction.NonLand],
                                    effects: [
                                        {
                                            type: EffectType.ApplyContinuousEffect,
                                            duration: { type: DurationType.UntilYourNextTurn },
                                            restrictions: [
                                                RestrictionType.CannotCastNamedCard,
                                                RestrictionType.CannotActivateNamedCardAbilities
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            label: 'Target nonland permanent',
                            targetDefinition: {
                                type: TargetType.Permanent,
                                restrictions: [Restriction.NonLand]
                            },
                            effects: [
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: { type: DurationType.UntilYourNextTurn },
                                    targetMapping: TargetMapping.Target1,
                                    restrictions: [
                                        RestrictionType.CannotAttack,
                                        RestrictionType.CannotBlock,
                                        RestrictionType.CannotActivateAbilities
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
