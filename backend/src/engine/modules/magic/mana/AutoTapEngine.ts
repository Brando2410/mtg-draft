// AutoTapEngine.ts
import { GameObject, GameState, PlayerId, EffectType, AddManaEffect, SpecializedEffect } from '@shared/engine_types';
import { EngineContext } from '../../../interfaces/EngineContext';
import { ManaParser } from './ManaParser';
import { ManaPoolManager } from './ManaPoolManager';
import { ManaColor, ManaPoolRecord, ManaProductionYield, ManaSourceCandidate } from './ManaTypes';
import { oracle } from './../../../OracleLogicMap';
import { RuleUtils } from '../../../utils/RuleUtils';
import { LogCategory, EngineLogger } from '../../../utils/EngineLogger';
import { getProcessors } from '../../ProcessorRegistry';

export class AutoTapEngine {
    public static autoTapLandsForCost(
        state: GameState,
        playerId: PlayerId,
        costStr: string,
        engine: EngineContext,
        payingFor?: GameObject
    ): { tappedIds: string[], producedMana: ManaPoolRecord } {
        const player = state.players[playerId];
        if (!player) return { tappedIds: [], producedMana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } };
        const requirements = ManaParser.parseManaCost(costStr);
        // Essential log: confirms what we are trying to satisfy
        EngineLogger.info(state, LogCategory.MANA, `[AUTOTAP] Auto-taping sources for cost: ${costStr}`);

        const tappedIds: string[] = [];
        const producedMana: ManaPoolRecord = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };

        // 1. Local tracking pool (floating + restricted)
        const localPool = ManaPoolManager.getUsableMana(player, payingFor);

        // 2. Identify all available sources (lands and non-lands)
        const availableSources = this.getAvailableManaSources(state, playerId, tappedIds);

        // 3. PLAYABILITY LOOK-AHEAD
        const totalCapacity = Object.values(localPool).reduce((a, b: any) => a + b, 0) + availableSources.length;
        const budget = totalCapacity - ManaParser.getManaValue(costStr);
        const playables = [...player.hand, ...(player.virtualHand || [])].filter((c: GameObject) => {
            if (c.id === payingFor?.id) return false; // Don't count the spell being cast
            return ManaParser.getManaValue(c.definition.manaCost || "") <= budget;
        });

        // 4. Calculate color demand from potential future plays
        const demandMap: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
        playables.forEach((c: GameObject) => {
            const cost = ManaParser.parseManaCost(c.definition.manaCost || "");
            Object.keys(cost.colored).forEach((symbol: string) => {
                symbol.split('/').forEach((part: string) => {
                    if (['W', 'U', 'B', 'R', 'G', 'C'].includes(part)) demandMap[part]++;
                });
            });
        });

        // 4b. Support for "Spend as any color"
        const canSpendAsAnyColor = state?.ruleRegistry?.continuousEffects?.some((e: any) =>
            (e.type === 'AllowSpendManaAsAnyColor' || e.spendAnyMana) &&
            e.controllerId === playerId &&
            (!e.targetIds || !payingFor || e.targetIds.includes(payingFor.id))
        );

        const findBestSource = (requiredColors?: string[] | null): ManaSourceCandidate | null => {
            const candidates: ManaSourceCandidate[] = [];
            const effectiveReqs = canSpendAsAnyColor ? null : requiredColors;

            availableSources.forEach(src => {
                if (tappedIds.includes(src.obj.id)) return;

                let canProduce = false;
                let bestAIdx = -1;
                let bestCIdx: number | undefined = undefined;

                // Check each mana ability
                src.abilities.forEach((a, aIdx) => {
                    const abilityColors = this.getProduceableColors(a);

                    // CHECK RESTRICTIONS
                    const isLegalForSource = (restrictions: string[]) => {
                        if (!restrictions || restrictions.length === 0) return true;
                        if (!payingFor) return false;
                        return restrictions.every(r => {
                            const lowR = r.toLowerCase();
                            if (lowR === 'instant_or_sorcery') {
                                return RuleUtils.isType(payingFor, 'instant') || RuleUtils.isType(payingFor, 'sorcery');
                            }
                            return RuleUtils.isType(payingFor, lowR) || RuleUtils.hasSubtype(payingFor, lowR);
                        });
                    };

                    if (!isLegalForSource(abilityColors.restrictions)) return;

                    const satisfies = !effectiveReqs ||
                        effectiveReqs.some(c => abilityColors.colors.has(c as ManaColor) || abilityColors.choiceColors.includes(c));

                    if (satisfies) {
                        // Calculate potential yield for "Least Waste" heuristic
                        let yieldValue = 0;
                        const anyAbility = a;
                        if (anyAbility.effects) {
                            anyAbility.effects.forEach((e) => {
                                let v: any = '{C}';
                                if (e.type === EffectType.AddMana) {
                                    v = (e as AddManaEffect).manaType || '{C}';
                                } else if (e.type === EffectType.AdNauseam || e.type === EffectType.ChaosWarp) {
                                    // Handle specialized mana effects if they use 'value'
                                    v = (e as SpecializedEffect).value || '{C}';
                                }

                                const amount = typeof e.amount === 'number' ? e.amount : 1;
                                yieldValue = Math.max(yieldValue, ManaParser.getManaValue(String(v)) * amount);
                            });
                        }

                        if (!canProduce || yieldValue < (src.currentYield || Infinity)) {

                            canProduce = true;
                            bestAIdx = aIdx;
                            src.currentYield = yieldValue;

                            // Handle choices (e.g. "Add one mana of any color")
                            if (abilityColors.hasChoice) {
                                if (effectiveReqs) {
                                    const foundChoice = abilityColors.choiceColors.findIndex(cc => effectiveReqs.includes(cc));
                                    if (foundChoice !== -1) bestCIdx = foundChoice;
                                } else {
                                    // For generic mana, pick the least demanded color
                                    let bestDemand = Infinity;
                                    abilityColors.choiceColors.forEach((cc, idx) => {
                                        const demand = demandMap[cc] || 0;
                                        if (demand < bestDemand) {
                                            bestDemand = demand;
                                            bestCIdx = idx;
                                        }
                                    });
                                    if (bestCIdx === undefined) bestCIdx = 0;
                                }
                            }
                        }
                    }
                });

                if (canProduce) {
                    // Calculate demand score: how many playables need colors this source can produce
                    let demandScore = 0;
                    src.allPossibleColors.forEach((c: ManaColor) => { demandScore += demandMap[c] || 0; });

                    candidates.push({
                        ...src,
                        aIdx: bestAIdx,
                        cIdx: bestCIdx,
                        versatility: src.allPossibleColors.size,
                        demandScore,
                        yieldScore: src.currentYield || 1
                    });
                }
            });

            if (candidates.length === 0) return null;

            // Priority sorting:
            // 1. Simpler sources first (Versatility: 1 -> 2 -> 3)
            // 2. Sources NOT needed by hand first (Demand Score)
            // 3. Lands vs Non-lands (Prefer Lands to keep creatures for utility/combat)
            candidates.sort((a, b) => {
                const yieldA = a.yieldScore || 1;
                const yieldB = b.yieldScore || 1;
                if (yieldA !== yieldB) return yieldA - yieldB;

                const versA = a.versatility || 1;
                const versB = b.versatility || 1;
                if (versA !== versB) return versA - versB;

                const demandA = a.demandScore || 0;
                const demandB = b.demandScore || 0;
                if (demandA !== demandB) return demandA - demandB;

                const aIsLand = RuleUtils.isLand(a.obj);
                const bIsLand = RuleUtils.isLand(b.obj);
                if (aIsLand !== bIsLand) return aIsLand ? -1 : 1;

                return 0;
            });

            return candidates[0];
        };

        // Helper to track and pool newly produced mana
        const trackProduction = (ability: any, source: ManaSourceCandidate, aIdx: number) => {
            const abilityColors = this.getProduceableColors(ability);
            const manaEffect = (ability.effects as any[])?.find((e: any) => e.type === 'AddMana' || e.mana || e.manaType);
            let producedAmount = 0;

            if (manaEffect) {
                const val = (manaEffect.value || manaEffect.mana || manaEffect.manaType || '{C}').toString();
                const amount = manaEffect.amount || 1;
                const produce = ManaParser.parseManaCost(val);

                if (source.cIdx !== undefined) {
                    const chosen = abilityColors.choiceColors[source.cIdx] as keyof ManaPoolRecord;
                    if (chosen) {
                        producedMana[chosen] += amount;
                        localPool[chosen] += amount;
                    }
                    producedAmount = amount;
                } else {
                    Object.entries(produce.colored).forEach(([c, amt]) => {
                        const color = c as keyof ManaPoolRecord;
                        producedMana[color] += (amt as number) * amount;
                        localPool[color] += (amt as number) * amount;
                    });
                    producedMana.C += produce.generic * amount;
                    localPool.C += produce.generic * amount;
                    producedAmount = ManaParser.getManaValue(val) * amount;
                }
            } else if (source.cIdx !== undefined) {
                const chosen = abilityColors.choiceColors[source.cIdx] as keyof ManaPoolRecord;
                if (chosen) {
                    producedMana[chosen]++;
                    localPool[chosen]++;
                }
                producedAmount = 1;
            } else {
                // Fallback for basics or simple top-level mana abilities
                const colors = Array.from(abilityColors.colors);
                if (colors.length > 0) {
                    const color = colors[0] as keyof ManaPoolRecord;
                    producedMana[color]++;
                    localPool[color]++;
                } else {
                    producedMana.C++;
                    localPool.C++;
                }
                producedAmount = 1;
            }
            return producedAmount;
        };


        // 5. SATISFY COLORED REQUIREMENTS
        const coloredReqs: string[] = [];
        Object.entries(requirements.colored).forEach(([c, amt]) => {
            for (let i = 0; i < amt; i++) coloredReqs.push(c);
        });

        for (const req of coloredReqs) {
            // Try pool first
            let satisfiedFromPool = false;
            const options = req.includes('/') ? req.split('/') : [req];
            for (const opt of options) {
                if (opt === 'P') continue;
                const poolKey = opt as keyof ManaPoolRecord;
                if (localPool[poolKey] > 0) {
                    localPool[poolKey]--;
                    satisfiedFromPool = true;
                    break;
                }
            }
            if (satisfiedFromPool) continue;

            // Tap source
            const source = findBestSource(options);
            if (source) {
                let actualCIdx = source.cIdx;
                if (actualCIdx === undefined) {
                    const abilityColors = this.getProduceableColors(source.abilities[source.aIdx || 0]);
                    if (abilityColors.hasChoice) actualCIdx = 0;
                }

                // We pass the calculated cIdx (Choice Index) into the engine.
                // This informs the land exactly which color to produce, bypassing the manual modal.
                engine.tapForMana(playerId, source.obj.id, source.aIdx || 0, actualCIdx);

                // ARCHITECTURAL NOTE: Stealth Pending Action Clearance
                if (state.pendingAction && (state.pendingAction.sourceId === source.obj.id || state.pendingAction.type === 'RESOLUTION_CHOICE' || state.pendingAction.type === 'OPTIONAL_ACTION')) {
                    state.pendingAction = undefined;
                }

                tappedIds.push(source.obj.id);
                trackProduction(source.abilities[source.aIdx || 0], { ...source, cIdx: actualCIdx }, source.aIdx || 0);

                // CONSUME IMMEDIATELY: The mana we just produced must satisfy the current colored requirement
                for (const opt of options) {
                    if (opt === 'P') continue;
                    const poolKey = opt as keyof ManaPoolRecord;
                    if (localPool[poolKey] > 0) {
                        localPool[poolKey]--;
                        break;
                    }
                }
            }
        }

        // 6. SATISFY GENERIC REQUIREMENTS
        let genericNeeded = requirements.generic;
        const poolOrder: ManaColor[] = ["C", "W", "U", "B", "R", "G"];
        for (const c of poolOrder) {
            if (genericNeeded <= 0) break;
            const take = Math.min(genericNeeded, localPool[c]);
            if (take > 0) {
                localPool[c] -= take;
                genericNeeded -= take;
            }
        }

        while (genericNeeded > 0) {
            const source = findBestSource(null);
            if (!source) {
                EngineLogger.debug(state, LogCategory.MANA, `[AUTOTAP-DEBUG] Generic satisfaction failed: No more sources. Still needed: ${genericNeeded}`);
                break;
            }

            let actualCIdx = source.cIdx;
            if (actualCIdx === undefined) {
                const abilityColors = this.getProduceableColors(source.abilities[source.aIdx || 0]);
                if (abilityColors.hasChoice) actualCIdx = 0;
            }

            // See ARCHITECTURAL NOTE on Choice Propagation above.
            engine.tapForMana(playerId, source.obj.id, source.aIdx || 0, actualCIdx);

            // See ARCHITECTURAL NOTE on Stealth Pending Action Clearance above.
            if (state.pendingAction && (state.pendingAction.sourceId === source.obj.id || state.pendingAction.type === 'RESOLUTION_CHOICE')) {
                state.pendingAction = undefined;
            }

            tappedIds.push(source.obj.id);

            trackProduction(source.abilities[source.aIdx || 0], { ...source, cIdx: actualCIdx }, source.aIdx || 0);

            // Re-apply pool to generic needed in case the source produced more than 1 or different colors
            for (const c of poolOrder) {
                if (genericNeeded <= 0) break;
                const take = Math.min(genericNeeded, localPool[c]);
                if (take > 0) {
                    localPool[c] -= take;
                    genericNeeded -= take;
                }
            }
        }

        return { tappedIds, producedMana };
    }

    private static getAvailableManaSources(state: GameState, playerId: string, alreadyTapped: string[]): ManaSourceCandidate[] {
        const sources: ManaSourceCandidate[] = [];

        const { layer: LayerProcessor } = getProcessors(state);

        state.battlefield.forEach((obj: GameObject) => {
            if (obj.controllerId !== playerId || obj.isTapped || alreadyTapped.includes(obj.id)) return;

            const stats = LayerProcessor.getEffectiveStats(obj, state);
            const abilities = stats.abilities || [];
            const manaAbilities = (abilities as any[]).filter((a: any) => typeof a !== 'string' && a.isManaAbility);
            if (manaAbilities.length === 0) return;

            const allPossibleColors = new Set<ManaColor>();
            manaAbilities.forEach((a: any) => {
                const colors = this.getProduceableColors(a);
                colors.colors.forEach((c: ManaColor) => allPossibleColors.add(c));
                colors.choiceColors.forEach((c: string) => allPossibleColors.add(c as ManaColor));
            });

            const allPossibleColorsArray = Array.from(allPossibleColors);
            sources.push({
                obj,
                abilities: manaAbilities,
                allPossibleColors,
                allPossibleColorsArray,
                choiceColors: Array.from(new Set(manaAbilities.flatMap((a: any) => this.getProduceableColors(a).choiceColors)))
            });
        });

        return sources;
    }

    private static getProduceableColors(ability: any): ManaProductionYield {
        const colors = new Set<ManaColor>();
        let hasChoice = false;
        const choiceColors: string[] = [];
        const restrictions: string[] = [];

        const extract = (effects: any[]) => {
            if (!effects) return;
            effects.forEach((e: any) => {
                if (e.type === 'AddMana' || e.mana || e.manaType) {
                    const val = (e.value || e.manaType || e.mana || '{C}').toString();
                    const reqs = ManaParser.parseManaCost(val);
                    Object.keys(reqs.colored).forEach((c: string) => {
                        c.split('/').forEach((part: string) => {
                            if (['W', 'U', 'B', 'R', 'G', 'C'].includes(part)) colors.add(part as ManaColor);
                        });
                    });
                    if (reqs.generic > 0) colors.add('C');

                    const rawR = e.manaRestrictions || e.restriction || e.restrictions;
                    if (rawR) {
                        if (Array.isArray(rawR)) restrictions.push(...rawR);
                        else restrictions.push(rawR);
                    }
                }
                if (e.choices) {
                    hasChoice = true;
                    e.choices.forEach((choice: any) => {
                        (choice.effects || []).forEach((se: any) => {
                            if (se.type === 'AddMana' || se.mana || se.manaType) {
                                const val = (se.value || se.manaType || se.mana || '{C}').toString();
                                const reqs = ManaParser.parseManaCost(val);
                                Object.keys(reqs.colored).forEach(c => {
                                    c.split('/').forEach(part => {
                                        if (['W', 'U', 'B', 'R', 'G', 'C'].includes(part)) choiceColors.push(part);
                                    });
                                });

                                const rawR = se.manaRestrictions || se.restriction || se.restrictions;
                                if (rawR) {
                                    if (Array.isArray(rawR)) restrictions.push(...rawR);
                                    else restrictions.push(rawR);
                                }
                            }
                        });
                    });
                }
                if (e.effects) extract(e.effects);
            });
        };

        extract(ability.effects || []);
        return { colors, hasChoice, choiceColors, restrictions };
    }
}
