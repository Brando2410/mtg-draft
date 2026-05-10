import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';
export const AntiquitiesontheLoose: CardDefinition = {
    name: "Antiquities on the Loose",
    manaCost: "{1}{W}{W}",
    scryfall_id: "68ee92cd-51af-4de5-bcc8-34d0bb2fd398",
    image_url: "https://cards.scryfall.io/normal/front/7/8/785d75b7-2054-47d0-8135-96ba6b4e9b78.jpg?1777297922",
    rarity: "rare",
    colors: ["W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "Create two 2/2 red and white Spirit creature tokens. Then if this spell was cast from anywhere other than your hand, put a +1/+1 counter on each Spirit you control.\nFlashback {4}{W}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{4}{W}{W}",

    abilities: [
        {
            type: AbilityType.Spell,
            flashbackCost: '{4}{W}{W}',
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Spirit',
                        types: ['Creature'],
                        subtypes: ['Spirit'],
                        colors: ['W', 'R'],
                        power: '2',
                        toughness: '2',
                        image_url: "https://cards.scryfall.io/normal/front/d/0/d0f3bd3d-08cf-4783-ae31-03770c8be69c.jpg?1775864773"
                    },
                    amount: 2
                },
                {
                    type: EffectType.ConditionalEffect,
                    condition: ConditionType.NotCastFromHand,
                    effects: [
                        {
                            type: EffectType.AddCounters,
                            amount: 1,
                            counterType: '+1/+1',
                            targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                            restrictions: [Restriction.Spirit]
                        }
                    ]
                }
            ]
        }
    ],

};

