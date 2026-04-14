import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const GnarledProfessor: CardDefinition = {
        name: "Gnarled Professor",
        manaCost: "{2}{G}{G}",
        colors: ["G"],
        types: ["Creature"],
        subtypes: ["Treefolk", "Druid"],
        power: "5",
        toughness: "4",
        keywords: ["Trample"],
        oracleText: "Trample\nWhen Gnarled Professor enters the battlefield, learn.",
        abilities: [
            {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.EnterBattlefield,
                effects: [{ type: EffectType.Learn }]
            }
        ]
    };
