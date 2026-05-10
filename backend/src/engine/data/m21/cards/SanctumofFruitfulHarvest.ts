import { AbilityType, CardDefinition, ConditionType, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SanctumofFruitfulHarvest: CardDefinition = {
    name: "Sanctum of Fruitful Harvest",
    manaCost: "{2}{G}",
    oracleText: "At the beginning of your precombat main phase, add X mana of any one color, where X is the number of Shrines you control.",
    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'Any',
                    amount: DynamicAmount.ShrinesYouControlCount,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "5ca28cfd-1a1b-4176-8b07-993d3d7b7ae4",
    image_url: "https://cards.scryfall.io/normal/front/5/c/5ca28cfd-1a1b-4176-8b07-993d3d7b7ae4.jpg?1594737198",
    rarity: "uncommon"
};

