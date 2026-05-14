import { AbilityDefinition, ContinuousEffect, CostType, GameObject, GameState, PlayerState, Restriction, TargetRestriction, EffectType, EffectDefinition, AddManaEffect, SpecializedEffect } from '@shared/engine_types';
import { RuleUtils } from '../../../utils/RuleUtils';
import { ManaParser } from './ManaParser';
import { ManaPoolManager } from './ManaPoolManager';
import { getProcessors } from '../../ProcessorRegistry';

export class ManaValidator {

  public static canPayManaCost(player: PlayerState, costStr: string, state?: GameState, payingFor?: GameObject): boolean {
    if (!costStr || player.manaCheat) return true;

    // Support for Chromatic Orrery / Spend as Any Color
    const canSpendAsAnyColor = state?.ruleRegistry.continuousEffects.some((e: ContinuousEffect) =>
      (e.type === 'AllowSpendManaAsAnyColor' || e.spendAnyMana) &&
      e.controllerId === player.id &&
      (!e.targetIds || !payingFor || e.targetIds.includes(payingFor.id))
    );
    const pool = ManaPoolManager.getUsableMana(player, payingFor);

    if (canSpendAsAnyColor) {
      const totalFloating = Object.values(pool).reduce((a, b) => a + (b as number), 0);
      const totalRequired = ManaParser.getManaValue(costStr);
      return totalFloating >= totalRequired;
    }

    const requirements = ManaParser.parseManaCost(costStr);
    let extraGenericFromHybrids = 0;

    // Check colored mana first (including hybrids)
    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
        const options = symbol.split('/');
        let left = amount;

        // 1. Try to pay with colors first
        for (const opt of options) {
          if (opt === 'P' || !isNaN(parseInt(opt))) continue;
          const available = pool[opt as keyof typeof pool] || 0;
          const take = Math.min(left, available);
          (pool as any)[opt] -= take;
          left -= take;
        }

        // 2. If any left, and it's a monocolored hybrid (e.g., 2/R), it adds to generic requirement
        if (left > 0) {
          const numericOpt = options.find(opt => !isNaN(parseInt(opt)));
          if (numericOpt) {
            extraGenericFromHybrids += (left * parseInt(numericOpt));
          } else {
            // It's a standard hybrid (e.g., G/W) but we ran out of both options
            return false;
          }
        }
      } else {
        if ((pool[symbol as keyof typeof pool] || 0) < amount) return false;
        (pool as any)[symbol] -= amount;
      }
    }

    const totalFloating = Object.values(pool).reduce((a, b) => a + (b as number), 0);
    const totalRequired = requirements.generic + extraGenericFromHybrids;

    return totalFloating >= totalRequired;
  }

  /**
   * Complex check: Can the player pay this cost using floating mana AND untapped sources?
   */
  public static canPayWithTotal(state: GameState, player: PlayerState, battlefield: GameObject[], costStr: string, payingFor?: GameObject, excludePayingFor = false): boolean {
    if (!costStr || player.manaCheat) return true;
    const requirements = ManaParser.parseManaCost(costStr);

    // 1. Prepare available sources
    const pool = { ...ManaPoolManager.getUsableMana(player, payingFor) };
    const untappedSources: { id: string, colors: string[], value: number }[] = [];

    const { layer: LayerProcessor } = getProcessors(state);

    battlefield.forEach((obj: GameObject) => {
      if (obj.controllerId === player.id && (!excludePayingFor || obj.id !== payingFor?.id)) {
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        const abilities = (stats.abilities || []) as (AbilityDefinition | string)[];

        // Find ALL mana-producing abilities (explicitly marked or having AddMana effect)
        const manaAbilities = abilities.filter((a): a is AbilityDefinition => {
          if (typeof a === 'string') return false;
          if (a.isManaAbility) return true;
          return !!a.effects?.some(e => e.type === EffectType.AddMana);
        });

        if (manaAbilities.length === 0) return;

        const sourceAbilities: { colors: string[], value: number, isTappedReq: boolean }[] = [];

        manaAbilities.forEach((a) => {
          // CHECK ACTIVATION COSTS
          const costs = a.costs || [];
          const requiresTap = costs.some(c => c.type === CostType.Tap);
          if (requiresTap && obj.isTapped) return;

          // Deduct mana cost from produced value
          const manaCost = costs.find(c => c.type === CostType.Mana);
          const activationCostValue = manaCost && typeof manaCost.value === 'string' ? ManaParser.getManaValue(manaCost.value) : 0;

          const colors = new Set<string>();
          const restrictions: TargetRestriction[] = [];

          const extract = (effects: EffectDefinition[]) => {
            if (!effects) return;
            effects.forEach((e) => {
              if (e.type === EffectType.AddMana) {
                const addMana = e as AddManaEffect;
                const manaType = addMana.manaType || '{C}';
                const res = ManaParser.parseManaCost(manaType.toString());
                Object.keys(res.colored).forEach(c => colors.add(c));
                if (res.generic > 0) colors.add('C');

                const rawR = addMana.manaRestrictions;
                if (rawR) {
                  if (Array.isArray(rawR)) restrictions.push(...(rawR as any));
                  else restrictions.push(rawR as any);
                }
              }
              if ('choices' in e && (e as any).choices) (e as any).choices.forEach((c: any) => extract(c.effects || []));
              if ('effects' in e && (e as any).effects) extract((e as any).effects);
            });
          };
          extract(a.effects || []);

          const isLegalForSource = (restrs: TargetRestriction[]) => {
            if (!restrs || restrs.length === 0) return true;
            if (!payingFor) return false;
            return restrs.every(r => {
              if (r === Restriction.InstantOrSorcery) return RuleUtils.isType(payingFor, 'instant') || RuleUtils.isType(payingFor, 'sorcery');
              if (typeof r !== 'string') return false;
              return RuleUtils.isType(payingFor, r) || RuleUtils.hasSubtype(payingFor, r);
            });
          };

          if (isLegalForSource(restrictions)) {
            let producedVal = 0;
            if (a.effects) {
              a.effects.forEach((e) => {
                if (e.type === EffectType.AddMana || e.type === EffectType.AdNauseam || e.type === EffectType.ChaosWarp) {
                  const v = (e as any).manaType || (e as any).value || '{C}';
                  const amountProp = e.amount || 1;
                  const resolvedAmount = RuleUtils.resolveAmount(state, amountProp, {
                    sourceId: obj.id,
                    controllerId: player.id,
                    effects: [],
                    targets: []
                  });
                  producedVal += (ManaParser.getManaValue(String(v)) * resolvedAmount);
                }
              });
            }
            const netValue = producedVal - activationCostValue;
            if (netValue > 0) {
              sourceAbilities.push({ colors: Array.from(colors), value: netValue, isTappedReq: requiresTap });
            }
          }
        });

        if (sourceAbilities.length > 0) {
          // Pick best ability for this object
          const bestAbility = sourceAbilities.sort((a, b) => b.value - a.value)[0];
          untappedSources.push({ id: obj.id, colors: bestAbility.colors, value: bestAbility.value });
        }
      }
    });

    // 2. Greedy validation for colored costs
    const coloredReqs: string[] = [];
    Object.entries(requirements.colored).forEach(([symbol, amount]) => {
      for (let i = 0; i < (amount as number); i++) coloredReqs.push(symbol);
    });

    const usedSources = new Map<string, number>(); // id -> value used
    for (const req of coloredReqs) {
      let satisfied = false;

      // a. Try pool first
      if (req.includes('/')) {
        const options = req.split('/');
        const colorOpt = options.find(opt => isNaN(parseInt(opt)) && (pool as Record<string, number>)[opt] > 0);
        if (colorOpt) {
          (pool as Record<string, number>)[colorOpt]--;
          satisfied = true;
        } else {
          const numericOpt = options.find(opt => !isNaN(parseInt(opt)));
          if (numericOpt) {
            requirements.generic += parseInt(numericOpt);
            satisfied = true;
          }
        }
      } else if ((pool as Record<string, number>)[req] > 0) {
        (pool as Record<string, number>)[req]--;
        satisfied = true;
      }

      if (satisfied) continue;

      // b. Try sources
      const options = req.includes('/') ? req.split('/') : [req];
      const colorOptions = options.filter(opt => isNaN(parseInt(opt)));
      const numericOpt = options.find(opt => !isNaN(parseInt(opt)));

      const possibleSources = untappedSources
        .filter(l => {
          const used = usedSources.get(l.id) || 0;
          const remaining = l.value - used;
          if (remaining <= 0) return false;
          return l.colors.includes('ANY') || l.colors.some((c: string) => colorOptions.includes(c));
        })
        .sort((a, b) => a.colors.length - b.colors.length);

      if (possibleSources.length > 0) {
        const source = possibleSources[0];
        const alreadyUsed = usedSources.get(source.id) || 0;
        usedSources.set(source.id, alreadyUsed + 1);
      } else if (numericOpt) {
        requirements.generic += parseInt(numericOpt);
      } else {
        return false;
      }
    }

    // 3. Final generic check
    const remainingPool = Object.values(pool).reduce((a, b) => a + (b as number), 0);
    const untranslatedSourcesValue = untappedSources
      .filter(s => !usedSources.has(s.id))
      .reduce((sum, s) => sum + s.value, 0);

    // Add leftover value from sources that were partially used for colored mana
    const partialSourcesValue = untappedSources
      .filter(s => usedSources.has(s.id))
      .reduce((sum, s) => sum + Math.max(0, s.value - usedSources.get(s.id)!), 0);

    return (remainingPool + untranslatedSourcesValue + partialSourcesValue) >= requirements.generic;
  }
}
