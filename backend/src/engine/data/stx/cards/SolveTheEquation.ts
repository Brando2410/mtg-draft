import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const SolvetheEquation: CardDefinition = {
        name: 'Solve the Equation',
        manaCost: '{2}{U}',
        colors: ['U'],
        types: ['Sorcery'],
        oracleText: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }],
                        destination: Zone.Hand,
                        reveal: true,
                        shuffle: true
                    }
                ]
            }
        ]
    };
