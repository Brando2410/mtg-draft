import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const ObsessiveStitcher: CardDefinition = {
        name: "Obsessive Stitcher",
        manaCost: "{1}{U}{B}",
        oracleText: "{T}: Draw a card, then discard a card.\n{2}{U}{B}, {T}, Sacrifice this creature: Return target creature card from your graveyard to the battlefield.",
        colors: ["black","blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Wizard"],
        power: "0",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "stitcher_loot",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }, { type: 'DiscardCards', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "stitcher_reanimate",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Mana', value: '{2}{U}{B}' }, { type: 'Tap', value: null }, { type: 'Sacrifice', value: null, targetMapping: 'SELF' }],
                targetDefinition: { type: 'CardInGraveyard', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'PutOnBattlefield', targetMapping: 'TARGET_1' }]
            }
        ]
    };


