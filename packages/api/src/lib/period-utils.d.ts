export type PeriodGranularity = 'WEEKLY' | 'MONTHLY';
interface ParsedPeriod {
    year: number;
    type: 'W' | 'M';
    index: number;
}
export interface PeriodSlice {
    code: string;
    periodKey: string;
    monthCode: string;
    weekCode: string | null;
    startDate: string;
    endDate: string;
    label: string;
    groupCode: string;
    groupLabel: string;
}
export type TimesheetWindowStatus = 'OPEN' | 'CONSOLIDATION' | 'FROZEN' | 'FUTURE';
export declare function parsePeriodCode(code: string): ParsedPeriod;
export declare function getPeriodDates(code: string): {
    startDate: string;
    endDate: string;
};
export declare function getPeriodLabel(code: string): string;
export declare function comparePeriodCodes(a: string, b: string): number;
export declare function currentPeriodCode(granularity: PeriodGranularity): string;
export declare function monthCodeForDate(dateStr: string): string;
export declare function weekCodeForDate(dateStr: string): string;
export declare function makePeriodSliceKey(monthCode: string, weekCode?: string | null): string;
export declare function parsePeriodSliceKey(code: string): {
    monthCode: string;
    weekCode: string | null;
    periodKey: string;
};
export declare function comparePeriodSliceKeys(a: string, b: string): number;
export declare function deriveTimesheetWindowStatus(periodKey: string, openPeriodKey: string): TimesheetWindowStatus;
export declare function isOpenTimesheetSlice(periodKey: string, openPeriodKey: string): boolean;
export declare function getPeriodSlicesForDateRange(startDate: string, endDate: string, granularity: PeriodGranularity): PeriodSlice[];
export declare function getPeriodsForDateRange(startDate: string, endDate: string, granularity: PeriodGranularity): string[];
export declare function nextPeriodCode(code: string): string;
export declare function nextPeriodSliceKey(periodKey: string): string | null;
export {};
//# sourceMappingURL=period-utils.d.ts.map