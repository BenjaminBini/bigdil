export function QuoteGridHeader() {
  return (
    <thead className="sticky top-0 z-10 bg-gray-50">
      <tr className="border-b border-gray-200">
        <th rowSpan={2} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Task / Profile</th>
        <th rowSpan={2} className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Days</th>
        <th colSpan={2} className="border-x border-gray-200 py-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-blue-600">Revenue</th>
        <th colSpan={2} className="border-r border-gray-200 py-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-orange-600">Cost</th>
        <th colSpan={2} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-500">Margin</th>
      </tr>
      <tr className="border-b border-gray-300">
        <th className="border-l border-gray-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Sell/Day</th>
        <th className="border-r border-gray-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Cost/Day</th>
        <th className="border-r border-gray-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">%</th>
      </tr>
    </thead>
  )
}
