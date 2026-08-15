'use client';

type Severity = 'low' | 'medium' | 'high';

interface SeverityToggleProps {
  value: Severity;
  onChange: (severity: Severity) => void;
}

export default function SeverityToggle({ value, onChange }: SeverityToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-full p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange('low')}
        className={`flex-1 py-2 text-center text-sm font-semibold rounded-full transition-all cursor-pointer active:scale-95 ${
          value === 'low' ? 'bg-[#22C55E] text-white' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Low
      </button>
      <button
        type="button"
        onClick={() => onChange('medium')}
        className={`flex-1 py-2 text-center text-sm font-semibold rounded-full transition-all cursor-pointer active:scale-95 ${
          value === 'medium' ? 'bg-[#F59E0B] text-white' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Medium
      </button>
      <button
        type="button"
        onClick={() => onChange('high')}
        className={`flex-1 py-2 text-center text-sm font-semibold rounded-full transition-all cursor-pointer active:scale-95 ${
          value === 'high' ? 'bg-[#EF4444] text-white' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        High
      </button>
    </div>
  );
}
