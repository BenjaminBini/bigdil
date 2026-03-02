export function computeMargin(sellRate: number, costRate: number): number {
  return sellRate - costRate
}

export function computeMarginPct(sellRate: number, costRate: number): number {
  if (sellRate === 0) return 0
  return ((sellRate - costRate) / sellRate) * 100
}
