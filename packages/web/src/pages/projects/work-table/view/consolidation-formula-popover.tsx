import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { FrozenColDef } from "@/lib/work-table/frozen";
import type { FrozenData, GridRow } from "@/lib/work-table/types";
import type { PeriodInfo, Quote } from "@/api/types";
import { formatCurrency, formatDays } from "@/lib/format";

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDays(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "0j";
  return `${formatDays(n)}j`;
}

function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return formatCurrency(n);
}

function makeDateFmt(language: string): Intl.DateTimeFormat {
  const locale = language.startsWith("fr") ? "fr-FR" : "en-GB";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" });
}

function fmtDate(iso: string, dateFmt: Intl.DateTimeFormat): string {
  return dateFmt.format(new Date(iso));
}

function fmtDateRange(
  start: string,
  end: string,
  dateFmt: Intl.DateTimeFormat,
): string {
  return `${fmtDate(start, dateFmt)} → ${fmtDate(end, dateFmt)}`;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface Factor {
  label: string;
  value: string;
  hint?: string;
}

interface BreakdownLine {
  label: string;
  expr: string;
  hint?: string;
}

type CellSource = "actual" | "planned" | "mixed";

interface CellContribution {
  periodKey: string;
  label: string;
  dateRange: string;
  days: number;
  source: CellSource;
}

interface FormulaContent {
  title: string;
  /** When set: rendered as a big monospace title that replaces both the small title and the formula block. */
  headline?: string;
  /** Symbolic equation, e.g. `Jours vendus × Taux vente/j` */
  symbolic: string;
  /** Same equation with values plugged in, e.g. `7j × 600 €/j`. Omit when result + cellSources are enough. */
  withValues?: string;
  result: string;
  description?: string;
  factors?: Factor[];
  breakdown?: { heading: string; lines: BreakdownLine[]; total?: string };
  /** Cell-level provenance: which periodKeys contributed, dates, declared vs planned. */
  cellSources?: { heading: string; rows: CellContribution[]; total: string };
}

// ── Cell-source helpers ────────────────────────────────────────────────────

function buildCellContributions(
  row: GridRow,
  periodsByKey: Map<string, PeriodInfo>,
  statusFilter: (s: PeriodInfo["status"]) => boolean,
  dateFmt: Intl.DateTimeFormat,
): CellContribution[] {
  const out: CellContribution[] = [];
  for (const [periodKey, days] of Object.entries(row.cells)) {
    if (days === 0) continue;
    const info = periodsByKey.get(periodKey);
    if (!info) continue;
    if (!statusFilter(info.status)) continue;
    const isActual = row.actualPeriods?.has(periodKey) ?? false;
    out.push({
      periodKey,
      label: info.label,
      dateRange: fmtDateRange(info.startDate, info.endDate, dateFmt),
      days,
      source: isActual ? "actual" : "planned",
    });
  }
  out.sort((a, b) => a.periodKey.localeCompare(b.periodKey));
  return out;
}

function aggregateChildContributions(
  row: GridRow,
  rows: GridRow[],
  periodsByKey: Map<string, PeriodInfo>,
  statusFilter: (s: PeriodInfo["status"]) => boolean,
  dateFmt: Intl.DateTimeFormat,
): CellContribution[] {
  // Recursively collect employee rows under this row
  const empRows: GridRow[] = [];
  function collect(r: GridRow) {
    if (r.kind === "employee") {
      empRows.push(r);
      return;
    }
    for (const child of rows) {
      if (child === r) continue;
      if (
        r.kind === "profile" &&
        child.kind === "employee" &&
        child.phaseId === r.phaseId &&
        child.taskId === r.taskId &&
        child.profileId === r.profileId
      )
        collect(child);
      else if (
        r.kind === "task" &&
        child.kind === "profile" &&
        child.phaseId === r.phaseId &&
        child.taskId === r.taskId
      )
        collect(child);
      else if (
        r.kind === "phase" &&
        child.kind === "task" &&
        child.phaseId === r.phaseId
      )
        collect(child);
      else if (r.kind === "grand-total" && child.kind === "phase")
        collect(child);
    }
  }
  collect(row);

  const merged = new Map<string, { actualDays: number; plannedDays: number }>();
  for (const e of empRows) {
    for (const [periodKey, days] of Object.entries(e.cells)) {
      if (days === 0) continue;
      const info = periodsByKey.get(periodKey);
      if (!info || !statusFilter(info.status)) continue;
      const cur = merged.get(periodKey) ?? { actualDays: 0, plannedDays: 0 };
      if (e.actualPeriods?.has(periodKey)) cur.actualDays += days;
      else cur.plannedDays += days;
      merged.set(periodKey, cur);
    }
  }

  const out: CellContribution[] = [];
  for (const [periodKey, { actualDays, plannedDays }] of merged) {
    const info = periodsByKey.get(periodKey)!;
    const days = actualDays + plannedDays;
    let source: CellSource = "planned";
    if (actualDays > 0 && plannedDays === 0) source = "actual";
    else if (actualDays > 0 && plannedDays > 0) source = "mixed";
    out.push({
      periodKey,
      label: info.label,
      dateRange: fmtDateRange(info.startDate, info.endDate, dateFmt),
      days,
      source,
    });
  }
  out.sort((a, b) => a.periodKey.localeCompare(b.periodKey));
  return out;
}

function buildSourceSection(
  heading: string,
  row: GridRow,
  rows: GridRow[],
  periodsByKey: Map<string, PeriodInfo>,
  statusFilter: (s: PeriodInfo["status"]) => boolean,
  dateFmt: Intl.DateTimeFormat,
): FormulaContent["cellSources"] | undefined {
  const contributions =
    row.kind === "employee"
      ? buildCellContributions(row, periodsByKey, statusFilter, dateFmt)
      : aggregateChildContributions(
          row,
          rows,
          periodsByKey,
          statusFilter,
          dateFmt,
        );
  if (contributions.length === 0) return undefined;
  const total = contributions.reduce((s, c) => s + c.days, 0);
  return { heading, rows: contributions, total: fmtDays(total) };
}

function quoteLinesForRow(row: GridRow, quotes: Quote[]) {
  if (!row.taskId || !row.profileId) return [];
  const matches: Array<{
    quoteId: string;
    title: string;
    days: number;
    sellRatePerDay: number;
    revenue: number;
    effectiveAt: string | null;
  }> = [];
  for (const quote of quotes) {
    if (quote.status !== "VALIDATED") continue;
    for (const line of quote.lines) {
      if (line.taskId === row.taskId && line.profileId === row.profileId) {
        matches.push({
          quoteId: quote.id,
          title: quote.title,
          days: line.days,
          sellRatePerDay: line.sellRatePerDay,
          revenue: line.revenueAmount,
          effectiveAt: quote.effectiveAt,
        });
      }
    }
  }
  return matches;
}

function getChildren(row: GridRow, rows: GridRow[]): GridRow[] {
  switch (row.kind) {
    case "profile":
      return rows.filter(
        (r) =>
          r.kind === "employee" &&
          r.phaseId === row.phaseId &&
          r.taskId === row.taskId &&
          r.profileId === row.profileId,
      );
    case "task":
      return rows.filter(
        (r) =>
          r.kind === "profile" &&
          r.phaseId === row.phaseId &&
          r.taskId === row.taskId,
      );
    case "phase":
      return rows.filter((r) => r.kind === "task" && r.phaseId === row.phaseId);
    case "grand-total":
      return rows.filter((r) => r.kind === "phase");
    default:
      return [];
  }
}

// ── Content builder ────────────────────────────────────────────────────────

interface BuildArgs {
  col: FrozenColDef;
  row: GridRow;
  fd: FrozenData;
  rows: GridRow[];
  frozenData: Map<string, FrozenData>;
  prevRaf: number | undefined;
  prevSnapshotMonthCode: string | null;
  periodsByKey: Map<string, PeriodInfo>;
  quotes: Quote[];
  t: TFunction;
  dateFmt: Intl.DateTimeFormat;
}

type RowKind = GridRow["kind"];

/**
 * Per-column headline key map: column.key → { rowKind → i18n key under
 * "workTable.formulaPopover.headline.<name>" }.
 *
 * Keep entries minimal — omit rowKinds where no headline applies, and the
 * popover falls back to the legacy `title` field for those rows.
 */
const COLUMN_HEADLINES: Partial<Record<string, Partial<Record<RowKind, string>>>> = {
  tc_spent: {
    employee: "headline.spentByEmployee",
    profile: "headline.spentOn",
    task: "headline.spentOn",
    phase: "headline.spentOn",
    "grand-total": "headline.spentTotal",
  },
  tc_rem: {
    employee: "headline.plannedByEmployee",
    profile: "headline.plannedOn",
    task: "headline.plannedOn",
    phase: "headline.plannedOn",
    "grand-total": "headline.plannedTotal",
  },
  tc_total: {
    employee: "headline.totalEmployee",
    profile: "headline.totalProfile",
    task: "headline.totalTask",
    phase: "headline.totalPhase",
    "grand-total": "headline.totalGrand",
  },
  tc_amount: {
    employee: "headline.costTotalEmployee",
    profile: "headline.costTotalProfile",
    task: "headline.costTotalTask",
    phase: "headline.costTotalPhase",
    "grand-total": "headline.costTotalGrand",
  },
  tr_sold: {
    profile: "headline.soldProfile",
    task: "headline.soldTask",
    phase: "headline.soldPhase",
    "grand-total": "headline.soldGrand",
  },
  tr_rate: {
    profile: "headline.rateProfile",
    task: "headline.rateTask",
    phase: "headline.ratePhase",
    "grand-total": "headline.rateGrand",
  },
  tr_amount: {
    profile: "headline.revenueProfile",
    task: "headline.revenueTask",
    phase: "headline.revenuePhase",
    "grand-total": "headline.revenueGrand",
  },
  tr_margin: {
    profile: "headline.marginProfile",
    task: "headline.marginTask",
    phase: "headline.marginPhase",
    "grand-total": "headline.marginGrand",
  },
  pc_spent: {
    employee: "headline.pcSpentEmployee",
    profile: "headline.pcSpentProfile",
    task: "headline.pcSpentTask",
    phase: "headline.pcSpentPhase",
    "grand-total": "headline.pcSpentGrand",
  },
  pc_cost: {
    employee: "headline.pcCostEmployee",
    profile: "headline.pcCostProfile",
    task: "headline.pcCostTask",
    phase: "headline.pcCostPhase",
    "grand-total": "headline.pcCostGrand",
  },
  pc_amount: {
    employee: "headline.pcAmountEmployee",
    profile: "headline.pcAmountProfile",
    task: "headline.pcAmountTask",
    phase: "headline.pcAmountPhase",
    "grand-total": "headline.pcAmountGrand",
  },
  pr_produced: {
    employee: "headline.prProducedEmployee",
    profile: "headline.prProducedProfile",
    task: "headline.prProducedTask",
    phase: "headline.prProducedPhase",
    "grand-total": "headline.prProducedGrand",
  },
  pr_amount: {
    employee: "headline.prAmountEmployee",
    profile: "headline.prAmountProfile",
    task: "headline.prAmountTask",
    phase: "headline.prAmountPhase",
    "grand-total": "headline.prAmountGrand",
  },
  pr_margin: {
    profile: "headline.prMarginProfile",
    task: "headline.prMarginTask",
    phase: "headline.prMarginPhase",
    "grand-total": "headline.prMarginGrand",
  },
};

function pickHeadline(
  colKey: string,
  row: GridRow,
  tp: (k: string, opts?: Record<string, unknown>) => string,
  extras: Record<string, unknown> = {},
): string | undefined {
  const key = COLUMN_HEADLINES[colKey]?.[row.kind];
  if (!key) return undefined;
  return tp(key, { name: row.label, ...extras });
}

function currentOpenWeek(periodsByKey: Map<string, PeriodInfo>): string {
  const open = [...periodsByKey.values()].find((p) => p.status === "OPEN");
  return open?.weekCode?.match(/W(\d+)/)?.[1] ?? "";
}

function buildFormulaContent(args: BuildArgs): FormulaContent | null {
  const {
    col,
    row,
    fd,
    rows,
    frozenData,
    prevRaf,
    prevSnapshotMonthCode,
    periodsByKey,
    quotes,
    t,
    dateFmt,
  } = args;
  const tp = (k: string, opts?: Record<string, unknown>) =>
    t(`workTable.formulaPopover.${k}`, opts ?? {}) as string;
  const children = getChildren(row, rows);
  const childLevelKey =
    row.kind === "profile"
      ? "employee"
      : row.kind === "task"
        ? "profile"
        : row.kind === "phase"
          ? "task"
          : row.kind === "grand-total"
            ? "phase"
            : null;
  const childLevelLabel = childLevelKey ? tp(`levels.${childLevelKey}`) : null;
  const detailHeading = childLevelLabel
    ? tp("detailBy", { level: childLevelLabel })
    : null;
  const childrenSum = tp("childrenSum", { count: children.length });

  const isFrozenOrConsolidation = (s: PeriodInfo["status"]) =>
    s === "FROZEN" || s === "CONSOLIDATION";
  const isOpenOrFuture = (s: PeriodInfo["status"]) =>
    s === "OPEN" || s === "FUTURE";
  const isConsolidation = (s: PeriodInfo["status"]) => s === "CONSOLIDATION";

  const quoteHint = (l: {
    effectiveAt: string | null;
    quoteId: string;
  }): string =>
    l.effectiveAt
      ? tp("hints.effective", { date: fmtDate(l.effectiveAt, dateFmt) })
      : tp("hints.quoteShort", { id: l.quoteId.slice(0, 8) });

  switch (col.key) {
    case "tc_spent": {
      const weekNum = currentOpenWeek(periodsByKey);
      const headline = pickHeadline(col.key, row, tp, { week: weekNum });
      const usePeriodSources =
        row.kind === "employee" || row.kind === "profile";
      const aggregateHeading = childLevelLabel
        ? tp("aggregateBy", { level: childLevelLabel })
        : null;
      return {
        title: tp("titles.tc_spent"),
        headline,
        symbolic: tp("symbolic.tc_spent"),
        result: fmtDays(fd.tcDaysSpent),
        breakdown:
          !usePeriodSources && aggregateHeading
            ? {
                heading: aggregateHeading,
                lines: children.map((c) => ({
                  label: c.label,
                  expr: fmtDays(frozenData.get(c.id)?.tcDaysSpent ?? 0),
                })),
                total: fmtDays(fd.tcDaysSpent),
              }
            : undefined,
        cellSources: usePeriodSources
          ? buildSourceSection(
              tp("sources.frozen"),
              row,
              rows,
              periodsByKey,
              isFrozenOrConsolidation,
              dateFmt,
            )
          : undefined,
      };
    }

    case "tc_rem": {
      const weekNum = currentOpenWeek(periodsByKey);
      const headline = pickHeadline(col.key, row, tp, { week: weekNum });
      const usePeriodSources =
        row.kind === "employee" || row.kind === "profile";
      const aggregateHeading = childLevelLabel
        ? tp("aggregateBy", { level: childLevelLabel })
        : null;
      return {
        title: tp("titles.tc_rem"),
        headline,
        symbolic: tp("symbolic.tc_rem"),
        result: fmtDays(fd.tcDaysRemaining),
        breakdown:
          !usePeriodSources && aggregateHeading
            ? {
                heading: aggregateHeading,
                lines: children.map((c) => ({
                  label: c.label,
                  expr: fmtDays(frozenData.get(c.id)?.tcDaysRemaining ?? 0),
                })),
                total: fmtDays(fd.tcDaysRemaining),
              }
            : undefined,
        cellSources: usePeriodSources
          ? buildSourceSection(
              tp("sources.planning"),
              row,
              rows,
              periodsByKey,
              isOpenOrFuture,
              dateFmt,
            )
          : undefined,
      };
    }

    case "tc_total": {
      return {
        title: tp("titles.tc_total"),
        headline: pickHeadline(col.key, row, tp),
        symbolic: tp("symbolic.tc_total"),
        withValues: `${fmtDays(fd.tcDaysSpent)} + ${fmtDays(fd.tcDaysRemaining)}`,
        result: fmtDays(fd.tcTotalDays),
      };
    }

    case "tc_amount": {
      const headline = pickHeadline(col.key, row, tp);
      if (row.kind === "employee") {
        return {
          title: tp("titles.tc_amount"),
          headline,
          symbolic: tp("symbolic.tc_amount_employee"),
          withValues: `${fmtDays(fd.tcTotalDays)} × ${fmtMoney(row.forecastCostRate)}`,
          result: fmtMoney(fd.tcAmount),
          factors: [
            {
              label: tp("factors.costRate"),
              value: fmtMoney(row.forecastCostRate),
              hint: row.employeeId
                ? tp("hints.costRateEmployee")
                : tp("hints.costRateProfile"),
            },
          ],
        };
      }
      return {
        title: tp("titles.tc_amount"),
        headline,
        symbolic: tp("symbolic.tc_amount_aggregate"),
        withValues: childrenSum,
        result: fmtMoney(fd.tcAmount),
        breakdown: detailHeading
          ? {
              heading: detailHeading,
              lines: children.map((c) => {
                const cd = frozenData.get(c.id);
                const days = cd?.tcTotalDays ?? 0;
                const amount = cd?.tcAmount ?? 0;
                const rate = days > 0 ? amount / days : 0;
                return {
                  label: c.label,
                  expr:
                    days > 0
                      ? `${fmtDays(days)} × ${fmtMoney(rate)} = ${fmtMoney(amount)}`
                      : fmtMoney(amount),
                };
              }),
              total: fmtMoney(fd.tcAmount),
            }
          : undefined,
      };
    }

    case "tr_sold": {
      const headline = pickHeadline(col.key, row, tp);
      const ql = quoteLinesForRow(row, quotes);
      if (ql.length > 0) {
        return {
          title: tp("titles.tr_sold"),
          headline,
          symbolic: tp("symbolic.tr_sold_quotes"),
          withValues: ql.map((l) => fmtDays(l.days)).join(" + "),
          result: fmtDays(fd.trDaysSold),
          breakdown: {
            heading: tp("sources.quoteLines"),
            lines: ql.map((l) => ({
              label: l.title,
              expr: fmtDays(l.days),
              hint: quoteHint(l),
            })),
            total: fmtDays(fd.trDaysSold),
          },
        };
      }
      return {
        title: tp("titles.tr_sold"),
        headline,
        symbolic: tp("symbolic.tr_sold_aggregate"),
        withValues: childrenSum,
        result: fmtDays(fd.trDaysSold),
        breakdown: detailHeading
          ? {
              heading: detailHeading,
              lines: children.map((c) => ({
                label: c.label,
                expr: fmtDays(frozenData.get(c.id)?.trDaysSold ?? 0),
              })),
              total: fmtDays(fd.trDaysSold),
            }
          : undefined,
      };
    }

    case "tr_rate": {
      const headline = pickHeadline(col.key, row, tp);
      const ql = quoteLinesForRow(row, quotes);
      if (ql.length > 0) {
        return {
          title: tp("titles.tr_rate"),
          headline,
          symbolic: tp("symbolic.tr_rate_quotes"),
          withValues: fmtMoney(row.forecastSellRate),
          result: fmtMoney(fd.trDailyRate),
          breakdown: {
            heading: tp("sources.quoteLines"),
            lines: ql.map((l) => ({
              label: l.title,
              expr: `${fmtDays(l.days)} @ ${fmtMoney(l.sellRatePerDay)}`,
              hint: quoteHint(l),
            })),
          },
        };
      }
      return {
        title: tp("titles.tr_rate"),
        headline,
        symbolic: tp("symbolic.tr_rate_aggregate"),
        withValues: "—",
        result: fmtMoney(fd.trDailyRate),
      };
    }

    case "tr_amount": {
      const headline = pickHeadline(col.key, row, tp);
      if (row.kind === "profile") {
        const ql = quoteLinesForRow(row, quotes);
        return {
          title: tp("titles.tr_amount"),
          headline,
          symbolic: tp("symbolic.tr_amount_profile"),
          withValues: `${fmtDays(fd.trDaysSold)} × ${fmtMoney(fd.trDailyRate)}`,
          result: fmtMoney(fd.trAmount),
          breakdown:
            ql.length > 0
              ? {
                  heading: tp("sources.quoteLines"),
                  lines: ql.map((l) => ({
                    label: l.title,
                    expr: `${fmtDays(l.days)} × ${fmtMoney(l.sellRatePerDay)} = ${fmtMoney(l.revenue)}`,
                    hint: l.effectiveAt
                      ? tp("hints.effective", {
                          date: fmtDate(l.effectiveAt, dateFmt),
                        })
                      : undefined,
                  })),
                  total: fmtMoney(fd.trAmount),
                }
              : undefined,
        };
      }
      return {
        title: tp("titles.tr_amount"),
        headline,
        symbolic: tp("symbolic.tr_amount_aggregate"),
        withValues: childrenSum,
        result: fmtMoney(fd.trAmount),
        breakdown: detailHeading
          ? {
              heading: detailHeading,
              lines: children.map((c) => ({
                label: c.label,
                expr: fmtMoney(frozenData.get(c.id)?.trAmount ?? 0),
              })),
              total: fmtMoney(fd.trAmount),
            }
          : undefined,
      };
    }

    case "tr_margin":
      return {
        title: tp("titles.tr_margin"),
        headline: pickHeadline(col.key, row, tp),
        symbolic: tp("symbolic.tr_margin"),
        withValues: `${fmtMoney(fd.trAmount)} − ${fmtMoney(fd.tcAmount)}`,
        result: fmtMoney(fd.trMargin),
        factors:
          fd.trMarginPct != null
            ? [
                {
                  label: tp("factors.marginPct"),
                  value: `${fd.trMarginPct.toFixed(1)}%`,
                  hint: tp("hints.marginPctFormula"),
                },
              ]
            : undefined,
      };

    case "pc_spent":
      return {
        title: tp("titles.pc_spent"),
        headline: pickHeadline(col.key, row, tp),
        symbolic: tp("symbolic.pc_spent"),
        withValues: fmtDays(fd.pcDaysSpent),
        result: fmtDays(fd.pcDaysSpent),
        breakdown: detailHeading
          ? {
              heading: detailHeading,
              lines: children.map((c) => ({
                label: c.label,
                expr: fmtDays(frozenData.get(c.id)?.pcDaysSpent ?? 0),
              })),
              total: fmtDays(fd.pcDaysSpent),
            }
          : undefined,
        cellSources: buildSourceSection(
          tp("sources.consolidation"),
          row,
          rows,
          periodsByKey,
          isConsolidation,
          dateFmt,
        ),
      };

    case "pc_cost":
      return {
        title: tp("titles.pc_cost"),
        headline: pickHeadline(col.key, row, tp),
        symbolic: tp("symbolic.pc_cost"),
        withValues: `${fmtMoney(fd.pcAmount)} ÷ ${fmtDays(fd.pcDaysSpent)}`,
        result: fmtMoney(fd.pcDailyCost),
      };

    case "pc_amount": {
      const headline = pickHeadline(col.key, row, tp);
      if (row.kind === "employee") {
        return {
          title: tp("titles.pc_amount"),
          headline,
          symbolic: tp("symbolic.pc_amount_employee"),
          withValues: `${fmtDays(fd.pcDaysSpent)} × ${fmtMoney(row.forecastCostRate)}`,
          result: fmtMoney(fd.pcAmount),
          cellSources: buildSourceSection(
            tp("sources.consolidation"),
            row,
            rows,
            periodsByKey,
            isConsolidation,
            dateFmt,
          ),
        };
      }
      return {
        title: tp("titles.pc_amount"),
        headline,
        symbolic: tp("symbolic.pc_amount_aggregate"),
        withValues: childrenSum,
        result: fmtMoney(fd.pcAmount),
        breakdown: detailHeading
          ? {
              heading: detailHeading,
              lines: children.map((c) => {
                const cd = frozenData.get(c.id);
                const days = cd?.pcDaysSpent ?? 0;
                const amount = cd?.pcAmount ?? 0;
                const rate = days > 0 ? amount / days : 0;
                return {
                  label: c.label,
                  expr:
                    days > 0
                      ? `${fmtDays(days)} × ${fmtMoney(rate)} = ${fmtMoney(amount)}`
                      : fmtMoney(amount),
                };
              }),
              total: fmtMoney(fd.pcAmount),
            }
          : undefined,
        cellSources: buildSourceSection(
          tp("sources.consolidation"),
          row,
          rows,
          periodsByKey,
          isConsolidation,
          dateFmt,
        ),
      };
    }

    case "pr_produced": {
      const headline = pickHeadline(col.key, row, tp);
      if (row.kind === "profile") {
        const fellBackToQuoted = prevRaf === undefined;
        const baseline = prevRaf ?? row.quotedDays;
        const baselineHint = fellBackToQuoted
          ? tp("hints.noPrevSnapshot")
          : prevSnapshotMonthCode
            ? tp("hints.snapshotCode", { code: prevSnapshotMonthCode })
            : tp("hints.prevSnapshot");
        const delta = Math.max(0, baseline - row.totalRemaining);
        return {
          title: tp("titles.pr_produced"),
          headline,
          symbolic: tp("symbolic.pr_produced_profile"),
          withValues: `max(0, ${fmtDays(baseline)} − ${fmtDays(row.totalRemaining)}) = ${fmtDays(delta)}`,
          result: fmtDays(fd.prDaysProduced),
          description: tp("descriptions.prProduced"),
          factors: [
            {
              label: tp("factors.prevRaf"),
              value: fmtDays(baseline),
              hint: baselineHint,
            },
            {
              label: tp("factors.currentRaf"),
              value: fmtDays(row.totalRemaining),
              hint: tp("hints.openFutureCells"),
            },
          ],
        };
      }
      if (row.kind === "employee") {
        const currentRaf = row.totalRemaining;
        const prevRaf = currentRaf + fd.prDaysProduced;
        return {
          title: tp("titles.pr_produced"),
          headline,
          symbolic: tp("symbolic.pr_produced_employee"),
          withValues: `max(0, ${fmtDays(prevRaf)} − ${fmtDays(currentRaf)}) = ${fmtDays(fd.prDaysProduced)}`,
          result: fmtDays(fd.prDaysProduced),
          description: tp("descriptions.prProduced"),
          factors: [
            {
              label: tp("factors.prevRaf"),
              value: fmtDays(prevRaf),
              hint: tp("hints.prevRafEmployee"),
            },
            {
              label: tp("factors.currentRaf"),
              value: fmtDays(currentRaf),
              hint: tp("hints.openFutureCells"),
            },
          ],
        };
      }
      return {
        title: tp("titles.pr_produced"),
        headline,
        symbolic: tp("symbolic.pr_produced_aggregate"),
        withValues: fmtDays(fd.prDaysProduced),
        result: fmtDays(fd.prDaysProduced),
        breakdown: detailHeading
          ? {
              heading: detailHeading,
              lines: children.map((c) => ({
                label: c.label,
                expr: fmtDays(frozenData.get(c.id)?.prDaysProduced ?? 0),
              })),
              total: fmtDays(fd.prDaysProduced),
            }
          : undefined,
      };
    }

    case "pr_amount": {
      const headline = pickHeadline(col.key, row, tp);
      if (row.kind === "profile" || row.kind === "employee") {
        return {
          title: tp("titles.pr_amount"),
          headline,
          symbolic: tp("symbolic.pr_amount_profile"),
          withValues: `${fmtDays(fd.prDaysProduced)} × ${fmtMoney(fd.trDailyRate)}`,
          result: fmtMoney(fd.prAmount),
          description: tp("descriptions.prAmount"),
          factors: [
            {
              label: tp("factors.sellRate"),
              value: fmtMoney(fd.trDailyRate),
              hint: tp("hints.sellRateFromQuote"),
            },
          ],
        };
      }
      return {
        title: tp("titles.pr_amount"),
        headline,
        symbolic: tp("symbolic.pr_amount_aggregate"),
        withValues: childrenSum,
        result: fmtMoney(fd.prAmount),
        breakdown: detailHeading
          ? {
              heading: detailHeading,
              lines: children.map((c) => {
                const cd = frozenData.get(c.id);
                const days = cd?.prDaysProduced ?? 0;
                const amount = cd?.prAmount ?? 0;
                const rate = days > 0 ? amount / days : 0;
                return {
                  label: c.label,
                  expr:
                    days > 0
                      ? `${fmtDays(days)} × ${fmtMoney(rate)} = ${fmtMoney(amount)}`
                      : fmtMoney(amount),
                };
              }),
              total: fmtMoney(fd.prAmount),
            }
          : undefined,
      };
    }

    case "pr_margin":
      return {
        title: tp("titles.pr_margin"),
        headline: pickHeadline(col.key, row, tp),
        symbolic: tp("symbolic.pr_margin"),
        withValues: `${fmtMoney(fd.prAmount)} − ${fmtMoney(fd.pcAmount)}`,
        result: fmtMoney(fd.prMargin),
        factors:
          fd.prMarginPct != null
            ? [
                {
                  label: tp("factors.marginPct"),
                  value: `${fd.prMarginPct.toFixed(1)}%`,
                  hint: tp("hints.marginPctFormula"),
                },
              ]
            : undefined,
      };

    default:
      return null;
  }
}

// ── Render ─────────────────────────────────────────────────────────────────

function SourceTag({ source, t }: { source: CellSource; t: TFunction }) {
  const label = t(`workTable.formulaPopover.tags.${source}`) as string;
  const cls =
    source === "actual"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      : source === "planned"
        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return (
    <span
      className={`rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}

interface ConsolidationFormulaPopoverProps {
  col: FrozenColDef;
  row: GridRow;
  fd: FrozenData;
  rows: GridRow[];
  frozenData: Map<string, FrozenData>;
  prevRaf: number | undefined;
  prevSnapshotMonthCode: string | null;
  periods: PeriodInfo[];
  quotes: Quote[];
  trigger: ReactNode;
}

export function ConsolidationFormulaPopover({
  col,
  row,
  fd,
  rows,
  frozenData,
  prevRaf,
  prevSnapshotMonthCode,
  periods,
  quotes,
  trigger,
}: ConsolidationFormulaPopoverProps) {
  const { t, i18n } = useTranslation("pages");
  const dateFmt = makeDateFmt(i18n.language);
  const [open, setOpen] = useState(false);
  const content = open
    ? (() => {
        const periodsByKey = new Map<string, PeriodInfo>();
        for (const p of periods) periodsByKey.set(p.periodKey, p);
        return buildFormulaContent({
          col,
          row,
          fd,
          rows,
          frozenData,
          prevRaf,
          prevSnapshotMonthCode,
          periodsByKey,
          quotes,
          t,
          dateFmt,
        });
      })()
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[420px] max-h-[520px] overflow-y-auto p-0"
        align="end"
        side="top"
      >
        {content ? (
          <div className="flex flex-col">
            {/* Header */}
            <div className="border-b px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t(`workTable.frozenHeader.groups.${col.group}`)}
                {" · "}
                {t(`workTable.frozenHeader.subgroups.${col.subGroup}`)}
                {" · "}
                {row.kind === "quote"
                  ? row.kind
                  : t(`workTable.formulaPopover.levels.${row.kind}`)}
              </div>
              {content.headline ? (
                <div className="text-sm font-semibold text-foreground">
                  {content.headline}
                </div>
              ) : (
                <div className="text-sm font-semibold text-foreground">
                  {content.title}
                </div>
              )}
            </div>

            {/* Formula block — symbolic / values / result on three aligned lines.
                Skipped only when a headline is set AND there's no withValues line
                (no numeric equation to show). */}
            {(content.withValues !== undefined || !content.headline) && (
              <div className="border-b bg-muted/30 px-3 py-2">
                <div className="font-mono text-[12px] leading-relaxed text-foreground">
                  <div className="text-muted-foreground">
                    {content.symbolic}
                  </div>
                  {content.withValues !== undefined && (
                    <div>
                      <span className="text-muted-foreground">= </span>
                      {content.withValues}
                    </div>
                  )}
                  <div className="font-semibold">
                    <span className="text-muted-foreground">= </span>
                    {content.result}
                  </div>
                </div>
                {content.description && (
                  <div className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                    {content.description}
                  </div>
                )}
              </div>
            )}

            {/* Factor hints (origin of secondary values) */}
            {content.factors && content.factors.length > 0 && (
              <div className="flex flex-col border-b px-3 py-2">
                {content.factors.map((f) => (
                  <div key={f.label} className="flex flex-col py-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-mono tabular-nums text-foreground">
                        {f.value}
                      </span>
                    </div>
                    {f.hint && (
                      <span className="pl-2 text-[10px] leading-tight text-muted-foreground/70">
                        {f.hint}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Breakdown per child / per quote line */}
            {content.breakdown && content.breakdown.lines.length > 0 && (
              <div className="flex flex-col border-b px-3 py-2">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {content.breakdown.heading}
                </div>
                {content.breakdown.lines.map((line, idx) => (
                  <div
                    key={`${line.label}-${idx}`}
                    className="flex flex-col py-0.5"
                  >
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span
                        className="truncate text-muted-foreground"
                        title={line.label}
                      >
                        {line.label}
                      </span>
                      <span className="shrink-0 font-mono tabular-nums text-foreground/90">
                        {line.expr}
                      </span>
                    </div>
                    {line.hint && (
                      <span className="pl-2 text-[10px] leading-tight text-muted-foreground/60">
                        {line.hint}
                      </span>
                    )}
                  </div>
                ))}
                {content.breakdown.total && (
                  <div className="mt-1 flex items-center justify-between border-t pt-1 text-[11px] font-semibold text-foreground">
                    <span>{t("workTable.formulaPopover.total")}</span>
                    <span className="font-mono tabular-nums">
                      {content.breakdown.total}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Cell sources — period-level provenance with dates + actual/planned tags */}
            {content.cellSources && content.cellSources.rows.length > 0 && (
              <div className="flex flex-col border-b px-3 py-2">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {content.cellSources.heading}
                </div>
                {content.cellSources.rows.map((src) => (
                  <div
                    key={src.periodKey}
                    className="flex items-center justify-between gap-2 py-0.5 text-xs"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-foreground/80">
                        {src.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {src.dateRange}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <SourceTag source={src.source} t={t} />
                      <span className="font-mono tabular-nums text-foreground/90">
                        {fmtDays(src.days)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between border-t pt-1 text-[11px] font-semibold text-foreground">
                  <span>{t("workTable.formulaPopover.total")}</span>
                  <span className="font-mono tabular-nums">
                    {content.cellSources.total}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-4 text-xs text-muted-foreground">—</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
