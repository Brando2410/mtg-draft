import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from '@shared/engine_types';
export const SummonedDromedary: CardDefinition = {
    name: "Summoned Dromedary",
    manaCost: "{3}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Spirit", "Camel"],
    keywords: ["Vigilance"],
    power: "4",
    toughness: "3",
    oracleText: "Vigilance\n{1}{W}: Return this card from your graveyard to your hand. Activate only as a sorcery.",
    abilities: [
        {
            name: "Return to Hand",
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            manaCost: "{1}{W}",
            costs: [{ type: CostType.Mana, value: '{1}{W}' }],
            activatedOnlyAsSorcery: true,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};


