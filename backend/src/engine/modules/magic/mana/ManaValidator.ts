import { AbilityDefinition, ContinuousEffect, GameObject, GameState, PlayerState, Restriction, TargetRestriction, EffectType, EffectDefinition, AddManaEffect, SpecializedEffect } from '@shared/engine_types';
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
      if (obj.controllerId === player.id && !obj.isTapped && (!excludePayingFor || obj.id !== payingFor?.id)) {
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        const abilities = (stats.abilities || []) as (AbilityDefinition | string)[];
        const manaAbilities = abilities.filter((a): a is AbilityDefinition => typeof a !== 'string' && !!a.isManaAbility);
        if (manaAbilities.length === 0) return;

        const isLegalForSource = (restrictions: TargetRestriction[]) => {
          if (!restrictions || restrictions.length === 0) return true;
          if (!payingFor) return false;

          return restrictions.every(r => {
            if (r === Restriction.InstantOrSorcery) {
              return RuleUtils.isType(payingFor, 'instant') || RuleUtils.isType(payingFor, 'sorcery');
            }
            if (typeof r !== 'string') return false;
            // Check both types and subtypes
            return RuleUtils.isType(payingFor, r) || RuleUtils.hasSubtype(payingFor, r);
          });
        };

        const sourceAbilities: { colors: string[], value: number }[] = [];
        manaAbilities.forEach((a) => {
          const colors = new Set<string>();
          const restrictions: TargetRestriction[] = [];

          const extract = (effects: EffectDefinition[]) => {
            if (!effects) return;
            effects.forEach((e) => {
              if (e.type === EffectType.AddMana) {
                const addMana = e as AddManaEffect;
                const val = addMana.manaType || '{C}';
                const res = ManaParser.parseManaCost(val.toString());
                Object.keys(res.colored).forEach(c => colors.add(c));
                if (res.generic > 0) colors.add('C');

                const rawR = addMana.manaRestrictions || addMana.costs; // Simplified for validator
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

          if (isLegalForSource(restrictions)) {
            let val = 0;
            if (a.effects) {
              a.effects.forEach((e) => {
                let v: any = '{C}';
                if (e.type === EffectType.AddMana) {
                  v = (e as AddManaEffect).manaType || '{C}';
                } else if (e.type === EffectType.AdNauseam || e.type === EffectType.ChaosWarp) {
                  v = (e as SpecializedEffect).value || '{C}';
                }
                const amount = typeof e.amount === 'number' ? e.amount : 1;
                val = Math.max(val, ManaParser.getManaValue(String(v)) * amount);
              });
            }
            sourceAbilities.push({ colors: Array.from(colors), value: val });
          }
        });

        if (sourceAbilities.length > 0) {
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
      // a. Try pool first
      if (req.includes('/')) {
        const options = req.split('/');
        const colorOpt = options.find(opt => isNaN(parseInt(opt)) && (pool as Record<string, number>)[opt] > 0);
        if (colorOpt) {
          (pool as Record<string, number>)[colorOpt]--;
          continue;
        }

        // If it's a monocolored hybrid and we can't pay color, it adds to generic requirements
        const numericOpt = options.find(opt => !isNaN(parseInt(opt)));
        if (numericOpt) {
          requirements.generic += parseInt(numericOpt);
          continue;
        }
      } else if ((pool as Record<string, number>)[req] > 0) {
        (pool as Record<string, number>)[req]--;
        continue;
      }

      // b. Try sources
      const options = req.includes('/') ? req.split('/') : [req];
      const colorOptions = options.filter(opt => isNaN(parseInt(opt)));
      const numericOpt = options.find(opt => !isNaN(parseInt(opt)));

      const possibleSources = untappedSources
        .filter(l => !usedSources.has(l.id) && l.colors.some((c: string) => colorOptions.includes(c)))
        .sort((a, b) => a.colors.length - b.colors.length);

      if (possibleSources.length > 0) {
        const source = possibleSources[0];
        usedSources.set(source.id, 1); // Mark 1 mana used from this source
      } else if (numericOpt) {
        // Treat as generic debt
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
