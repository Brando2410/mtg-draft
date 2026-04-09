import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ScavengingOoze: Record<string, ImplementableCard> = {
    "Scavenging Ooze": {
        name: "Scavenging Ooze",
        manaCost: "{1}{G}",
        colors: ["green"],
        types: ["Creature"],
        subtypes: ["Ooze"],
        supertypes: [],
        oracleText: "{G}: Exile target card from a graveyard. If it was a creature card, put a +1/+1 counter on Scavenging Ooze and you gain 1 life.",
        image_url: "https://cards.scryfall.io/normal/front/1/7/17b59819-4746-4c67-b6e5-4157d498a065.jpg",
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "scavenging_ooze_exile",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{G}' }],
                targetDefinition: { type: 'Card', count: 1, restrictions: ['Graveyard'] },
                effects: [
                    { type: 'Exile', targetMapping: 'TARGET_1' },
                    { type: EffectType.AddCounters, amount: 1, value: '+1/+1', condition: 'TARGET_1_MATCHES:creature', targetMapping: 'SELF' },
                    { type: EffectType.GainLife, amount: 1, condition: 'TARGET_1_MATCHES:creature', targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};
