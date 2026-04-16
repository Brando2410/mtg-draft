import { AbilityType, ZoneRequirement, Zone, EffectType, TargetType, TargetMapping, CardDefinition } from '@shared/engine_types';

export const Revitalize: CardDefinition = {
    name: "Revitalize",
    manaCost: "{1}{W}",
    oracleText: "You gain 3 life.\nDraw a card.",
    colors: ["W"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "revitalize_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                { type: EffectType.GainLife, amount: 3, targetMapping: TargetMapping.Controller },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]

};
