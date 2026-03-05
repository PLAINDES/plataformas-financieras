import type { SimpleBarChartProps } from '../types/benefit.types';

export function SimpleBarChart({ data, selectedIndustry, height = 420 }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="w-full h-full flex flex-col justify-end p-5">
      <div className="flex items-end justify-between gap-2 h-full">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const isSelected = item.industry === selectedIndustry;

          return (
            <div key={index} className="flex flex-col items-center justify-end flex-grow h-full min-w-[40px]">
              <div
                className="text-center mb-2 text-xs"
                style={{
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#0d6efd' : '#6c757d'
                }}
              >
                {item.value.toFixed(1)}%
              </div>
              <div
                className="w-full rounded-t relative transition-all duration-300 ease-in-out min-h-[10px]"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: isSelected ? '#0d6efd' : '#e9ecef',
                  boxShadow: isSelected ? '0 4px 8px rgba(13, 110, 253, 0.3)' : 'none'
                }}
              />
              <div
                className="text-center mt-2 whitespace-nowrap"
                style={{
                  fontSize: '0.7rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#0d6efd' : '#6c757d',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'top center',
                  marginTop: '20px'
                }}
              >
                {item.industry}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}