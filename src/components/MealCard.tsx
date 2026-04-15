import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import type { FlavorTag } from '@/data/mockData';

interface MealCardProps {
  name: string;
  tags: FlavorTag[];
  ingredients: string[];
  selected?: boolean;
  onSelect?: () => void;
  showSelectButton?: boolean;
  mealType?: string;
}

const tagColors: Record<FlavorTag, string> = {
  Spicy: 'bg-red-100 text-red-700',
  Sweet: 'bg-pink-100 text-pink-700',
  Light: 'bg-green-100 text-green-700',
  Balanced: 'bg-blue-100 text-blue-700',
};

const MealCard = ({ name, tags, ingredients, selected, onSelect, showSelectButton, mealType }: MealCardProps) => {
  return (
    <GlassCard
      className={cn(
        'transition-all duration-300 cursor-pointer',
        selected && 'ring-2 ring-emerald-400 bg-emerald-50/60 shadow-emerald-200/50'
      )}
      onClick={onSelect}
    >
      {mealType && (
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/50 mb-1">{mealType}</p>
      )}
      <h3 className="font-semibold text-base text-foreground">{name}</h3>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {tags.map((tag) => (
          <span key={tag} className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', tagColors[tag])}>
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-foreground/50 mt-2 line-clamp-1">{ingredients.join(', ')}</p>
      {showSelectButton && (
        <button
          className={cn(
            'mt-3 w-full text-sm font-medium py-2 rounded-xl transition-colors',
            selected
              ? 'bg-emerald-500 text-white'
              : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          {selected ? '✓ Selected' : 'Select Meal'}
        </button>
      )}
    </GlassCard>
  );
};

export default MealCard;
