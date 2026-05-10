import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from '@shared/engine_types';
export const SummonedDromedary: CardDefinition = {
    name: "Summoned Dromedary",
    manaCost: "{3}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Spirit", "Camel"],
    keywords: ["Vigilance"],
    power: "4",
    toughness: "3",
    oracleText: "Vigilance\n{1}{W}: Return this card from your graveyard to your hand. Activate only as a sorcery.",
    abilities: [
        {
            name: "Return to Hand",
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            manaCost: "{1}{W}",
            costs: [{ type: CostType.Mana, value: '{1}{W}' }],
            activatedOnlyAsSorcery: true,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "44d0277c-ca82-4334-a15a-cd67a9db0d02",
    image_url: "https://cards.scryfall.io/normal/front/4/4/44d0277c-ca82-4334-a15a-cd67a9db0d02.jpg?1775937170",
    rarity: "uncommon"
};

