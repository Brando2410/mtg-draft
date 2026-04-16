import { AbilityType, Zone, CardDefinition, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Forest: CardDefinition = {
        name: "Forest",
        manaCost: "",
        oracleText: "({T}: Add {G}.)",
        colors: [],
        supertypes: ["Basic"],
        types: ["Land"],
        subtypes: ["Forest"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "forest_mana",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{G}' }]
            }
        ]
    };

