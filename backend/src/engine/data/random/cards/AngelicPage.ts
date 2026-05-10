import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const AngelicPage: CardDefinition = {

    name: "Angelic Page",
    manaCost: "{1}{W}",
    oracleText: "Flying\n{T}: Target attacking or blocking creature gets +1/+1 until end of turn.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Angel", "Spirit"],
    power: "1",
    toughness: "1",
    keywords: ["Flying"],
    set: "JMP",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            targetDefinitions: [{ type: TargetType.Creature, count: 1, restrictions: [
                { type: 'State', value: 'AttackingOrBlocking' }
            ] }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 1,
                toughnessModifier: 1,
                layer: 7,
                targetMapping: TargetMapping.Target1
            }]
        }
    ],
    scryfall_id: "ddf5db14-f2aa-4088-9894-7bd3a56dfe1e",
    image_url: "https://cards.scryfall.io/normal/front/d/d/ddf5db14-f2aa-4088-9894-7bd3a56dfe1e.jpg?1600715409",
    rarity: "common"
};

