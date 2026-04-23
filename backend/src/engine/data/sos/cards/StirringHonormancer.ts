import { AbilityType, CardDefinition, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
    }]
};
