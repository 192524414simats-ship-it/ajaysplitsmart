interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'brand' | 'red' | 'amber';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({ value, max, color = 'brand', height = 'md', showLabel = false }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOver = value > max;

  const colors = {
    brand: 'bg-brand-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
  };
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

  return (
    <div className="w-full">
      <div className={`w-full ${heights[height]} bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${isOver ? 'bg-red-500' : colors[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{Math.round(pct)}%</span>
          {isOver && <span className="text-red-500 font-medium">Over budget</span>}
        </div>
      )}
    </div>
  );
}
