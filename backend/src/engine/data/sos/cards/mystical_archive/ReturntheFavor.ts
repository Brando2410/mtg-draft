import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ReturntheFavor: CardDefinition = {
    name: "Return the Favor",
    manaCost: "{R}{R}",


    colors: ["R"],
    types: ["Instant"],
    subtypes: [],
    keywords: ["Spree"],
    oracleText: "Spree (Choose one or more additional costs.)\n+ {1} — Copy target instant spell, sorcery spell, activated ability, or triggered ability. You may choose new targets for the copy.\n+ {1} — Change the target of target spell or ability with a single target.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 2,
            modes: [
                {
                    label: "Copy target instant/sorcery/activated/triggered",
                    costs: [{ type: CostType.Mana, value: "{1}" }],
                    targetDefinitions: [{
                        count: 1,
                        type: TargetType.Any,
                        sourceZones: [Zone.Stack],
                        restrictions: [Restriction.InstantOrSorcery + "_or_" + Restriction.Ability]
                    }],
                    effects: [{ type: EffectType.CopySpellOnStack, chooseNewTargets: true, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: "Change the target of target spell or ability",
                    costs: [{ type: CostType.Mana, value: "{1}" }],
                    targetDefinitions: [{
                        count: 1,
                        type: TargetType.Any,
                        sourceZones: [Zone.Stack],
                        restrictions: [Restriction.Spell + "_or_" + Restriction.Ability, "HAS_SINGLE_TARGET"]
                    }],
                    effects: [{ type: EffectType.ChangeTarget, targetMapping: TargetMapping.Target1 }]
                }
            ]
        }
    ],
    scryfall_id: "e968efff-635b-4780-9bbe-099e75a1841b",
    image_url: "https://cards.scryfall.io/normal/front/e/9/e968efff-635b-4780-9bbe-099e75a1841b.jpg?1775936710",
    rarity: "uncommon"
};

