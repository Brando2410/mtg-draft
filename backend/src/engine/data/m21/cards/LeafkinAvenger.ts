import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const LeafkinAvenger: CardDefinition = {
    name: "Leafkin Avenger",
    manaCost: "{2}{R}{G}",
    oracleText: "{T}: Add {G} for each creature with power 4 or greater you control.\n{7}{R}: This creature deals damage equal to its power to target player or planeswalker.",
    colors: ["R", "G"],
    types: ["Creature"],
    subtypes: ["Elemental", "Druid"],
    power: "4",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                manaType: 'G',
                amount: (state: any, source: any) => {
                    return state.battlefield.filter((o: any) =>
                        o.controllerId === source.controllerId &&
                        o.definition.types.some((t: any) => t.toLowerCase() === 'creature') &&
                        (o.effectiveStats?.power ?? 0) >= 4
                    ).length;
                },
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Mana, value: '{7}{R}' }],
            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1,
                restrictions: ['Player', 'Planeswalker']
            },
            effects: [{
                type: EffectType.DealDamage,
                amount: DynamicAmount.SourcePower,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};



