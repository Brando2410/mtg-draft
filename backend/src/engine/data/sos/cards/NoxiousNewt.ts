import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const NoxiousNewt: CardDefinition = {
    name: "Noxious Newt",
    manaCost: "{1}{G}",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Salamander"
    ],
    keywords: ["Deathtouch"],
    oracleText: "Deathtouch\n{T}: Add {G}.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap, value: true }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    mana: '{G}',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "1",
    toughness: "2"
};
    
