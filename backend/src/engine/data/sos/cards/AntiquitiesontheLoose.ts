import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping } from '@shared/engine_types';
export const AntiquitiesontheLoose: CardDefinition = {
    name: "Antiquities on the Loose",
    manaCost: "{1}{W}{W}",
    scryfall_id: "68ee92cd-51af-4de5-bcc8-34d0bb2fd398",
    image_url: "https://cards.scryfall.io/normal/front/6/8/68ee92cd-51af-4de5-bcc8-34d0bb2fd398.jpg?1775936960",
    colors: [
        "W"
    ],
    types: [
        "Sorcery"
    ],
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
                        image_url: 'https://cards.scryfall.io/png/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.png?1682693862'
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
                            restrictions: ["Spirit"]
                        }
                    ]
                }
            ]
        }
    ]
};
