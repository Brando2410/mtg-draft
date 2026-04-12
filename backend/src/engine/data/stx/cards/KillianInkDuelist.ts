import { AbilityType, ImplementableCard, ZoneRequirement, EffectType } from '@shared/engine_types';

export const KillianInkDuelist: ImplementableCard = {
    name: 'Killian, Ink Duelist',
    manaCost: '{W}{B}',
    type_line: 'Legendary Creature — Human Shaman',
    types: ['Creature'],
    subtypes: ['Human', 'Shaman'],
    power: '2',
    toughness: '2',
    keywords: ['Lifelink', 'Menace'],
    colors: ['white', 'black'],
    supertypes: ['Legendary'],
    oracleText: 'Lifelink, menace\nSpells you cast that target a creature cost {2} less to cast.',
    abilities: [
        {
            id: 'killian_cost_reduction',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: 'CostReduction',
                    targetMapping: 'CONTROLLER',
                    amount: 2,
                    condition: 'SPELL_TARGETS_CREATURE'
                }
            ]
        }
    ]
};
