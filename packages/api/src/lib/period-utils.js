export function parsePeriodCode(code) {
    const m = code.match(/^(\d{4})([WM])(\d{1,2})$/);
    if (!m)
        throw new Error(`Invalid period code: ${code}`);
    return { year: parseInt(m[1]), type: m[2], index: parseInt(m[3]) };
}
function isoWeekStart(year, week) {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Dow = jan4.getUTCDay() || 7;
    const week1Monday = new Date(jan4.getTime() - (jan4Dow - 1) * 86400000);
    return new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
}
function dateToIsoString(d) {
    return d.toISOString().slice(0, 10);
}
export function getPeriodDates(code) {
    const { year, type, index } = parsePeriodCode(code);
    if (type === 'M') {
        const start = new Date(Date.UTC(year, index - 1, 1));
        const end = new Date(Date.UTC(year, index, 0));
        return { startDate: dateToIsoString(start), endDate: dateToIsoString(end) };
    }
    const start = isoWeekStart(year, index);
    const end = new Date(start.getTime() + 6 * 86400000);
    return { startDate: dateToIsoString(start), endDate: dateToIsoString(end) };
}
const MONTH_NAMES_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
export function getPeriodLabel(code) {
    const { year, type, index } = parsePeriodCode(code);
    if (type === 'M')
        return `${MONTH_NAMES_FR[index - 1]} ${year}`;
    return `Semaine ${index}, ${year}`;
}
export function comparePeriodCodes(a, b) {
    const pa = parsePeriodCode(a);
    const pb = parsePeriodCode(b);
    if (pa.year !== pb.year)
        return pa.year < pb.year ? -1 : 1;
    if (pa.type !== pb.type)
        return pa.type < pb.type ? -1 : 1;
    if (pa.index !== pb.index)
        return pa.index < pb.index ? -1 : 1;
    return 0;
}
function getIsoWeekCode(d) {
    const thu = new Date(d.getTime());
    thu.setUTCDate(thu.getUTCDate() - ((thu.getUTCDay() + 6) % 7) + 3);
    const year = thu.getUTCFullYear();
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Dow = jan4.getUTCDay() || 7;
    const week1Mon = new Date(jan4.getTime() - (jan4Dow - 1) * 86400000);
    // The week index must be derived from the Thursday of `d`'s ISO week, not
    // from `d` itself. Using `d` causes Sundays (last day of an ISO week) to
    // round up to the next week — e.g., 2026-05-03 was being misclassified as
    // 2026W19 instead of 2026W18.
    const week = Math.round((thu.getTime() - week1Mon.getTime()) / (7 * 86400000)) + 1;
    return `${year}W${week}`;
}
export function currentPeriodCode(granularity) {
    const now = new Date();
    if (granularity === 'MONTHLY') {
        return `${now.getUTCFullYear()}M${now.getUTCMonth() + 1}`;
    }
    return getIsoWeekCode(now);
}
export function monthCodeForDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00Z');
    return `${d.getUTCFullYear()}M${d.getUTCMonth() + 1}`;
}
export function weekCodeForDate(dateStr) {
    return containingPeriod(dateStr, 'WEEKLY');
}
function maxDate(a, b) {
    return a > b ? a : b;
}
function minDate(a, b) {
    return a < b ? a : b;
}
export function makePeriodSliceKey(monthCode, weekCode) {
    return weekCode ? `${monthCode}__${weekCode}` : monthCode;
}
export function parsePeriodSliceKey(code) {
    const [monthCode, weekCode = null] = code.split('__');
    if (!monthCode)
        throw new Error(`Invalid period slice code: ${code}`);
    parsePeriodCode(monthCode);
    if (weekCode)
        parsePeriodCode(weekCode);
    return { monthCode, weekCode, periodKey: makePeriodSliceKey(monthCode, weekCode) };
}
export function comparePeriodSliceKeys(a, b) {
    const pa = parsePeriodSliceKey(a);
    const pb = parsePeriodSliceKey(b);
    const monthCompare = comparePeriodCodes(pa.monthCode, pb.monthCode);
    if (monthCompare !== 0)
        return monthCompare;
    if (pa.weekCode === pb.weekCode)
        return 0;
    if (pa.weekCode === null)
        return -1;
    if (pb.weekCode === null)
        return 1;
    return comparePeriodCodes(pa.weekCode, pb.weekCode);
}
// Status spec (global, single open weekly slice):
//   OPEN          — slice equals openPeriodKey
//   FROZEN        — slice's accounting month strictly before openWeek's month
//   CONSOLIDATION — slice in openWeek's month, week starts (chronologically) before openWeek
//   FUTURE        — every other slice (later month, or same month after openWeek)
// Chronological compare is by the week's actual start date, so a straddle week
// like 2026W53 (Dec 28 - Jan 3) ranks before 2027W1 (Jan 4 - 10) even though the
// raw weekCode strings sort the other way.
function sliceStartDate(p) {
    return getPeriodDates(p.weekCode ?? p.monthCode).startDate;
}
export function deriveTimesheetWindowStatus(periodKey, openPeriodKey) {
    const current = parsePeriodSliceKey(periodKey);
    const open = parsePeriodSliceKey(openPeriodKey);
    if (current.periodKey === open.periodKey)
        return 'OPEN';
    if (comparePeriodCodes(current.monthCode, open.monthCode) < 0)
        return 'FROZEN';
    if (comparePeriodCodes(current.monthCode, open.monthCode) > 0)
        return 'FUTURE';
    const currentStart = sliceStartDate(current);
    const openStart = sliceStartDate(open);
    if (currentStart < openStart)
        return 'CONSOLIDATION';
    return 'FUTURE';
}
export function isOpenTimesheetSlice(periodKey, openPeriodKey) {
    return deriveTimesheetWindowStatus(periodKey, openPeriodKey) === 'OPEN';
}
export function getPeriodSlicesForDateRange(startDate, endDate, granularity) {
    const slices = [];
    if (granularity === 'MONTHLY') {
        return getPeriodsForDateRange(startDate, endDate, 'MONTHLY').map((monthCode) => ({
            code: monthCode,
            periodKey: monthCode,
            monthCode,
            weekCode: null,
            ...getPeriodDates(monthCode),
            label: getPeriodLabel(monthCode),
            groupCode: monthCode,
            groupLabel: getPeriodLabel(monthCode),
        }));
    }
    for (const weekCode of getPeriodsForDateRange(startDate, endDate, 'WEEKLY')) {
        const planningDates = getPeriodDates(weekCode);
        const sliceStart = maxDate(startDate, planningDates.startDate);
        const sliceEnd = minDate(endDate, planningDates.endDate);
        for (const monthCode of getPeriodsForDateRange(sliceStart, sliceEnd, 'MONTHLY')) {
            const accountingDates = getPeriodDates(monthCode);
            const periodKey = makePeriodSliceKey(monthCode, weekCode);
            slices.push({
                code: periodKey,
                periodKey,
                monthCode,
                weekCode,
                startDate: maxDate(sliceStart, accountingDates.startDate),
                endDate: minDate(sliceEnd, accountingDates.endDate),
                label: getPeriodLabel(weekCode),
                groupCode: monthCode,
                groupLabel: getPeriodLabel(monthCode),
            });
        }
    }
    return slices;
}
export function getPeriodsForDateRange(startDate, endDate, granularity) {
    const codes = [];
    let current = containingPeriod(startDate, granularity);
    const end = containingPeriod(endDate, granularity);
    while (comparePeriodCodes(current, end) <= 0) {
        codes.push(current);
        current = nextPeriodCode(current);
    }
    return codes;
}
function containingPeriod(dateStr, granularity) {
    const d = new Date(dateStr + 'T00:00:00Z');
    if (granularity === 'MONTHLY') {
        return `${d.getUTCFullYear()}M${d.getUTCMonth() + 1}`;
    }
    return getIsoWeekCode(d);
}
export function nextPeriodCode(code) {
    const { year, type, index } = parsePeriodCode(code);
    if (type === 'M') {
        if (index === 12)
            return `${year + 1}M1`;
        return `${year}M${index + 1}`;
    }
    const next = isoWeekStart(year, index + 1);
    return getIsoWeekCode(next);
}
export function nextPeriodSliceKey(periodKey) {
    // periodKey may be composite ("monthCode__weekCode") — unwrap to the slice
    // start/end before asking getPeriodDates, which only handles single codes.
    const { weekCode, monthCode } = parsePeriodSliceKey(periodKey);
    const sliceCode = weekCode ?? monthCode;
    const { endDate: weekEnd } = getPeriodDates(sliceCode);
    // For a composite key, the slice ends at min(week end, month end).
    const monthEnd = getPeriodDates(monthCode).endDate;
    const sliceEnd = weekCode && monthEnd < weekEnd ? monthEnd : weekEnd;
    const next = new Date(`${sliceEnd}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const nextDate = dateToIsoString(next);
    const slices = getPeriodSlicesForDateRange(nextDate, nextDate, 'WEEKLY');
    return slices[0]?.code ?? null;
}
//# sourceMappingURL=period-utils.js.map