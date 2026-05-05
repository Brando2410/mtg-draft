import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const BasrisAegis: CardDefinition = {
    name: "Basri's Aegis",
    manaCost: "{3}{W}",
    scryfall_id: "8f747867-080e-4735-97e3-057b4455855f",
    image_url: "https://cards.scryfall.io/normal/front/8/f/8f747867-080e-4735-97e3-057b4455855f.jpg?1596250058",
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
    ]
};
