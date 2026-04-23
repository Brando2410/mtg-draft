import { AbilityType, CardDefinition, EffectType, TargetMapping, SelectionType, Zone, Restriction } from '@shared/engine_types';

export const AdventurousImpulse: CardDefinition = {
    name: "Adventurous Impulse",
    manaCost: "{G}",
    oracleText: "Look at the top three cards of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
    colors: ["G"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 3,
                    amount: 1,
                    restrictions: [Restriction.Creature, Restriction.Land],
                    reveal: true,
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom'
                }
            ]
        }
    ]
};
