import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const BasrisSolidarity: CardDefinition = {

    name: "Basri's Solidarity",
    manaCost: "{1}{W}",
    oracleText: "Put a +1/+1 counter on each creature you control.",
    colors: ["W"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{ type: EffectType.AddCounters, amount: 1, counterType: '+1/+1', targetMapping: TargetMapping.AllCreaturesYouControl }]
        }
    ]

};

