import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SanctumofFruitfulHarvest: Record<string, ImplementableCard> = {
    "Sanctum of Fruitful Harvest": {
        name: "Sanctum of Fruitful Harvest",
        manaCost: "{2}{G}",
        oracleText: "At the beginning of your precombat main phase, add X mana of any one color, where X is the number of Shrines you control.",
        colors: ["green"],
        supertypes: ["Legendary"],
        types: ["Enchantment"],
        subtypes: ["Shrine"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "sanctum_fruitful_harvest_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_PRE_COMBAT_MAIN_PHASE_START',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'AddMana', amount: 'COUNT_Shrine', manaType: 'ANY', targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
