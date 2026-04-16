import { CardDefinition, AbilityType, Zone, EffectType, TargetType, TargetMapping } from "@shared/engine_types";

export const BasrisAegis: CardDefinition = {
    name: "Basri's Aegis",
    manaCost: "{2}{W}{W}",
    oracleText: "Put a +1/+1 counter on each of up to two target creatures. You may search your library and/or graveyard for a card named Basri, Devoted Paladin, reveal it, and put it into your hand. If you search your library this way, shuffle.",
    colors: ["W"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 2,
                minCount: 0
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: "P1P1",
                    amount: 1,
                    targetMapping: TargetMapping.TargetAll
                },
                {
                    type: EffectType.SearchLibrary,
                    sourceZones: [Zone.Library, Zone.Graveyard],
                    optional: true,
                    reveal: true,
                    zone: Zone.Hand,
                    targetDefinition: {
                        type: TargetType.Card,
                        restrictions: [{ type: 'Name', value: "Basri, Devoted Paladin" }],
                        count: 1
                    }
                }
            ]
        }
    ]
};
