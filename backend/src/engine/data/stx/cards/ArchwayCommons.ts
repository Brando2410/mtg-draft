import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ArchwayCommons: CardDefinition = {
    name: 'Archway Commons',
    manaCost: '',
    scryfall_id: "f6f6a2ff-7eb7-4680-af2b-e69ac88a65c9",
    image_url: "https://cards.scryfall.io/normal/front/f/6/f6f6a2ff-7eb7-4680-af2b-e69ac88a65c9.jpg?1624740834",
    colors: [],
    types: ['Land'],
    oracleText: 'Archway Commons enters the battlefield tapped.\nWhen Archway Commons enters the battlefield, sacrifice it unless you pay {1}.\n{T}: Add one mana of any color.',
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{ type: EffectType.EntersTapped }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.Choice,
                label: "Pay {1} or sacrifice Archway Commons?",
                choices: [
                    { label: "Pay {1}", costs: [{ type: CostType.Mana, value: '{1}' }] },
                    { label: "Sacrifice", effects: [{ type: CostType.Sacrifice, targetMapping: TargetMapping.Self }] }
                ]
            }]
        },
        {
            type: AbilityType.Activated,
            id: "{T}: Add one mana of any color.",
            costs: [{ type: CostType.Tap }],
            effects: [{
                type: EffectType.Choice,
                label: "Select color",
                choices: [
                    { label: "{W}", effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                    { label: "{U}", effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                    { label: "{B}", effects: [{ type: EffectType.AddMana, manaType: 'B' }] },
                    { label: "{R}", effects: [{ type: EffectType.AddMana, manaType: 'R' }] },
                    { label: "{G}", effects: [{ type: EffectType.AddMana, manaType: 'G' }] }
                ]
            }]
        }
    ]
};


