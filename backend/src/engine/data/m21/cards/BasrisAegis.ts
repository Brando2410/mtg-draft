import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const BasrisAegis: CardDefinition = {
    name: "Basri's Aegis",
    manaCost: "{3}{W}",

    oracleText: "Put a +1/+1 counter on target creature you control. You may search your library and/or graveyard for a card named Basri, Devoted Paladin, reveal it, and put it into your hand. If you search your library this way, shuffle.",
    colors: ["W"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.YouControl]
            }],
            effects: [
                { type: EffectType.AddCounters, counterType: '+1/+1', amount: 1, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.SearchLibrary,
                    targetDefinitions: [{
                        type: TargetType.Card,
                        count: 1,
                        restrictions: [{ type: Restriction.Name, value: 'Basri, Devoted Paladin' }]
                    }],
                    sourceZones: [Zone.Library, Zone.Graveyard],
                    zone: Zone.Hand,
                    reveal: true,
                    optional: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "577657ed-162f-4104-b0af-ee9733e90f20",
    image_url: "https://cards.scryfall.io/normal/front/5/7/577657ed-162f-4104-b0af-ee9733e90f20.jpg?1596250020",
    rarity: "rare"
};

