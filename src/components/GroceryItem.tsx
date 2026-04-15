import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';
import type { GroceryItemData } from '@/data/mockData';

interface GroceryItemProps {
  item: GroceryItemData;
  onEdit: (id: string) => void;
}

const GroceryItem = ({ item, onEdit }: GroceryItemProps) => {
  return (
    <GlassCard
      className="flex items-center justify-between cursor-pointer hover:bg-white/70 transition-colors"
      onClick={() => onEdit(item.id)}
    >
      <div className="flex items-center gap-3">
        <StatusBadge status={item.status} />
        <div>
          <p className="font-medium text-sm text-foreground">{item.name}</p>
          <p className="text-xs text-foreground/50">
            {item.quantity} {item.unit}
          </p>
        </div>
      </div>
      <span className="text-xs text-foreground/40">tap to edit</span>
    </GlassCard>
  );
};

export default GroceryItem;
