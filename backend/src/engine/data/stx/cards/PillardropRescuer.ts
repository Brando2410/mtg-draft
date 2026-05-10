import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const PillardropRescuer: CardDefinition = {
    name: 'Pillardrop Rescuer',
    manaCost: '{4}{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Cleric'],
    power: "2",
    toughness: "2",
    keywords: ['Flying'],
    oracleText: 'Flying\nWhen Pillardrop Rescuer enters the battlefield, return target creature card with mana value 3 or less from your graveyard to your hand.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                count: 1,
                type: TargetType.CardInGraveyard,
                restrictions: [Restriction.Creature, Restriction.ManaValue3OrLess, Restriction.YouControl]
            }],
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "0884666e-8f9b-44b1-a1e3-c1c8941e2152",
    image_url: "https://cards.scryfall.io/normal/front/0/8/0884666e-8f9b-44b1-a1e3-c1c8941e2152.jpg?1624589600",
    rarity: "common"
};

