import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType} from "@shared/engine_types";

export const Forest: CardDefinition = {
        name: "Forest",
        manaCost: "",
    scryfall_id: "3279314f-d639-4489-b2ab-3621bb3ca64b",
    image_url: "https://cards.scryfall.io/normal/front/3/2/3279314f-d639-4489-b2ab-3621bb3ca64b.jpg?1594737877",
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

