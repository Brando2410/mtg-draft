import { AbilityType, CardDefinition, CostType, Zone } from '@shared/engine_types';
export const SoaringStoneglider: CardDefinition = {
    name: "Soaring Stoneglider",
    manaCost: "{2}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Elephant", "Cleric"],
    keywords: ["Flying", "Vigilance"],
    power: "4",
    toughness: "3",
    oracleText: "As an additional cost to cast this spell, exile two cards from your graveyard or pay {1}{W}.\nFlying, vigilance",
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [
                {
                    type: CostType.Choice,
                    label: 'Choose an additional cost',
                    choices: [
                        {
                            label: 'Exile 2 cards from your graveyard',
                            costs: [{ type: CostType.Exile, amount: 2, sourceZones: [Zone.Graveyard] }]
                        },
                        {
                            label: 'Pay {1}{W}',
                            costs: [{ type: CostType.Mana, value: '{1}{W}' }]
                        }
                    ]
                }
            ]
        }
    ]
};
