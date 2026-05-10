import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const ParadoxSurveyor: CardDefinition = {
    name: "Paradox Surveyor",
    manaCost: "{G}{G/U}{U}",


    colors: ["G", "U"],
    types: ["Creature"],
    subtypes: ["Elf", "Druid"],
    keywords: ["Reach"],
    power: "3",
    toughness: "3",
    oracleText: "Reach\nWhen this creature enters, look at the top five cards of your library. You may reveal a land card or a card with {X} in its mana cost from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 5,
                    optional: true,
                    restrictions: [
                        {
                            type: Restriction.Any,
                            restrictions: [Restriction.Land, Restriction.HasXInManaCost]
                        }

                    ],
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "d7cb1af2-0302-46ff-8303-ae9d07541a01",
    image_url: "https://cards.scryfall.io/normal/front/d/7/d7cb1af2-0302-46ff-8303-ae9d07541a01.jpg?1775938445",
    rarity: "uncommon"
};

