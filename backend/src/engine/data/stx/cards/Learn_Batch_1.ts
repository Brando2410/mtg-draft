import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, Zone, TriggerEvent } from '@shared/engine_types';

export const FieldTrip: ImplementableCard = {
    name: 'Field Trip',
    manaCost: '{2}{G}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['green'],
    oracleText: "Search your library for a basic Forest card, reveal it, put it into your hand, then shuffle. Learn.",
    abilities: [
        {
            id: 'field_trip_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetMapping: 'CONTROLLER',
                    restrictions: ['Basic', 'Forest'],
                    reveal: true,
                    destination: Zone.Hand,
                    shuffle: true
                },
                {
                    type: EffectType.Learn,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};

export const GuidingVoice: ImplementableCard = {
    name: 'Guiding Voice',
    manaCost: '{W}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['white'],
    oracleText: "Put a +1/+1 counter on target creature. Learn.",
    abilities: [
        {
            id: 'guiding_voice_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature']
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'TARGET_1',
                    amount: 1,
                    value: '+1/+1'
                },
                {
                    type: EffectType.Learn,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};

export const ProfessorOfSymbology: ImplementableCard = {
    name: 'Professor of Symbology',
    manaCost: '{1}{W}',
    type_line: 'Creature — Kor Cleric',
    types: ['Creature'],
    subtypes: ['Kor', 'Cleric'],
    power: '2',
    toughness: '1',
    colors: ['white'],
    oracleText: "When Professor of Symbology enters the battlefield, learn.",
    abilities: [
        {
            id: 'professor_of_symbology_etb',
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.EnterBattlefield,
            activeZone: ZoneRequirement.Battlefield,
            triggerCondition: 'SELF',
            effects: [
                {
                    type: EffectType.Learn,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};
