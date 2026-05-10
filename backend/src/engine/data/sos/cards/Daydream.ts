import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
export const Daydream: CardDefinition = {
    name: "Daydream",
    manaCost: "{W}",


    colors: ["W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "Exile target creature you control, then return that card to the battlefield under its owner's control with a +1/+1 counter on it.\nFlashback {2}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{2}{W}",
    abilities: [
        {
            type: AbilityType.Spell,
            flashbackCost: "{2}{W}",
            targetDefinitions: [{
                type: TargetType.Creature, count: 1, restrictions: [
                    Restriction.YouControl
                ]
            }],
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1,
                    effects: [
                        {
                            type: EffectType.PutOnBattlefield,
                            targetMapping: TargetMapping.Target1,
                            ownerControl: true
                        },
                        {
                            type: EffectType.AddCounters,
                            targetMapping: TargetMapping.Target1,
                            counterType: 'p1p1',
                            amount: 1
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "e2b16cb2-b8b2-45df-9695-3c16e9d89e28",
    image_url: "https://cards.scryfall.io/normal/front/e/2/e2b16cb2-b8b2-45df-9695-3c16e9d89e28.jpg?1775936973",
    rarity: "uncommon"
};

