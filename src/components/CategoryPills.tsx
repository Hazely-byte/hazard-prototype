'use client';

interface CategoryPillsProps {
  selected: string;
  onSelect: (category: string) => void;
  categories: { value: string; label: string; icon?: string }[];
}

export default function CategoryPills({ selected, onSelect, categories }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
      {categories.map((cat) => {
        const isSelected = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer active:scale-95 ${
              isSelected
                ? 'bg-[#D4F67B] text-[#192625] shadow-sm'
                : 'bg-white text-gray-600 border border-[#E2E8DC] hover:border-[#B5E342]'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
