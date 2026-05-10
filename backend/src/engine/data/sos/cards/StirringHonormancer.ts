import { AbilityType, CardDefinition, EffectType, TriggerEvent, Zone } from '@shared/engine_types';

export const StirringHonormancer: CardDefinition = {
    name: "Stirring Honormancer",
    manaCost: "{2}{W}{W/B}{B}",
    colors: ["B", "W"],
    types: ["Creature"],
    subtypes: ["Rhino", "Bard"],
    keywords: [],
    oracleText: "When this creature enters, look at the top X cards of your library, where X is the number of creatures you control. Put one of those cards into your hand and the rest into your graveyard.",
    power: "4",
    toughness: "5",
    abilities: [{
        type: AbilityType.Triggered,
        eventMatch: TriggerEvent.EnterBattlefield,
        effects: [
            {
                type: EffectType.LookAtTopAndPick,
                fromTop: 'CREATURE_COUNT_YOU_CONTROL',
                amount: 1,
                zone: Zone.Hand,
                remainderZone: Zone.Graveyard
            }
        ]
    }],
    scryfall_id: "ee84b04d-78fc-416f-9166-72e5417c3e17",
    image_url: "https://cards.scryfall.io/normal/front/e/e/ee84b04d-78fc-416f-9166-72e5417c3e17.jpg?1775938634",
    rarity: "uncommon"
};

