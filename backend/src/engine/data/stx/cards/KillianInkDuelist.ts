import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const KillianInkDuelist: CardDefinition = {
        name: 'Killian, Ink Duelist',
        manaCost: '{W}{B}',
        colors: ['W', 'B'],
        types: ['Creature'],
        subtypes: ['Human', 'Warlock'],
        supertypes: ['Legendary'],
        power: "2",
        toughness: "2",
        keywords: ['Lifelink', 'Menace'],
        oracleText: 'Lifelink, Menace\nSpells you cast that target a permanent cost {2} less to cast.',
        abilities: [
            {
                type: AbilityType.Static,
                effects: [
                    {
                        type: EffectType.CostReduction,
                        amount: '{2}',
                        spellRestriction: { type: 'TargetsPermanent' }
                    }
                ]
            }
        ]
    };

