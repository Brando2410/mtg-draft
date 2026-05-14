// AutoTapEngine.ts
import { GameObject, GameState, PlayerId, EffectType, AddManaEffect, SpecializedEffect, AbilityDefinition, CostType } from '@shared/engine_types';
import { EngineContext } from '../../../interfaces/EngineContext';
import { ManaParser } from './ManaParser';
import { ManaPoolManager } from './ManaPoolManager';
import { ManaColor, ManaPoolRecord, ManaProductionYield, ManaSourceCandidate } from './ManaTypes';
import { RuleUtils } from '../../../utils/RuleUtils';
import { LogCategory, EngineLogger } from '../../../utils/EngineLogger';
import { getProcessors } from '../../ProcessorRegistry';

/**
 * AutoTapEngine: Orchestrates the automated tapping of mana sources to satisfy costs.
 * Uses heuristics like "Least Waste", "Playability Look-ahead", and "Restricted Preference".
 */
export class AutoTapEngine {
    
    /**
     * Unified validation: Checks if a cost is payable using all available sources.
     * This is the single source of truth for all mana availability checks.
     */
    public static canPayMana(
        state: GameState, 
        playerId: PlayerId, 
        costStr: string, 
        payingFor?: GameObject,
        excludeId?: string
    ): boolean {
        const player = state.players[playerId];
        if (!player || player.manaCheat) return true;

        const requirements = ManaParser.parseManaCost(costStr);
        const localPool = ManaPoolManager.getUsableMana(player, payingFor);

        // Run the actual solver logic in simulation mode
        const { producedMana } = this.autoTapLandsForCost(state, playerId, costStr, null as any, payingFor, excludeId);

        // Combine floating mana and simulated produced mana
        const totalW = (localPool.W || 0) + (producedMana.W || 0);
        const totalU = (localPool.U || 0) + (producedMana.U || 0);
        const totalB = (localPool.B || 0) + (producedMana.B || 0);
        const totalR = (localPool.R || 0) + (producedMana.R || 0);
        const totalG = (localPool.G || 0) + (producedMana.G || 0);
        const totalC = (localPool.C || 0) + (producedMana.C || 0);

        const totalPool: ManaPoolRecord = { W: totalW, U: totalU, B: totalB, R: totalR, G: totalG, C: totalC };

        // Final check: Can this combined pool satisfy the requirements?
        return this.isSatisfied(requirements, totalPool, this.checkSpendAsAnyColor(state, playerId, payingFor));
    }

    /**
     * Main entry point for auto-tapping.
     */
    public static autoTapLandsForCost(
        state: GameState,
        playerId: PlayerId,
        costStr: string,
        engine: EngineContext,
        payingFor?: GameObject,
        excludeId?: string
    ): { tappedIds: string[], producedMana: ManaPoolRecord } {
        const player = state.players[playerId];
        if (!player) return { tappedIds: [], producedMana: this.emptyPool() };
        
        const requirements = ManaParser.parseManaCost(costStr);
        EngineLogger.info(state, LogCategory.MANA, `[AUTOTAP] Auto-taping sources for cost: ${costStr}`);

        const tappedIds: string[] = [];
        const producedMana: ManaPoolRecord = this.emptyPool();
        const localPool = ManaPoolManager.getUsableMana(player, payingFor);

        // 1. Context Preparation
        const availableSources = this.getAvailableManaSources(state, playerId, tappedIds, excludeId);
        const demandMap = this.calculateColorDemand(player, availableSources, localPool, costStr, payingFor);
        const canSpendAsAnyColor = this.checkSpendAsAnyColor(state, playerId, payingFor);

        // 2. Satisfy Colored Requirements
        this.satisfyColoredRequirements(state, playerId, requirements, localPool, availableSources, tappedIds, producedMana, demandMap, canSpendAsAnyColor, engine, payingFor);

        // 3. Satisfy Generic Requirements
        this.satisfyGenericRequirements(state, playerId, requirements, localPool, availableSources, tappedIds, producedMana, demandMap, canSpendAsAnyColor, engine, payingFor);

        return { tappedIds, producedMana };
    }

    // --- STEP 1: CONTEXT HELPERS ---

    private static emptyPool(): ManaPoolRecord {
        return { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    }

    private static checkSpendAsAnyColor(state: GameState, playerId: PlayerId, payingFor?: GameObject): boolean {
        return state?.ruleRegistry?.continuousEffects?.some((e: any) =>
            (e.type === 'AllowSpendManaAsAnyColor' || e.spendAnyMana) &&
            e.controllerId === playerId &&
            (!e.targetIds || !payingFor || e.targetIds.includes(payingFor.id))
        ) || false;
    }

    /**
     * Calculates which colors are needed for future plays in hand to avoid "locking" ourselves.
     */
    private static calculateColorDemand(player: any, availableSources: ManaSourceCandidate[], localPool: ManaPoolRecord, costStr: string, payingFor?: GameObject): Record<string, number> {
        const totalCapacity = Object.values(localPool).reduce((a, b: any) => a + b, 0) + availableSources.length;
        const budget = totalCapacity - ManaParser.getManaValue(costStr);
        
        const demandMap: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
        const playables = [...player.hand, ...(player.virtualHand || [])].filter((c: GameObject) => {
            if (c.id === payingFor?.id) return false;
            return ManaParser.getManaValue(c.definition.manaCost || "") <= budget;
        });

        playables.forEach((c: GameObject) => {
            const cost = ManaParser.parseManaCost(c.definition.manaCost || "");
            Object.keys(cost.colored).forEach((symbol: string) => {
                symbol.split('/').forEach((part: string) => {
                    if (['W', 'U', 'B', 'R', 'G', 'C'].includes(part)) demandMap[part]++;
                });
            });
        });

        return demandMap;
    }

    // --- STEP 2: REQUIREMENT SATISFACTION ---

    /**
     * Internal utility to check if a mana pool satisfies requirements.
     */
    private static isSatisfied(requirements: any, pool: ManaPoolRecord, canSpendAsAny: boolean): boolean {
        const workPool = { ...pool };
        
        if (canSpendAsAny) {
            const totalRequired = ManaParser.getManaValue(""); // Need a way to get total value from requirements
            // Fallback to manual sum since parseManaCost output is structured
            let requiredSum = requirements.generic;
            Object.values(requirements.colored).forEach((v: any) => requiredSum += v);
            
            const totalAvailable = Object.values(workPool).reduce((a, b) => a + (b as number), 0);
            return totalAvailable >= requiredSum;
        }

        // Colored first
        for (const [symbol, amount] of Object.entries(requirements.colored)) {
            const count = amount as number;
            if (symbol.includes('/')) {
                // Hybrid handling (simplified for validation)
                const options = symbol.split('/');
                let satisfied = false;
                for (const opt of options) {
                    if (workPool[opt as keyof ManaPoolRecord] >= count) {
                        workPool[opt as keyof ManaPoolRecord] -= count;
                        satisfied = true;
                        break;
                    }
                }
                if (!satisfied) return false;
            } else {
                if ((workPool[symbol as keyof ManaPoolRecord] || 0) < count) return false;
                workPool[symbol as keyof ManaPoolRecord] -= count;
            }
        }

        // Generic last
        const remaining = Object.values(workPool).reduce((a, b) => a + (b as number), 0);
        return remaining >= requirements.generic;
    }

    private static satisfyColoredRequirements(
        state: GameState,
        playerId: PlayerId,
        requirements: any,
        localPool: ManaPoolRecord,
        availableSources: ManaSourceCandidate[],
        tappedIds: string[],
        producedMana: ManaPoolRecord,
        demandMap: Record<string, number>,
        canSpendAsAnyColor: boolean,
        engine: EngineContext,
        payingFor?: GameObject
    ) {
        const coloredReqs: string[] = [];
        Object.entries(requirements.colored).forEach(([c, amt]) => {
            for (let i = 0; i < (amt as number); i++) coloredReqs.push(c);
        });

        for (const req of coloredReqs) {
            if (this.trySatisfyFromPool(localPool, req)) continue;

            const options = req.includes('/') ? req.split('/') : [req];
            const source = this.findBestSource(state, availableSources, tappedIds, options, canSpendAsAnyColor, demandMap, payingFor);
            
            if (source) {
                this.executeSourceTapping(state, playerId, source, req, tappedIds, producedMana, localPool, engine, payingFor);
                this.trySatisfyFromPool(localPool, req); // Consume the produced mana
            }
        }
    }

    private static satisfyGenericRequirements(
        state: GameState,
        playerId: PlayerId,
        requirements: any,
        localPool: ManaPoolRecord,
        availableSources: ManaSourceCandidate[],
        tappedIds: string[],
        producedMana: ManaPoolRecord,
        demandMap: Record<string, number>,
        canSpendAsAnyColor: boolean,
        engine: EngineContext,
        payingFor?: GameObject
    ) {
        let genericNeeded = requirements.generic;
        const poolOrder: ManaColor[] = ["C", "W", "U", "B", "R", "G"];

        // Try pool first
        for (const c of poolOrder) {
            if (genericNeeded <= 0) break;
            const take = Math.min(genericNeeded, localPool[c]);
            if (take > 0) {
                localPool[c] -= take;
                genericNeeded -= take;
            }
        }

        // Tap sources for the rest
        while (genericNeeded > 0) {
            const source = this.findBestSource(state, availableSources, tappedIds, null, canSpendAsAnyColor, demandMap, payingFor);
            if (!source) break;

            this.executeSourceTapping(state, playerId, source, 'C', tappedIds, producedMana, localPool, engine, payingFor);

            for (const c of poolOrder) {
                if (genericNeeded <= 0) break;
                const take = Math.min(genericNeeded, localPool[c]);
                if (take > 0) {
                    localPool[c] -= take;
                    genericNeeded -= take;
                }
            }
        }
    }

    private static trySatisfyFromPool(pool: ManaPoolRecord, req: string): boolean {
        const options = req.includes('/') ? req.split('/') : [req];
        for (const opt of options) {
            if (opt === 'P') continue;
            const poolKey = opt as keyof ManaPoolRecord;
            if (pool[poolKey] > 0) {
                pool[poolKey]--;
                return true;
            }
        }
        return false;
    }

    // --- STEP 3: SOURCE SELECTION LOGIC ---

    private static findBestSource(
        state: GameState,
        availableSources: ManaSourceCandidate[],
        tappedIds: string[],
        requiredColors: string[] | null,
        canSpendAsAnyColor: boolean,
        demandMap: Record<string, number>,
        payingFor?: GameObject
    ): ManaSourceCandidate | null {
        const candidates: ManaSourceCandidate[] = [];
        const effectiveReqs = canSpendAsAnyColor ? null : requiredColors;

        availableSources.forEach(src => {
            if (tappedIds.includes(src.obj.id)) return;

            const bestAbility = this.getBestAbilityForSource(src, effectiveReqs, payingFor, demandMap);
            if (bestAbility) {
                candidates.push({
                    ...src,
                    ...bestAbility,
                    versatility: src.allPossibleColors.size,
                    demandScore: this.calculateDemandScore(src, demandMap),
                    yieldScore: src.currentYield || 1
                });
            }
        });

        if (candidates.length === 0) return null;

        // Priority sorting (Least Waste heuristic)
        candidates.sort((a, b) => {
            if (a.yieldScore !== b.yieldScore) return (a.yieldScore || 0) - (b.yieldScore || 0);
            if (a.versatility !== b.versatility) return (a.versatility || 0) - (b.versatility || 0);
            if (a.demandScore !== b.demandScore) return (a.demandScore || 0) - (b.demandScore || 0);
            
            const aIsLand = RuleUtils.isLand(a.obj);
            const bIsLand = RuleUtils.isLand(b.obj);
            if (aIsLand !== bIsLand) return aIsLand ? -1 : 1;
            return 0;
        });

        return candidates[0];
    }

    private static getBestAbilityForSource(src: ManaSourceCandidate, effectiveReqs: string[] | null, payingFor: GameObject | undefined, demandMap: Record<string, number>) {
        let bestAIdx = -1;
        let currentBestScore = -1;
        let bestCIdx: number | undefined = undefined;
        let foundAny = false;
        let finalYield = 0;

        src.abilities.forEach((aRecord) => {
            const a = aRecord.ability;
            const yieldInfo = this.getProduceableColors(a);

            if (!this.isLegalForSource(yieldInfo.restrictions, payingFor)) return;

            const satisfies = !effectiveReqs || effectiveReqs.some(c => 
                yieldInfo.colors.has('ANY' as ManaColor) || yieldInfo.colors.has(c as ManaColor) || 
                yieldInfo.choiceColors.includes('ANY') || yieldInfo.choiceColors.includes(c)
            );

            if (satisfies) {
                const yieldValue = this.calculateAbilityYield(a);
                const score = (yieldInfo.restrictions.length > 0 ? 10 : 0) + yieldValue;

                if (!foundAny || score > currentBestScore) {
                    foundAny = true;
                    bestAIdx = aRecord.originalIndex;
                    currentBestScore = score;
                    finalYield = yieldValue;
                    bestCIdx = this.determineBestChoiceIndex(yieldInfo, effectiveReqs, demandMap);
                }
            }
        });

        return foundAny ? { aIdx: bestAIdx, cIdx: bestCIdx, currentYield: finalYield } : null;
    }

    private static calculateAbilityYield(ability: AbilityDefinition): number {
        let yieldValue = 0;
        if (ability.effects) {
            ability.effects.forEach((e: any) => {
                let v = e.type === EffectType.AddMana ? (e as AddManaEffect).manaType || '{C}' : '{C}';
                const amount = typeof e.amount === 'number' ? e.amount : 1;
                yieldValue = Math.max(yieldValue, ManaParser.getManaValue(String(v)) * amount);
            });
        }
        return yieldValue;
    }

    private static determineBestChoiceIndex(yieldInfo: ManaProductionYield, effectiveReqs: string[] | null, demandMap: Record<string, number>): number | undefined {
        if (!yieldInfo.hasChoice) {
            if (yieldInfo.colors.has('ANY' as ManaColor) && effectiveReqs?.[0]) {
                const colors = ['W', 'U', 'B', 'R', 'G'];
                const idx = colors.indexOf(effectiveReqs[0]);
                return idx !== -1 ? idx : 0;
            }
            return undefined;
        }

        if (effectiveReqs) {
            const found = yieldInfo.choiceColors.findIndex(cc => effectiveReqs.includes(cc));
            return found !== -1 ? found : 0;
        }

        // Pick least demanded color for generic mana
        let bestDemand = Infinity;
        let bestIdx = 0;
        yieldInfo.choiceColors.forEach((cc, idx) => {
            const demand = demandMap[cc] || 0;
            if (demand < bestDemand) {
                bestDemand = demand;
                bestIdx = idx;
            }
        });
        return bestIdx;
    }

    private static isLegalForSource(restrictions: string[], payingFor?: GameObject): boolean {
        if (!restrictions || restrictions.length === 0) return true;
        if (!payingFor) return false;
        return restrictions.every(r => {
            const lowR = r.toLowerCase();
            if (lowR === 'instant_or_sorcery') return RuleUtils.isType(payingFor, 'instant') || RuleUtils.isType(payingFor, 'sorcery');
            return RuleUtils.isType(payingFor, lowR) || RuleUtils.hasSubtype(payingFor, lowR);
        });
    }

    private static calculateDemandScore(src: ManaSourceCandidate, demandMap: Record<string, number>): number {
        let score = 0;
        src.allPossibleColors.forEach((c: ManaColor) => { score += demandMap[c] || 0; });
        return score;
    }

    // --- STEP 4: EXECUTION HELPERS ---

    private static executeSourceTapping(
        state: GameState,
        playerId: PlayerId,
        source: ManaSourceCandidate,
        desiredColor: string,
        tappedIds: string[],
        producedMana: ManaPoolRecord,
        localPool: ManaPoolRecord,
        engine: EngineContext,
        payingFor?: GameObject
    ) {
        let actualCIdx = source.cIdx;
        if (actualCIdx === undefined) {
            const abilityColors = this.getProduceableColors(source.abilities.find(a => a.originalIndex === source.aIdx)?.ability);
            if (abilityColors.hasChoice) actualCIdx = 0;
            else if (abilityColors.colors.has('ANY' as ManaColor)) {
                const colors = ['W', 'U', 'B', 'R', 'G'];
                actualCIdx = colors.indexOf(desiredColor);
                if (actualCIdx === -1) actualCIdx = 0;
            }
        }

        engine.tapForMana(playerId, source.obj.id, source.aIdx || 0, actualCIdx);
        
        // Stealth Action Clearance
        if (state.pendingAction && (state.pendingAction.sourceId === source.obj.id || state.pendingAction.type === 'RESOLUTION_CHOICE' || state.pendingAction.type === 'OPTIONAL_ACTION')) {
            state.pendingAction = undefined;
        }

        tappedIds.push(source.obj.id);
        const abilityToTrack = source.abilities.find(ar => ar.originalIndex === source.aIdx)?.ability || source.obj.definition.abilities?.[source.aIdx || 0];
        this.trackProduction(state, abilityToTrack as any, { ...source, cIdx: actualCIdx }, producedMana, localPool, desiredColor);
    }

    private static trackProduction(state: GameState, ability: any, source: ManaSourceCandidate, producedMana: ManaPoolRecord, localPool: ManaPoolRecord, desiredColor?: string) {
        if (!ability) return;

        const yieldInfo = this.getProduceableColors(ability);
        const manaEffect = (ability.effects as any[])?.find((e: any) => e.type === EffectType.AddMana);

        if (manaEffect) {
            const val = (manaEffect.manaType || '{C}').toString();
            const amount = manaEffect.amount || 1;
            const produce = ManaParser.parseManaCost(val);

            if (source.cIdx !== undefined) {
                const chosen = yieldInfo.choiceColors[source.cIdx];
                let colorToProduce = (chosen as string) === 'ANY' ? (desiredColor || 'C') : chosen;
                if ((colorToProduce as string) === 'ANY') colorToProduce = 'C';
                producedMana[colorToProduce as keyof ManaPoolRecord] += amount;
                localPool[colorToProduce as keyof ManaPoolRecord] += amount;
            } else {
                Object.entries(produce.colored).forEach(([c, amt]) => {
                    let color = (c as string) === 'ANY' ? (desiredColor || 'C') : c;
                    if ((color as string) === 'ANY') color = 'C';
                    producedMana[color as keyof ManaPoolRecord] += (amt as number) * amount;
                    localPool[color as keyof ManaPoolRecord] += (amt as number) * amount;
                });
                producedMana.C += produce.generic * amount;
                localPool.C += produce.generic * amount;
            }
        } else {
            // Fallback for simple/intrinsic abilities
            const colors = Array.from(yieldInfo.colors);
            const rawColor = source.cIdx !== undefined ? yieldInfo.choiceColors[source.cIdx] : colors[0];
            let color = (rawColor as string) === 'ANY' ? (desiredColor || 'C') : rawColor;
            if (!color || (color as string) === 'ANY') color = 'C';
            producedMana[color as keyof ManaPoolRecord]++;
            localPool[color as keyof ManaPoolRecord]++;
        }
    }

    // --- SHARED UTILS ---

    private static getAvailableManaSources(state: GameState, playerId: string, alreadyTapped: string[], excludeId?: string): ManaSourceCandidate[] {
        const sources: ManaSourceCandidate[] = [];
        const { layer: LayerProcessor } = getProcessors(state);

        state.battlefield.forEach((obj: GameObject) => {
            if (obj.controllerId !== playerId || alreadyTapped.includes(obj.id) || obj.id === excludeId) return;
            
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            const abilities = (stats.abilities || []) as (AbilityDefinition | string)[];

            const manaAbilities = abilities.filter((a): a is AbilityDefinition => {
                if (typeof a === 'string') return false;
                return a.isManaAbility || !!a.effects?.some(e => e.type === EffectType.AddMana);
            });

            if (manaAbilities.length === 0) return;

            const allPossibleColors = new Set<ManaColor>();
            const validManaAbilities: { ability: AbilityDefinition, originalIndex: number }[] = [];

            manaAbilities.forEach((a) => {
                const originalIndex = abilities.indexOf(a);
                if ((a.costs || []).some(c => c.type === CostType.Tap) && obj.isTapped) return;

                const yieldInfo = this.getProduceableColors(a);
                yieldInfo.colors.forEach((c: ManaColor) => allPossibleColors.add(c));
                yieldInfo.choiceColors.forEach((c: string) => allPossibleColors.add(c as ManaColor));
                validManaAbilities.push({ ability: a, originalIndex });
            });

            if (validManaAbilities.length === 0) return;

            sources.push({
                obj,
                abilities: validManaAbilities as any,
                allPossibleColors,
                allPossibleColorsArray: Array.from(allPossibleColors),
                choiceColors: Array.from(new Set(validManaAbilities.flatMap((a) => this.getProduceableColors(a.ability).choiceColors)))
            });
        });

        return sources;
    }

    private static getProduceableColors(ability: any): ManaProductionYield {
        const colors = new Set<ManaColor>();
        let hasChoice = false;
        const choiceColors: string[] = [];
        const restrictions: string[] = [];

        if (!ability) return { colors, hasChoice, choiceColors, restrictions };

        const extract = (effects: any[]) => {
            if (!effects) return;
            effects.forEach((e: any) => {
                if (e.type === EffectType.AddMana) {
                    const val = (e.manaType || '{C}').toString();
                    const reqs = ManaParser.parseManaCost(val);
                    Object.keys(reqs.colored).forEach((c: string) => {
                        if (c === 'ANY') {
                            colors.add('ANY' as ManaColor);
                            hasChoice = true;
                            choiceColors.push('W', 'U', 'B', 'R', 'G');
                            return;
                        }
                        c.split('/').forEach((part: string) => {
                            if (['W', 'U', 'B', 'R', 'G', 'C'].includes(part)) colors.add(part as ManaColor);
                        });
                    });
                    if (reqs.generic > 0) colors.add('C' as ManaColor);

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
                            if (se.type === EffectType.AddMana) {
                                const val = (se.manaType || '{C}').toString();
                                const reqs = ManaParser.parseManaCost(val);
                                Object.keys(reqs.colored).forEach(c => {
                                    if (c === 'ANY') { choiceColors.push('ANY'); return; }
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
